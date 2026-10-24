import { getPool, ensureSecurityTables, recordServerAudit } from '../_lib/db.js';
import {
  getAuthenticatedUser,
  generateSecureTempPassword,
  hashPassword,
  getTempPasswordExpirationDate,
  toDbRoleEnum,
  normalizeRoleName
} from '../_lib/security.js';

export default async function handler(req, res) {
  const actor = await getAuthenticatedUser(req);
  if (!actor) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  // Validación estricta de rol en el servidor: solo Superadministrador o Administrador
  const isSuperadmin = actor.rol === 'Superadministrador';
  const isAdmin = actor.rol === 'Administrador' || isSuperadmin;

  if (!isAdmin) {
    return res.status(403).json({
      error: 'No tenés permisos suficientes en el servidor para administrar usuarios.'
    });
  }

  const db = getPool();
  if (!db) {
    return res.status(503).json({ error: 'Base de datos no conectada.' });
  }

  await ensureSecurityTables();

  // LISTAR USUARIOS
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query(
        `SELECT u.id, u.nombre_completo AS nombre, u.email, u.telefono, u.rol, u.activo,
                u.is_temp_password, u.debe_cambiar_password, u.temp_password_expires_at,
                u.ultimo_ingreso, u.created_at,
                COUNT(c.id)::int AS passkeys_count
         FROM usuarios u
         LEFT JOIN credenciales_webauthn c ON c.usuario_id = u.id
         WHERE u.deleted_at IS NULL
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );

      const sanitized = rows
        .map(r => ({
          id: r.id,
          nombre: r.nombre,
          email: r.email,
          telefono: r.telefono || '',
          rol: normalizeRoleName(r.rol),
          activo: r.activo,
          must_change_password: Boolean(r.is_temp_password || r.debe_cambiar_password),
          temp_password_expires_at: r.temp_password_expires_at,
          ultimo_ingreso: r.ultimo_ingreso,
          created_at: r.created_at,
          passkeys_count: r.passkeys_count || 0
        }))
        .filter(u => isSuperadmin || u.rol !== 'Superadministrador');

      return res.status(200).json({ users: sanitized });
    } catch (err) {
      console.error('[LUMIA Users GET Error]:', err.message);
      return res.status(500).json({ error: 'Error al consultar usuarios.' });
    }
  }

  // CREAR NUEVO USUARIO CON CONTRASEÑA TEMPORAL CSPRNG DE UN SOLO USO (48 HORAS)
  if (req.method === 'POST') {
    const { nombre, email, telefono, rolNombre } = req.body || {};
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y correo electrónico son obligatorios.' });
    }

    const targetRole = normalizeRoleName(rolNombre || 'Rescatista');
    if (targetRole === 'Superadministrador' && !isSuperadmin) {
      return res.status(403).json({
        error: 'Solo un Superadministrador puede asignar el rol de Superadministrador.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const tempPassword = generateSecureTempPassword(14); // 14 caracteres CSPRNG
    const passwordHash = await hashPassword(tempPassword);
    const expiresAt = getTempPasswordExpirationDate();

    try {
      const { rows } = await db.query(
        `INSERT INTO usuarios (
           nombre_completo, email, password_hash, rol, debe_cambiar_password,
           is_temp_password, temp_password_expires_at, telefono, activo
         )
         VALUES ($1, $2, $3, $4, TRUE, TRUE, $5, $6, TRUE)
         RETURNING id, nombre_completo, email, telefono, rol, activo, created_at, temp_password_expires_at`,
        [nombre.trim(), cleanEmail, passwordHash, toDbRoleEnum(targetRole), expiresAt.toISOString(), telefono || '']
      );

      const created = rows[0];

      await recordServerAudit({
        usuarioId: actor.id,
        usuarioNombre: actor.nombre,
        accion: 'Alta de usuario con clave temporal CSPRNG (48h)',
        modulo: 'usuarios',
        detalle: {
          nuevo_usuario_id: created.id,
          nuevo_usuario_email: created.email,
          rol_asignado: targetRole,
          expira_en: expiresAt.toISOString()
        },
        ipAddress: req.headers['x-forwarded-for'] || null
      });

      // La clave temporal en texto plano se devuelve UNA SOLA VEZ en esta respuesta y jamás se almacena
      return res.status(201).json({
        user: {
          id: created.id,
          nombre: created.nombre_completo,
          email: created.email,
          telefono: created.telefono || '',
          rol: normalizeRoleName(created.rol),
          activo: created.activo,
          must_change_password: true,
          temp_password_expires_at: created.temp_password_expires_at,
          created_at: created.created_at,
          passkeys_count: 0
        },
        oneTimeTempPassword: tempPassword,
        expiresAt: expiresAt.toISOString()
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un usuario registrado con ese correo electrónico.' });
      }
      console.error('[LUMIA Users POST Error]:', err.message);
      return res.status(500).json({ error: 'Error al crear el usuario.' });
    }
  }

  // RESTABLECER ACCESO / REVOCAR PASSKEYS / CAMBIAR ESTADO O ROL
  if (req.method === 'PATCH') {
    const { userId, action, activo, rolNombre, revokePasskeys } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido.' });
    }

    try {
      const { rows: targetRows } = await db.query(
        `SELECT id, nombre_completo, email, rol FROM usuarios WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [userId]
      );
      if (targetRows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      const targetUser = targetRows[0];
      const targetCurrentRole = normalizeRoleName(targetUser.rol);

      if (targetCurrentRole === 'Superadministrador' && !isSuperadmin) {
        return res.status(403).json({
          error: 'Un Administrador no puede modificar ni restablecer a un Superadministrador.'
        });
      }

      if (action === 'reset_access') {
        const tempPassword = generateSecureTempPassword(14);
        const passwordHash = await hashPassword(tempPassword);
        const expiresAt = getTempPasswordExpirationDate();

        await db.query(
          `UPDATE usuarios
           SET password_hash = $1,
               debe_cambiar_password = TRUE,
               is_temp_password = TRUE,
               temp_password_expires_at = $2,
               failed_login_attempts = 0,
               locked_until = NULL,
               updated_at = NOW()
           WHERE id = $3`,
          [passwordHash, expiresAt.toISOString(), userId]
        );

        let revokedCount = 0;
        if (revokePasskeys !== false) {
          const delRes = await db.query(
            `DELETE FROM credenciales_webauthn WHERE usuario_id = $1`,
            [userId]
          );
          revokedCount = delRes.rowCount || 0;
        }

        // Revocar sesiones activas previas
        await db.query(`UPDATE sesiones_auth SET revoked = TRUE WHERE usuario_id = $1`, [userId]);

        await recordServerAudit({
          usuarioId: actor.id,
          usuarioNombre: actor.nombre,
          accion: revokePasskeys !== false
            ? 'Restablecimiento de clave temporal (48h) y revocación de Passkeys'
            : 'Restablecimiento de clave temporal (48h)',
          modulo: 'usuarios',
          detalle: {
            usuario_afectado_id: targetUser.id,
            usuario_afectado_email: targetUser.email,
            passkeys_revocadas: revokedCount,
            expira_en: expiresAt.toISOString()
          },
          ipAddress: req.headers['x-forwarded-for'] || null
        });

        return res.status(200).json({
          success: true,
          oneTimeTempPassword: tempPassword,
          expiresAt: expiresAt.toISOString(),
          revokedPasskeysCount: revokedCount
        });
      }

      if (typeof activo === 'boolean') {
        await db.query(`UPDATE usuarios SET activo = $1, updated_at = NOW() WHERE id = $2`, [activo, userId]);
        await recordServerAudit({
          usuarioId: actor.id,
          usuarioNombre: actor.nombre,
          accion: activo ? 'Reactivación de cuenta de usuario' : 'Desactivación de cuenta de usuario',
          modulo: 'usuarios',
          detalle: { usuario_afectado_email: targetUser.email },
          ipAddress: req.headers['x-forwarded-for'] || null
        });
        return res.status(200).json({ success: true });
      }

      if (rolNombre) {
        const newRole = normalizeRoleName(rolNombre);
        if (newRole === 'Superadministrador' && !isSuperadmin) {
          return res.status(403).json({ error: 'Solo el Superadministrador puede otorgar ese rol.' });
        }
        await db.query(`UPDATE usuarios SET rol = $1, updated_at = NOW() WHERE id = $2`, [toDbRoleEnum(newRole), userId]);
        await recordServerAudit({
          usuarioId: actor.id,
          usuarioNombre: actor.nombre,
          accion: 'Cambio de rol de usuario',
          modulo: 'usuarios',
          detalle: {
            usuario_afectado_email: targetUser.email,
            rol_anterior: targetCurrentRole,
            rol_nuevo: newRole
          },
          ipAddress: req.headers['x-forwarded-for'] || null
        });
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Acción inválida.' });
    } catch (err) {
      console.error('[LUMIA Users PATCH Error]:', err.message);
      return res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
