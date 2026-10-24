/**
 * LUMIA - LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
 * Generador Oficial del Manual de Usuario y Gestión Operativa en PDF
 * 
 * Diseñado para Administradores y Rescatistas Independientes
 * Identidad visual oficial: #C94A2A (Terracota Vívido)
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LUMIA_COLORS, LUMIA_LOGO_BASE64 } from '../lib/brandingAssets.js';

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
 * Aplica pie de página institucional a cada página del manual
 */
function addFooter(doc, pageNum, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(230, 225, 222);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 120, 115);
  doc.text('LUMIA • Manual Operativo del Sistema • Protegido bajo Ley 25.326', 14, pageHeight - 7);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
}

/**
 * Aplica el encabezado estándar para páginas interiores del manual
 */
function addInteriorHeader(doc, title, sectionNumber) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Inyección del logo oficial miniatura a la izquierda
  try {
    doc.addImage(LUMIA_LOGO_BASE64, 'PNG', 14, 8, 26, 17, undefined, 'FAST');
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('LUMIA', 14, 16);
  }

  // Título y sección a la derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text(`SECCIÓN ${sectionNumber} • MANUAL DE GESTIÓN`, pageWidth - 14, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 98, 95);
  doc.text(title.toUpperCase(), pageWidth - 14, 19, { align: 'right' });

  // Línea divisoria
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.setLineWidth(0.6);
  doc.line(14, 27, pageWidth - 14, 27);
}

/**
 * Genera el documento PDF completo del Manual de Usuario
 */
