import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Bell, LogOut, ShieldCheck, Database, Cloud } from 'lucide-react';
import { isOverdue, isDueSoon } from '../../lib/formatters';
import { Logo } from '../common/Logo';

export function Header({ currentView, setCurrentView }) {
  const { currentUser, logout } = useAuth();
  const { seguimientos, eventosSalud, reportesCalle } = useData();

  // Calcular alertas activas para el badge
  const pendingFollowups = seguimientos.filter(s => !s.completado && (isOverdue(s.fecha_contacto) || s.estado_general === 'alerta'));
  const dueHealth = eventosSalud.filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento)));
  const newReports = reportesCalle.filter(r => r.estado_reporte === 'nuevo');
  const totalAlerts = pendingFollowups.length + dueHealth.length + newReports.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo Oficial LUMIA con subtítulo grande y legible */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Logo
              variant="full"
              background="transparent"
              size="md"
              className="h-12 w-auto transition-transform group-hover:scale-[1.02]"
              priority={true}
            />
          </div>

          {/* Estado de conexión + Alertas + Perfil */}
          <div className="flex items-center gap-3">
            {/* Indicador de Backend */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-stone-50 border-stone-200 text-stone-600">
              {isSupabaseConfigured ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Supabase Conectado</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-lumia-500" />
                  <span>Modo Local / Demo</span>
                </>
              )}
            </div>

            {/* Campana de Alertas */}
            <button
              onClick={() => setCurrentView('alertas')}
              className="relative p-2.5 rounded-2xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Centro de Alertas"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-lumia-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Perfil del Usuario */}
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-800 leading-tight">{currentUser?.nombre}</p>
                <div className="flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-lumia-500" />
                  <span className="text-[10px] text-stone-500 font-semibold">{currentUser?.rol}</span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-2xl bg-lumia-50 text-lumia-700 font-bold text-sm flex items-center justify-center border border-lumia-200 shadow-sm">
                {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
