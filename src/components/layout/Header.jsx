import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Bell, LogOut, ShieldCheck, Database, Cloud, Download, Sparkles, BookOpen, Inbox, Fingerprint, Settings } from 'lucide-react';
import { isOverdue, isDueSoon } from '../../lib/formatters';
import { Logo } from '../common/Logo';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { ModalCompartirDossier } from '../superadmin/ModalCompartirDossier';
import { MisDispositivosModal } from '../auth/MisDispositivosModal';

export function Header({ currentView, setCurrentView }) {
  const { currentUser, logout, isPasskeySupported } = useAuth();
  const { seguimientos, eventosSalud, reportesCalle, mensajesSistema } = useData();

  const [downloadingManual, setDownloadingManual] = useState(false);
  const [showSuperadminShare, setShowSuperadminShare] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);

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

  // Calcular alertas activas para el badge
  const pendingFollowups = seguimientos.filter(s => !s.completado && (isOverdue(s.fecha_contacto) || s.estado_general === 'alerta'));
  const dueHealth = eventosSalud.filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento)));
  const newReports = reportesCalle.filter(r => r.estado_reporte === 'nuevo');
  const totalAlerts = pendingFollowups.length + dueHealth.length + newReports.length;

  const unreadMessages = (mensajesSistema || []).filter(m => !m.leido).length;

  return (
    <>
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

            {/* Acciones y Perfil */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Opción EXCLUSIVA Superadministrador: Panel Superadmin */}
              {isSuperadmin && (
                <button
                  onClick={() => setCurrentView('panel_superadmin')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    currentView === 'panel_superadmin'
                      ? 'bg-lumia-500 text-white shadow-lumia-500/25 ring-2 ring-lumia-600'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                  title="Panel de Control Superadmin (Noticias y Teléfono del Portal)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-lumia-400 shrink-0" />
                  <span className="hidden md:inline">Panel Superadmin</span>
                </button>
              )}

              {/* Opción EXCLUSIVA Superadministrador: Dossier Oficial */}
              {isSuperadmin && (
                <button
                  onClick={() => setShowSuperadminShare(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex items-center gap-1.5 shadow-sm"
                  title="Dossier Técnico Oficial de Capacidades y Descarga PDF (Exclusivo Superadministrador)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="hidden md:inline">Dossier Oficial</span>
                </button>
              )}

              {/* Opción de descarga del Manual de Usuario para Administrador y Superadmin */}
              {isAdminOrSuper && (
                <button
                  onClick={handleDownloadManual}
                  disabled={downloadingManual}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all flex items-center gap-1.5"
                  title="Descargar Manual Operativo Completo (PDF Oficial)"
                >
                  <Download className="w-3.5 h-3.5 text-lumia-600 shrink-0" />
                  <span className="hidden sm:inline">{downloadingManual ? 'Descargando...' : 'Manual (PDF)'}</span>
                </button>
              )}

              {/* Indicador de Backend */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-stone-50 border-stone-200 text-stone-600">
                {isSupabaseConfigured ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Supabase Conectado</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-lumia-500" />
                    <span>Neon Postgres</span>
                  </>
                )}
              </div>

              {/* Mensajes del Sistema */}
              <button
                onClick={() => setCurrentView('mensajes')}
                className="relative p-2.5 rounded-2xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Mensajes del Sistema"
              >
                <Inbox className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadMessages}
                  </span>
                )}
              </button>

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

              {/* Botón directo a Configuración y Biometría para todos los usuarios */}
              <button
                onClick={() => setCurrentView('configuracion')}
                className={`p-2.5 rounded-2xl transition-colors ${
                  currentView === 'configuracion'
                    ? 'bg-lumia-50 text-lumia-700 ring-2 ring-lumia-500'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                title="Configuración de Cuenta y Biometría (Huella / Rostro)"
              >
                <Fingerprint className="w-5 h-5 text-lumia-600" />
              </button>

              {/* Perfil del Usuario */}
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <button
                  onClick={() => setCurrentView('configuracion')}
                  className="text-right hidden sm:block hover:opacity-80 transition-opacity text-left"
                  title="Ir a Configuración"
                >
                  <p className="text-xs font-bold text-stone-800 leading-tight">{currentUser?.nombre}</p>
                  <div className="flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3 text-lumia-500" />
                    <span className="text-[10px] text-stone-500 font-semibold">{currentUser?.rol}</span>
                  </div>
                </button>

                <div 
                  onClick={() => setCurrentView('configuracion')}
                  className="w-9 h-9 rounded-2xl bg-lumia-50 text-lumia-700 font-bold text-sm flex items-center justify-center border border-lumia-200 shadow-sm cursor-pointer hover:bg-lumia-100 transition-colors"
                  title="Configuración de cuenta y biometría"
                >
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

      {/* Modal de Dispositivos Biométricos Passkey */}
      {showDevicesModal && (
        <MisDispositivosModal
          isOpen={showDevicesModal}
          onClose={() => setShowDevicesModal(false)}
        />
      )}

      {/* Modal exclusivo de Superadministrador para dossier autenticado */}
      {showSuperadminShare && (
        <ModalCompartirDossier
          isOpen={showSuperadminShare}
          onClose={() => setShowSuperadminShare(false)}
          onOpenInternalDossier={() => setCurrentView('dossier')}
        />
      )}
    </>
  );
}
