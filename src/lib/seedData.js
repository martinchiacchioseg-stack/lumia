// Datos semilla realistas para Patita Aliada (utilizados como estado inicial y fallback)

export const INITIAL_USERS = [
  {
    id: 'usr-superadmin',
    nombre: 'Superadministración LUMIA',
    email: 'martinchiacchio.seg@gmail.com',
    telefono: '+5491122334455',
    rol: 'Superadministrador',
    rol_id: 'rol-superadmin',
    activo: true,
    must_change_password: false,
    is_temp_password: false,
    temp_password_expires_at: null,
    password_hash: '$2b$10$hgQVBxGKyyg3eMgDEa9WXeklB3HNly2FcrVs8CVrum2DwqZ./VxHK',
    created_at: '2026-10-01T10:00:00.000Z',
    ultimo_ingreso: null
  },
  {
    id: 'usr-admin',
    nombre: 'Génesis Bustamante',
    email: 'genesisbustamante88@gmail.com',
    telefono: '+5491199887766',
    rol: 'Administrador',
    rol_id: 'rol-admin',
    activo: true,
    must_change_password: true,
    is_temp_password: true,
    temp_password_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    password_hash: '$2b$10$xMjZPGlJrYMDxR8e.MMWBO5IkOyd2jJIWFotD//7DxGX.kEQJwEje',
    created_at: '2026-10-01T10:30:00.000Z',
    ultimo_ingreso: null
  },
  {
    id: 'usr-rescatista-flor',
    nombre: 'Florencia Romero',
    email: 'flor.rescatista@gmail.com',
    telefono: '+5491133221100',
    rol: 'Rescatista',
    rol_id: 'rol-rescatista',
    activo: true,
    must_change_password: false,
    is_temp_password: false,
    temp_password_expires_at: null,
    password_hash: '$2b$10$f69yP7y44K3y5f2X2gH9zO5.X4.7h8K8V9L3mQ1W2E3R4T5Y6U7I8',
    created_at: '2026-10-05T12:00:00.000Z',
    ultimo_ingreso: '2026-10-21T18:00:00.000Z'
  }
];

