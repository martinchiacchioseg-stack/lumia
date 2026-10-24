/**
 * LUMIA - LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
 * Generador Oficial del Dossier Técnico y Funcional de la Plataforma en PDF
 * 
 * Documento ejecutivo institucional para Superadministración y Auditoría
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
 * Pie de página institucional del Dossier
 */
function addDossierFooter(doc, pageNum, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(225, 220, 218);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(125, 115, 110);
  doc.text('LUMIA • Dossier Técnico y Funcional Oficial • Confidencial • Ley Nacional N° 25.326', 14, pageHeight - 7);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
}

/**
 * Encabezado para páginas interiores del Dossier
 */
function addDossierHeader(doc, title, sectionNumber) {
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    doc.addImage(LUMIA_LOGO_BASE64, 'PNG', 14, 8, 26, 17, undefined, 'FAST');
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('LUMIA', 14, 16);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text(`DOSSIER TÉCNICO • SECCIÓN ${sectionNumber}`, pageWidth - 14, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 90, 88);
  doc.text(title.toUpperCase(), pageWidth - 14, 18, { align: 'right' });

  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.setLineWidth(0.6);
  doc.line(14, 26, pageWidth - 14, 26);
}

/**
 * Dibuja una tarjeta de módulo en el PDF
 */
function drawModuleCard(doc, x, y, width, height, modNumber, title, tag, description, bullets) {
  // Fondo de tarjeta con borde
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(228, 222, 220);
  doc.roundedRect(x, y, width, height, 2.5, 2.5, 'FD');

  // Franja lateral terracota
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(x, y, 2.5, height, 1, 1, 'F');

  // Badge numérico y título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text(`[${modNumber}] ${title}`, x + 6, y + 6.5);

  // Tag / Categoría
  doc.setFontSize(7);
  doc.setTextColor(130, 100, 90);
  doc.text(tag.toUpperCase(), x + width - 5, y + 6.5, { align: 'right' });

  // Resumen
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 60, 58);
  const descLines = doc.splitTextToSize(description, width - 12);
  doc.text(descLines, x + 6, y + 11.5);

  // Puntos clave
  let bulletY = y + 12 + (descLines.length * 3.4);
  bullets.forEach(bullet => {
    if (bulletY + 3.2 <= y + height) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
      doc.text('•', x + 6, bulletY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 42, 40);
      const bLines = doc.splitTextToSize(bullet, width - 16);
      doc.text(bLines, x + 9, bulletY);
      bulletY += (bLines.length * 3.3) + 0.8;
    }
  });
}

/**
 * Genera el documento PDF completo del Dossier de LUMIA
 */
