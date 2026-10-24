import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { formatDate, isOverdue, isDueSoon } from '../../lib/formatters';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { ModalCompartirDossier } from '../superadmin/ModalCompartirDossier';
import { 
  Dog, 
  HeartHandshake, 
  AlertTriangle, 
  Syringe, 
  MapPin, 
  PlusCircle, 
  PhoneCall, 
  ArrowRight, 
  Calendar,
  Sparkles,
  ClipboardList,
  Download,
  BookOpen
} from 'lucide-react';

export function DashboardView({ setCurrentView, onOpenNewAnimal, onOpenNewReport, onSelectAnimal }) {
  const { currentUser } = useAuth();
  const { animales, adopciones, seguimientos, eventosSalud, reportesCalle, adoptantes } = useData();
  const { hasPermission } = usePermissions();

  const [downloadingManual, setDownloadingManual] = useState(false);
  const [showSuperadminShare, setShowSuperadminShare] = useState(false);

  const isSuperadmin = currentUser?.rol === 'Superadministrador';
  const isAdminOrSuper = currentUser?.rol === 'Administrador' || isSuperadmin;

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

  // Métricas
  const activeAnimals = animales.filter(a => !a.archivado && a.estado_caso !== 'adoptado' && a.estado_caso !== 'fallecido');
  const activeAdoptions = adopciones.filter(a => a.estado_adopcion === 'activo en seguimiento');
  
  // Alertas
  const overdueFollowups = seguimientos.filter(s => !s.completado && isOverdue(s.fecha_contacto));
  const weekFollowups = seguimientos.filter(s => !s.completado && isDueSoon(s.fecha_contacto, 7));
  const alertStatusFollowups = seguimientos.filter(s => s.estado_general === 'alerta');

  const upcomingVaccines = eventosSalud.filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento, 14)));
  const pendingCastrations = adopciones.filter(a => a.compromiso_castracion && a.fecha_limite_castracion && (isOverdue(a.fecha_limite_castracion) || isDueSoon(a.fecha_limite_castracion, 15)));

  const newStreetReports = reportesCalle.filter(r => r.estado_reporte === 'nuevo');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Saludo Bienvenida */}
      <div className="bg-gradient-to-r from-patita-500 to-patita-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-patita-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <svg className="w-64 h-64 fill-white" viewBox="0 0 100 100">
            <ellipse cx="50" cy="62" rx="18" ry="14"/>
            <circle cx="28" cy="42" r="8"/>
            <circle cx="43" cy="30" r="8"/>
            <circle cx="57" cy="30" r="8"/>
            <circle cx="72" cy="42" r="8"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-patita-50 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Rescate Independiente
            </span>
            <span className="text-xs text-patita-100 font-medium">Argentina</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Hola, {currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'rescatista'}! 🐾
          </h1>
          <p className="mt-1 text-sm text-patita-100 max-w-xl">
            Tenés <span className="font-bold underline decoration-white/50">{activeAnimals.length} animales</span> bajo cuidado activo y <span className="font-bold underline decoration-white/50">{activeAdoptions.length} adopciones</span> en seguimiento.
          </p>

          {/* Accesos rápidos móviles / desktop */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {hasPermission('animales', 'crear') && (
              <button
                onClick={onOpenNewAnimal}
                className="px-4 py-2 rounded-xl bg-white text-patita-700 font-bold text-xs sm:text-sm hover:bg-patita-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-patita-600" />
                <span>Nuevo Rescate</span>
              </button>
            )}

            {hasPermission('reportes_calle', 'crear') && (
              <button
                onClick={onOpenNewReport}
                className="px-4 py-2 rounded-xl bg-patita-800/40 hover:bg-patita-800/60 text-white font-bold text-xs sm:text-sm transition-colors border border-white/20 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-patita-200" />
                <span>Reportar en Calle</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('alertas')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Ver {overdueFollowups.length + upcomingVaccines.length + newStreetReports.length} alertas</span>
            </button>

            {/* Opción de descarga del manual para el Administrador */}
            {isAdminOrSuper && (
              <button
                onClick={handleDownloadManual}
                disabled={downloadingManual}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition-colors border border-white/30 flex items-center gap-1.5 shadow-sm"
                title="Descargar Manual Operativo Completo en PDF"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{downloadingManual ? 'Generando...' : 'Manual de Usuario (PDF)'}</span>
              </button>
            )}

            {/* Opción exclusiva del Superadministrador: Generar/Compartir Link de Funciones */}
            {isSuperadmin && (
              <button
                onClick={() => setShowSuperadminShare(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs sm:text-sm hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1.5"
                title="Compartir Enlace Oficial de Funciones del Sistema"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Compartir Funciones (Link)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Casos Activos */}
        <div 
          onClick={() => setCurrentView('animales')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Casos Activos</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dog className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">{activeAnimals.length}</span>
            <span className="text-xs text-stone-400 font-medium">en tránsito o adopción</span>
          </div>
        </div>

        {/* Adopciones en Seguimiento */}
        <div 
          onClick={() => setCurrentView('adopciones')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">En Seguimiento</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">{activeAdoptions.length}</span>
            <span className="text-xs text-stone-400 font-medium">hogares activos</span>
          </div>
        </div>

        {/* Controles / Alertas Posadopción */}
        <div 
          onClick={() => setCurrentView('alertas')}
          className={`bg-white p-4 sm:p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
            overdueFollowups.length > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Controles Pendientes</span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              overdueFollowups.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">{overdueFollowups.length + weekFollowups.length}</span>
            <span className="text-xs text-rose-600 font-bold">
              {overdueFollowups.length > 0 ? `${overdueFollowups.length} vencidos` : 'al día'}
            </span>
          </div>
        </div>

        {/* Reportes de Calle Nuevos */}
        <div 
          onClick={() => setCurrentView('reportes')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Reportes Calle</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">{newStreetReports.length}</span>
            <span className="text-xs text-sky-600 font-medium">sin tomar</span>
          </div>
        </div>
      </div>

      {/* Sección Doble Columna: Alertas Urgentes + Casos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 cols): Centro Rápido de Alertas */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
              <h2 className="font-extrabold text-stone-900 text-base">Atención Requerida Esta Semana</h2>
            </div>
            <button
              onClick={() => setCurrentView('alertas')}
              className="text-xs font-bold text-patita-600 hover:text-patita-700 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Casos en Semáforo ROJO / Alerta */}
            {alertStatusFollowups.map(seg => {
              const adop = adopciones.find(a => a.id === seg.adopcion_id);
              const anim = animales.find(a => a.id === adop?.animal_id);
              return (
                <div key={seg.id} className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      !
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-950">
                        Alerta en seguimiento: <span className="underline">{anim?.nombre_actual || 'Animal'}</span>
                      </p>
                      <p className="text-xs text-rose-800 mt-0.5">{seg.observaciones}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('adopciones')}
                    className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold shrink-0 hover:bg-rose-700"
                  >
                    Revisar
                  </button>
                </div>
              );
            })}

            {/* Controles Vencidos o por vencer */}
            {overdueFollowups.slice(0, 2).map(seg => {
              const adop = adopciones.find(a => a.id === seg.adopcion_id);
              const anim = animales.find(a => a.id === adop?.animal_id);
              const adoptante = adoptantes.find(ad => ad.id === adop?.adoptante_id);
              return (
                <div key={seg.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Control posadopción vencido: <span className="text-patita-600">{anim?.nombre_actual}</span>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Familia: {adoptante?.nombre_apellido} • Venció el {formatDate(seg.fecha_contacto)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('adopciones')}
                    className="px-3 py-1 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-300 shrink-0"
                  >
                    Contactar
                  </button>
                </div>
              );
            })}

            {/* Vacunas próximas o vencidas */}
            {upcomingVaccines.slice(0, 2).map(salud => {
              const anim = animales.find(a => a.id === salud.animal_id);
              return (
                <div key={salud.id} className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sky-950">
                        Refuerzo requerido: {salud.tipo_evento} ({anim?.nombre_actual})
                      </p>
                      <p className="text-[11px] text-sky-800">
                        Vencimiento: {formatDate(salud.fecha_proximo_refuerzo_o_vencimiento)} • {salud.producto_o_detalle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectAnimal && anim && onSelectAnimal(anim)}
                    className="px-3 py-1 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shrink-0"
                  >
                    Ver Ficha
                  </button>
                </div>
              );
            })}

            {/* Compromisos de Castración */}
            {pendingCastrations.slice(0, 1).map(adop => {
              const anim = animales.find(a => a.id === adop.animal_id);
              const adoptante = adoptantes.find(ad => ad.id === adop.adoptante_id);
              return (
                <div key={adop.id} className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      ✂️
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-950">
                        Compromiso de castración: {anim?.nombre_actual}
                      </p>
                      <p className="text-[11px] text-purple-800">
                        Fecha límite: {formatDate(adop.fecha_limite_castracion)} • Adoptante: {adoptante?.nombre_apellido}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('adopciones')}
                    className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shrink-0"
                  >
                    Seguimiento
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha (1 col): Reportes de Calle Activos */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-extrabold text-stone-900 text-base">Alertas en la Vía Pública</h2>
            <button
              onClick={() => setCurrentView('reportes')}
              className="text-xs font-bold text-patita-600 hover:text-patita-700 flex items-center gap-1"
            >
              <span>Mapa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {reportesCalle.slice(0, 3).map(rep => (
              <div 
                key={rep.id} 
                onClick={() => setCurrentView('reportes')}
                className="p-3 rounded-2xl border border-stone-200 hover:border-patita-400 bg-stone-50/50 hover:bg-stone-50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant={rep.nivel_urgencia === 'crítico' ? 'danger' : rep.nivel_urgencia === 'alto' ? 'warning' : 'info'}>
                    Urgencia {rep.nivel_urgencia}
                  </Badge>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {rep.estado_reporte === 'nuevo' ? '🔴 Sin Tomar' : '🟡 En Rescate'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-800 line-clamp-2">
                  {rep.descripcion}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{rep.direccion_aproximada || 'Ubicación GPS registrada'}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenNewReport}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-stone-300 hover:border-patita-500 text-stone-600 hover:text-patita-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cargar nuevo reporte de calle</span>
          </button>
        </div>
      </div>

      {/* Modal exclusivo de Superadministrador para compartir enlace */}
      {showSuperadminShare && (
        <ModalCompartirDossier
          isOpen={showSuperadminShare}
          onClose={() => setShowSuperadminShare(false)}
        />
      )}
    </div>
  );
}
