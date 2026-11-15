import { v7 as uuidv7 } from 'uuid';

/**
 * Generates a timestamp-ordered, collision-free UUIDv7
 */
export function generateEntityId(prefix = '') {
  const id = uuidv7();
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Masks sensitive personal information (Ley 25.326 Argentina)
 * E.g. DNI "34567890" -> "***7890", Address "Av. Corrientes 1234" -> "Av. Corrientes ***"
 */
export function maskSensitiveValue(val, type = 'dni') {
  if (!val || typeof val !== 'string') return val;
  const clean = val.trim();
  if (type === 'dni') {
    if (clean.length <= 4) return '***';
    return `***${clean.slice(-4)}`;
  }
  if (type === 'address') {
    const parts = clean.split(' ');
    if (parts.length <= 1) return '***';
    return `${parts[0]} ***`;
  }
  return '***';
}

/**
 * Strips or masks sensitive fields if user is not authorized to see full PII
 */
export function sanitizeAdopterRecord(adopter, userRole) {
  if (!adopter) return adopter;
  const isPrivileged = userRole === 'Superadministrador' || userRole === 'Administrador';
  if (isPrivileged) return adopter;

  return {
    ...adopter,
    dni_cuit: maskSensitiveValue(adopter.dni_cuit, 'dni'),
    direccion_numero: '***',
    direccion_piso_depto: '***',
    foto_dni_frente: null,
    foto_dni_dorso: null,
    _masked: true
  };
}
