import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPool, ensureSecurityTables } from './db.js';

const BCRYPT_ROUNDS = 12;
const COOKIE_NAME = 'lumia_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas
const TEMP_PASSWORD_TTL_MS = 48 * 60 * 60 * 1000; // 48 horas exactas

// Lista de contraseñas comunes o predecibles prohibidas
const COMMON_PASSWORDS_BLACKLIST = new Set([
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  '111111',
  '1111111111',
  '0000000000',
  'password',
  'password123',
  'contraseña',
  'contrasena',
  'qwertyuiop',
  'qwerty1234',
  'administrador',
  'superadmin',
  'rescatista',
  'patitaaliada',
  'temporal-patita',
  'lumia12345',
  'argentina1',
]);

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.DATABASE_URL || 'lumia-fallback-hmac-key-rotate-in-vercel-prod';
}

/**
 * Genera una contraseña temporal criptográficamente segura de 14 caracteres
 */
export function generateSecureTempPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*+-=?';
  const all = upper + lower + digits + symbols;

  const bytes = crypto.randomBytes(length * 2);
  const chars = [
    upper[bytes[0] % upper.length],
    lower[bytes[1] % lower.length],
    digits[bytes[2] % digits.length],
    symbols[bytes[3] % symbols.length],
  ];

  for (let i = 4; i < length; i++) {
    chars.push(all[bytes[i] % all.length]);
  }

  // Mezclar con Fisher-Yates usando bytes criptográficos
  for (let i = chars.length - 1; i > 0; i--) {
    const j = bytes[length + i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Valida la política de nueva contraseña definitiva:
 * - Mínimo 10 caracteres
 * - Rechaza contraseñas comunes / repetitivas
 * - Rechaza si incluye el nombre o correo del usuario
 */
export function validatePasswordPolicy(newPassword, { email = '', nombre = '', oldPassword = '' } = {}) {
  if (!newPassword || typeof newPassword !== 'string') {
    return { valid: false, message: 'Debés ingresar una contraseña válida.' };
  }

  if (newPassword.length < 10) {
    return { valid: false, message: 'La nueva contraseña debe tener como mínimo 10 caracteres.' };
  }

  if (newPassword.length > 128) {
    return { valid: false, message: 'La contraseña no puede superar los 128 caracteres.' };
  }

  const normalized = newPassword.toLowerCase().trim();

  if (COMMON_PASSWORDS_BLACKLIST.has(normalized) || /^(\d)\1+$/.test(normalized) || /^12345/.test(normalized)) {
    return {
      valid: false,
      message: 'Esta contraseña es muy común o predecible. Elegí una combinación única y segura.'
    };
  }

  if (oldPassword && newPassword === oldPassword) {
    return {
      valid: false,
      message: 'La nueva contraseña debe ser diferente a la clave temporal o anterior.'
    };
  }

  // Verificar que no contenga el correo o partes del nombre del usuario
  const emailUser = (email || '').split('@')[0]?.toLowerCase();
  if (emailUser && emailUser.length >= 3 && normalized.includes(emailUser)) {
    return {
      valid: false,
      message: 'Por seguridad, la contraseña no puede contener tu dirección de correo electrónico.'
    };
  }

  const nameParts = (nombre || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(p => p.length >= 3);

  for (const part of nameParts) {
    if (normalized.includes(part)) {
      return {
        valid: false,
        message: 'Por seguridad, la contraseña no puede contener tu nombre o apellido.'
      };
    }
  }

  return { valid: true };
}

/**
 * Hashea una contraseña con bcrypt (costo 12)
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash bcrypt
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Calcula la fecha de vencimiento de una clave temporal (48 horas)
 */
export function getTempPasswordExpirationDate() {
  return new Date(Date.now() + TEMP_PASSWORD_TTL_MS);
}

/**
 * Firma un payload de sesión con HMAC-SHA256 y devuelve el token
 */
export function createSignedSessionToken(userPayload) {
  const payload = {
    id: userPayload.id,
    email: userPayload.email,
    nombre: userPayload.nombre,
    rol: userPayload.rol,
    must_change_password: Boolean(userPayload.must_change_password),
    exp: Date.now() + SESSION_TTL_MS,
    jti: crypto.randomBytes(16).toString('hex')
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

/**
 * Verifica un token de sesión firmado
 */
export function verifySignedSessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [base64Payload, signature] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(base64Payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Emite la cookie de sesión con atributos HttpOnly, Secure y SameSite=Strict
 */
export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${maxAge}`
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

/**
 * Limpia la cookie de sesión al cerrar sesión
 */
export function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const parts = [
    `${COOKIE_NAME}=`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=0`
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

/**
 * Parsea las cookies de la petición HTTP
 */
export function parseCookies(req) {
  const header = req.headers?.cookie || '';
  const cookies = {};
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}

/**
 * Normaliza los nombres de rol entre base de datos SQL y aplicación
 */
export function normalizeRoleName(rawRole) {
  if (!rawRole) return 'Rescatista';
  const upper = String(rawRole).toUpperCase().trim();
  if (upper === 'SUPERADMIN' || upper === 'SUPERADMINISTRADOR') return 'Superadministrador';
  if (upper === 'ADMIN' || upper === 'ADMINISTRADOR') return 'Administrador';
  if (upper === 'RESCATISTA') return 'Rescatista';
  if (upper === 'COLABORADORA' || upper === 'HOGAR_TRANSITO') return 'Colaboradora';
  if (upper === 'SOLO LECTURA' || upper === 'SOLO_LECTURA' || upper === 'VOLUNTARIO') return 'Solo lectura';
  return rawRole;
}

export function toDbRoleEnum(appRole) {
  const norm = normalizeRoleName(appRole);
  if (norm === 'Superadministrador') return 'SUPERADMIN';
  if (norm === 'Administrador') return 'ADMIN';
  if (norm === 'Rescatista') return 'RESCATISTA';
  if (norm === 'Colaboradora') return 'HOGAR_TRANSITO';
  return 'VOLUNTARIO';
}

/**
 * Obtiene y valida la sesión actual en el servidor (vía cookie HttpOnly o cabecera)
 */
export async function getAuthenticatedUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME] || req.headers?.['x-lumia-session'];
  const decoded = verifySignedSessionToken(token);
  if (!decoded) return null;

  const db = getPool();
  if (db) {
    try {
      await ensureSecurityTables();
      const { rows } = await db.query(
        `SELECT id, nombre_completo, email, rol, activo, is_temp_password, debe_cambiar_password
         FROM usuarios
         WHERE id = $1 AND deleted_at IS NULL
         LIMIT 1`,
        [decoded.id]
      );
      if (rows.length > 0) {
        const u = rows[0];
        if (!u.activo) return null;
        return {
          id: u.id,
          nombre: u.nombre_completo,
          email: u.email,
          rol: normalizeRoleName(u.rol),
          must_change_password: Boolean(u.is_temp_password || u.debe_cambiar_password)
        };
      }
    } catch {
      // Fallback al token firmado validado por HMAC si la tabla usa otro esquema
    }
  }

  return {
    id: decoded.id,
    nombre: decoded.nombre,
    email: decoded.email,
    rol: normalizeRoleName(decoded.rol),
    must_change_password: Boolean(decoded.must_change_password)
  };
}

/**
 * Obtiene el Relying Party (rpID y origin) para WebAuthn según el entorno (Vercel prod o dev)
 */
export function getWebAuthnRpConfig(req) {
  const hostHeader = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost:5173';
  const hostname = hostHeader.split(':')[0];
  const proto = req.headers?.['x-forwarded-proto'] || (hostname === 'localhost' ? 'http' : 'https');

  const rpID = process.env.RP_ID || hostname;
  const origin = process.env.RP_ORIGIN || `${proto}://${hostHeader}`;

  return {
    rpName: 'LUMIA — Gestión de Rescates y Adopciones',
    rpID,
    origin
  };
}