export const INITIAL_ANIMALS = [
  {
    id: 'anim-luna',
    codigo_interno: 'DOG-001',
    nombre_actual: 'Luna',
    nombre_anterior_apodo: 'Lunita',
    especie: 'perro',
    sexo: 'hembra',
    edad_estimada: 'joven',
    fecha_nacimiento_aproximada: '2024-03-10',
    tamano: 'mediano',
    pelaje_color_senas_particulares: 'Manto negro brillante con manchas blancas en el pecho y patitas delanteras. Orejas semierguidas.',
    estado_caso: 'adoptado',
    fecha_rescate: '2026-08-20',
    ubicacion_rescate: 'Parque Avellaneda, CABA',
    latitud: -34.6465,
    longitud: -58.4784,
    rescatista_a_cargo: 'usr-admin',
    transito_previo: {
      nombre: 'Hogar de Tránsito Belgrano (Mariana)',
      direccion: 'Juramento 2100, CABA',
      telefono: '+5491144445555'
    },
    foto_portada: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    galeria: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        categoria: 'rescate',
        fecha: '2026-08-20',
        notas: 'Día del rescate en el parque, estaba desnutrida y con sed'
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
        categoria: 'evolucion',
        fecha: '2026-09-10',
        notas: 'Recuperando peso y jugando en el patio de tránsito'
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
        categoria: 'familia_adoptiva',
        fecha: '2026-10-01',
        notas: 'Primer día en su nuevo hogar con Carla'
      }
    ],
    relacion_con_perros: 'Muy sociable, juega con machos y hembras sin problemas',
    relacion_con_gatos: 'Curiosa pero respetuosa, convive sin perseguirlos',
    relacion_con_personas: 'Súper dulce con niños, un poco asustadiza con ruidos fuertes o escobas',
    nivel_energia: 'moderado',
    manejo_correa_paseos: 'Camina muy bien con pretal antitirones',
    notas_conducta: 'Le tiene miedo a las tormentas y la pirotecnia; responde excelente al refuerzo positivo con premios ricos.',
    alimentacion_recomendada: 'Alimento balanceado premium adultos medianos (VitalCan Balance) 280g diarios repartidos en 2 tomas.',
    archivado: false,
    created_at: '2026-08-20T14:00:00.000Z'
  },
  {
    id: 'anim-milo',
    codigo_interno: 'CAT-001',
    nombre_actual: 'Milo',
    nombre_anterior_apodo: 'Amarillito',
    especie: 'gato',
    sexo: 'macho',
    edad_estimada: 'cachorro 2-6 meses',
    fecha_nacimiento_aproximada: '2026-06-01',
    tamano: 'chico',
    pelaje_color_senas_particulares: 'Atigrado naranja y blanco (red tabby), ojos ámbar, punta de la cola blanca.',
    estado_caso: 'en adopción',
    fecha_rescate: '2026-09-28',
    ubicacion_rescate: 'Plaza Flores, CABA',
    latitud: -34.6288,
    longitud: -58.4638,
    rescatista_a_cargo: 'usr-admin',
    transito_previo: {
      nombre: 'Tránsito de Gatitos Flores',
      direccion: 'Rivadavia y Artigas',
      telefono: '+5491133334444'
    },
    foto_portada: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    galeria: [
      {
        id: 'g4',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        categoria: 'rescate',
        fecha: '2026-09-28',
        notas: 'Encontrado en un cantero de la plaza resguardándose de la lluvia'
      }
    ],
    relacion_con_perros: 'No testeado con perros',
    relacion_con_gatos: 'Excelente con otros gatitos, es muy mimoso y duerme acurrucado',
    relacion_con_personas: 'Ronronero compulsivo, le encanta dormir en el pecho de las personas',
    nivel_energia: 'muy activo',
    manejo_correa_paseos: 'No aplica',
    notas_conducta: 'Súper juguetón, le encantan las cañitas con plumas. Requisito de adopción: departamento con red de protección en todas las ventanas.',
    alimentacion_recomendada: 'Purina Pro Plan Kitten húmedo y seco libre demanda.',
    archivado: false,
    created_at: '2026-09-28T16:30:00.000Z'
  },
  {
    id: 'anim-simba',
    codigo_interno: 'DOG-002',
    nombre_actual: 'Simba',
    nombre_anterior_apodo: 'Barba',
    especie: 'perro',
    sexo: 'macho',
    edad_estimada: 'adulto',
    fecha_nacimiento_aproximada: '2022-05-15',
    tamano: 'grande',
    pelaje_color_senas_particulares: 'Mestizo tipo ovejero leonado, hocico oscuro, cicatriz en oreja izquierda.',
    estado_caso: 'en tránsito',
    fecha_rescate: '2026-10-10',
    ubicacion_rescate: 'Lomas de Zamora, GBA Sur',
    latitud: -34.7600,
    longitud: -58.4000,
    rescatista_a_cargo: 'usr-rescatista-flor',
    transito_previo: {
      nombre: 'Pensión Canina Lomas',
      direccion: 'Alsina 1200',
      telefono: '+5491177778888'
    },
    foto_portada: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    galeria: [],
    relacion_con_perros: 'Tranquilo si no lo prepotean, prefiere convivir con hembras',
    relacion_con_gatos: 'Tiende a perseguirlos, se recomienda hogar sin gatos',
    relacion_con_personas: 'Noble y protector, muy agradecido, adora que le rasquen el lomo',
    nivel_energia: 'tranquilo',
    manejo_correa_paseos: 'Va al trote con fuerza, necesita collar fijo y correa reforzada',
    notas_conducta: 'Fue rescatado de la calle con herida de mordedura en cicatrización y anemia leve. Muy dócil con veterinarios.',
    alimentacion_recomendada: 'Alimento premium de alta digestibilidad más suplemento vitamínico diario.',
    archivado: false,
    created_at: '2026-10-10T11:00:00.000Z'
  }
];

