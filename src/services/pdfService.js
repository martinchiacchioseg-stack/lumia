/**
 * LUMIA - LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
 * Servicio Centralizado de Generación de Documentos y PDFs Oficiales
 * 
 * Color Corporativo Oficial: #C94A2A (Terracota Vívido)
 * Todos los documentos del sistema consumen este servicio para garantizar
 * la identidad visual unificada y el membrete oficial transparente.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LUMIA_COLORS, LUMIA_LOGO_BASE64 } from '../lib/brandingAssets.js';
import { formatDate } from '../lib/formatters.js';

// Configuración general de página A4 en milímetros
const PAGE_CONFIG = {
  format: 'a4',
  unit: 'mm',
  orientation: 'portrait',
  width: 210,
  height: 297,
  marginLeft: 14,
  marginRight: 14,
  marginTop: 12,
  marginBottom: 14
};

// Conversión de color HEX a RGB para jsPDF
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

const PRIMARY_RGB = hexToRgb(LUMIA_COLORS.primary); // #C94A2A

/**
 * Aplica el membrete superior oficial LUMIA en cualquier página de documento
 */
export function applyOfficialHeader(doc, { title = 'LIBRETA SANITARIA OFICIAL', subtitle = '', codigo = '' } = {}) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Inyección del Logo Oficial Transparente (36mm x 24mm proporcional)
  try {
    doc.addImage(LUMIA_LOGO_BASE64, 'PNG', PAGE_CONFIG.marginLeft, 8, 38, 25, undefined, 'FAST');
  } catch (err) {
    // Fallback de texto si el renderizador de imagen tiene un problema
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('LUMIA', PAGE_CONFIG.marginLeft, 18);
  }

  // Título del documento a la derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text(title.toUpperCase(), pageWidth - PAGE_CONFIG.marginRight, 16, { align: 'right' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110, 98, 95);
    doc.text(subtitle, pageWidth - PAGE_CONFIG.marginRight, 20.5, { align: 'right' });
  }

  if (codigo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(43, 35, 33);
    doc.text(`REGISTRO: ${codigo}`, pageWidth - PAGE_CONFIG.marginRight, 25, { align: 'right' });
  }

  // Línea divisoria decorativa con color corporativo #C94A2A
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.setLineWidth(0.6);
  doc.line(PAGE_CONFIG.marginLeft, 35, pageWidth - PAGE_CONFIG.marginRight, 35);

  doc.setDrawColor(232, 163, 146);
  doc.setLineWidth(0.2);
  doc.line(PAGE_CONFIG.marginLeft, 36, pageWidth - PAGE_CONFIG.marginRight, 36);
}

/**
 * Aplica el pie de página oficial con numeración y nota legal
 */
export function applyOfficialFooter(doc, pageNumber = 1, totalPages = 1) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 10;

  // Línea sutil
  doc.setDrawColor(220, 215, 213);
  doc.setLineWidth(0.3);
  doc.line(PAGE_CONFIG.marginLeft, footerY - 3, pageWidth - PAGE_CONFIG.marginRight, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(110, 98, 95);
  doc.text(
    'LUMIA — Libreta Única de Mascotas, Informes y Adopciones • Sistema Nacional para Rescatistas • Ley 25.326',
    PAGE_CONFIG.marginLeft,
    footerY + 1
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - PAGE_CONFIG.marginRight, footerY + 1, { align: 'right' });
}

/**
 * Validador y normalizador seguro de datos de entrada para la Libreta
 */
