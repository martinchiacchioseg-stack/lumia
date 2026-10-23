import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { useAuth } from '../../context/AuthContext';
import { ModalNuevoReporteCalle } from './ModalNuevoReporteCalle';
import { Badge } from '../common/Badge';
import { formatDate } from '../../lib/formatters';
import { 
  MapPin, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Dog, 
  Layers, 
  Navigation, 
  Clock, 
  UserPlus, 
  ArrowRight 
} from 'lucide-react';
import L from 'leaflet';

export function ReportesCalleView({ onSelectAnimal }) {
  const { reportesCalle, updateReporteCalle, convertReportToAnimal } = useData();
  const { hasPermission } = usePermissions();
  const { currentUser } = useAuth();

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Filtrar activos
  const activeReports = reportesCalle.filter(r => !r.archivado);

  // Inicialización del Mapa con Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centrado por defecto en Buenos Aires
      const map = L.map(mapContainerRef.current, {
        center: [-34.6037, -58.3816],
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Añadir pines para los reportes
    activeReports.forEach(rep => {
      if (rep.latitud && rep.longitud) {
        const color = rep.nivel_urgencia === 'crítico' ? '#e11d48' :
                      rep.nivel_urgencia === 'alto' ? '#ea580c' :
                      rep.nivel_urgencia === 'medio' ? '#d97706' : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">🐾</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([rep.latitud, rep.longitud], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 200px;">
            <strong style="color: ${color}; text-transform: uppercase;">Urgencia ${rep.nivel_urgencia}</strong>
            <p style="margin: 4px 0; font-weight: 500;">${rep.descripcion.slice(0, 70)}...</p>
            <span style="font-size: 10px; color: #666;">${rep.direccion_aproximada || ''}</span>
          </div>
        `);

        marker.on('click', () => {
          setSelectedReport(rep);
        });

        markersRef.current.push(marker);
      }
    });

    // Invalidar tamaño para asegurar correcto renderizado en cambios de layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [activeReports]);

  // Tomar caso
  const handleTakeCase = (reporteId) => {
    updateReporteCalle(reporteId, {
      estado_reporte: 'tomado',
      rescatista_asignada: currentUser?.id
    });
  };

  // Convertir reporte en ficha de animal
  const handleConvertToRescue = (reporteId) => {
    const newAnimal = convertReportToAnimal(reporteId);
    if (newAnimal && onSelectAnimal) {
      onSelectAnimal(newAnimal);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-patita-600" />
            <span>Reportes de Calle y Mapa Comunitario</span>
          </h1>
          <p className="text-xs text-stone-500">Relevamiento de animales en la vía pública, alertas en tiempo real y rescates</p>
        </div>

        {hasPermission('reportes_calle', 'crear') && (
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-patita-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Reportar Animal en Calle</span>
          </button>
        )}
      </div>

      {/* Contenedor del Mapa Interactivo (OpenStreetMap + Leaflet) */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Layers className="w-4 h-4 text-patita-600" />
            <span>Mapa de Casos Activos en Buenos Aires y alrededores</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Crítico</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Alto</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medio</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bajo</span>
          </div>
        </div>

        <div 
          ref={mapContainerRef} 
          className="w-full h-80 sm:h-96 z-10"
        />
      </div>

      {/* Listado de Tarjetas de Reportes */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
          Alertas Activas ({activeReports.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeReports.map(rep => {
            const isResolved = rep.estado_reporte === 'resuelto';
            const isTaken = rep.estado_reporte === 'tomado';

            return (
              <div
                key={rep.id}
                className={`bg-white rounded-3xl border shadow-sm p-5 space-y-3 flex flex-col justify-between transition-all ${
                  selectedReport?.id === rep.id ? 'ring-2 ring-patita-500 border-patita-400' : 'border-stone-200/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={
                      rep.nivel_urgencia === 'crítico' ? 'danger' :
                      rep.nivel_urgencia === 'alto' ? 'warning' : 'info'
                    }>
                      Urgencia {rep.nivel_urgencia}
                    </Badge>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {formatDate(rep.created_at)}
                    </span>
                  </div>

                  {rep.fotos && rep.fotos.length > 0 && (
                    <div className="h-40 rounded-2xl overflow-hidden mb-3 bg-stone-100 border border-stone-200">
                      <img src={rep.fotos[0]} alt="Foto reporte" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs text-stone-800 font-semibold leading-relaxed">
                    {rep.descripcion}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-patita-600 shrink-0" />
                    <span>{rep.direccion_aproximada || 'Coordenadas registradas'}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isResolved ? 'bg-emerald-100 text-emerald-800' :
                      isTaken ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isResolved ? '✓ Resuelto / Rescatado' : isTaken ? '🟡 En Rescate' : '🔴 Sin Tomar'}
                    </span>
                  </div>
                </div>

                {/* Acciones de gestión de reporte */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                  {!isResolved && !isTaken && (
                    <button
                      onClick={() => handleTakeCase(rep.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tomar Caso</span>
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => handleConvertToRescue(rep.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm shadow-patita-600/20"
                    >
                      <Dog className="w-3.5 h-3.5" />
                      <span>Convertir a Ficha de Rescate</span>
                    </button>
                  )}

                  {isResolved && rep.animal_id && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Animal ya incorporado al sistema
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNewModal && (
        <ModalNuevoReporteCalle
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}