export async function generateManualAdministradorPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // =========================================================================
  // PÁGINA 1: PORTADA INSTITUCIONAL
  // =========================================================================
  
  // Marco y fondo sutil
  doc.setFillColor(254, 248, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Franja decorativa superior
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Logo Oficial Completo Centrado
  try {
    doc.addImage(LUMIA_LOGO_BASE64, 'PNG', (pageWidth - 90) / 2, 35, 90, 60, undefined, 'FAST');
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('LUMIA', pageWidth / 2, 60, { align: 'center' });
  }

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(43, 35, 33);
  doc.text('MANUAL OPERATIVO DE GESTIÓN', pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('SISTEMA INTEGRAL PARA RESCATISTAS DE ANIMALES', pageWidth / 2, 124, { align: 'center' });

  // Línea central
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 35, 131, pageWidth / 2 + 35, 131);

  // Cuadro con metadatos del documento
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 222);
  doc.roundedRect(25, 145, pageWidth - 50, 75, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('INFORMACIÓN GENERAL DEL DOCUMENTO', 32, 156);

  const metaData = [
    ['Plataforma:', 'LUMIA (Libreta Única de Mascotas, Informes y Adopciones)'],
    ['Versión:', '1.0 - Lista para Producción / Despliegue Oficial'],
    ['Destinatarios:', 'Administradores, Coordinadoras y Equipo de Rescate'],
    ['Ámbito:', 'República Argentina (Formato DD/MM/AAAA)'],
    ['Marco Legal:', 'Ley Nacional N° 25.326 de Protección de Datos Personales'],
    ['Seguridad:', 'Control RBAC con Cifrado de Contraseñas y RLS en Base de Datos']
  ];

  let metaY = 166;
  metaData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 70, 67);
    doc.text(label, 32, metaY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(43, 35, 33);
    doc.text(value, 65, metaY);
    metaY += 8.5;
  });

  // Franja inferior
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 98, 95);
  doc.text('Guía oficial de procedimientos para la gestión de rescates, adopciones responsables,', pageWidth / 2, 240, { align: 'center' });
  doc.text('seguimientos automatizados, libretas sanitarias y reportes de vía pública.', pageWidth / 2, 246, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('DOCUMENTO EXCLUSIVO PARA ADMINISTRACIÓN Y COORDINACIÓN', pageWidth / 2, 260, { align: 'center' });

  // =========================================================================
  // PÁGINA 2: ESTRUCTURA, ACCESO Y ROLES DE USUARIO
  // =========================================================================
  doc.addPage();
  addInteriorHeader(doc, 'Acceso, Seguridad y Roles de Usuario', '01');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Jerarquía de Seguridad y Control de Acceso (RBAC)', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'LUMIA implementa un modelo de seguridad por roles estrictos y sin registro público. Únicamente los administradores ' +
    'o el superadministrador pueden dar de alta nuevos usuarios. Todos los nuevos usuarios reciben una contraseña temporal ' +
    'que deben cambiar obligatoriamente en su primer inicio de sesión.',
    14, 44, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  autoTable(doc, {
    startY: 56,
    head: [['Nivel de Rol', 'Alcance y Privilegios', 'Gestión de Contraseña']],
    body: [
      [
        'SUPERADMINISTRADOR\n(Dueño Técnico)',
        'Acceso total a datos, esquemas, base de datos Neon/PostgreSQL, auditoría completa e integración técnica. Es el único que puede designar otros superadministradores.',
        'Autónoma. Puede restablecer credenciales de cualquier perfil del sistema.'
      ],
      [
        'ADMINISTRADOR\n(Rescatista Responsable)',
        'Control total del circuito operativo: Animales, Adoptantes, Contratos de Adopción, Seguimientos, Vacunas y Reportes. Puede crear otros usuarios y asignarles roles.',
        'Contraseña temporal aleatoria CSPRNG (48h de caducidad) con cambio forzoso a clave definitiva de 10+ caracteres en 1er ingreso.'
      ],
      [
        'RESCATISTA\n(Gestión Operativa)',
        'Gestiona sus casos asignados, fichas clínicas, acuerdos de adopción y actualiza las fotos y notas de seguimiento.',
        'Contraseña temporal aleatoria CSPRNG (48h) con cambio forzoso de clave y activación optativa de huella o rostro.'
      ],
      [
        'COLABORADORA\n(Relevamiento de Calle)',
        'Ingreso rápido desde celulares para reportar animales extraviados o heridos en vía pública y consultar el estado de sus reportes.',
        'Perfil liviano con acceso restringido exclusivamente a reportes y fichas públicas.'
      ],
      [
        'SOLO LECTURA\n(Auditoría / Consulta)',
        'Visualización de fichas médicas, estadísticas e informes sin facultad de edición ni borrado.',
        'Asignación estándar por invitación del Administrador.'
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b], textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [43, 35, 33], cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 96 },
      2: { cellWidth: 44 }
    }
  });

  const yAfterRoles = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Protección Especial de Datos Sensibles (Ley Nacional 25.326)', 14, yAfterRoles);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'En cumplimiento con la normativa argentina, el DNI, imágenes adjuntas del documento y domicilio exacto ' +
    'de los adoptantes se encuentran protegidos. Si un usuario no posee el permiso especial "ver_datos_sensibles_adoptantes", ' +
    'el sistema censura automáticamente dichos datos (ej: DNI: 38.***.*** y calle truncada), impidiendo filtraciones indebidas.',
    14, yAfterRoles + 6, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('3. Acceso Biométrico Seguro (Huella o Rostro / Passkeys) — Ley 25.326', 14, yAfterRoles + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(43, 35, 33);
  doc.text(
    '• Activación: Al establecer su clave definitiva, el usuario puede tocar "Activar" para registrar la huella o rostro de su teléfono o computadora. También puede activarlo o desvincular equipos desde su perfil.\n' +
    '• Privacidad Estricta (Ley 25.326): LUMIA jamás recibe, guarda ni transmite datos biométricos. La verificación se realiza 100% en el chip seguro del dispositivo del usuario (WebAuthn estándar).\n' +
    '• Recuperación por pérdida: Si el usuario pierde su equipo, un Administrador o Superadministrador puede revocar sus passkeys vinculadas y emitir una nueva clave temporal de 48h desde el panel de usuarios.',
    14, yAfterRoles + 32, { maxWidth: pageWidth - 28, lineHeightFactor: 1.25 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('4. Asistente con IA "Patita Aliada" y Funcionamiento PWA', 14, yAfterRoles + 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(43, 35, 33);
  doc.text(
    '• Patita Aliada (IA): Asistente flotante con Gemini Flash para orientación en primeros auxilios, Ley 14.346 y redacción de adopciones. Accesible para todos los roles operativos.\n' +
    '• Instalación PWA: Se instala como app nativa en Android e iPhone desde el navegador sin ocupar espacio.',
    14, yAfterRoles + 58, { maxWidth: pageWidth - 28, lineHeightFactor: 1.25 }
  );

  // =========================================================================
  // PÁGINA 3: FICHA DE ANIMALES Y LIBRETA SANITARIA
  // =========================================================================
  doc.addPage();
  addInteriorHeader(doc, 'Ficha 360° del Animal y Libreta Sanitaria', '02');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Alta de Animal y Código Interno Único', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Cada ingreso genera un código unívoco irrepetible (formato DOG-001, CAT-001) para rastreo en expedientes y convenios. ' +
    'La ficha registra especie, sexo, edad estimada por rangos veterinarios, tamaño, color de pelaje y señas particulares ' +
    '(cicatrices, manchas, amputaciones) indispensables para identificación indubitable.',
    14, 43, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  autoTable(doc, {
    startY: 54,
    head: [['Estado del Caso', 'Definición Operativa', 'Acción Recomendada en el Sistema']],
    body: [
      ['RESCATADO', 'El animal fue retirado de la vía pública. Se encuentra en evaluación clínica inicial o veterinaria de urgencia.', 'Cargar fotos del rescate, señas y registrar gastos de clínica veterinaria.'],
      ['EN TRÁNSITO', 'Alojado temporalmente en el hogar de una rescatista o voluntaria mientras se recupera o socializa.', 'Vincular nombre y teléfono del hogar de tránsito para auditoría y visitas.'],
      ['EN ADOPCIÓN', 'Mascota castrada/desparasitada con aptitud médica y conductual para ser postulada en adopción.', 'Publicar ficha con fotos de evolución y notas de convivencia familiar.'],
      ['ADOPTADO', 'Vínculo cerrado mediante entrega formal, firma de contrato y traspaso de tenencia responsable.', 'Activa el calendario automático del Semáforo Posadopción a 48 hs, 15d, 1m, 3m, 6m y 1 año.'],
      ['FALLECIDO', 'Cierre de legajo por causas médicas o vejez. Se preserva el registro histórico sin borrado físico.', 'Registrar informe de defunción y conservar la historia clínica para estadísticas.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b], textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [43, 35, 33], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 67 }
    }
  });

  const yAfterFicha = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Libreta Sanitaria y Control de Refuerzos / Castraciones', 14, yAfterFicha);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'El módulo de salud centraliza los actos veterinarios: Vacuna Antirrábica, Séxtuple/Quíntuple Canina, Triple Felina, ' +
    'desparasitaciones internas/externas y cirugías de castración. Cada vacuna o antiparasitario cuenta con fecha de aplicación, ' +
    'lote/medicamento, profesional actuante y fecha calculada de próximo vencimiento, la cual alimenta el Centro de Alertas.',
    14, yAfterFicha + 6, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  // Cuadro destacado
  doc.setFillColor(254, 248, 246);
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(14, yAfterFicha + 24, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('💡 Compromiso Obligatorio de Castración:', 20, yAfterFicha + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Si un cachorro se entrega antes de la edad reproductiva, el sistema fija la fecha límite pactada en el contrato. ' +
    '15 días antes de dicha fecha, el sistema genera una alerta amarilla en el panel de control para que la rescatista coordine ' +
    'el turno veterinario con los adoptantes.',
    20, yAfterFicha + 38, { maxWidth: pageWidth - 40, lineHeightFactor: 1.3 }
  );

  // =========================================================================
  // PÁGINA 4: ADOPCIÓN, CONTRATOS Y SEMÁFORO DE SEGUIMIENTO
  // =========================================================================
  doc.addPage();
  addInteriorHeader(doc, 'Adopciones, Contratos y Semáforo Posadopción', '03');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Alta de Adopción y Período de Adaptación (15 Días)', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Al formalizar una entrega, se vincula el animal con el adoptante previamente calificado como "Apto". ' +
    'Se establece la modalidad de entrega (Llevado a domicilio o Retirado) y se computa el período de adaptación de 15 días. ' +
    'Durante este lapso, el animal sigue bajo tutela cautelar de la rescatista.',
    14, 43, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Cronograma Automático de 6 Etapas Posadopción', 14, 60);

  autoTable(doc, {
    startY: 66,
    head: [['Etapa', 'Plazo Desde la Entrega', 'Objetivo del Relevamiento Posadopción']],
    body: [
      ['Etapa 1', 'A las 48 Horas', 'Verificar adaptación primaria, aceptación de alimento, sueño, manejo de pretal/correa y primeros signos de apego.'],
      ['Etapa 2', 'A los 15 Días', 'Evaluación final del período de prueba. Constatar convivencia con la familia y otros animales.'],
      ['Etapa 3', 'Al 1 Mes', 'Consolidación de rutinas. Confirmación de peso y respuesta en paseos y entorno doméstico.'],
      ['Etapa 4', 'A los 3 Meses', 'Auditoría médica veterinaria: verificación de revacunación y control de fecha de castración acordada.'],
      ['Etapa 5', 'A los 6 Meses', 'Auditoría intermedia de conducta, estado físico general y bienestar integral.'],
      ['Etapa 6', 'Al 1 Año', 'Cierre exitoso del caso o paso a seguimiento anual preventivo. Felicitación a la familia adoptante.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b], textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [43, 35, 33], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 112 }
    }
  });

  const yAfterEtapas = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('3. Lógica del Semáforo Inteligente Posadopción', 14, yAfterEtapas);

  autoTable(doc, {
    startY: yAfterEtapas + 6,
    head: [['Color', 'Criterio de Disparo', 'Acción Exigida al Administrador']],
    body: [
      ['VERDE', 'Caso al día. Último seguimiento calificado como Excelente o Normal y próximo control aún con plazo vigente.', 'Ninguna inmediata. El sistema notificará cuando se acerque el próximo hito.'],
      ['AMARILLO', 'El próximo control vence en 5 días o menos, o el período de prueba de 15 días caducó sin contacto asentado.', 'Enviar WhatsApp recordatorio al adoptante solicitando video/foto actual.'],
      ['ROJO', 'Control vencido impago de respuesta, o el estado general fue calificado como "Alerta" (escape, enfermedad, conflicto).', 'Intervención urgente: llamada telefónica o visita presencial de rescate recuperado.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [80, 70, 67], textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [43, 35, 33], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 76 }
    }
  });

  // =========================================================================
  // PÁGINA 5: REPORTES DE CALLE Y MAPA DE RESCATES
  // =========================================================================
  doc.addPage();
  addInteriorHeader(doc, 'Reportes Comunitarios de Calle y Geolocalización', '04');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Relevamiento Exprés de Animales en la Vía Pública', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Diseñado para colaboradoras y rescatistas que transitan la calle y encuentran animales en riesgo. ' +
    'Permite capturar la ubicación exacta mediante el GPS del celular o enlace de mapa, tomar una foto al instante ' +
    'y catalogar el nivel de urgencia para alertar a toda la red comunitaria en tiempo real.',
    14, 43, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  autoTable(doc, {
    startY: 54,
    head: [['Urgencia', 'Tiempo de Respuesta', 'Protocolo Operativo']],
    body: [
      ['CRÍTICA / ATROPELLO', 'Inmediato (< 30 min)', 'Traslado urgente a guardia veterinaria de 24hs. Coordinar flete solidario y solicitar fotos de lesiones.'],
      ['CACHORROS ABANDONADOS', 'Prioritario (< 2 hs)', 'Riesgo de hipotermia o predadores. Conseguir nodriza o leche maternizada y ubicar tránsito cerrado.'],
      ['HERIDO LEVE / ENFERMO', 'Mismo día (< 6 hs)', 'Relevamiento con comida, revisión de piel/sarna o heridas superficiales. Aislamiento preventivo.'],
      ['EN PELIGRO / VÍA RÁPIDA', 'Urgente (< 2 hs)', 'Animal desorientado en avenidas o autopistas. Convocatoria de rescatistas cercanas para contención.'],
      ['AVISTAMIENTO', 'Planificado (< 24 hs)', 'Animal comunitario con buena alimentación barrial o búsqueda de dueño extraviado vía redes sociales.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b], textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [43, 35, 33], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 96 }
    }
  });

  const yAfterCalle = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Conversión Directa de Reporte en Caso Rescatado', 14, yAfterCalle);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Cuando el equipo acude y asegura al animal, un solo clic en el botón "Asignar a Nuevo Caso" traslada ' +
    'automáticamente la foto, las notas y las coordenadas de rescate a la ficha del animal (creando su código DOG/CAT), ' +
    'evitando duplicación de datos y preservando la historia completa desde la calle hasta la adopción.',
    14, yAfterCalle + 6, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  // =========================================================================
  // PÁGINA 6: DOCUMENTACIÓN OFICIAL IMPRIMIBLE Y QR DINÁMICO
  // =========================================================================
  doc.addPage();
  addInteriorHeader(doc, 'Libreta Única A4, Credencial y QR de Verificación', '05');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Libreta Única Imprimible (A4 Plegable al Medio)', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'El sistema genera un documento PDF oficial en hoja A4 diseñado para imprimirse en doble faz y plegarse al medio, ' +
    'conformando un cuadernillo físico oficial con el logotipo institucional transparente de LUMIA:\n' +
    '• Cara 1: Ficha identificatoria completa del adoptante y de la mascota (foto, señas, chip y procedencia).\n' +
    '• Cara 2: Tabla sanitaria oficial de vacunas, antiparasitarios y castración con firma del veterinario.\n' +
    '• Cara 3: Acta y cláusulas contractuales de tenencia responsable con compromiso de seguimiento.\n' +
    '• Cara 4: Código QR dinámico de trazabilidad y validación pública en línea.',
    14, 43, { maxWidth: pageWidth - 28, lineHeightFactor: 1.3 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Credencial de Bolsillo / Tarjeta ID (86mm x 54mm)', 14, 82);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Permite a la familia adoptante portar una tarjeta plastificada del tamaño de una tarjeta de crédito o documento. ' +
    'En caso de extravío, cualquier persona o veterinario puede constatar el número de chip y llamar de inmediato al rescatista.',
    14, 88, { maxWidth: pageWidth - 28, align: 'justify', lineHeightFactor: 1.3 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('3. Verificación Pública por Código QR (Sin Exponer Datos Sensibles)', 14, 107);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Al escanear el QR con la cámara de cualquier teléfono, el sistema abre la Ficha Digital de Verificación Oficial:\n' +
    '• Certifica que la mascota pertenece al Registro Nacional LUMIA y no es un caso robado o extraviado.\n' +
    '• Muestra foto actual, señas particulares y teléfono de emergencia de la rescatista responsable.\n' +
    '• IMPORTANTE: Por estricta protección de la intimidad familiar, NO muestra el DNI, domicilio ni datos privados del adoptante.',
    14, 113, { maxWidth: pageWidth - 28, lineHeightFactor: 1.3 }
  );

  // Cuadro final de contacto
  doc.setFillColor(254, 248, 246);
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(14, 145, pageWidth - 28, 40, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('SOPORTE TÉCNICO Y AUDITORÍA DE SISTEMA', 22, 156);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(43, 35, 33);
  doc.text(
    'Para solicitudes de nuevos módulos, auditorías de base de datos o ampliación de infraestructura en la nube,\n' +
    'el Administrador debe contactar al canal de Superadministración técnica oficial de LUMIA:\n' +
    '• Canal Institucional: Mensajes del Sistema / Superadministración Técnica\n' +
    '• Plataforma: LUMIA Argentina • Base de Datos: Neon PostgreSQL Protegida con RLS',
    22, 163, { lineHeightFactor: 1.3 }
  );

  // Aplicar pie de página a todas las hojas generadas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  return doc;
}

/**
 * Dispara la descarga del Manual de Usuario Oficial en PDF
 */
export async function downloadManualAdministradorPdf() {
  const doc = await generateManualAdministradorPdf();
  const filename = 'LUMIA_Manual_Operativo_Administrador.pdf';
  doc.save(filename);
  return filename;
}
