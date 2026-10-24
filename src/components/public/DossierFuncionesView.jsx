import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
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
  Layers
} from 'lucide-react';

export function DossierFuncionesView({ onBackToApp }) {
  const { currentUser } = useAuth();
  const [downloading, setDownloading] = useState(false);

  if (currentUser?.rol !== 'Superadministrador') {
    return null;
  }

  const handleDownloadManual = async () => {
    setDownloading(true);
    try {
      await downloadManualAdministradorPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el manual en PDF.');
    } finally {
      setDownloading(false);
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
        'Evaluación de conducta y socialización (relación con perros, gatos, niños, personas, manejo con pretal/correa).'
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
        'Relevamiento socioambiental: tipo de vivienda (casa, departamento, campo) y condición (propietario o inquilino con permiso).',
        'Calificación del adoptante: Apto, En evaluación, o No apto / Alerta (para prevenir reincidentes y maltrato).',
        'Blindaje de Datos Sensibles (Ley Nacional N° 25.326): DNI, foto de documento y domicilio censurados automáticamente para perfiles sin autorización expresa.',
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
        'Vinculación formal entre el animal y el adoptante calificado con modalidad de entrega (a domicilio o retirado).',
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
        'Registro de eventos sanitarios: Antirrábica, Séxtuple/Quíntuple, Triple Felina, Desparasitación interna y externa.',
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
        'Manual Operativo de Gestión en PDF de 6 páginas listo para descargar por el equipo coordinador.'
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
      id: 'rbac',
      titulo: 'Seguridad y Matriz Granular de Roles (RBAC)',
      icono: Lock,
      badge: 'Seguridad Multi-Nivel',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      resumen: 'Jerarquía de tres niveles configurable desde la interfaz sin necesidad de tocar código.',
      caracteristicas: [
        'Superadministrador: Dueño técnico con acceso total, gestión de bases de datos, usuarios y enlaces oficiales.',
        'Administrador: Control operativo completo de animales, adoptantes, casos, seguimientos y creación de usuarios.',
        'Roles preconfigurados y editables: Rescatista (gestión de casos propios), Colaboradora (reportes de calle) y Solo Lectura.',
        'Matriz granular: permisos específicos por módulo y por acción (ver, crear, editar, archivar, exportar).',
        'Sin registro público: acceso exclusivo por invitación con contraseña temporal y cambio obligatorio en primer ingreso.'
      ]
    },
    {
      numero: '11',
      id: 'auditoria',
      titulo: 'Bitácora de Auditoría Inmutable de Actividad',
      icono: History,
      badge: 'Transparencia',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      resumen: 'Registro cronológico inviolable de cada modificación realizada en el sistema.',
      caracteristicas: [
        'Registro de usuario, fecha exacta (zona horaria Buenos Aires), acción, módulo afectado y detalle de cambios.',
        'Preservación histórica: las bajas de usuarios o registros se realizan mediante borrado lógico (soft delete).',
        'Filtro de auditoría por rango de fechas y por operador responsable.'
      ]
    },
    {
      numero: '12',
      id: 'import_export',
      titulo: 'Importación y Exportación Masiva (Excel / CSV)',
      icono: FileSpreadsheet,
      badge: 'Interoperabilidad',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      resumen: 'Migración rápida de planillas antiguas y respaldo periódico de la base de datos.',
      caracteristicas: [
        'Importador asistido de planillas de cálculo (Excel / CSV) de animales y adoptantes con mapeo de columnas.',
        'Exportación instantánea en formatos CSV y JSON para copias de resguardo locales.',
        'Validación automática de duplicados por DNI y códigos internos.'
      ]
    },
    {
      numero: '13',
      id: 'pwa',
      titulo: 'Arquitectura PWA Mobile-First y Base de Datos Cloud',
      icono: Smartphone,
      badge: 'Tecnología de Vanguardia',
      color: 'bg-lumia-50 text-lumia-800 border-lumia-200',
      resumen: 'Desarrollada para funcionar a la perfección en el teléfono de la rescatista en territorio.',
      caracteristicas: [
        'Instalable como Progressive Web App (PWA) en celulares Android e iPhone sin tiendas comerciales.',
        'Funcionamiento Offline-First: permite registrar notas y consultas en la calle con guardado en LocalStorage.',
        'Base de datos PostgreSQL en la nube (Neon / Vercel Storage / Supabase) con alta disponibilidad y escalabilidad.',
        'Diseño con Tailwind CSS en terracota corporativo (#C94A2A) de alto contraste visual.'
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
            <button
              onClick={handleDownloadManual}
              disabled={downloading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all flex items-center gap-2 border border-stone-300"
              title="Descargar Manual Operativo Completo en PDF"
            >
              <Download className="w-4 h-4 text-lumia-600" />
              <span className="hidden sm:inline">{downloading ? 'Generando PDF...' : 'Descargar Manual (PDF)'}</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-lumia-500 hover:bg-lumia-600 text-white shadow-sm transition-all flex items-center gap-1.5"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-lumia-100 text-lumia-800 border border-lumia-200 mb-4 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-lumia-600" />
            <span>Dossier Técnico y Funcional de la Plataforma • Enlace Oficial Exclusivo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
            Catálogo Completo de Capacidades LUMIA
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto mb-6">
            Libreta Única de Mascotas, Informes y Adopciones. Plataforma integral nacional de gestión 
            para rescatistas independientes de animales en la República Argentina.
          </p>

          {/* Aviso de seguridad de sesión */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-stone-600 px-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vista protegida por sesión autenticada de Superadministración</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas destacadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-lumia-600">13</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Módulos Integrados</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-emerald-600">6 Etapas</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Seguimiento 48h a 1 Año</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-sky-600">Ley 25.326</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Datos Sensibles Seguros</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p className="text-2xl font-black text-purple-600">PWA 100%</p>
            <p className="text-xs font-semibold text-stone-500 uppercase mt-0.5">Mobile-First + Offline</p>
          </div>
        </div>
      </div>

      {/* Grilla Detallada de Módulos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="space-y-6">
          {MODULOS_DETALLADOS.map((modulo) => {
            const IconComponent = modulo.icono;
            return (
              <div 
                key={modulo.id} 
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-lumia-50 text-lumia-600 flex items-center justify-center font-black text-lg border border-lumia-100 shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400">MÓDULO {modulo.numero}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${modulo.color}`}>
                          {modulo.badge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                        {modulo.titulo}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-stone-600 font-medium">
                  {modulo.resumen}
                </p>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                    Funciones y Reglas de Negocio Implementadas:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-600">
                    {modulo.caracteristicas.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloque final de descarga del manual */}
        <div className="mt-12 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-lumia-500/20 text-lumia-400 flex items-center justify-center mx-auto mb-4 border border-lumia-400/30">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Descargá el Manual Operativo Oficial Completo en PDF
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mb-6">
            Documento institucional de 6 páginas con portada, diagramas de flujo, tablas explicativas 
            y los protocolos de acción para el equipo administrador y rescatistas.
          </p>
          <button
            onClick={handleDownloadManual}
            disabled={downloading}
            className="px-6 py-3.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-sm shadow-lg shadow-lumia-500/30 transition-all inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>{downloading ? 'Generando documento oficial...' : 'Descargar Manual Operativo (PDF)'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default DossierFuncionesView;
