import { getPool, ensureSecurityTables, recordServerAudit } from '../_lib/db.js';
import {
  getAuthenticatedUser,
  validatePasswordPolicy,
  verifyPassword,
  hashPassword,
  createSignedSessionToken,
  setSessionCookie
} from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const sessionUser = await getAuthenticatedUser(req);
  if (!sessionUser) {
    return res.status(401).json({ error: 'Sesión no válida o expirada.' });
  }

  const { oldPassword, newPassword } = req.body || {};

  // Validar política de nueva contraseña (mínimo 10 caracteres, lista negra y datos personales)
  const validation = validatePasswordPolicy(newPassword, {
    email: sessionUser.email,
    nombre: sessionUser.nombre,
    oldPassword
  });

  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  const db = getPool();
  if (!db) {
    return res.status(503).json({ error: 'Base de datos no disponible.' });
  }

  try {
    await ensureSecurityTables();

    const { rows } = await db.query(
      `SELECT id, password_hash FROM usuarios WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [sessionUser.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const dbUser = rows[0];
    if (oldPassword) {
      const matchesOld = await verifyPassword(oldPassword, dbUser.password_hash);
      if (!matchesOld) {
        return res.status(401).json({ error: 'La contraseña actual o temporal ingresada no es correcta.' });
      }
    }

    // Verificar que la nueva contraseña no sea idéntica al hash actual
    const sameAsCurrent = await verifyPassword(newPassword, dbUser.password_hash);
    if (sameAsCurrent) {
      return res.status(400).json({
        error: 'La nueva contraseña definitiva no puede ser igual a la clave temporal anterior.'
      });
    }

    const newHash = await hashPassword(newPassword);

    await db.query(
      `UPDATE usuarios
       SET password_hash = $1,
           debe_cambiar_password = FALSE,
           is_temp_password = FALSE,
           temp_password_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [newHash, sessionUser.id]
    );

    const updatedUser = {
      ...sessionUser,
      must_change_password: false
    };

    const newToken = createSignedSessionToken(updatedUser);
    setSessionCookie(res, newToken);

    await recordServerAudit({
      usuarioId: sessionUser.id,
      usuarioNombre: sessionUser.nombre,
      accion: 'Cambio obligatorio de contraseña completado',
      modulo: 'autenticacion',
      ipAddress: req.headers['x-forwarded-for'] || null
    });

    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    console.error('[LUMIA ChangePassword Error]:', err.message);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña.' });
  }
}
