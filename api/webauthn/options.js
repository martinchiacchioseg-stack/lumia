import {
  generateRegistrationOptions,
  generateAuthenticationOptions
} from '@simplewebauthn/server';
import { getPool, ensureSecurityTables } from '../_lib/db.js';
import { getAuthenticatedUser, getWebAuthnRpConfig } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, email } = req.body || {};
  const { rpName, rpID } = getWebAuthnRpConfig(req);
  const db = getPool();

  if (!db) {
    return res.status(503).json({ error: 'Base de datos no conectada.' });
  }

  try {
    await ensureSecurityTables();

    // 1. OPCIONES DE REGISTRO DE NUEVA PASSKEY (Requiere usuario autenticado)
    if (action === 'register') {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Debés iniciar sesión para registrar tu huella o rostro.' });
      }

      // Buscar credenciales previas para excluirlas y evitar duplicar el mismo dispositivo
      const { rows: existingCreds } = await db.query(
        `SELECT credential_id, transports FROM credenciales_webauthn WHERE usuario_id = $1`,
        [user.id]
      );

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new Uint8Array(Buffer.from(String(user.id))),
        userName: user.email,
        userDisplayName: user.nombre,
        attestationType: 'none',
        excludeCredentials: existingCreds.map(c => ({
          id: c.credential_id,
          transports: c.transports || ['internal']
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required',
          authenticatorAttachment: 'platform'
        }
      });

      // Guardar desafío (challenge) de un solo uso con vencimiento en 5 minutos
      await db.query(
        `INSERT INTO desafios_webauthn (usuario_id, email, challenge, proposito, expires_at)
         VALUES ($1, $2, $3, 'register', NOW() + INTERVAL '5 minutes')`,
        [user.id, user.email, options.challenge]
      );

      return res.status(200).json(options);
    }

    // 2. OPCIONES DE AUTENTICACIÓN CON PASSKEY (En pantalla de Login)
    if (action === 'authenticate') {
      let allowCredentials = undefined;
      let targetUserId = null;
      const cleanEmail = email ? email.trim().toLowerCase() : null;

      if (cleanEmail) {
        const { rows: userRows } = await db.query(
          `SELECT id FROM usuarios WHERE LOWER(email) = $1 AND activo = TRUE AND deleted_at IS NULL LIMIT 1`,
          [cleanEmail]
        );
        if (userRows.length > 0) {
          targetUserId = userRows[0].id;
          const { rows: creds } = await db.query(
            `SELECT credential_id, transports FROM credenciales_webauthn WHERE usuario_id = $1`,
            [targetUserId]
          );
          if (creds.length > 0) {
            allowCredentials = creds.map(c => ({
              id: c.credential_id,
              transports: c.transports || ['internal']
            }));
          }
        }
      }

      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'required',
        allowCredentials
      });

      await db.query(
        `INSERT INTO desafios_webauthn (usuario_id, email, challenge, proposito, expires_at)
         VALUES ($1, $2, $3, 'authenticate', NOW() + INTERVAL '5 minutes')`,
        [targetUserId, cleanEmail, options.challenge]
      );

      return res.status(200).json(options);
    }

    return res.status(400).json({ error: 'Acción WebAuthn no reconocida.' });
  } catch (err) {
    console.error('[LUMIA WebAuthn Options Error]:', err.message);
    return res.status(500).json({ error: 'No se pudieron generar las opciones biométricas.' });
  }
}