export const INITIAL_ADOPTERS = [
  {
    id: 'adop-carla',
    nombre_apellido: 'Carla Daniela Rossi',
    dni_cuit: '35442119',
    telefono_whatsapp: '+5491155443322',
    telefono_secundario: '+5491144009988',
    direccion_calle: 'Av. San Juan',
    direccion_numero: '3240',
    direccion_entrecalles: 'Entre Boedo y Colombres',
    direccion_piso_depto: '4to B',
    direccion_barrio: 'Boedo',
    direccion_localidad: 'CABA',
    direccion_provincia: 'Buenos Aires',
    tipo_vivienda: 'departamento',
    condicion_vivienda: 'propietario',
    redes_sociales: {
      instagram: '@carlarossi_art',
      facebook: 'Carla Rossi'
    },
    foto_dni_frente: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    foto_dni_dorso: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    consentimiento_datos: true,
    archivado: false,
    created_at: '2026-09-25T15:00:00.000Z'
  },
  {
    id: 'adop-pablo',
    nombre_apellido: 'Pablo Esteban Gómez',
    dni_cuit: '31889452',
    telefono_whatsapp: '+5491166778899',
    telefono_secundario: '',
    direccion_calle: 'Mariano Fragueiro',
    direccion_numero: '1850',
    direccion_entrecalles: 'Cervantes y Castelar',
    direccion_piso_depto: '',
    direccion_barrio: 'Alta Córdoba',
    direccion_localidad: 'Córdoba Capital',
    direccion_provincia: 'Córdoba',
    tipo_vivienda: 'casa con patio cerrado',
    condicion_vivienda: 'propietario',
    redes_sociales: {
      instagram: '@pablito_gomez'
    },
    foto_dni_frente: '',
    foto_dni_dorso: '',
    consentimiento_datos: true,
    archivado: false,
    created_at: '2026-10-15T18:00:00.000Z'
  }
];

export const INITIAL_ADOPTIONS = [
  {
    id: 'adopcion-luna',
    animal_id: 'anim-luna',
    adoptante_id: 'adop-carla',
    fecha_entrega: '2026-10-01',
    modalidad_entrega: 'llevado al domicilio',
    periodo_adaptacion_dias: 21,
    compromiso_castracion: true,
    fecha_limite_castracion: '2026-10-31',
    estado_adopcion: 'activo en seguimiento',
    observaciones: 'Luna se adaptó de manera espectacular. Carla trabaja remoto así que no pasa mucho tiempo sola.',
    contrato_firmado: 'https://example.com/contrato-luna.pdf',
    archivado: false,
    created_at: '2026-10-01T16:00:00.000Z'
  }
];

export const INITIAL_FOLLOWUPS = [
  {
    id: 'seg-1',
    adopcion_id: 'adopcion-luna',
    fecha_contacto: '2026-10-04',
    tipo_contacto: 'WhatsApp',
    foto_video_recibido: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    estado_general: 'excelente',
    observaciones: 'Control inicial 72 hs: Carla nos mandó fotos durmiendo en su camita nueva. Come con apetito y hace sus necesidades en los paseos.',
    proxima_fecha_seguimiento: '2026-10-16',
    completado: true,
    created_at: '2026-10-04T19:00:00.000Z'
  },
  {
    id: 'seg-2',
    adopcion_id: 'adopcion-luna',
    fecha_contacto: '2026-10-16',
    tipo_contacto: 'WhatsApp',
    foto_video_recibido: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    estado_general: 'excelente',
    observaciones: 'Control a los 15 días: excelente relación, ya pasea tranquila y conoce los horarios. Se le recordó el turno de castración para fin de mes.',
    proxima_fecha_seguimiento: '2026-10-25',
    completado: true,
    created_at: '2026-10-16T17:30:00.000Z'
  },
  {
    id: 'seg-3',
    adopcion_id: 'adopcion-luna',
    fecha_contacto: '2026-10-25',
    tipo_contacto: 'WhatsApp',
    foto_video_recibido: '',
    estado_general: 'alerta',
    observaciones: 'Control programado a los 30 días: verificar castración y recibir fotos actuales.',
    proxima_fecha_seguimiento: '2026-11-01',
    completado: false,
    created_at: '2026-10-01T16:05:00.000Z'
  }
];