function normalizeLibretaData(data = {}) {
  const mascota = data.mascota || {};
  const adoptante = data.adoptante || {};
  const adopcion = data.adopcion || {};
  const historial = Array.isArray(data.historial) ? data.historial : [];
  const options = data.options || {};

  return {
    mascota: {
      nombre: mascota.nombre_actual || mascota.nombre || 'Sin nombre',
      especie: mascota.especie || 'perro',
      raza: mascota.raza || mascota.pelaje_color_senas_particulares || 'Mestizo',
      sexo: mascota.sexo || 'No especificado',
      edad_estimada: mascota.edad_estimada || 'Joven',
      fecha_nacimiento: mascota.fecha_nacimiento_aproximada || mascota.fecha_nacimiento || '',
      peso: mascota.peso || mascota.tamano || 'Mediano',
      color: mascota.pelaje_color_senas_particulares || mascota.color || 'No especificado',
      microchip: mascota.microchip || mascota.codigo_interno || 'N/A',
      codigo_interno: mascota.codigo_interno || 'LUM-001',
      procedencia: mascota.ubicacion_rescate || 'Rescate en vía pública',
      foto_url: mascota.foto_portada || mascota.foto || null,
      alimentacion: mascota.alimentacion_recomendada || 'Alimento balanceado estándar',
      notas_conducta: mascota.notas_conducta || 'Sociable y dócil',
    },
    adoptante: {
      nombre: adoptante.nombre_apellido || adoptante.nombre || 'A designar',
      dni: adoptante.dni_cuit || adoptante.dni || 'Sin registrar',
      telefono: adoptante.telefono_whatsapp || adoptante.telefono || 'Sin registrar',
      email: adoptante.email || 'No provisto',
      domicilio: adoptante.direccion_calle
        ? `${adoptante.direccion_calle} ${adoptante.direccion_numero || ''} ${adoptante.direccion_piso_depto || ''}`.trim()
        : adoptante.domicilio || 'Domicilio verificado',
      barrio: adoptante.direccion_barrio || '',
      ciudad: adoptante.direccion_localidad || adoptante.ciudad || 'Buenos Aires',
      provincia: adoptante.direccion_provincia || adoptante.provincia || 'Buenos Aires',
      cp: adoptante.cp || 'CABA/GBA',
      tipo_vivienda: adoptante.tipo_vivienda || 'Vivienda apta para animales',
    },
    adopcion: {
      fecha_entrega: adopcion.fecha_entrega || new Date().toISOString().split('T')[0],
      modalidad: adopcion.modalidad_entrega || adopcion.modalidad || 'Entrega a domicilio',
      periodo_adaptacion: adopcion.periodo_adaptacion_dias || 21,
      compromiso_castracion: Boolean(adopcion.compromiso_castracion),
      fecha_limite_castracion: adopcion.fecha_limite_castracion || '',
      observaciones: adopcion.observaciones || 'Adopción bajo pautas de tenencia responsable LUMIA.',
    },
    historial,
    options: {
      qrCodeUrl: options.qrCodeUrl || `https://lumia.ar/verificar/${mascota.codigo_interno || 'LUM-001'}`,
      organizationName: options.organizationName || 'Red Nacional de Rescatistas de Animales',
      organizationStampUrl: options.organizationStampUrl || null,
      includeActa: options.includeActa !== false,
      ...options
    }
  };
}

/**
 * Carga segura de imagen externa a Base64 con fallback automático
 */
