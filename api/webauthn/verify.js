import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { getPool, ensureSecurityTables, recordServerAudit } from '../_lib/db.js';
import {
  getAuthenticatedUser,
  getWebAuthnRpConfig,
  createSignedSessionToken,
  setSessionCookie,
  normalizeRoleName
} from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, credential, deviceName } = req.body || {};
  const { rpID, origin } = getWebAuthnRpConfig(req);
  const db = getPool();

  if (!db) {
    return res.status(503).json({ error: 'Base de datos no conectada.' });
  }

  try {
    await ensureSecurityTables();

    // Extraer el challenge desde clientDataJSON para validar que exista, no haya expirado y sea de un solo uso
    const clientDataJSON = credential?.response?.clientDataJSON;
    if (!clientDataJSON) {
      return res.status(400).json({ error: 'Respuesta biométrica incompleta.' });
    }

    const decodedClientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
    const incomingChallenge = decodedClientData.challenge;

    const { rows: challengeRows } = await db.query(
      `UPDATE desafios_webauthn
       SET used = TRUE
       WHERE challenge = $1
         AND proposito = $2
         AND used = FALSE
         AND expires_at > NOW()
       RETURNING id, usuario_id, email`,
      [incomingChallenge, action === 'register' ? 'register' : 'authenticate']
    );

    if (challengeRows.length === 0) {
      return res.status(400).json({
        error: 'El desafío de seguridad expiró o ya fue utilizado. Intentá nuevamente.'
      });
    }

    const challengeRecord = challengeRows[0];

    // 1. VERIFICAR REGISTRO DE NUEVA PASSKEY
    if (action === 'register') {
      const user = await getAuthenticatedUser(req);
      if (!user || (challengeRecord.usuario_id && String(challengeRecord.usuario_id) !== String(user.id))) {
        return res.status(401).json({ error: 'Sesión inválida para registrar el dispositivo.' });
      }

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: incomingChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true
      });

      if (!verification.verified || !verification.registrationInfo) {
        return res.status(400).json({ error: 'No se pudo verificar la firma del dispositivo.' });
      }

      const { credential: regCred } = verification.registrationInfo;
      const credId = regCred.id;
      const publicKeyBase64Url = Buffer.from(regCred.publicKey).toString('base64url');
      const counter = regCred.counter || 0;
      const transports = credential.response?.transports || ['internal'];
      const cleanDeviceName = (deviceName || 'Dispositivo Personal (Huella / Rostro)').slice(0, 100);

      // Cumplimiento Ley 25.326: se guarda únicamente clave pública, ID de credencial, contador y nombre del dispositivo
      const { rows: inserted } = await db.query(
        `INSERT INTO credenciales_webauthn (
           usuario_id, credential_id, public_key, counter, transports, nombre_dispositivo, last_used_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, credential_id, nombre_dispositivo, created_at, last_used_at`,
        [user.id, credId, publicKeyBase64Url, counter, transports, cleanDeviceName]
      );

      await recordServerAudit({
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        accion: 'Alta de Passkey biométrica (WebAuthn)',
        modulo: 'seguridad_biometrica',
        detalle: {
          dispositivo: cleanDeviceName,
          credential_id_prefix: String(credId).slice(0, 10)
        },
        ipAddress: req.headers['x-forwarded-for'] || null
      });

      return res.status(201).json({
        verified: true,
        device: inserted[0]
      });
    }

    // 2. VERIFICAR INICIO DE SESIÓN CON PASSKEY
    if (action === 'authenticate') {
      const credId = credential.id;
      const { rows: credRows } = await db.query(
        `SELECT c.id, c.usuario_id, c.credential_id, c.public_key, c.counter, c.transports, c.nombre_dispositivo,
                u.nombre_completo, u.email, u.telefono, u.rol, u.activo, u.is_temp_password, u.debe_cambiar_password
         FROM credenciales_webauthn c
         JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.credential_id = $1 AND u.deleted_at IS NULL
         LIMIT 1`,
        [credId]
      );

      if (credRows.length === 0) {
        return res.status(401).json({
          error: 'Este dispositivo no tiene una passkey activa o fue revocada. Ingresá con tu contraseña.'
        });
      }

      const storedCred = credRows[0];
      if (!storedCred.activo) {
        return res.status(401).json({ error: 'Credenciales inválidas o cuenta desactivada.' });
      }

      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: incomingChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: storedCred.credential_id,
          publicKey: new Uint8Array(Buffer.from(storedCred.public_key, 'base64url')),
          counter: Number(storedCred.counter || 0),
          transports: storedCred.transports || ['internal']
        },
        requireUserVerification: true
      });

      if (!verification.verified) {
        return res.status(401).json({ error: 'Verificación biométrica rechazada.' });
      }

      const newCounter = verification.authenticationInfo.newCounter;

      await db.query(
        `UPDATE credenciales_webauthn
         SET counter = $1, last_used_at = NOW()
         WHERE id = $2`,
        [newCounter, storedCred.id]
      );

      await db.query(
        `UPDATE usuarios
         SET failed_login_attempts = 0, locked_until = NULL, ultimo_ingreso = NOW()
         WHERE id = $1`,
        [storedCred.usuario_id]
      );

      const sessionUser = {
        id: storedCred.usuario_id,
        nombre: storedCred.nombre_completo,
        email: storedCred.email,
        telefono: storedCred.telefono || '',
        rol: normalizeRoleName(storedCred.rol),
        activo: true,
        must_change_password: Boolean(storedCred.is_temp_password || storedCred.debe_cambiar_password)
      };

      const token = createSignedSessionToken(sessionUser);
      setSessionCookie(res, token);

      await recordServerAudit({
        usuarioId: sessionUser.id,
        usuarioNombre: sessionUser.nombre,
        accion: 'Inicio de sesión exitoso con Passkey (Huella / Rostro)',
        modulo: 'autenticacion',
        detalle: { dispositivo: storedCred.nombre_dispositivo },
        ipAddress: req.headers['x-forwarded-for'] || null
      });

      return res.status(200).json({
        verified: true,
        user: sessionUser
      });
    }

    return res.status(400).json({ error: 'Acción inválida.' });
  } catch (err) {
    console.error('[LUMIA WebAuthn Verify Error]:', err.message);
    return res.status(400).json({ error: 'No se pudo completar la verificación biométrica.' });
  }
}