export const INITIAL_HEALTH_EVENTS = [
  {
    id: 'salud-1',
    animal_id: 'anim-luna',
    fecha: '2026-08-25',
    tipo_evento: 'vacuna antirrábica',
    producto_o_detalle: 'Rabisin (Boehringer Ingelheim)',
    profesional_veterinaria: 'Dra. Silvina Romero - MP 4590',
    lugar: 'Veterinaria El Ombú',
    diagnostico_enfermedad: '',
    medicacion_cronica: false,
    fecha_proximo_refuerzo_o_vencimiento: '2027-08-25',
    created_at: '2026-08-25T11:00:00.000Z'
  },
  {
    id: 'salud-2',
    animal_id: 'anim-luna',
    fecha: '2026-09-05',
    tipo_evento: 'múltiple/séxtuple/triple felina',
    producto_o_detalle: 'Nobivac DHPPi + L (Séxtuple canina)',
    profesional_veterinaria: 'Dra. Silvina Romero',
    lugar: 'Veterinaria El Ombú',
    diagnostico_enfermedad: '',
    medicacion_cronica: false,
    fecha_proximo_refuerzo_o_vencimiento: '2027-09-05',
    created_at: '2026-09-05T10:00:00.000Z'
  },
  {
    id: 'salud-3',
    animal_id: 'anim-simba',
    fecha: '2026-10-12',
    tipo_evento: 'tratamiento',
    producto_o_detalle: 'Cefalexina 500mg cada 12hs por 10 días + desinfección con Clorhexidina',
    profesional_veterinaria: 'Dr. Alejandro Ruiz',
    lugar: 'Hospital Veterinario Municipal Lomas',
    diagnostico_enfermedad: 'Herida desgarrada en pata delantera izquierda por mordedura callejera',
    medicacion_cronica: true,
    detalle_medicacion_cronica: 'Antibiótico diario hasta el 22/10',
    fecha_proximo_refuerzo_o_vencimiento: '2026-10-24', // Próximo a vencer / control
    created_at: '2026-10-12T16:00:00.000Z'
  }
];

export const INITIAL_STREET_REPORTS = [
  {
    id: 'rep-1',
    descripcion: 'Perrita mestiza atropellada en la mano hacia provincia. Está sobre la vereda resguardada por vecinos con una manta pero renguea mucho y necesita atención urgente.',
    latitud: -34.6180,
    longitud: -58.4200,
    direccion_aproximada: 'Av. Rivadavia 4300, Almagro, CABA',
    nivel_urgencia: 'crítico',
    estado_reporte: 'nuevo',
    fotos: [
      'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=800&q=80'
    ],
    reportante_id: 'usr-rescatista-flor',
    rescatista_asignada: null,
    fecha_resolucion: null,
    animal_id: null,
    created_at: '2026-10-22T20:15:00.000Z'
  },
  {
    id: 'rep-2',
    descripcion: 'Gata mamá con 4 gatitos recién nacidos en una caja de cartón al lado de un contenedor de basura.',
    latitud: -34.6037,
    longitud: -58.3816,
    direccion_aproximada: 'Talcahuano 450, San Nicolás, CABA',
    nivel_urgencia: 'alto',
    estado_reporte: 'tomado',
    fotos: [
      'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80'
    ],
    reportante_id: 'usr-admin',
    rescatista_asignada: 'usr-admin',
    fecha_resolucion: null,
    animal_id: null,
    created_at: '2026-10-22T14:00:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-1',
    usuario_nombre: 'Génesis Bustamante',
    accion: 'Creación de adopción',
    tabla_afectada: 'adopciones',
    registro_nombre: 'Luna (DOG-001) a Carla Rossi',
    fecha: '2026-10-01T16:00:00.000Z'
  },
  {
    id: 'aud-2',
    usuario_nombre: 'Florencia Romero',
    accion: 'Registro de rescate',
    tabla_afectada: 'animales',
    registro_nombre: 'Simba (DOG-002)',
    fecha: '2026-10-10T11:00:00.000Z'
  },
  {
    id: 'aud-3',
    usuario_nombre: 'Génesis Bustamante',
    accion: 'Carga de seguimiento',
    tabla_afectada: 'seguimientos',
    registro_nombre: 'Control 15 días - Luna',
    fecha: '2026-10-16T17:30:00.000Z'
  }
];

export const INITIAL_NEWS = [
  {
    id: 'noticia-1',
    titulo: 'Jornada de Castración Gratuita y Vacunación Antirrábica',
    fecha: '24/10/2026',
    categoria: 'Campaña Sanitaria',
    resumen: 'Este sábado estaremos en la plaza realizando castraciones con turno previo y vacunación antirrábica por orden de llegada para perros y gatos.',
    cuerpo: 'Continuamos con el plan integral de control ético poblacional. Si tenés animales de la calle en tu cuadra o querés castrar a tu rescatado, escribinos para reservar turno.',
    foto_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    autor: 'Génesis Bustamante',
    publicado: true
  },
  {
    id: 'noticia-2',
    titulo: '¡Final Feliz! Milo ya duerme en su nuevo hogar definitivo',
    fecha: '22/10/2026',
    categoria: 'Caso de Éxito',
    resumen: 'Después de 3 meses de recuperación y cuidados en hogar de tránsito, Milo fue adoptado responsablemente por una hermosa familia en Belgrano.',
    cuerpo: 'Queremos agradecer a todos los que compartieron sus fotos en redes sociales y a su hogar de tránsito por cuidarlo con tanto amor. ¡Las adopciones salvan vidas!',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    autor: 'Génesis Bustamante',
    publicado: true
  },
  {
    id: 'noticia-3',
    titulo: 'Convocatoria Abierta: Buscamos Hogares de Tránsito Solidarios',
    fecha: '18/10/2026',
    categoria: 'Comunidad',
    resumen: 'El tránsito es el eslabón clave del rescate. Si tenés un espacio seguro en tu casa o departamento y querés ayudar a un animal mientras encuentra familia, sumate.',
    cuerpo: 'Nosotras cubrimos el alimento balanceado, la atención veterinaria y los insumos médicos. Vos solo ponés el techo, el cuidado y el amor.',
    foto_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    autor: 'Génesis Bustamante',
    publicado: true
  }
];

