import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useData } from '../../context/DataContext';
import { 
  Home, 
  Dog, 
  Users, 
  MapPin, 
  Bell, 
  Menu, 
  X,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  BarChart3,
  ExternalLink,
  Inbox
} from 'lucide-react';
import { isOverdue, isDueSoon } from '../../lib/formatters';

export function BottomNav({ currentView, setCurrentView }) {
  const { currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const { seguimientos, eventosSalud, reportesCalle, mensajesSistema } = useData();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSuperadmin = 
    currentUser?.rol === 'Superadministrador' || 
    currentUser?.email === 'martinchiacchio.seg@gmail.com';

  const unreadMessages = (mensajesSistema || []).filter(m => !m.leido).length;

  // Alertas
  const pendingFollowups = seguimientos.filter(s => !s.completado && (isOverdue(s.fecha_contacto) || s.estado_general === 'alerta'));
  const dueHealth = eventosSalud.filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento)));
  const newReports = reportesCalle.filter(r => r.estado_reporte === 'nuevo');
  const totalAlerts = pendingFollowups.length + dueHealth.length + newReports.length;

  const navigateTo = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Menú Expandido Móvil */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setMenuOpen(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl p-5 shadow-2xl border-t border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-100">
              <span className="font-bold text-stone-800 text-sm">Más opciones y módulos</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 py-2">
              {hasPermission('adopciones', 'ver') && (
                <button
                  onClick={() => navigateTo('adopciones')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-left font-medium text-sm border border-stone-200/60"
                >
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  <span>Adopciones</span>
                </button>
              )}

              {hasPermission('estadisticas', 'ver') && (
                <button
                  onClick={() => navigateTo('estadisticas')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-left font-medium text-sm border border-stone-200/60"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>Estadísticas</span>
                </button>
              )}

              {hasPermission('usuarios', 'ver') && (
                <button
                  onClick={() => navigateTo('usuarios')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-left font-medium text-sm border border-stone-200/60"
                >
                  <ShieldCheck className="w-4 h-4 text-patita-600" />
                  <span>Usuarios y Roles</span>
                </button>
              )}

              {hasPermission('import_export', 'ver') && (
                <button
                  onClick={() => navigateTo('import_export')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-left font-medium text-sm border border-stone-200/60"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>Importar / Exportar</span>
                </button>
              )}

              {isSuperadmin && (
                <button
                  onClick={() => navigateTo('panel_superadmin')}
                  className="col-span-2 flex items-center gap-2.5 p-3 rounded-2xl bg-stone-900 text-white text-left font-bold text-sm shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-lumia-400" />
                  <span>Panel Administrativo Superadmin</span>
                </button>
              )}

              <button
                onClick={() => navigateTo('mensajes')}
                className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-left font-medium text-sm border border-stone-200/60"
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-lumia-600" />
                  <span>Mensajes del Sistema</span>
                </div>
                {unreadMessages > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                    {unreadMessages} nuevos
                  </span>
                )}
              </button>

              <a
                href={`${window.location.origin}${window.location.pathname}?portal=adopciones`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-lumia-50 hover:bg-lumia-100 text-lumia-800 font-bold text-xs border border-lumia-200 shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-lumia-600" />
                <span>Portal de Adopciones y Noticias (Link Libre)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Barra Inferior Fija Móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {/* Inicio */}
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentView === 'dashboard' ? 'text-patita-600 font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        {/* Animales */}
        {hasPermission('animales', 'ver') && (
          <button
            onClick={() => navigateTo('animales')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
              currentView === 'animales' ? 'text-patita-600 font-bold' : 'text-stone-500'
            }`}
          >
            <Dog className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Animales</span>
          </button>
        )}

        {/* Adoptantes */}
        {hasPermission('adoptantes', 'ver') && (
          <button
            onClick={() => navigateTo('adoptantes')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
              currentView === 'adoptantes' ? 'text-patita-600 font-bold' : 'text-stone-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Adoptantes</span>
          </button>
        )}

        {/* Reportes Calle */}
        {hasPermission('reportes_calle', 'ver') && (
          <button
            onClick={() => navigateTo('reportes')}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
              currentView === 'reportes' ? 'text-patita-600 font-bold' : 'text-stone-500'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Calle</span>
            {newReports.length > 0 && (
              <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            )}
          </button>
        )}

        {/* Alertas */}
        <button
          onClick={() => navigateTo('alertas')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            currentView === 'alertas' ? 'text-patita-600 font-bold' : 'text-stone-500'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Alertas</span>
          {totalAlerts > 0 && (
            <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          )}
        </button>

        {/* Más menú */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            menuOpen ? 'text-patita-600' : 'text-stone-500'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Más</span>
        </button>
      </div>
    </>
  );
}
