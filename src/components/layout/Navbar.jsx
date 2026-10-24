import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useData } from '../../context/DataContext';
import { 
  Home, 
  Dog, 
  Users, 
  HeartHandshake, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  ShieldAlert,
  FileSpreadsheet, 
  BarChart3,
  ExternalLink,
  Inbox,
  Fingerprint
} from 'lucide-react';

export function Navbar({ currentView, setCurrentView }) {
  const { currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const { mensajesSistema } = useData();

  const isSuperadmin = currentUser?.rol === 'Superadministrador';

  const unreadMessages = (mensajesSistema || []).filter(m => !m.leido).length;

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, visible: true },
    { id: 'animales', label: 'Animales', icon: Dog, visible: hasPermission('animales', 'ver') },
    { id: 'adoptantes', label: 'Adoptantes', icon: Users, visible: hasPermission('adoptantes', 'ver') },
    { id: 'adopciones', label: 'Adopciones', icon: HeartHandshake, visible: hasPermission('adopciones', 'ver') },
    { id: 'reportes', label: 'Reportes Calle', icon: MapPin, visible: hasPermission('reportes_calle', 'ver') },
    { id: 'alertas', label: 'Alertas', icon: Bell, visible: true },
    { id: 'mensajes', label: 'Mensajes', icon: Inbox, badge: unreadMessages, visible: true },
    { id: 'panel_superadmin', label: 'Panel Superadmin', icon: ShieldAlert, visible: isSuperadmin },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, visible: hasPermission('estadisticas', 'ver') },
    { id: 'usuarios', label: 'Usuarios y Roles', icon: ShieldCheck, visible: hasPermission('usuarios', 'ver') },
    { id: 'import_export', label: 'Importar / Exportar', icon: FileSpreadsheet, visible: hasPermission('import_export', 'ver') },
    { id: 'configuracion', label: 'Configuración', icon: Fingerprint, visible: true },
  ];

  return (
    <nav className="hidden lg:block bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1.5 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1">
            {navItems.filter(item => item.visible).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-lumia-500 text-white shadow-sm shadow-lumia-500/30'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-lumia-700' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Enlace directo al Portal Público Libre de Adopciones y Noticias */}
          <a
            href={`${window.location.origin}${window.location.pathname}?portal=adopciones`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-lumia-50 text-lumia-800 hover:bg-lumia-100 border border-lumia-200 transition-colors shadow-sm ml-2 shrink-0"
            title="Abrir el Portal Público Libre de Adopciones y Noticias"
          >
            <ExternalLink className="w-3.5 h-3.5 text-lumia-600" />
            <span>Portal Adopciones (Link Libre)</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
