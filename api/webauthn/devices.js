import { ensureSecurityTables, withRlsContext, recordServerAudit } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/security.js';

export default async function handler(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  try {
    await ensureSecurityTables();

    if (req.method === 'GET') {
      const devices = await withRlsContext(user, async (client) => {
        const { rows } = await client.query(
          `SELECT id, credential_id, nombre_dispositivo, created_at, last_used_at
           FROM credenciales_webauthn
           WHERE usuario_id = $1
           ORDER BY created_at DESC`,
          [user.id]
        );
        return rows;
      });

      return res.status(200).json({ devices });
    }

    if (req.method === 'DELETE') {
      const { deviceId } = req.body || req.query || {};
      if (!deviceId) {
        return res.status(400).json({ error: 'ID de dispositivo requerido.' });
      }

      const deleted = await withRlsContext(user, async (client) => {
        const { rows } = await client.query(
          `DELETE FROM credenciales_webauthn
           WHERE id = $1 AND usuario_id = $2
           RETURNING id, nombre_dispositivo`,
          [deviceId, user.id]
        );
        return rows[0] || null;
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Dispositivo no encontrado.' });
      }

      await recordServerAudit({
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        accion: 'Baja de dispositivo Passkey por el usuario',
        modulo: 'seguridad_biometrica',
        detalle: { dispositivo: deleted.nombre_dispositivo },
        ipAddress: req.headers['x-forwarded-for'] || null
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[LUMIA WebAuthn Devices Error]:', err.message);
    return res.status(500).json({ error: 'Error al gestionar dispositivos biométricos.' });
  }
}
