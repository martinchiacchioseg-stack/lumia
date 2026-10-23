import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { DataProvider } from './context/DataContext';

// Componentes de Layout
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';

// Vistas
import { LoginView } from './components/auth/LoginView';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { AnimalesListView } from './components/animales/AnimalesListView';
import { AdoptantesListView } from './components/adoptantes/AdoptantesListView';
import { AdopcionesListView } from './components/adopciones/AdopcionesListView';
import { ReportesCalleView } from './components/reportes/ReportesCalleView';
import { AlertasCenterView } from './components/alertas/AlertasCenterView';
import { UsuariosRolesView } from './components/usuarios/UsuariosRolesView';
import { ImportExportView } from './components/import_export/ImportExportView';
import { EstadisticasView } from './components/estadisticas/EstadisticasView';

// Modales Globales
import { ModalNuevoAnimal } from './components/animales/ModalNuevoAnimal';
import { FichaAnimalModal } from './components/animales/FichaAnimalModal';
import { ModalNuevoReporteCalle } from './components/reportes/ModalNuevoReporteCalle';

function MainApp() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Modales compartidos
  const [showNewAnimalModal, setShowNewAnimalModal] = useState(false);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [editingAnimal, setEditingAnimal] = useState(null);

  // Si no está autenticado, mostrar pantalla de Login
  if (!currentUser) {
    return <LoginView />;
  }

  const handleEditAnimal = (animal) => {
    setSelectedAnimal(null);
    setEditingAnimal(animal);
    setShowNewAnimalModal(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 pb-16 lg:pb-0">
      {/* Modal obligatorio si must_change_password está activo */}
      <ForcePasswordChangeModal />

      {/* Barra superior de encabezado */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {/* Barra de navegación de escritorio */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Contenido principal de la vista actual */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && (
          <DashboardView
            setCurrentView={setCurrentView}
            onOpenNewAnimal={() => { setEditingAnimal(null); setShowNewAnimalModal(true); }}
            onOpenNewReport={() => setShowNewReportModal(true)}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
          />
        )}

        {currentView === 'animales' && (
          <AnimalesListView
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onOpenNewAnimal={() => { setEditingAnimal(null); setShowNewAnimalModal(true); }}
          />
        )}

        {currentView === 'adoptantes' && (
          <AdoptantesListView />
        )}

        {currentView === 'adopciones' && (
          <AdopcionesListView
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
          />
        )}

        {currentView === 'reportes' && (
          <ReportesCalleView
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
          />
        )}

        {currentView === 'alertas' && (
          <AlertasCenterView
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'usuarios' && (
          <UsuariosRolesView />
        )}

        {currentView === 'import_export' && (
          <ImportExportView />
        )}

        {currentView === 'estadisticas' && (
          <EstadisticasView />
        )}
      </main>

      {/* Navegación móvil inferior (Mobile-First) */}
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Modal Alta / Edición de Animal */}
      {showNewAnimalModal && (
        <ModalNuevoAnimal
          isOpen={showNewAnimalModal}
          onClose={() => { setShowNewAnimalModal(false); setEditingAnimal(null); }}
          initialData={editingAnimal}
        />
      )}

      {/* Modal Reporte de Calle */}
      {showNewReportModal && (
        <ModalNuevoReporteCalle
          isOpen={showNewReportModal}
          onClose={() => setShowNewReportModal(false)}
        />
      )}

      {/* Modal Ficha Completa del Animal */}
      {selectedAnimal && (
        <FichaAnimalModal
          isOpen={Boolean(selectedAnimal)}
          onClose={() => setSelectedAnimal(null)}
          animal={selectedAnimal}
          onEditAnimal={handleEditAnimal}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}
