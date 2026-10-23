import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Bell, Heart, LogOut, ShieldCheck, Database, Cloud } from 'lucide-react';
import { isOverdue, isDueSoon } from '../../lib/formatters';

export function Header({ currentView, setCurrentView }) {
  const { currentUser, logout } = useAuth();
  const { seguimientos, eventosSalud, reportesCalle } = useData();

  // Calcular alertas activas para el badge
  const pendingFollowups = seguimientos.filter(s => !s.completado && (isOverdue(s.fecha_contacto) || s.estado_general === 'alerta'));
  const dueHealth = eventosSalud.filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento)));
  const newReports = reportesCalle.filter(r => r.estado_reporte === 'nuevo');
  const totalAlerts = pendingFollowups.length + dueHealth.length + newReports.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-patita-600 to-patita-400 flex items-center justify-center text-white shadow-md shadow-patita-500/20 group-hover:scale-105 transition-transform">
              {/* Paw Icon SVG */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 100 100">
                <ellipse cx="50" cy="62" rx="18" ry="14"/>
                <circle cx="28" cy="42" r="8"/>
                <circle cx="43" cy="30" r="8"/>
                <circle cx="57" cy="30" r="8"/>
                <circle cx="72" cy="42" r="8"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 text-lg tracking-tight">Patita Aliada</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-patita-100 text-patita-800">ARG</span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block font-medium">Gestión de rescates y adopciones</p>
            </div>
          </div>

          {/* Estado de conexión + Alertas + Perfil */}
          <div className="flex items-center gap-3">
            {/* Indicador de Backend */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-stone-50 border-stone-200 text-stone-600">
              {isSupabaseConfigured ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Supabase Conectado</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modo Local / Demo</span>
                </>
              )}
            </div>

            {/* Campana de Alertas */}
            <button
              onClick={() => setCurrentView('alertas')}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Centro de Alertas"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Perfil del Usuario */}
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-800 leading-tight">{currentUser?.nombre}</p>
                <div className="flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-patita-600" />
                  <span className="text-[10px] text-stone-500 font-medium">{currentUser?.rol}</span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 font-bold text-sm flex items-center justify-center border border-stone-300">
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
