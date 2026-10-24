import { getPool, ensureSecurityTables, recordServerAudit } from '../_lib/db.js';
import { getAuthenticatedUser, normalizeRoleName } from '../_lib/security.js';
import { PATITA_ALIADA_SYSTEM_INSTRUCTION } from '../_lib/patitaSystemPrompt.js';

const MAX_MESSAGES_PER_HOUR = 30;
const HOUR_WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_TURNS = 10;

// Rate limit en memoria de respaldo si la consulta se hace sin latencia de DB
const userMemoryQuota = new Map();

function checkMemoryQuota(userId) {
  const now = Date.now();
  const entry = userMemoryQuota.get(userId);
  if (!entry || now - entry.windowStart > HOUR_WINDOW_MS) {
    const fresh = { count: 1, windowStart: now };
    userMemoryQuota.set(userId, fresh);
    return { allowed: true, count: 1 };
  }
  if (entry.count >= MAX_MESSAGES_PER_HOUR) {
    return { allowed: false, count: entry.count };
  }
  entry.count += 1;
  return { allowed: true, count: entry.count };
}

/**
 * Sanea el contexto opcional de un animal para garantizar que JAMÁS se envíen
 * datos personales o sensibles de adoptantes (Ley 25.326: DNI, domicilio, teléfono, fotos de DNI).
 */
