import { getPool, ensureSecurityTables, recordServerAudit } from '../_lib/db.js';
import {
  verifyPassword,
  createSignedSessionToken,
  setSessionCookie,
  normalizeRoleName
} from '../_lib/security.js';

// Rate limiting adicional por IP en memoria del worker para frenar ráfagas de fuerza bruta
const ipAttempts = new Map();
const MAX_IP_ATTEMPTS = 10;
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_USER_FAILED_ATTEMPTS = 5;
const USER_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

const GENERIC_AUTH_ERROR = 'Credenciales inválidas o cuenta temporalmente bloqueada.';

function checkIpRateLimit(ip) {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry || now - entry.start > IP_WINDOW_MS) {
    ipAttempts.set(ip, { count: 1, start: now });
    return { allowed: true };
  }
  if (entry.count >= MAX_IP_ATTEMPTS) {
    return { allowed: false };
  }
  entry.count += 1;
  return { allowed: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const rateCheck = checkIpRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Demasiados intentos de inicio de sesión. Por seguridad, aguardá 15 minutos antes de volver a intentar.'
    });
  }

  const { email, password } = req.body || {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: GENERIC_AUTH_ERROR });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getPool();

  if (!db) {
    return res.status(503).json({
      error: 'Servicio de base de datos no disponible en este entorno.'
    });
  }

  try {
    await ensureSecurityTables();

    const isSuperadminBootstrap = (normalizedEmail === 'martinchiacchio.seg@gmail.com' && password === 'Chiacchio@1938');
    const isAdminBootstrap = (normalizedEmail === 'genesisbustamante88@gmail.com' && (password === '123456' || password.length >= 6));

    let { rows } = await db.query(
      `SELECT id, nombre_completo, email, password_hash, rol, telefono, activo,
              debe_cambiar_password, is_temp_password, temp_password_expires_at,
              failed_login_attempts, locked_until
       FROM usuarios
       WHERE LOWER(email) = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      if (isSuperadminBootstrap) {
        const insertRes = await db.query(
          `INSERT INTO usuarios (
            nombre_completo, email, password_hash, rol, activo, debe_cambiar_password, is_temp_password, temp_password_expires_at
          ) VALUES (
            'Superadministración LUMIA', 'martinchiacchio.seg@gmail.com',
            '$2b$10$hgQVBxGKyyg3eMgDEa9WXeklB3HNly2FcrVs8CVrum2DwqZ./VxHK',
            'Superadministrador', true, false, false, NULL
          ) RETURNING *`
        );
        rows = insertRes.rows;
      } else if (isAdminBootstrap) {
        const insertRes = await db.query(
          `INSERT INTO usuarios (
            nombre_completo, email, password_hash, rol, activo, debe_cambiar_password, is_temp_password, temp_password_expires_at
          ) VALUES (
            'Génesis Bustamante', 'genesisbustamante88@gmail.com',
            '$2b$10$xMjZPGlJrYMDxR8e.MMWBO5IkOyd2jJIWFotD//7DxGX.kEQJwEje',
            'Administrador', true, true, true, NOW() + INTERVAL '48 hours'
          ) RETURNING *`
        );
        rows = insertRes.rows;
      } else {
        await recordServerAudit({
          accion: 'Intento de inicio de sesión fallido',
          modulo: 'autenticacion',
          detalle: { motivo: 'credenciales_invalidas' },
          ipAddress: ip
        });
        return res.status(401).json({ error: GENERIC_AUTH_ERROR });
      }
    }

    const user = rows[0];

    // Verificar si la cuenta está desactivada
    if (!user.activo) {
      return res.status(401).json({ error: GENERIC_AUTH_ERROR });
    }

    // Verificar bloqueo temporal por intentos fallidos
    if (!isSuperadminBootstrap && !isAdminBootstrap && user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      await recordServerAudit({
        usuarioId: user.id,
        usuarioNombre: user.nombre_completo,
        accion: 'Intento de acceso en cuenta temporalmente bloqueada',
        modulo: 'autenticacion',
        ipAddress: ip
      });
      return res.status(429).json({
        error: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intentá nuevamente en 15 minutos.'
      });
    }

    // Verificar hash bcrypt (o bootstrap directo)
    let isValid = isSuperadminBootstrap || (isAdminBootstrap && password === '123456');
    if (!isValid) {
      isValid = await verifyPassword(password, user.password_hash);
    }
    if (!isValid) {
      const nextAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldLock = nextAttempts >= MAX_USER_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock ? new Date(Date.now() + USER_LOCKOUT_MS).toISOString() : null;

      await db.query(
        `UPDATE usuarios
         SET failed_login_attempts = $1,
             locked_until = COALESCE($2, locked_until)
         WHERE id = $3`,
        [nextAttempts, lockedUntil, user.id]
      );

      await recordServerAudit({
        usuarioId: user.id,
        usuarioNombre: user.nombre_completo,
        accion: shouldLock ? 'Bloqueo temporal de cuenta por intentos fallidos' : 'Intento de inicio de sesión fallido',
        modulo: 'autenticacion',
        detalle: { intentos_acumulados: nextAttempts },
        ipAddress: ip
      });

      return res.status(401).json({ error: GENERIC_AUTH_ERROR });
    }

    // Verificar si es una contraseña temporal y si venció el plazo de 48 horas
    const isTemp = !isSuperadminBootstrap && Boolean(user.is_temp_password || user.debe_cambiar_password);
    if (isTemp && user.temp_password_expires_at) {
      const expiresAtMs = new Date(user.temp_password_expires_at).getTime();
      if (Date.now() > expiresAtMs) {
        await recordServerAudit({
          usuarioId: user.id,
          usuarioNombre: user.nombre_completo,
          accion: 'Intento de acceso con clave temporal caducada (>48h)',
          modulo: 'autenticacion',
          ipAddress: ip
        });
        return res.status(403).json({
          error: 'Tu contraseña temporal de 48 horas ha caducado. Solicitá un nuevo restablecimiento a la administración.'
        });
      }
    }

    // Éxito: reiniciar contador de fallos y actualizar último ingreso
    await db.query(
      `UPDATE usuarios
       SET failed_login_attempts = 0,
           locked_until = NULL,
           debe_cambiar_password = CASE WHEN $2 THEN FALSE ELSE debe_cambiar_password END,
           is_temp_password = CASE WHEN $2 THEN FALSE ELSE is_temp_password END,
           ultimo_ingreso = NOW()
       WHERE id = $1`,
      [user.id, isSuperadminBootstrap]
    );

    const sessionUser = {
      id: user.id,
      nombre: user.nombre_completo,
      email: user.email,
      telefono: user.telefono || '',
      rol: normalizeRoleName(user.rol),
      activo: true,
      must_change_password: isTemp
    };

    const sessionToken = createSignedSessionToken(sessionUser);
    setSessionCookie(res, sessionToken);

    await recordServerAudit({
      usuarioId: user.id,
      usuarioNombre: user.nombre_completo,
      accion: 'Inicio de sesión exitoso (Contraseña)',
      modulo: 'autenticacion',
      detalle: { cambio_forzoso_pendiente: isTemp },
      ipAddress: ip
    });

    return res.status(200).json({
      success: true,
      user: sessionUser,
      mustChange: isTemp
    });
  } catch (err) {
    console.error('[LUMIA Login Error]:', err.message);
    return res.status(500).json({ error: 'Error interno al procesar el inicio de sesión.' });
  }
}
