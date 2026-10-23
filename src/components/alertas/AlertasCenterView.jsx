import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';
import { formatDate, isOverdue, isDueSoon } from '../../lib/formatters';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Syringe, 
  HeartHandshake, 
  CheckCircle2, 
  MapPin, 
  Phone 
} from 'lucide-react';

export function AlertasCenterView({ onSelectAnimal, setCurrentView }) {
  const { seguimientos, adopciones, animales, adoptantes, eventosSalud, reportesCalle, updateSeguimiento } = useData();

  const [activeTab, setActiveTab] = useState('todos');

  // Alertas de seguimientos posadopción
  const followUpAlerts = seguimientos
    .filter(s => !s.completado && (isOverdue(s.fecha_contacto) || isDueSoon(s.fecha_contacto, 7) || s.estado_general === 'alerta'))
    .map(s => {
      const adop = adopciones.find(a => a.id === s.adopcion_id);
      const pet = animales.find(an => an.id === adop?.animal_id);
      const adopter = adoptantes.find(ad => ad.id === adop?.adoptante_id);
      return {
        ...s,
        tipo: 'seguimiento',
        animal: pet,
        adoptante: adopter,
        vencido: isOverdue(s.fecha_contacto),
        enAlerta: s.estado_general === 'alerta'
      };
    });

  // Alertas de vacunas y eventos de salud
  const healthAlerts = eventosSalud
    .filter(e => e.fecha_proximo_refuerzo_o_vencimiento && (isOverdue(e.fecha_proximo_refuerzo_o_vencimiento) || isDueSoon(e.fecha_proximo_refuerzo_o_vencimiento, 15)))
    .map(e => {
      const pet = animales.find(an => an.id === e.animal_id);
      return {
        ...e,
        tipo: 'salud',
        animal: pet,
        vencido: isOverdue(e.fecha_proximo_refuerzo_o_vencimiento)
      };
    });

  // Alertas de compromisos de castración
  const castrationAlerts = adopciones
    .filter(a => a.compromiso_castracion && a.fecha_limite_castracion && (isOverdue(a.fecha_limite_castracion) || isDueSoon(a.fecha_limite_castracion, 20)))
    .map(a => {
      const pet = animales.find(an => an.id === a.animal_id);
      const adopter = adoptantes.find(ad => ad.id === a.adoptante_id);
      return {
        ...a,
        tipo: 'castracion',
        animal: pet,
        adoptante: adopter,
        vencido: isOverdue(a.fecha_limite_castracion)
      };
    });

  // Reportes comunitarios sin tomar
  const reportAlerts = reportesCalle
    .filter(r => r.estado_reporte === 'nuevo')
    .map(r => ({
      ...r,
      tipo: 'calle'
    }));

  const handleMarkFollowupDone = (segId) => {
    updateSeguimiento(segId, { completado: true });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-patita-600" />
          <span>Centro Unificado de Alertas</span>
        </h1>
        <p className="text-xs text-stone-500">
          Controles vencidos, refuerzos veterinarios pendientes y compromisos de castración
        </p>
      </div>

      {/* Selector de pestañas */}
      <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-hide text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('todos')}
          className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'todos' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Todas las Alertas ({followUpAlerts.length + healthAlerts.length + castrationAlerts.length + reportAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('seguimientos')}
          className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'seguimientos' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Controles Posadopción ({followUpAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('salud')}
          className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'salud' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Vacunas y Refuerzos ({healthAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('castraciones')}
          className={`pb-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'castraciones' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Castraciones ({castrationAlerts.length})
        </button>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {/* Seguimientos */}
        {(activeTab === 'todos' || activeTab === 'seguimientos') && followUpAlerts.map(seg => (
          <div 
            key={seg.id}
            className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              seg.enAlerta ? 'bg-rose-50/80 border-rose-300' : seg.vencido ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold ${
                seg.enAlerta ? 'bg-rose-600' : seg.vencido ? 'bg-amber-500' : 'bg-patita-500'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    Control de Adopción: {seg.animal?.nombre_actual || 'Animal'}
                  </span>
                  <Badge variant={seg.enAlerta ? 'danger' : seg.vencido ? 'warning' : 'info'}>
                    {seg.enAlerta ? 'SEMÁFORO ROJO' : seg.vencido ? 'VENCIDO' : 'PRÓXIMO'}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 mt-1">{seg.observaciones}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                  <span>Familia: <strong>{seg.adoptante?.nombre_apellido}</strong></span>
                  <span>Fecha prevista: <strong>{formatDate(seg.fecha_contacto)}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleMarkFollowupDone(seg.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar Realizado</span>
              </button>
              {seg.animal && (
                <button
                  onClick={() => onSelectAnimal && onSelectAnimal(seg.animal)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                >
                  Ver Ficha
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Vacunas */}
        {(activeTab === 'todos' || activeTab === 'salud') && healthAlerts.map(salud => (
          <div
            key={salud.id}
            className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              salud.vencido ? 'bg-rose-50/70 border-rose-300' : 'bg-sky-50/70 border-sky-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    {salud.tipo_evento}: {salud.animal?.nombre_actual || 'Animal'}
                  </span>
                  <Badge variant={salud.vencido ? 'danger' : 'info'}>
                    {salud.vencido ? 'VENCIDO' : 'PRÓXIMO REFUERZO'}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Producto: {salud.producto_o_detalle} {salud.profesional_veterinaria ? `• Vet: ${salud.profesional_veterinaria}` : ''}
                </p>
                <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                  Fecha límite / Refuerzo: <strong>{formatDate(salud.fecha_proximo_refuerzo_o_vencimiento)}</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {salud.animal && (
                <button
                  onClick={() => onSelectAnimal && onSelectAnimal(salud.animal)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Abrir Libreta Médica
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Castraciones */}
        {(activeTab === 'todos' || activeTab === 'castraciones') && castrationAlerts.map(adop => (
          <div
            key={adop.id}
            className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              adop.vencido ? 'bg-rose-50/70 border-rose-300' : 'bg-purple-50/70 border-purple-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-lg">
                ✂️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">
                    Compromiso de Castración: {adop.animal?.nombre_actual}
                  </span>
                  <Badge variant={adop.vencido ? 'danger' : 'warning'}>
                    {adop.vencido ? 'PLAZO VENCIDO' : 'POR VENCER'}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Adoptante responsable: <strong>{adop.adoptante?.nombre_apellido}</strong> (Tel: {adop.adoptante?.telefono_whatsapp})
                </p>
                <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                  Fecha límite firmada: <strong>{formatDate(adop.fecha_limite_castracion)}</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <button
                onClick={() => setCurrentView('adopciones')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Gestionar Caso
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
