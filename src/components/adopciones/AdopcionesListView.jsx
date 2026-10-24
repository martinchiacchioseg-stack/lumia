import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { ModalNuevaAdopcion } from './ModalNuevaAdopcion';
import { ModalWhatsApp } from '../adoptantes/ModalWhatsApp';
import { SmartCameraInput } from '../common/SmartCameraInput';
import { Badge } from '../common/Badge';
import { formatDate } from '../../lib/formatters';
import { HeartHandshake, Plus, Calendar, Phone, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const ADOPCION_SCHEMA = [
  { name: 'fecha_entrega', label: 'Fecha de entrega', type: 'date', context: 'Formato YYYY-MM-DD' },
  { name: 'modalidad_entrega', label: 'Modalidad de entrega', type: 'select', options: ['llevado al domicilio', 'retirado por el adoptante'] },
  { name: 'periodo_adaptacion_dias', label: 'Días de período de adaptación', type: 'number', context: 'Cantidad de días de adaptación' },
  { name: 'compromiso_castracion', label: 'Compromiso de castración firmado', type: 'boolean' },
  { name: 'fecha_limite_castracion', label: 'Fecha límite de castración', type: 'date', context: 'Formato YYYY-MM-DD' },
  { name: 'observaciones', label: 'Observaciones y acuerdos', type: 'string' }
];

export function AdopcionesListView({ onSelectAnimal }) {
  const { adopciones, animales, adoptantes, seguimientos } = useData();
  const { hasPermission } = usePermissions();

  const [showNewModal, setShowNewModal] = useState(false);
  const [whatsAppModal, setWhatsAppModal] = useState({
    isOpen: false,
    adoptante: null,
    animal: null
  });

  const handleOpenWhatsApp = (adopcion) => {
    const animal = animales.find(a => a.id === adopcion.animal_id);
    const adoptante = adoptantes.find(ad => ad.id === adopcion.adoptante_id);
    if (!adoptante) return;
    setWhatsAppModal({
      isOpen: true,
      adoptante,
      animal
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-rose-500" />
            <span>Adopciones y Seguimientos</span>
          </h1>
          <p className="text-xs text-stone-500">Historial de adopciones, controles programados y compromisos asumidos</p>
        </div>

        {hasPermission('adopciones', 'crear') && (
          <div className="flex flex-wrap items-center gap-2">
            <SmartCameraInput
              schema={ADOPCION_SCHEMA}
              formTitle="Nueva Adopción"
              buttonText="Escanear Acta con IA"
              onScanComplete={() => {
                setShowNewModal(true);
              }}
            />
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-patita-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Concretar Nueva Adopción</span>
            </button>
          </div>
        )}
      </div>

      {/* Listado */}
      {adopciones.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <HeartHandshake className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700">No hay adopciones registradas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adopciones.map(adop => {
            const animal = animales.find(a => a.id === adop.animal_id);
            const adoptante = adoptantes.find(ad => ad.id === adop.adoptante_id);
            const allSegs = seguimientos.filter(s => s.adopcion_id === adop.id);
            const completedCount = allSegs.filter(s => s.completado).length;
            const nextPending = allSegs.find(s => !s.completado);

            return (
              <div
                key={adop.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => animal && onSelectAnimal && onSelectAnimal(animal)}
                        className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer shrink-0 hover:opacity-90"
                      >
                        <img
                          src={animal?.foto_portada || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                          alt={animal?.nombre_actual || 'Animal'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 
                          onClick={() => animal && onSelectAnimal && onSelectAnimal(animal)}
                          className="font-extrabold text-stone-900 text-base hover:text-patita-600 cursor-pointer transition-colors"
                        >
                          {animal?.nombre_actual || 'Animal'}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium">
                          Familia: <span className="font-bold text-stone-800">{adoptante?.nombre_apellido || 'Adoptante'}</span>
                        </p>
                        <span className="text-[11px] text-stone-400">Entrega: {formatDate(adop.fecha_entrega)}</span>
                      </div>
                    </div>

                    <Badge variant={adop.estado_adopcion === 'adopción consolidada' ? 'success' : 'primary'}>
                      {adop.estado_adopcion}
                    </Badge>
                  </div>

                  {/* Progreso del calendario de controles */}
                  <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-stone-600">Controles posadopción</span>
                      <span className="text-patita-600 font-bold">{completedCount} de {allSegs.length} realizados</span>
                    </div>

                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-patita-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${allSegs.length > 0 ? (completedCount / allSegs.length) * 100 : 0}%` }}
                      />
                    </div>

                    {nextPending && (
                      <p className="text-[11px] text-stone-500">
                        Próximo control previsto: <strong>{formatDate(nextPending.fecha_contacto)}</strong> ({nextPending.observaciones?.slice(0, 45)}...)
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => animal && onSelectAnimal && onSelectAnimal(animal)}
                    className="text-xs font-bold text-patita-600 hover:text-patita-700"
                  >
                    Ver ficha y seguimientos →
                  </button>

                  {adoptante?.telefono_whatsapp && (
                    <button
                      onClick={() => handleOpenWhatsApp(adop)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Adopción */}
      {showNewModal && (
        <ModalNuevaAdopcion
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* Modal WhatsApp */}
      {whatsAppModal.isOpen && (
        <ModalWhatsApp
          isOpen={whatsAppModal.isOpen}
          onClose={() => setWhatsAppModal({ isOpen: false, adoptante: null, animal: null })}
          adoptante={whatsAppModal.adoptante}
          animal={whatsAppModal.animal}
        />
      )}
    </div>
  );
}
