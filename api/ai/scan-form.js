import { getAuthenticatedUser, normalizeRoleName } from '../_lib/security.js';

const SYSTEM_PROMPT = 
  "Analiza la imagen proporcionada y extrae los datos correspondientes para completar el esquema JSON solicitado según el contexto de cada campo. Devuelve ÚNICAMENTE un objeto JSON válido cuyas claves coincidan exactamente con las solicitadas. Si un dato no es legible o no aparece en la imagen, devuelve null en ese campo sin inventar ni adivinar información. Formatea fechas en YYYY-MM-DD y valores numéricos sin símbolos de moneda.";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  // 1. Verificación de sesión o rol del usuario
  const user = await getAuthenticatedUser(req);
  const clientRole = normalizeRoleName(user?.rol || req.headers?.['x-lumia-role']);
  const effectiveUserId = user?.id || req.headers?.['x-lumia-user-id'];

  if (!user && !effectiveUserId) {
    return res.status(401).json({
      error: 'Se requiere iniciar sesión en LUMIA para utilizar el escaneo inteligente de formularios.'
    });
  }

  if (clientRole === 'Solo lectura' || clientRole === 'VOLUNTARIO') {
    return res.status(403).json({
      error: 'Tu perfil de permisos no tiene autorización para modificar o autocompletar formularios.'
    });
  }

  // 2. Extraer y validar el payload
  const { image, mimeType = 'image/jpeg', schema = [] } = req.body || {};

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Falta la imagen a analizar en formato Base64.' });
  }

  if (!Array.isArray(schema) || schema.length === 0) {
    return res.status(400).json({ error: 'Se requiere un esquema de campos válido para extraer datos.' });
  }

  // Limpiar Base64 si incluye el prefijo data:...;base64,
  let base64Data = image;
  let effectiveMime = mimeType;
  const dataUriMatch = image.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    effectiveMime = dataUriMatch[1];
    base64Data = dataUriMatch[2];
  }

  // 3. Clave y Modelo de Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return res.status(503).json({
      error: 'El servicio de visión por IA requiere la variable de entorno GEMINI_API_KEY en el servidor.'
    });
  }

  try {
    // 4. Construir descripción del esquema JSON para el prompt
    const fieldsDescription = schema.map(f => {
      let desc = `- "${f.name}": (${f.type || 'texto'}) ${f.label || ''}`;
      if (f.context) desc += ` — Contexto: ${f.context}`;
      if (Array.isArray(f.options) && f.options.length > 0) {
        desc += ` [Opciones válidas estrictas: ${f.options.map(o => `"${o}"`).join(', ')}]`;
      }
      return desc;
    }).join('\n');

    const userPrompt = 
      `Campos a extraer de la imagen (devolvé exactamente un objeto JSON con estas claves):\n` +
      `${fieldsDescription}\n\n` +
      `Si un dato no se encuentra en la imagen, asignale null. Recordá: Fechas en formato YYYY-MM-DD, números sin símbolos ni separadores de miles.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: effectiveMime,
                  data: base64Data
                }
              },
              {
                text: userPrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Gemini Vision API Error]:', response.status, errBody);
      return res.status(502).json({
        error: 'El servicio de visión inteligente de Gemini no pudo procesar la imagen en este momento.'
      });
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({
        error: 'La IA no devolvió ninguna respuesta legible a partir de la imagen.'
      });
    }

    // 5. Parsear y validar el JSON devuelto
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      // Intentar limpiar bloques markdown tipo ```json ... ```
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Sanitizar resultado devolviendo solo claves del esquema
    const allowedKeys = new Set(schema.map(f => f.name));
    const sanitizedData = {};
    let matchedCount = 0;

    for (const [key, val] of Object.entries(parsedResult || {})) {
      if (allowedKeys.has(key)) {
        if (val !== null && val !== undefined && val !== '') {
          sanitizedData[key] = val;
          matchedCount++;
        } else {
          sanitizedData[key] = null;
        }
      }
    }

    return res.status(200).json({
      success: true,
      extractedData: sanitizedData,
      fieldsExtractedCount: matchedCount,
      totalSchemaFields: schema.length
    });

  } catch (error) {
    console.error('[Scan Form Handler Error]:', error);
    return res.status(500).json({
      error: 'Ocurrió un error inesperado al analizar la imagen con IA: ' + (error.message || 'Error desconocido')
    });
  }
}