async function loadImgToBase64(url) {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * GENERADOR PRINCIPAL: LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES (LUMIA)
 * 
 * Formato oficial: Documento A4 completo (2 páginas imprimibles a doble faz o plegable)
 * con identidad visual terracota #C94A2A, tabla sanitaria y acta de adopción.
 * 
 * @param {Object} rawData { mascota, adoptante, historial, adopcion, options }
 * @returns {Promise<jsPDF>}
 */
export async function generateLibreta(rawData) {
  const data = normalizeLibretaData(rawData);
  const doc = new jsPDF(PAGE_CONFIG);
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_CONFIG.marginLeft - PAGE_CONFIG.marginRight;

  // Cargar foto de la mascota en segundo plano si existe
  const petPhotoBase64 = data.mascota.foto_url ? await loadImgToBase64(data.mascota.foto_url) : null;

  // =========================================================================
  // PÁGINA 1: PORTADA Y DATOS FILIATORIOS (MASCOTA + FAMILIA ADOPTANTE)
  // =========================================================================
  applyOfficialHeader(doc, {
    title: 'LIBRETA ÚNICA SANITARIA Y DE ADOPCIÓN',
    subtitle: 'DOCUMENTO OFICIAL DE IDENTIFICACIÓN ANIMAL',
    codigo: data.mascota.codigo_interno
  });

  let currentY = 41;

  // --- SECCIÓN 1: DATOS DE LA MASCOTA ---
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('1. DATOS DE IDENTIFICACIÓN DE LA MASCOTA', PAGE_CONFIG.marginLeft + 3, currentY + 4.8);

  currentY += 10;

  // Recuadro para foto de la mascota
  const photoSize = 34;
  const photoX = PAGE_CONFIG.marginLeft;
  const photoY = currentY;

  doc.setDrawColor(220, 215, 213);
  doc.setFillColor(250, 240, 237); // Light terracota fill
  doc.roundedRect(photoX, photoY, photoSize, photoSize, 2, 2, 'FD');

  if (petPhotoBase64) {
    try {
      doc.addImage(petPhotoBase64, 'JPEG', photoX + 1, photoY + 1, photoSize - 2, photoSize - 2, undefined, 'FAST');
    } catch (e) {
      drawPhotoPlaceholder(doc, photoX, photoY, photoSize, data.mascota.nombre);
    }
  } else {
    drawPhotoPlaceholder(doc, photoX, photoY, photoSize, data.mascota.nombre);
  }

  // Grilla de datos de la mascota
  const infoX = photoX + photoSize + 5;
  const col1X = infoX;
  const col2X = infoX + 50;
  const col3X = infoX + 95;

  doc.setTextColor(43, 35, 33);
  doc.setFontSize(8.5);

  const drawField = (label, value, x, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 98, 95);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 35, 33);
    doc.text(String(value || '-'), x, y + 4.2);
  };

  drawField('Nombre de la Mascota:', data.mascota.nombre, col1X, currentY + 1);
  drawField('Especie y Sexo:', `${data.mascota.especie.toUpperCase()} • ${data.mascota.sexo}`, col2X, currentY + 1);
  drawField('Microchip / ID Interno:', data.mascota.codigo_interno, col3X, currentY + 1);

  drawField('Edad Estimada:', data.mascota.edad_estimada, col1X, currentY + 12);
  drawField('Tamaño / Peso:', data.mascota.peso, col2X, currentY + 12);
  drawField('Fecha Nac. Aprox:', formatDate(data.mascota.fecha_nacimiento), col3X, currentY + 12);

  drawField('Pelaje y Señas Particulares:', data.mascota.color, col1X, currentY + 23);
  drawField('Lugar de Procedencia:', data.mascota.procedencia, col3X, currentY + 23);

  currentY += photoSize + 6;

  // --- SECCIÓN 2: DATOS DEL ADOPTANTE / TUTOR RESPONSABLE ---
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('2. DATOS DEL TUTOR / FAMILIA ADOPTANTE (LEY 25.326)', PAGE_CONFIG.marginLeft + 3, currentY + 4.8);

  currentY += 10;

  // Caja de datos del adoptante
  doc.setDrawColor(220, 215, 213);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 27, 2, 2, 'D');

  const adCol1 = PAGE_CONFIG.marginLeft + 4;
  const adCol2 = PAGE_CONFIG.marginLeft + 65;
  const adCol3 = PAGE_CONFIG.marginLeft + 125;

  drawField('Nombre y Apellido:', data.adoptante.nombre, adCol1, currentY + 4);
  drawField('DNI / CUIT:', data.adoptante.dni, adCol2, currentY + 4);
  drawField('Teléfono WhatsApp:', data.adoptante.telefono, adCol3, currentY + 4);

  drawField('Domicilio Completo:', data.adoptante.domicilio, adCol1, currentY + 15);
  drawField('Localidad y Provincia:', `${data.adoptante.ciudad}, ${data.adoptante.provincia}`, adCol2, currentY + 15);
  drawField('Tipo de Vivienda:', data.adoptante.tipo_vivienda, adCol3, currentY + 15);

  currentY += 32;

  // --- SECCIÓN 3: HISTORIAL SANITARIO (VACUNAS Y DESPARASITACIONES) ---
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('3. CONTROL SANITARIO VETERINARIO OFICIAL (VACUNAS Y TRATAMIENTOS)', PAGE_CONFIG.marginLeft + 3, currentY + 4.8);

  currentY += 9;

  // Preparar tabla de vacunas y eventos
  const tableRows = data.historial.length > 0
    ? data.historial.map((item) => [
        formatDate(item.fecha),
        item.tipo_evento || 'Vacuna',
        item.producto_o_detalle || 'Registro veterinario',
        item.profesional_veterinaria || item.lugar || 'Clínica Veterinaria',
        item.fecha_proximo_refuerzo_o_vencimiento ? formatDate(item.fecha_proximo_refuerzo_o_vencimiento) : 'Anual'
      ])
    : [
        ['-', 'Control inicial', 'Desparasitación y chequeo clínico de ingreso', 'Equipo Veterinario', 'Al día'],
        ['-', 'Antirrábica', 'Vacunación antirrábica obligatoria', 'Por aplicar', 'Pendiente'],
        ['-', 'Refuerzo séxtuple / triple', 'Plan de inmunización', 'Por aplicar', 'Pendiente']
      ];

  autoTable(doc, {
    startY: currentY,
    head: [['FECHA', 'TIPO DE EVENTO', 'PRODUCTO / DETALLE / LOTE', 'VETERINARIO / MP', 'PRÓXIMO REFUERZO']],
    body: tableRows,
    margin: { left: PAGE_CONFIG.marginLeft, right: PAGE_CONFIG.marginRight },
    theme: 'grid',
    headStyles: {
      fillColor: [PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [43, 35, 33],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [250, 246, 245]
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 55 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
    }
  });

  applyOfficialFooter(doc, 1, data.options.includeActa ? 2 : 1);

  // =========================================================================
  // PÁGINA 2: ACTA DE ADOPCIÓN, COMPROMISO Y VALIDACIÓN DIGITAL
  // =========================================================================
  if (data.options.includeActa) {
    doc.addPage();
    applyOfficialHeader(doc, {
      title: 'ACTA DE ADOPCIÓN Y COMPROMISO RESPONSABLE',
      subtitle: 'CONTRATO DE VÍNCULO Y BIENESTAR ANIMAL',
      codigo: data.mascota.codigo_interno
    });

    currentY = 41;

    // Caja de Términos y Pautas de Bienestar
    doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('4. CLÁUSULAS DEL ACUERDO DE ADOPCIÓN', PAGE_CONFIG.marginLeft + 3, currentY + 4.8);

    currentY += 10;

    doc.setDrawColor(220, 215, 213);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 54, 2, 2, 'D');

    const clauses = [
      '1. BIENESTAR INTEGRAL: El adoptante se compromete a brindar alimentación adecuada, atención veterinaria periódica, paseos seguros con correa/pretal y un entorno libre de maltrato o intemperie.',
      '2. SEGUIMIENTO POSADOPCIÓN: El adoptante acepta recibir y responder los controles de seguimiento periódico acordados a través de WhatsApp o visita (48-72 hs, 15 días, 1 mes, 3 meses, 6 meses y 1 año), enviando fotos o videos actualizados del animal.',
      '3. COMPROMISO DE CASTRACIÓN: Si el animal no fue entregado esterilizado por razones de edad o salud, el adoptante asume el compromiso ineludible de castrarlo dentro del plazo fijado en este documento.',
      '4. NO ABANDONO NI TRANSFERENCIA: Queda prohibida la entrega a terceros, venta o abandono de la mascota. En caso de fuerza mayor que impida continuar la tenencia, el adoptante restituirá de inmediato la custodia a la red rescatista.',
      '5. DEVOLUCIÓN: La red rescatista se reserva el derecho de rescate ante cualquier incumplimiento grave comprobado que vulnere la salud física o emocional de la mascota.'
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(43, 35, 33);

    let clauseY = currentY + 5;
    clauses.forEach((c) => {
      const splitText = doc.splitTextToSize(c, contentWidth - 8);
      doc.text(splitText, PAGE_CONFIG.marginLeft + 4, clauseY);
      clauseY += splitText.length * 3.6 + 1.2;
    });

    currentY += 58;

    // Fechas y Pautas Particulares
    doc.setFillColor(250, 240, 237);
    doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.roundedRect(PAGE_CONFIG.marginLeft, currentY, contentWidth, 24, 2, 2, 'FD');

    drawField('Fecha de Concreción:', formatDate(data.adopcion.fecha_entrega), PAGE_CONFIG.marginLeft + 4, currentY + 4);
    drawField('Modalidad de Entrega:', data.adopcion.modalidad, PAGE_CONFIG.marginLeft + 55, currentY + 4);
    drawField('Período de Adaptación:', `${data.adopcion.periodo_adaptacion} días`, PAGE_CONFIG.marginLeft + 120, currentY + 4);

    drawField(
      'Compromiso Castración:',
      data.adopcion.compromiso_castracion
        ? `Obligatoria antes del ${formatDate(data.adopcion.fecha_limite_castracion)}`
        : 'Intervención ya realizada',
      PAGE_CONFIG.marginLeft + 4,
      currentY + 14
    );

    drawField(
      'Observaciones Especiales:',
      data.adopcion.observaciones,
      PAGE_CONFIG.marginLeft + 75,
      currentY + 14
    );

    currentY += 28;

    // --- SECCIÓN: SLOTS PARA FIRMAS, QR Y SELLO OFICIAL ---
    const signBoxHeight = 52;
    doc.setDrawColor(220, 215, 213);
    doc.rect(PAGE_CONFIG.marginLeft, currentY, contentWidth, signBoxHeight);

    const signColWidth = (contentWidth - 45) / 2; // Espacio para 2 firmas + slot QR/Sello a la derecha

    // Firma 1: Adoptante
    const sig1X = PAGE_CONFIG.marginLeft + 5;
    doc.setDrawColor(180, 175, 173);
    doc.line(sig1X, currentY + 36, sig1X + signColWidth - 10, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(43, 35, 33);
    doc.text('FIRMA DEL ADOPTANTE', sig1X + (signColWidth - 10) / 2, currentY + 40, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 98, 95);
    doc.text(`Aclaración: ${data.adoptante.nombre}`, sig1X + (signColWidth - 10) / 2, currentY + 44, { align: 'center' });
    doc.text(`DNI: ${data.adoptante.dni}`, sig1X + (signColWidth - 10) / 2, currentY + 48, { align: 'center' });

    // Firma 2: Rescatista / Responsable
    const sig2X = sig1X + signColWidth;
    doc.line(sig2X, currentY + 36, sig2X + signColWidth - 10, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(43, 35, 33);
    doc.text('FIRMA RESCATISTA RESPONSABLE', sig2X + (signColWidth - 10) / 2, currentY + 40, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 98, 95);
    doc.text(`Por: ${data.options.organizationName}`, sig2X + (signColWidth - 10) / 2, currentY + 44, { align: 'center' });
    doc.text('Firma y Sello de Entrega', sig2X + (signColWidth - 10) / 2, currentY + 48, { align: 'center' });

    // Slot 3: Validación Digital QR y Sello de Organización
    const qrSlotX = PAGE_CONFIG.marginLeft + contentWidth - 42;
    doc.setFillColor(250, 246, 245);
    doc.setDrawColor(220, 215, 213);
    doc.roundedRect(qrSlotX, currentY + 3, 38, 46, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('VALIDACIÓN DIGITAL', qrSlotX + 19, currentY + 7, { align: 'center' });

    // Recuadro interior para el código QR dinámico
    doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.rect(qrSlotX + 6.5, currentY + 9, 25, 25);

    // Representación gráfica de QR o texto verificador
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(43, 35, 33);
    doc.text('CÓDIGO QR', qrSlotX + 19, currentY + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(110, 98, 95);
    doc.text('Escanear para', qrSlotX + 19, currentY + 24, { align: 'center' });
    doc.text('ficha online', qrSlotX + 19, currentY + 27, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(43, 35, 33);
    doc.text(`ID: ${data.mascota.codigo_interno}`, qrSlotX + 19, currentY + 38, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(110, 98, 95);
    doc.text('lumia.ar/verificar', qrSlotX + 19, currentY + 42, { align: 'center' });

    applyOfficialFooter(doc, 2, 2);
  }

  return doc;
}

/**
 * Placeholder gráfico cuando no hay foto disponible para la mascota
 */
function drawPhotoPlaceholder(doc, x, y, size, name) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('🐾', x + size / 2, y + size / 2 - 2, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(110, 98, 95);
  doc.text(name.slice(0, 14), x + size / 2, y + size / 2 + 6, { align: 'center' });
}

/**
 * Genera el archivo PDF y dispara la descarga en el navegador
 */
export async function downloadLibretaPdf(data, customFilename = null) {
  const doc = await generateLibreta(data);
  const animalName = (data?.mascota?.nombre_actual || data?.mascota?.nombre || 'mascota')
    .toLowerCase()
    .replace(/\s+/g, '_');
  const code = (data?.mascota?.codigo_interno || 'LUM').toLowerCase();
  const filename = customFilename || `LUMIA_Libreta_${animalName}_${code}.pdf`;

  doc.save(filename);
  return filename;
}

/**
 * Genera el documento y retorna su Data URI / Blob para previsualización directa
 */
export async function getLibretaPdfBlobUrl(data) {
  const doc = await generateLibreta(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
