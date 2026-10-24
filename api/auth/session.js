import { getAuthenticatedUser, clearSessionCookie } from '../_lib/security.js';
import { recordServerAudit } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ authenticated: false, user: null });
    }
    return res.status(200).json({ authenticated: true, user });
  }

  if (req.method === 'DELETE' || req.method === 'POST') {
    const user = await getAuthenticatedUser(req);
    clearSessionCookie(res);
    if (user) {
      await recordServerAudit({
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        accion: 'Cierre de sesión',
        modulo: 'autenticacion',
        ipAddress: req.headers['x-forwarded-for'] || null
      });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
