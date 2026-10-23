import React from 'react';
import { usePermissions } from '../../context/PermissionsContext';
import { 
  Home, 
  Dog, 
  Users, 
  HeartHandshake, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  FileSpreadsheet, 
  BarChart3 
} from 'lucide-react';

export function Navbar({ currentView, setCurrentView }) {
  const { hasPermission } = usePermissions();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, visible: true },
    { id: 'animales', label: 'Animales', icon: Dog, visible: hasPermission('animales', 'ver') },
    { id: 'adoptantes', label: 'Adoptantes', icon: Users, visible: hasPermission('adoptantes', 'ver') },
    { id: 'adopciones', label: 'Adopciones', icon: HeartHandshake, visible: hasPermission('adopciones', 'ver') },
    { id: 'reportes', label: 'Reportes Calle', icon: MapPin, visible: hasPermission('reportes_calle', 'ver') },
    { id: 'alertas', label: 'Alertas', icon: Bell, visible: true },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, visible: hasPermission('estadisticas', 'ver') },
    { id: 'usuarios', label: 'Usuarios y Roles', icon: ShieldCheck, visible: hasPermission('usuarios', 'ver') },
    { id: 'import_export', label: 'Importar / Exportar', icon: FileSpreadsheet, visible: hasPermission('import_export', 'ver') },
  ];

  return (
    <nav className="hidden lg:block bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-1.5 overflow-x-auto scrollbar-hide">
          {navItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-patita-500 text-white shadow-sm shadow-patita-500/30'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
