import { compressImage } from '../lib/imageCompression';

/**
 * Servicio cliente para autocompletar formularios mediante Visión por IA (OCR Inteligente).
 * 
 * @param {Object} params
 * @param {File|Blob} params.file - Archivo de imagen seleccionado o capturado con la cámara
 * @param {Array} params.schema - Definición dinámica de los campos del formulario
 * @param {Object} [params.currentUser] - Usuario actual para trazabilidad de sesión y auditoría
 * @returns {Promise<{ extractedData: Object, fieldsExtractedCount: number, totalSchemaFields: number }>}
 */
export async function scanFormWithAI({ file, schema, currentUser }) {
  if (!file) {
    throw new Error('Seleccioná o capturá una imagen para analizar.');
  }

  if (!Array.isArray(schema) || schema.length === 0) {
    throw new Error('No se definió el esquema de campos para este formulario.');
  }

  // 1. Compresión del lado cliente (máximo 1200px, 80% calidad JPEG)
  const compressed = await compressImage(file, 1200, 0.8);

  // 2. Envío al endpoint seguro del servidor
  const res = await fetch('/api/ai/scan-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lumia-user-id': currentUser?.id || '',
      'x-lumia-role': currentUser?.rol || ''
    },
    credentials: 'include',
    body: JSON.stringify({
      image: compressed.dataUrl,
      mimeType: compressed.mimeType,
      schema
    })
  });

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    throw new Error('El servidor de análisis no devolvió una respuesta válida. Código: ' + res.status);
  }

  if (!res.ok) {
    throw new Error(data.error || 'No se pudo procesar la imagen con IA en este momento.');
  }

  return {
    extractedData: data.extractedData || {},
    fieldsExtractedCount: data.fieldsExtractedCount || 0,
    totalSchemaFields: data.totalSchemaFields || schema.length
  };
}