export async function generateDossierPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = 5;

  // =========================================================================
  // PÁGINA 1: PORTADA EJECUTIVA OFICIAL
  // =========================================================================
  doc.setFillColor(254, 248, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Franja superior terracota
  doc.setFillColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.rect(0, 0, pageWidth, 7, 'F');

  // Logo institucional
  try {
    doc.addImage(LUMIA_LOGO_BASE64, 'PNG', (pageWidth - 95) / 2, 30, 95, 62, undefined, 'FAST');
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
    doc.text('LUMIA', pageWidth / 2, 60, { align: 'center' });
  }

  // Títulos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(40, 32, 30);
  doc.text('DOSSIER TÉCNICO Y FUNCIONAL', pageWidth / 2, 108, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('PLATAFORMA INTEGRAL DE GESTIÓN PARA RESCATISTAS DE ANIMALES', pageWidth / 2, 116, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 100, 96);
  doc.text('Arquitectura, Ciberseguridad, Módulos Operativos e Inteligencia Artificial', pageWidth / 2, 122, { align: 'center' });

  // Línea divisoria central
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.setLineWidth(1.2);
  doc.line(pageWidth / 2 - 40, 128, pageWidth / 2 + 40, 128);

  // Cuadro con ficha técnica y legal
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 220, 218);
  doc.roundedRect(20, 138, pageWidth - 40, 95, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('ESPECIFICACIONES GENERALES DEL SISTEMA', 28, 149);

  const fichaData = [
    ['Sistema:', 'LUMIA (Libreta Única de Mascotas, Informes y Adopciones)'],
    ['Tipo de Solución:', 'Progressive Web App (PWA) Mobile-First con Base PostgreSQL Cloud'],
    ['Emisor Autorizado:', 'Superadministración Técnica LUMIA'],
    ['Ámbito y Jurisdicción:', 'República Argentina (Formatos DD/MM/AAAA y huso GMT-3)'],
    ['Marco Legal:', 'Ley Nacional N° 25.326 (Protección Datos Personales) y Ley N° 14.346'],
    ['Ciberseguridad:', 'Passkeys FIDO2/WebAuthn, Hashes Bcrypt, RLS y Contraseñas CSPRNG (48h)'],
    ['Inteligencia Artificial:', 'Asistente "Patita Aliada" (Google Gemini Flash en Servidor Seguro)'],
    ['Difusión y Adopciones:', 'Portal Público Libre con WhatsApp directo y Generador de Flyers']
  ];

  let fy = 158;
  fichaData.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(75, 65, 62);
    doc.text(k, 28, fy);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(35, 28, 26);
    doc.text(v, 64, fy);
    fy += 8.5;
  });

  // Nota de seguridad y confidencialidad
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 110, 105);
  doc.text('Este documento describe la totalidad de capacidades técnicas, operativas y de seguridad', pageWidth / 2, 250, { align: 'center' });
  doc.text('de LUMIA. Es emitido y descargado exclusivamente bajo sesión autenticada de Superadministrador.', pageWidth / 2, 255, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('DOCUMENTO EXCLUSIVO DE AUDITORÍA Y SUPERADMINISTRACIÓN', pageWidth / 2, 268, { align: 'center' });

  addDossierFooter(doc, 1, totalPages);

  // =========================================================================
  // PÁGINA 2: MÓDULOS OPERATIVOS CENTRALES (01 A 04)
  // =========================================================================
  doc.addPage();
  addDossierHeader(doc, 'Módulos Operativos de Gestión de Rescates y Adopciones', '01');

  // Resumen introductorio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('1. Núcleo de Gestión de Rescate y Familias Adoptivas', 14, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 60, 58);
  doc.text(
    'LUMIA reemplaza el seguimiento caótico en planillas y chats de mensajería mediante una arquitectura de trazabilidad única en Argentina, garantizando el bienestar de los animales y el cumplimiento de plazos legales.',
    14,
    40,
    { maxWidth: pageWidth - 28 }
  );

  // Módulo 01: Ficha 360° del Animal
  drawModuleCard(
    doc, 14, 48, pageWidth - 28, 48,
    '01', 'Ficha Integral 360° del Animal y Código Único', 'Trazabilidad Principal',
    'Legajo digital centralizado de cada animal con código correlativo irrepetible y ficha clínica descriptiva.',
    [
      'Código interno único autogenerado (ej. DOG-001, CAT-001) para trazabilidad legal y administrativa.',
      'Identificación completa: especie, sexo, edad estimada por rangos, tamaño, color, señas y microchip.',
      'Ciclo de vida del caso: Rescatado → En tránsito → En adopción → Adoptado / Fallecido.',
      'Galería fotográfica categorizada (rescate, evolución sanitaria y convivencia) y evaluación de conducta.'
    ]
  );

  // Módulo 02: Directorio de Adoptantes y Ley 25.326
  drawModuleCard(
    doc, 14, 101, pageWidth - 28, 48,
    '02', 'Directorio de Adoptantes y Blindaje de Privacidad (Ley 25.326)', 'Seguridad de Datos',
    'Base de datos segura de postulantes y familias adoptivas con protección estricta de identidad.',
    [
      'Relevamiento socioambiental: tipo de vivienda (casa con patio cerrado, departamento) y animales convivientes.',
      'Calificación de adoptantes: Apto, En evaluación, o Alerta (registro preventivo contra maltratadores y reincidentes).',
      'Blindaje Ley Nacional N° 25.326: DNI, foto de documento y domicilio censurados automáticamente para perfiles sin permiso.',
      'Historial de adopciones vinculadas y botón directo de contacto por WhatsApp sin agendar números.'
    ]
  );

  // Módulo 03: Adopciones Formales y Período de Adaptación
  drawModuleCard(
    doc, 14, 154, pageWidth - 28, 48,
    '03', 'Adopciones Formales y Período de Adaptación Tutelado', 'Seguridad Jurídica',
    'Formalización del traspaso de custodia responsable con contrato digital y período de prueba obligatorio.',
    [
      'Vinculación jurídica formal del animal con el adoptante calificado y registro del hogar de tránsito previo.',
      'Cómputo automático del período de prueba de 15 días con tutela preventiva y seguimiento continuo.',
      'Adjunto de contrato de adopción firmado en PDF o foto y compromiso formal de castración para cachorros.',
      'Gestión de devoluciones con reingreso transparente al circuito de rescate preservando el historial clínico.'
    ]
  );

  // Módulo 04: Cronograma Automatizado en 6 Etapas
  drawModuleCard(
    doc, 14, 207, pageWidth - 28, 52,
    '04', 'Seguimiento Posadopción Automatizado en 6 Hitos', 'Automatización',
    'Cronograma programado automáticamente que acompaña al animal durante su primer año de adopción.',
    [
      'Contacto 1 (48-72 hs): Primer apego, alimentación inicial, adaptación al nuevo ambiente y descanso.',
      'Contacto 2 (15 días): Vencimiento del período de adaptación formal y evaluación de convivencia.',
      'Contacto 3 (1 mes): Consolidación de rutinas, paseos y relación con otros miembros de la familia.',
      'Contacto 4 (3 meses): Verificación de refuerzo de vacunas anuales y fecha de cirugía de castración.',
      'Contacto 5 (6 meses): Evaluación del desarrollo corporal, salud general y comportamiento.',
      'Contacto 6 (1 año): Cierre exitoso del caso o pase definitivo a seguimiento preventivo anual.'
    ]
  );

  addDossierFooter(doc, 2, totalPages);

  // =========================================================================
  // PÁGINA 3: SALUD, ALERTAS Y GEOLOCALIZACIÓN (05 A 08)
  // =========================================================================
  doc.addPage();
  addDossierHeader(doc, 'Semáforo de Alertas, Salud Veterinaria y Reportes de Calle', '02');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('2. Inteligencia Operativa, Sanitaria y Relevamiento Comunitario', 14, 34);

  // Módulo 05: Semáforo Inteligente Posadopción
  drawModuleCard(
    doc, 14, 42, pageWidth - 28, 48,
    '05', 'Semáforo Posadopción en Tiempo Real y Alertas Proactivas', 'Monitoreo Activo',
    'Algoritmo que calcula automáticamente el estado de riesgo de cada caso posadopción.',
    [
      '🟢 VERDE: Caso al día, última respuesta favorable y sin vencimientos pendientes.',
      '🟡 AMARILLO: Control que vence en los próximos 5 días o período de prueba concluido sin reporte asentado.',
      '🔴 ROJO: Control vencido urgente o caso marcado en estado "Alerta" (escape, conflicto o enfermedad grave).',
      'Botón directo "wa.me" con mensaje personalizado que cita el nombre del animal y el hito de control exacto.'
    ]
  );

  // Módulo 06: Libreta Sanitaria Digital
  drawModuleCard(
    doc, 14, 95, pageWidth - 28, 48,
    '06', 'Libreta Sanitaria Digital y Calendario Veterinario', 'Salud Animal',
    'Historial médico completo con cálculo automático de refuerzos de vacunas y desparasitaciones.',
    [
      'Registro de eventos sanitarios: Antirrábica, Séxtuple/Quíntuple, Triple Felina, Antiparasitarios y Cirugías.',
      'Certificados de castración con registro de veterinario actuante, clínica y fecha de intervención.',
      'Cálculo automático de la fecha del próximo refuerzo veterinario con integración al Centro de Alertas.',
      'Adjuntos de análisis clínicos, ecografías, recetas veterinarias e informes de laboratorio.'
    ]
  );

  // Módulo 07: Reportes de Calle con Mapa Interactivo
  drawModuleCard(
    doc, 14, 148, pageWidth - 28, 48,
    '07', 'Reportes Comunitarios de Calle con Geolocalización GPS', 'Territorio en Vivo',
    'Relevamiento rápido en vía pública para asistir animales atropellados, perdidos o en peligro.',
    [
      'Formulario mobile ultraliviano con captura automática de coordenadas GPS del teléfono de la rescatista.',
      'Niveles de urgencia: Crítica / Atropello, Cachorros abandonados, En peligro, Herido leve y Avistamiento.',
      'Mapa interactivo con Leaflet y pines diferenciados por color según la severidad del reporte.',
      'Botón "Convertir a Ficha de Rescate" que promueve el caso a ficha formal en un clic sin tipear de nuevo.'
    ]
  );

  // Módulo 08: Generador de Documentación Oficial en PDF
  drawModuleCard(
    doc, 14, 201, pageWidth - 28, 52,
    '08', 'Generación de Documentación Oficial e Imprimibles en PDF', 'Impresión Legal',
    'Servicio centralizado de generación de documentos listos para imprimir y entregar a las familias.',
    [
      'Libreta Sanitaria A4 Imprimible: Diseñada para impresión doble faz y plegado al medio formando un cuadernillo.',
      'Incluye: Carátula oficial, datos del adoptante, ficha descriptiva con foto, tabla de vacunas, firmas y QR.',
      'Credencial Plastificable de Bolsillo (86mm x 54mm) con foto, señas y teléfonos de emergencia 24hs.',
      'Manual Operativo de Gestión en PDF oficial de 6 páginas para capacitación interna de administradores.'
    ]
  );

  addDossierFooter(doc, 3, totalPages);

  // =========================================================================
  // PÁGINA 4: INTELIGENCIA ARTIFICIAL, DIFUSIÓN Y QR (09 A 13)
  // =========================================================================
  doc.addPage();
  addDossierHeader(doc, 'Inteligencia Artificial, Portal Público y Difusión', '03');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('3. Innovación, Difusión en Redes y Asistencia con Inteligencia Artificial', 14, 34);

  // Módulo 09: Verificación por Código QR
  drawModuleCard(
    doc, 14, 42, pageWidth - 28, 42,
    '09', 'Verificación Digital Pública por Código QR Dinámico', 'Identificación Segura',
    'Trazabilidad instantánea escaneable con cualquier cámara de smartphone sin apps adicionales.',
    [
      'Código QR dinámico impreso en la libreta física y credencial que valida la legalidad del rescate.',
      'Permite a veterinarias o vecinos que hallen una mascota extraviada contactar directo a la organización.',
      'Protección estricta: NO divulga datos privados, DNI ni domicilio del adoptante para resguardar su intimidad.'
    ]
  );

  // Módulo 10: Generador de Flyers para Redes Sociales
  drawModuleCard(
    doc, 14, 89, pageWidth - 28, 42,
    '10', 'Generador Automático de Flyers para Redes Sociales', 'Difusión Comunitaria',
    'Creación instantánea de flyers de difusión listos para publicar en Instagram, Facebook y WhatsApp.',
    [
      'Plantilla institucional con logo de LUMIA, foto destacada del animal, nombre, edad, tamaño y personalidad.',
      'Teléfono oficial de contacto y advertencia de adopción responsable bajo contrato legal.',
      'Descarga directa en formato de imagen optimizado para historias (Stories) y publicaciones en el muro.'
    ]
  );

  // Módulo 11: Portal Público de Adopciones y Noticias
  drawModuleCard(
    doc, 14, 136, pageWidth - 28, 46,
    '11', 'Portal Comunitario Libre de Adopciones y Novedades', 'Acceso Ciudadano',
    'Enlace público libre para compartir con la comunidad sin necesidad de usuario ni clave.',
    [
      'Catálogo online de animales en adopción con filtros por especie, tamaño, edad y compatibilidad de hogar.',
      'Formulario directo de postulación donde los adoptantes interesados completan sus datos socioambientales.',
      'Sección de noticias comunitarias y panel administrativo para que el Superadministrador gestione publicaciones y teléfono.'
    ]
  );

  // Módulo 12: Asistente con IA "Patita Aliada" (Google Gemini)
  drawModuleCard(
    doc, 14, 187, pageWidth - 28, 48,
    '12', 'Asistente de IA "Patita Aliada" (Google Gemini Flash)', 'Inteligencia Artificial',
    'Compañera virtual de rescate animal en rioplatense, alojada en backend seguro sin exponer claves al cliente.',
    [
      'Protocolos paso a paso ante atropellamientos, intoxicaciones, golpes de calor, heridas y parvovirus.',
      'Asesoramiento sobre normativa argentina (Ley Nacional N° 14.346) y contención emocional de la rescatista.',
      'Botón contextual "Consultar a Patita Aliada" desde la ficha de cada animal para evaluar su cuadro clínico.',
      'Respeto de privacidad: nunca envía datos sensibles de adoptantes a la IA y limita a 30 consultas/hora por usuario.'
    ]
  );

  // Módulo 13: Mensajes del Sistema
  drawModuleCard(
    doc, 14, 240, pageWidth - 28, 26,
    '13', 'Mensajes del Sistema y Comunicación Interna', 'Coordinación',
    'Canal directo de comunicados institucionales desde la Superadministración hacia el equipo operativo.',
    [
      'Notificaciones internas sobre actualizaciones, cambios normativos o avisos de guardia.',
      'Bandeja con contador de no leídos en el encabezado de la aplicación para respuesta rápida.'
    ]
  );

  addDossierFooter(doc, 4, totalPages);

  // =========================================================================
  // PÁGINA 5: CIBERSEGURIDAD, BIOMETRÍA Y ARQUITECTURA TÉCNICA (14 A 18)
  // =========================================================================
  doc.addPage();
  addDossierHeader(doc, 'Ciberseguridad, Biometría FIDO2 y Arquitectura de Infraestructura', '04');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('4. Ciberseguridad Blindada, Passkeys Biométricas y Base de Datos', 14, 34);

  // Módulo 14: Acceso Biométrico Passkeys FIDO2
  drawModuleCard(
    doc, 14, 42, pageWidth - 28, 44,
    '14', 'Acceso Biométrico Nativo con Passkeys (WebAuthn / FIDO2)', 'Biometría Blindada',
    'Inicio de sesión mediante huella dactilar, Face ID o Windows Hello con cero almacenamiento biométrico.',
    [
      'Cumplimiento estricto Ley 25.326: los datos biométricos NUNCA salen del chip seguro del dispositivo (TPM / Enclave).',
      'Al servidor únicamente se envía una firma matemática pública FIDO2; imposible de interceptar o clonar.',
      'Panel de "Mis Dispositivos" disponible para todos los usuarios y revocación administrativa en caso de robo de celular.'
    ]
  );

  // Módulo 15: Autenticación Criptográfica Robusta
  drawModuleCard(
    doc, 14, 91, pageWidth - 28, 44,
    '15', 'Políticas Criptográficas y Claves Temporales CSPRNG (48 hs)', 'Defensa Activa',
    'Eliminación total de contraseñas por defecto y protección contra ataques automatizados de fuerza bruta.',
    [
      'Generador CSPRNG de 14 caracteres único, mostrado una sola vez al creador y con vencimiento a las 48 horas.',
      'Cambio obligatorio en primer ingreso con validación contra lista negra de claves vulnerables (mínimo 10 caracteres).',
      'Almacenamiento seguro con algoritmo de hash Bcrypt y bloqueo automático de 15 minutos tras 5 intentos fallidos.'
    ]
  );

  // Módulo 16: Matriz Granular de Roles (RBAC) y RLS
  drawModuleCard(
    doc, 14, 140, pageWidth - 28, 42,
    '16', 'Control de Acceso Granular (RBAC) y Row Level Security (RLS)', 'Aislamiento de Datos',
    'Seguridad multicapa aplicada tanto a nivel de interfaz como en el motor de base de datos PostgreSQL.',
    [
      'Roles del sistema: Superadministrador (dueño técnico), Administrador, Rescatista, Colaboradora y Solo Lectura.',
      'Políticas de RLS en Neon PostgreSQL que impiden el acceso a filas de datos ajenas sin autorización explícita.',
      'Protección absoluta de vistas exclusivas (Dossier Técnico, Panel Superadmin) verificadas siempre en servidor.'
    ]
  );

  // Módulo 17 y 18: Auditoría y Arquitectura Cloud
  drawModuleCard(
    doc, 14, 187, pageWidth - 28, 42,
    '17 y 18', 'Auditoría Inmutable, PWA Mobile-First y Neon PostgreSQL', 'Infraestructura Cloud',
    'Registro inalterable de operaciones y despliegue de alta disponibilidad en Vercel Serverless.',
    [
      'Bitácora inmutable con registro de usuario, IP, acción y timestamp (GMT-3) preservando datos con soft delete.',
      'Arquitectura Progressive Web App (PWA) instalable en Android e iOS con funcionamiento offline de emergencia.',
      'Alojamiento en Vercel Serverless + Neon PostgreSQL Pooled con certificados TLS/SSL forzados en tránsito.'
    ]
  );

  // Bloque de certificación y firma institucional
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.roundedRect(14, 235, pageWidth - 28, 30, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('CERTIFICACIÓN OFICIAL DE ESPECIFICACIONES TÉCNICAS', 20, 242);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 50, 48);
  doc.text('Se certifica que la plataforma LUMIA cumple con los estándares de ciberseguridad, trazabilidad animal y protección', 20, 248);
  doc.text('de datos personales aquí descriptos, encontrándose lista y operativa para su despliegue nacional en producción.', 20, 253);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(PRIMARY_RGB.r, PRIMARY_RGB.g, PRIMARY_RGB.b);
  doc.text('Superadministración Técnica LUMIA • República Argentina', pageWidth - 20, 260, { align: 'right' });

  addDossierFooter(doc, 5, totalPages);

  return doc;
}

/**
 * Dispara la descarga del PDF del Dossier Técnico Oficial
 */
export async function downloadDossierPdf() {
  const doc = await generateDossierPdf();
  const fecha = new Date().toISOString().slice(0, 10);
  doc.save(`LUMIA_Dossier_Tecnico_Oficial_${fecha}.pdf`);
  return true;
}