function buildSanitizedAnimalContext(rawAnimal) {
  if (!rawAnimal || typeof rawAnimal !== 'object') return '';

  const safeFields = {
    codigo: String(rawAnimal.codigo_interno || '').slice(0, 30),
    nombre: String(rawAnimal.nombre_actual || '').slice(0, 60),
    especie: String(rawAnimal.especie || '').slice(0, 30),
    sexo: String(rawAnimal.sexo || '').slice(0, 30),
    edad_estimada: String(rawAnimal.edad_estimada || '').slice(0, 50),
    tamano: String(rawAnimal.tamano || '').slice(0, 30),
    estado_caso: String(rawAnimal.estado_caso || '').slice(0, 40),
    senas_y_pelaje: String(rawAnimal.pelaje_color_senas_particulares || '').slice(0, 300),
    conducta: String(rawAnimal.notas_conducta || '').slice(0, 300),
    convivencia_perros: String(rawAnimal.relacion_con_perros || '').slice(0, 150),
    convivencia_gatos: String(rawAnimal.relacion_con_gatos || '').slice(0, 150),
    convivencia_personas: String(rawAnimal.relacion_con_personas || '').slice(0, 150),
    resumen_salud: Array.isArray(rawAnimal.eventos_salud)
      ? rawAnimal.eventos_salud
          .slice(0, 8)
          .map(ev => `${ev.tipo_evento || 'Evento'}: ${ev.producto_o_detalle || ''} (${ev.fecha || ''})`)
          .join(' | ')
          .slice(0, 400)
      : ''
  };

  return (
    `\n[CONTEXTO CLÍNICO DEL ANIMAL EN LUMIA — SIN DATOS DE ADOPTANTES]\n` +
    `- Nombre y código: ${safeFields.nombre} (${safeFields.codigo})\n` +
    `- Especie y sexo: ${safeFields.especie}, ${safeFields.sexo}\n` +
    `- Edad estimada y tamaño: ${safeFields.edad_estimada}, tamaño ${safeFields.tamano}\n` +
    `- Estado actual: ${safeFields.estado_caso}\n` +
    `- Señas / pelaje: ${safeFields.senas_y_pelaje || 'No especificado'}\n` +
    `- Conducta y socialización: ${safeFields.conducta || 'Sin notas'} | Perros: ${safeFields.convivencia_perros} | Gatos: ${safeFields.convivencia_gatos} | Personas: ${safeFields.convivencia_personas}\n` +
    `- Libreta sanitaria: ${safeFields.resumen_salud || 'Sin eventos registrados aún'}\n`
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 1. Validar sesión y rol en el servidor
  const user = await getAuthenticatedUser(req);
  const clientRole = normalizeRoleName(user?.rol || req.headers?.['x-lumia-role']);

  if (!user && !req.headers?.['x-lumia-user-id']) {
    return res.status(401).json({
      error: 'Necesitás iniciar sesión en LUMIA para consultar a Patita Aliada.'
    });
  }

  const effectiveRole = user ? user.rol : clientRole;
  const effectiveUserId = user?.id || req.headers?.['x-lumia-user-id'];
  const effectiveUserName = user?.nombre || 'Rescatista LUMIA';

  // Bloquear explícitamente al rol "Solo lectura"
  if (effectiveRole === 'Solo lectura' || effectiveRole === 'VOLUNTARIO') {
    return res.status(403).json({
      error: 'Tu perfil de Solo Lectura no tiene habilitado el uso del asistente Patita Aliada.'
    });
  }

  // 2. Validar mensaje y longitud máxima para controlar costos
  const { message, history = [], animalContext = null } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Escribí tu consulta para que pueda ayudarte.' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Tu mensaje supera el límite de ${MAX_MESSAGE_LENGTH} caracteres. Por favor resumilo un poquito para poder responderte rápido.`
    });
  }

  // 3. Rate limiting por usuario (30 mensajes por hora)
  const memQuota = checkMemoryQuota(String(effectiveUserId));
  if (!memQuota.allowed) {
    return res.status(429).json({
      error: 'Alcanzaste el límite de 30 consultas por hora a Patita Aliada. Descansá unos minutos y volvé a escribirme.'
    });
  }

  const db = getPool();
  if (db && effectiveUserId && /^[0-9a-fA-F-]{36}$/.test(String(effectiveUserId))) {
    try {
      await ensureSecurityTables();
      const { rows } = await db.query(
        `SELECT ai_queries_hour_count, ai_queries_window_start
         FROM usuarios
         WHERE id = $1 LIMIT 1`,
        [effectiveUserId]
      );

      if (rows.length > 0) {
        const u = rows[0];
        const windowStart = u.ai_queries_window_start ? new Date(u.ai_queries_window_start).getTime() : 0;
        const expiredWindow = Date.now() - windowStart > HOUR_WINDOW_MS;
        const currentHourCount = expiredWindow ? 0 : (u.ai_queries_hour_count || 0);

        if (currentHourCount >= MAX_MESSAGES_PER_HOUR) {
          return res.status(429).json({
            error: 'Alcanzaste el límite de 30 consultas por hora. Aguardá unos minutos para continuar.'
          });
        }

        await db.query(
          `UPDATE usuarios
           SET ai_queries_hour_count = $1,
               ai_queries_window_start = CASE WHEN $2 THEN NOW() ELSE COALESCE(ai_queries_window_start, NOW()) END,
               ai_queries_total = COALESCE(ai_queries_total, 0) + 1
           WHERE id = $3`,
          [currentHourCount + 1, expiredWindow, effectiveUserId]
        );
      }
    } catch (dbErr) {
      console.warn('[LUMIA AI Quota DB Note]:', dbErr.message);
    }
  }

  // 4. Verificar clave de API de Gemini en servidor
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return res.status(503).json({
      error: 'El servicio de IA aún no tiene configurada la variable GEMINI_API_KEY en el servidor.'
    });
  }

  try {
    // 5. Construir historial limpio (sin datos sensibles)
    const sanitizedContextBlock = buildSanitizedAnimalContext(animalContext);
    const recentHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];

    const contents = recentHistory
      .filter(turn => turn && typeof turn.text === 'string' && turn.text.trim())
      .map(turn => ({
        role: turn.role === 'model' ? 'model' : 'user',
        parts: [{ text: turn.text.slice(0, MAX_MESSAGE_LENGTH) }]
      }));

    const finalUserPrompt = sanitizedContextBlock
      ? `${sanitizedContextBlock}\nConsulta de la rescatista: ${trimmedMessage}`
      : trimmedMessage;

    contents.push({
      role: 'user',
      parts: [{ text: finalUserPrompt }]
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: PATITA_ALIADA_SYSTEM_INSTRUCTION }]
        },
        contents,
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[LUMIA Gemini API Error]:', response.status, errBody.slice(0, 200));
      return res.status(502).json({
        error: 'En este momento no pude conectarme para responderte. Probá de nuevo en unos segundos; ante una urgencia acudí directo a una guardia veterinaria.'
      });
    }

    const data = await response.json();
    const replyText =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') ||
      'Perdón, no pude procesar bien la respuesta. ¿Me contás de nuevo qué está pasando?';

    // 6. Registrar en auditoría ÚNICAMENTE el consumo (sin guardar jamás el contenido de la charla)
    await recordServerAudit({
      usuarioId: effectiveUserId,
      usuarioNombre: effectiveUserName,
      accion: 'Consulta a asistente IA Patita Aliada',
      modulo: 'asistente_ia',
      detalle: {
        rol_usuario: effectiveRole,
        incluyo_ficha_animal: Boolean(animalContext?.codigo_interno),
        consultas_hora_actual: memQuota.count
      },
      ipAddress: req.headers['x-forwarded-for'] || null
    });

    return res.status(200).json({
      reply: replyText,
      remainingInHour: Math.max(0, MAX_MESSAGES_PER_HOUR - memQuota.count)
    });
  } catch (err) {
    console.error('[LUMIA AI Chat Error]:', err.message);
    return res.status(500).json({
      error: 'Ocurrió un inconveniente de conexión con el asistente. El resto de la aplicación sigue funcionando con normalidad.'
    });
  }
}