export const INITIAL_SYSTEM_MESSAGES = [
  {
    id: 'msg-avances-completos-hoy-20261024',
    remitente_nombre: 'Superadministración LUMIA',
    remitente_rol: 'Superadministrador Técnico',
    remitente_email: 'martinchiacchio.seg@gmail.com',
    destinatario: 'Génesis Bustamante y Equipo de Administración',
    asunto: '🐾 Informe Oficial: Sincronización en la Nube Multidispositivo, OCR con Cámara y Mejoras Operativas',
    categoria: 'Actualización Mayor del Sistema',
    prioridad: 'Alta',
    fecha: '24/10/2026',
    hora: '20:45',
    leido: false,
    resumen: 'Sincronización centralizada en Neon PostgreSQL entre celulares y PC, autocompletado inteligente con cámara (OCR) en todos los formularios, ficha de adoptante en animales adoptados y descarga de dossier en PDF.',
    contenido_detallado: [
      {
        titulo: '1. Sincronización Centralizada Multidispositivo en Tiempo Real (Neon PostgreSQL)',
        detalle: 'Solucionamos la desconexión entre dispositivos. Ahora cualquier animal rescatado, adopción, adoptante o reporte de calle cargado desde un celular, tablet o PC se sincroniza de inmediato en la base de datos central en la nube (Neon PostgreSQL). Aunque abras la aplicación desde otro dispositivo o borres el historial del navegador, la información se descargará automáticamente actualizada y completa.'
      },
      {
        titulo: '2. Autocompletado de Formularios con Cámara e IA (OCR Visual Inteligente)',
        detalle: 'Se implementó el botón "Escanear con IA" / cámara en todos los formularios de la plataforma: Alta y Edición de Fichas de Animales, Libreta Sanitaria y Vacunas, Alta y Edición de Adoptantes, Registro de Adopciones, Reportes de Calle y Usuarios. En celulares abre directamente la cámara trasera y en PC permite subir imágenes o fotos de libretas veterinarias, completando los campos automáticamente y destacándolos con un reborde verde suave para su confirmación.'
      },
      {
        titulo: '3. Ficha de Adoptante en Ficha de Animal Adoptado',
        detalle: 'Para aquellos animales que se encuentren en estado "adoptado", en la parte inferior de la ficha ahora se visualiza directamente la ficha completa de la persona adoptante con sus datos de contacto y enlace directo a su calendario de seguimiento, reemplazando la información del hogar de tránsito previo.'
      },
      {
        titulo: '4. Descarga del Dossier Oficial en Formato PDF',
        detalle: 'El dossier del animal con sus fotos, historia de rescate, temperamento y estado sanitario ahora cuenta con la funcionalidad de descarga directa en PDF formal institucional desde la ficha del animal y desde el panel de superadministrador.'
      },
      {
        titulo: '5. Seguridad Reforzada y Acceso Biométrico (Passkeys / WebAuthn)',
        detalle: 'Todos los usuarios, incluyendo el superadministrador, cuentan en su sección de Configuración con la opción de registrar su huella dactilar o reconocimiento facial para iniciar sesión de manera rápida y segura sin depender de contraseñas manuales.'
      }
    ]
  },
  {
    id: 'msg-hoy-actualizaciones-20261024',
    remitente_nombre: 'Superadministración LUMIA',
    remitente_rol: 'Superadministrador Técnico',
    remitente_email: 'soporte@patitaaliada.org.ar',
    destinatario: 'Administración y Coordinación de Rescate',
    asunto: '🚀 Informe Oficial: Actualizaciones y Nuevos Módulos Implementados en LUMIA',
    categoria: 'Actualización Mayor del Sistema',
    prioridad: 'Alta',
    fecha: '24/10/2026',
    hora: '03:15',
    leido: false,
    resumen: 'Resumen completo de las mejoras técnicas, seguridad biométrica, asistente de IA Patita Aliada y herramientas desplegadas hoy.',
    contenido_detallado: [
      {
        titulo: '1. Base de Datos en Producción (Neon PostgreSQL - AWS São Paulo)',
        detalle: 'Conectamos exitosamente la base de datos de producción con el esquema relacional completo: tablas de animales, adoptantes con protección de datos sensibles (Ley 25.326), contratos, bitácora de seguimiento en 6 etapas, eventos de salud y reportes de calle. Se inicializó la vista inteligente vista_semaforo_adopciones que calcula automáticamente las alertas verdes, amarillas y rojas en tiempo real.'
      },
      {
        titulo: '2. Seguridad Reforzada, Claves CSPRNG (48h) y Acceso Biométrico (Passkeys)',
        detalle: 'Las cuentas nuevas reciben una contraseña aleatoria criptográficamente segura de un solo uso con validez de 48 horas y cambio obligatorio (mínimo 10 caracteres). Además, ya podés activar el ingreso con huella digital o reconocimiento facial (WebAuthn) desde tu celular o computadora sin que el sistema almacene datos biométricos.'
      },
      {
        titulo: '3. Rediseño e Identidad Visual Oficial LUMIA en Portada',
        detalle: 'Ampliamos el logotipo oficial a escala 2xl en la portada principal. Ahora el corazón outline con huella grande centrada (#C94A2A terracota vívido), la sigla LUMIA en mayúscula y el subtítulo obligatorio "LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES" lucen nítidos, imponentes y legibles en cualquier celular o monitor.'
      },
      {
        titulo: '4. Manual Operativo de Gestión en PDF (6 Páginas Oficiales)',
        detalle: 'Ya contás con el botón "Manual (PDF)" en el menú superior, en el Dashboard y en la sección de usuarios. Genera un documento PDF institucional con portada formal, diagramas, protocolos de rescate, etapas de adopción, seguridad biométrica y resguardo legal, listo para imprimir o capacitar a nuevas rescatistas.'
      },
      {
        titulo: '5. Asistente de IA "Patita Aliada" Integrado',
        detalle: 'Sumamos el botón flotante de Patita Aliada (impulsado por Gemini Flash en servidor seguro) para responder consultas de primeros auxilios, legislación argentina (Ley 14.346), redacción de publicaciones de adopción y acompañamiento emocional para rescatistas.'
      },
      {
        titulo: '6. Generador de Flyers para Redes Sociales en cada Ficha',
        detalle: 'En la ficha de cada animal y en el listado de casos ahora disponés del botón "Flyer Redes". Te permite generar al instante piezas gráficas listas para publicar en Instagram y Facebook (Post 1:1 o Stories 9:16) con la foto del animal, señas, estado de salud, tus datos de contacto y el logo oficial de LUMIA. Podés descargarlo como imagen PNG en alta definición (1080px) o copiar el texto ya redactado con hashtags.'
      },
      {
        titulo: '7. Portal Público Libre de Adopciones y Noticias',
        detalle: 'Creamos la web pública libre (link: ?portal=adopciones) para difundir animales en adopción y noticias del refugio. Este enlace es libre y cualquier voluntaria, adoptante o seguidor puede compartirlo en sus estados de WhatsApp o redes. Los interesados pueden consultar por WhatsApp o postularse en línea directamente.'
      },
      {
        titulo: '8. Nuevo Canal de Comunicaciones Oficiales ("Mensajes del Sistema")',
        detalle: 'Este nuevo canal directo que estás viendo te permitirá recibir siempre las instrucciones técnicas, avisos de mantenimiento, respaldos y actualizaciones que vaya incorporando a la plataforma, con control de lectura y notificaciones inmediatas.'
      }
    ]
  }
];

export const INITIAL_PORTAL_CONFIG = {
  telefono_guardia: '+54 9 11 9988-7766',
  telefono_whatsapp: '5491199887766',
  nombre_guardia: 'Guardia y Rescate LUMIA',
  email_contacto: 'contacto@patitaaliada.org.ar',
  zona_cobertura: 'Buenos Aires, Argentina',
  mensaje_bienvenida: 'Ellos esperan una segunda oportunidad'
};
