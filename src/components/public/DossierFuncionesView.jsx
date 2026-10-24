import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { downloadDossierPdf } from '../../services/dossierPdfService';
import { 
  ShieldCheck, 
  Dog, 
  Users, 
  HeartHandshake, 
  ClipboardCheck, 
  Stethoscope, 
  MapPin, 
  FileText, 
  QrCode, 
  Lock, 
  History, 
  FileSpreadsheet, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  Layers,
  Fingerprint,
  Bot,
  Share2,
  Globe,
  Inbox,
  FileDown
} from 'lucide-react';

export function DossierFuncionesView({ onBackToApp }) {
  const { currentUser } = useAuth();
  const [downloadingDossier, setDownloadingDossier] = useState(false);
  const [downloadingManual, setDownloadingManual] = useState(false);

  if (currentUser?.rol !== 'Superadministrador') {
    return null;
  }

  const handleDownloadDossier = async () => {
    setDownloadingDossier(true);
    try {
      await downloadDossierPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el dossier en PDF.');
    } finally {
      setDownloadingDossier(false);
    }
  };

  const handleDownloadManual = async () => {
    setDownloadingManual(true);
    try {
      await downloadManualAdministradorPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el manual en PDF.');
    } finally {
      setDownloadingManual(false);
    }
  };

  const MODULOS_DETALLADOS = [
    {
      numero: '01',
      id: 'animales',
      titulo: 'Ficha 360° de Animales y Código Único',
      icono: Dog,
      badge: 'Gestión Principal',
      color: 'bg-lumia-50 text-lumia-800 border-lumia-200',
      resumen: 'Centraliza el legajo integral de cada perro, gato u otro animal rescatado con identificación unívoca.',
      caracteristicas: [
        'Código interno único autogenerado irrepetible (formato DOG-001, CAT-001) para trazabilidad legal.',
        'Ficha descriptiva completa: especie, sexo, edad estimada por rangos veterinarios, tamaño y color de pelaje.',
        'Registro de señas particulares (manchas, cicatrices, amputaciones, número de microchip).',
        'Ciclo de vida del caso: Rescatado → En tránsito → En adopción → Adoptado / Fallecido.',
        'Mapeo de procedencia: barrio, localidad, coordenadas geográficas o link de mapa del lugar de rescate.',
        'Galería fotográfica categorizada (rescate, evolución clínica y convivencia con su familia adoptiva).',
        'Evaluación de conducta y socialización (relación con perros, gatos, niños, personas, pretal/correa).'
      ]
    },
    {
      numero: '02',
      id: 'adoptantes',
      titulo: 'Directorio de Adoptantes y Protección Ley 25.326',
      icono: Users,
      badge: 'Privacidad Protegida',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      resumen: 'Base de datos de postulantes y familias adoptivas con blindaje de datos sensibles y contacto directo.',
      caracteristicas: [
        'Directorio completo con nombre, DNI/CUIT, teléfono celular con enlace directo a WhatsApp.',
        'Relevamiento socioambiental: tipo de vivienda (casa, departamento, campo) y condición de tenencia.',
        'Calificación del adoptante: Apto, En evaluación, o Alerta (registro preventivo contra maltratadores y reincidentes).',
        'Blindaje de Datos Sensibles (Ley Nacional N° 25.326): DNI, foto de documento y domicilio censurados automáticamente.',
        'Historial de adopciones previas y vinculación de múltiples animales a un mismo adoptante.'
      ]
    },
    {
      numero: '03',
      id: 'adopciones',
      titulo: 'Adopciones Formales y Período de Adaptación',
      icono: HeartHandshake,
      badge: 'Seguridad Legal',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      resumen: 'Formalización del traspaso de custodia responsable con plazos de prueba y acuerdo de seguimiento.',
      caracteristicas: [
        'Vinculación formal entre el animal y el adoptante calificado con modalidad de entrega registrada.',
        'Cómputo automático del período de adaptación de 15 días con tutela preventiva de la rescatista.',
        'Adjunto digital de contrato de adopción firmado en PDF o fotografía.',
        'Compromiso obligatorio de castración para cachorros entregados antes de su madurez reproductiva.',
        'Gestión de devoluciones con reingreso automático al estado de rescate sin pérdida de historial.'
      ]
    },
    {
      numero: '04',
      id: 'seguimientos',
      titulo: 'Seguimiento Posadopción Automatizado en 6 Etapas',
      icono: ClipboardCheck,
      badge: 'Automatización Inteligente',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      resumen: 'Elimina la pérdida de casos en chats de WhatsApp dispersos mediante un cronograma estructurado.',
      caracteristicas: [
        'Generación automática del calendario de 6 contactos posadopción al confirmar la entrega:',
        '• Contacto 1: A las 48 horas (primer apego, alimentación y descanso inicial).',
        '• Contacto 2: A los 15 días (evaluación final del período de adaptación).',
        '• Contacto 3: Al mes (consolidación de rutinas y convivencia).',
        '• Contacto 4: A los 3 meses (control de vacunas y fecha de castración).',
        '• Contacto 5: A los 6 meses (evolución de conducta y estado físico).',
        '• Contacto 6: Al año (cierre exitoso formal del caso o pase a seguimiento anual).',
        'Bitácora multimedia de respuestas con registro de estado general (Excelente, Normal, Regular o Alerta).'
      ]
    },
    {
      numero: '05',
      id: 'semaforo',
      titulo: 'Semáforo Inteligente Posadopción en Tiempo Real',
      icono: Layers,
      badge: 'Prevención Activa',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      resumen: 'Calcula instantáneamente el estado de riesgo de cada adopción para priorizar la atención.',
      caracteristicas: [
        '🟢 VERDE: Caso al día, último seguimiento favorable y sin vencimientos pendientes.',
        '🟡 AMARILLO: Control que vence en los próximos 5 días o período de prueba concluido sin reporte asentado.',
        '🔴 ROJO: Control vencido urgente o caso marcado en estado "Alerta" (escape, conflicto o enfermedad).',
        'Botón de envío de WhatsApp con mensaje prearmado que cita el nombre del animal y el hito de control.',
        'Vista de base de datos dedicada (vista_semaforo_adopciones) calculada directamente en PostgreSQL.'
      ]
    },
    {
      numero: '06',
      id: 'salud',
      titulo: 'Libreta Sanitaria Digital y Vencimientos',
      icono: Stethoscope,
      badge: 'Control Veterinario',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      resumen: 'Historial clínico completo con cálculo de fechas de revacunación, antiparasitarios y cirugías.',
      caracteristicas: [
        'Registro de eventos sanitarios: Antirrábica, Séxtuple/Quíntuple, Triple Felina, Antiparasitarios y Cirugías.',
        'Cirugías de castración con registro de veterinaria actuante y certificado.',
        'Cálculo automático de la fecha del próximo refuerzo veterinario con integración al Centro de Alertas.',
        'Adjuntos de estudios médicos, ecografías, análisis de sangre y recetas veterinarias.'
      ]
    },
    {
      numero: '07',
      id: 'reportes',
      titulo: 'Reportes Comunitarios de Calle con Mapa Interactivo',
      icono: MapPin,
      badge: 'Geolocalización',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      resumen: 'Relevamiento rápido en la vía pública con mapa Leaflet para actuar de urgencia ante animales en peligro.',
      caracteristicas: [
        'Formulario ultraliviano para teléfonos móviles con captura de ubicación GPS automática.',
        'Niveles de urgencia: Crítica / Atropello, Cachorros abandonados, En peligro, Herido leve y Avistamiento.',
        'Mapa interactivo comunitario con pines de colores según el nivel de urgencia del reporte.',
        'Conversión directa: con 1 clic se promueve el reporte a "Ficha de Animal Rescatado" sin volver a cargar los datos.'
      ]
    },
    {
      numero: '08',
      id: 'imprimibles',
      titulo: 'Generación de Documentación Oficial en PDF',
      icono: FileText,
      badge: 'Imprimibles Oficiales',
      color: 'bg-lumia-50 text-lumia-800 border-lumia-200',
      resumen: 'Servicio centralizado con logotipo oficial transparente y formato normalizado para impresión.',
      caracteristicas: [
        'Libreta Única A4 Imprimible: Diseñada para imprimirse en doble faz y plegarse al medio formando un cuadernillo oficial.',
        'Incluye: Ficha del adoptante, Ficha de la mascota con foto, Tablas de vacunas, Cláusulas contractuales y Firmas.',
        'Credencial de Bolsillo (86mm x 54mm): Tarjeta de identificación plastificable con foto, señas y teléfonos de emergencia.',
        'Manual Operativo de Gestión en PDF oficial listo para descargar por el equipo coordinador.'
      ]
    },
    {
      numero: '09',
      id: 'qr',
      titulo: 'Verificación Digital Pública por Código QR',
      icono: QrCode,
      badge: 'Identificación Rápida',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      resumen: 'Trazabilidad y validación pública instantánea accesible desde la cámara de cualquier teléfono.',
      caracteristicas: [
        'Código QR dinámico impreso tanto en la Libreta A4 como en la Credencial de bolsillo.',
        'Al escanearlo, abre la Ficha Pública de Verificación LUMIA certificando la autenticidad del rescate.',
        'Permite a veterinarias o vecinos que encuentren una mascota perdida llamar directamente al rescatista.',
        'Protección estricta: NO divulga datos privados, DNI ni dirección del adoptante para resguardar la intimidad.'
      ]
    },
    {
      numero: '10',
      id: 'flyers',
      titulo: 'Generador de Flyers para Redes Sociales',
      icono: Share2,
      badge: 'Difusión Viral',
      color: 'bg-pink-50 text-pink-800 border-pink-200',
      resumen: 'Creación instantánea de flyers gráficos oficiales para Instagram, Facebook y estados de WhatsApp.',
      caracteristicas: [
        'Diseño visual institucional con logotipo de LUMIA en terracota corporativo (#C94A2A).',
        'Carga automática de la fotografía del rescatado, nombre, edad estimada, temperamento y señas particulares.',
        'Inclusión del número de contacto oficial y requisitos de adopción responsable.',
        'Descarga directa de imagen optimizada para compartir en redes en un solo toque.'
      ]
    },
    {
      numero: '11',
      id: 'portal',
      titulo: 'Portal Público Libre de Adopciones y Novedades',
      icono: Globe,
      badge: 'Comunidad Abierta',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      resumen: 'Enlace libre que cualquier perfil puede compartir sin requerir claves ni permisos de usuario.',
      caracteristicas: [
        'Catálogo público de rescatados en adopción con galería de imágenes y fichas accesibles para adoptantes.',
        'Filtros por especie, tamaño, edad y compatibilidad con niños u otros animales.',
        'Formulario de postulación directa para interesados en adoptar.',
        'Panel administrativo donde el Superadministrador elige las noticias a publicar y el número de contacto oficial.'
      ]
    },
    {
      numero: '12',
      id: 'ia',
      titulo: 'Asistente con IA Especializado "Patita Aliada"',
      icono: Bot,
      badge: 'Inteligencia Artificial',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      resumen: 'Compañera virtual de rescate basada en Google Gemini Flash con voz rioplatense y empatía.',
      caracteristicas: [
        'Respuestas inmediatas en primeros auxilios veterinarios, manejo seguro con bozal improvisado y traslado.',
        'Orientación sobre normativa argentina de maltrato animal (Ley Nacional N° 14.346) y trámites judiciales.',
        'Botón directo "Consultar a Patita Aliada" desde la ficha médica de cada animal para analizar su evolución.',
        'Privacidad absoluta bajo Ley 25.326: nunca se transmiten datos de adoptantes y las instrucciones residen en el servidor.'
      ]
    },
    {
      numero: '13',
      id: 'mensajes',
      titulo: 'Mensajes del Sistema y Comunicación Interna',
      icono: Inbox,
      badge: 'Coordinación Interna',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      resumen: 'Canal directo de directivas y novedades emitidas por el Superadministrador hacia los Administradores.',
      caracteristicas: [
        'Bandeja de entrada con contador de no leídos en el encabezado de la aplicación.',
        'Avisos institucionales sobre actualizaciones del sistema, guardias veterinarias y cambios operativos.',
        'Registro de auditoría interna de lecturas y confirmaciones de recepción.'
      ]
    },
    {
      numero: '14',
      id: 'biometria',
      titulo: 'Acceso Biométrico Nativo (Passkeys FIDO2 / WebAuthn)',
      icono: Fingerprint,
      badge: 'Ciberseguridad Avanzada',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      resumen: 'Ingreso instantáneo mediante huella dactilar, Face ID o Windows Hello con cero almacenamiento biométrico.',
      caracteristicas: [
        'Implementación oficial con @simplewebauthn conforme a los estándares de la alianza FIDO2.',
        'Cero almacenamiento biométrico en servidores: el rasgo nunca abandona el enclave seguro del dispositivo (TPM).',
        'Panel de Configuración de Dispositivos para todos los usuarios y revocación inmediata en caso de extravío de celular.',
        'Protección estricta contra phishing y robo de credenciales mediante firmas criptográficas de clave pública.'
      ]
    },
    {
      numero: '15',
      id: 'seguridad',
      titulo: 'Políticas Criptográficas y Claves Temporales CSPRNG',
      icono: Lock,
      badge: 'Defensa Activa',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      resumen: 'Erradicación de claves por defecto y protección activa contra ataques automatizados de fuerza bruta.',
      caracteristicas: [
        'Generación de contraseñas temporales CSPRNG de 14 caracteres con caducidad a las 48 horas.',
        'Muestra única al creador del usuario y cambio forzoso obligatorio en el primer inicio de sesión.',
        'Política estricta: mínimo 10 caracteres, rechazo de contraseñas comunes y de datos del usuario.',
        'Almacenamiento con hash Bcrypt y bloqueo automático de 15 minutos tras 5 intentos fallidos.'
      ]
    },
    {
      numero: '16',
      id: 'rbac',
      titulo: 'Seguridad y Matriz Granular de Roles (RBAC + RLS)',
      icono: ShieldCheck,
      badge: 'Seguridad Multi-Nivel',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      resumen: 'Jerarquía estricta configurable con aislamiento a nivel de fila en la base de datos PostgreSQL.',
      caracteristicas: [
        'Superadministrador: Dueño técnico con acceso total, gestión de bases de datos, noticias y configuración.',
        'Administrador: Control operativo de animales, adoptantes, casos, seguimientos y creación de usuarios.',
        'Roles operativos: Rescatista (gestión de casos asignados), Colaboradora (reportes de calle) y Solo Lectura.',
        'Row Level Security (RLS) en PostgreSQL impidiendo que un perfil acceda a datos para los que no tiene permiso.'
      ]
    },
    {
      numero: '17',
      id: 'auditoria',
      titulo: 'Bitácora de Auditoría Inmutable de Actividad',
      icono: History,
      badge: 'Transparencia',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      resumen: 'Registro cronológico inviolable de cada modificación realizada en el sistema.',
      caracteristicas: [
        'Registro de usuario, fecha exacta (zona horaria Buenos Aires), acción, módulo afectado y detalle de cambios.',
        'Preservación histórica: las bajas de usuarios o registros se realizan mediante borrado lógico (soft delete).',
        'Filtro de auditoría por rango de fechas y por operador responsable para inspección técnica.'
      ]
    },
    {
      numero: '18',
      id: 'pwa',
      titulo: 'Arquitectura PWA Mobile-First y Base de Datos Cloud',
      icono: Smartphone,
      badge: 'Tecnología Cloud',
      color: 'bg-lumia-50 text-lumia-800 border-lumia-200',
      resumen: 'Desarrollada para funcionar a la perfección en el teléfono de la rescatista en territorio.',
      caracteristicas: [
        'Instalable como Progressive Web App (PWA) en celulares Android e iPhone sin tiendas comerciales.',
        'Funcionamiento Offline-First: permite consultar y registrar datos en la calle con guardado en LocalStorage.',
        'Base de datos PostgreSQL en la nube (Neon) con pool de conexiones y latencia ultrabaja.',
        'Despliegue serverless en Vercel con cabeceras de seguridad estrictas (CSP, nosniff, SameSite=Strict).'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20">
      {/* Barra superior institucional */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo
              variant="full"
              background="transparent"
              size="md"
              className="h-12 w-auto"
              priority={true}
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* BOTÓN PRINCIPAL: DESCARGAR DOSSIER PDF */}
            <button
              onClick={handleDownloadDossier}
              disabled={downloadingDossier}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-lumia-500 hover:bg-lumia-600 text-white shadow-md shadow-lumia-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              title="Descargar Dossier Oficial Completo de Capacidades en PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloadingDossier ? 'Generando Dossier...' : 'Descargar Dossier (PDF)'}</span>
            </button>

            {/* BOTÓN SECUNDARIO: MANUAL PDF */}
            <button
              onClick={handleDownloadManual}
              disabled={downloadingManual}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all flex items-center gap-2 border border-stone-300 hidden sm:flex"
              title="Descargar Manual Operativo Completo en PDF"
            >
              <Download className="w-4 h-4 text-lumia-600" />
              <span>{downloadingManual ? 'Generando...' : 'Manual (PDF)'}</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a la App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner Principal del Dossier */}
      <div className="bg-gradient-to-b from-white via-lumia-50/40 to-stone-100 border-b border-stone-200 py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-lumia-100 text-lumia-800 border border-lumia-200 mb-4 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-lumia-600" />
            <span>Dossier Técnico y Funcional Oficial • 18 Módulos Integrados</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
            Catálogo Completo de Capacidades LUMIA
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto mb-6">
            Libreta Única de Mascotas, Informes y Adopciones. Plataforma integral nacional de gestión 
            para rescatistas independientes de animales en la República Argentina.
          </p>

          {/* Tarjeta de descarga destacada para el Superadministrador */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-4 rounded-3xl border border-lumia-200 shadow-md max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-stone-900 block">Exclusivo Superadministrador</span>
                <span className="text-[11px] text-stone-500">Documento ejecutivo de 5 páginas listo para imprimir o presentar</span>
              </div>
            </div>

            <button
              onClick={handleDownloadDossier}
              disabled={downloadingDossier}
              className="px-5 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-md shadow-lumia-500/30 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloadingDossier ? 'Generando PDF...' : 'Descargar Dossier Oficial (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas destacadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-lumia-600">18</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Módulos Integrados</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-emerald-600">6 Etapas</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Seguimiento 48h a 1 Año</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-sky-600">WebAuthn</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Passkeys Biométricas</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-amber-600">Gemini IA</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Patita Aliada Rioplatense</p>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Módulos Detallados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULOS_DETALLADOS.map((modulo) => {
            const Icon = modulo.icono;
            return (
              <div 
                key={modulo.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-lumia-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-lumia-600 tracking-wider">
                      MÓDULO {modulo.numero}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${modulo.color}`}>
                      {modulo.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-lumia-600 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-stone-900 leading-tight">
                      {modulo.titulo}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-600 mb-4 leading-relaxed font-medium">
                    {modulo.resumen}
                  </p>

                  <div className="space-y-2 border-t border-stone-100 pt-3">
                    {modulo.caracteristicas.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-600 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lumia-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón flotante inferior para descargar el PDF */}
        <div className="mt-12 text-center">
          <button
            onClick={handleDownloadDossier}
            disabled={downloadingDossier}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-sm shadow-lg shadow-lumia-500/30 transition-all disabled:opacity-50"
          >
            <FileDown className="w-5 h-5" />
            <span>{downloadingDossier ? 'Generando Documento Oficial...' : 'Descargar Dossier Completo en PDF (5 Páginas)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
