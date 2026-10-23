// Utilidades de formato para Argentina (fechas DD/MM/AAAA, WhatsApp wa.me, etc.)

/**
 * Formatea una fecha a formato rioplatense DD/MM/AAAA
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Formatea fecha y hora completa
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Calcula si una fecha ya venció
 */
export function isOverdue(dateString) {
  if (!dateString) return false;
  const target = new Date(dateString).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return target < today;
}

/**
 * Calcula si una fecha vence pronto (próximos 7 días)
 */
export function isDueSoon(dateString, days = 7) {
  if (!dateString) return false;
  const target = new Date(dateString).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const diffDays = (target - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Limpia y normaliza un teléfono celular a formato internacional para WhatsApp
 * Ej: 011 15-5544-3322 o 1155443322 -> 5491155443322
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  // Quitar 0 inicial si existe
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // Si no empieza con 54, agregar prefijo argentino
  if (!cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Genera el enlace directo de WhatsApp con mensaje personalizado de seguimiento
 */
export function getWhatsappLink(phone, messageText) {
  const number = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Generador de plantillas de mensaje para adoptantes
 */
export function getWhatsappTemplate({ adoptanteNombre, animalNombre, diasDesdeEntrega = 15 }) {
  const nombreCorto = (adoptanteNombre || 'Hola').split(' ')[0];
  const pet = animalNombre || 'tu compañero';

  return `¡Hola ${nombreCorto}! 🐾 Te escribo desde Patita Aliada para saber cómo andan las cosas con ${pet}. 
Queríamos ver cómo viene la convivencia y si se viene adaptando bien a las rutinas de la casa. 
Cuando tengas un ratito libre, ¿nos mandarías una fotito o videito actual para ver cómo está? ¡Te mandamos un abrazo enorme y gracias por darle una oportunidad! ❤️`;
}

/**
 * Formato amigable de DNI / CUIT argentino
 */
export function formatDNI(dni) {
  if (!dni) return '-';
  const clean = dni.replace(/\D/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  }
  if (clean.length === 11) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
  }
  return dni;
}
