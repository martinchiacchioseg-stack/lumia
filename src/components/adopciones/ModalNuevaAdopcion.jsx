import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import confetti from 'canvas-confetti';
import { HeartHandshake, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export function ModalNuevaAdopcion({ isOpen, onClose }) {
  const { animales, adoptantes, addAdopcion } = useData();

  // Filtrar animales disponibles (no adoptados ni fallecidos)
  const availableAnimals = animales.filter(a => !a.archivado && a.estado_caso !== 'adoptado' && a.estado_caso !== 'fallecido');
  // Adoptantes activos
  const activeAdopters = adoptantes.filter(ad => !ad.archivado);

  const [formData, setFormData] = useState({
    animal_id: availableAnimals[0]?.id || '',
    adoptante_id: activeAdopters[0]?.id || '',
    fecha_entrega: new Date().toISOString().split('T')[0],
    modalidad_entrega: 'llevado al domicilio',
    periodo_adaptacion_dias: 21,
    compromiso_castracion: true,
    fecha_limite_castracion: '',
    observaciones: 'Adopción responsable concretada tras entrevista.'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.animal_id || !formData.adoptante_id) return;

    addAdopcion(formData);

    // Efecto de festejo con confeti para la adopción concretada
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignorar si no corre en el navegador
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concretar Nueva Adopción Responsable"
      subtitle="Generará automáticamente el calendario de 6 controles posadopción (48hs a 1 año)"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de Animal */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Animal que se entrega en adopción *
          </label>
          <select
            name="animal_id"
            required
            value={formData.animal_id}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
          >
            {availableAnimals.length === 0 ? (
              <option value="">No hay animales marcados como disponibles</option>
            ) : (
              availableAnimals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre_actual} ({a.codigo_interno}) - {a.especie} {a.edad_estimada}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Selección de Adoptante */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Familia o persona adoptante *
          </label>
          <select
            name="adoptante_id"
            required
            value={formData.adoptante_id}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
          >
            {activeAdopters.map(ad => (
              <option key={ad.id} value={ad.id}>
                {ad.nombre_apellido} (WhatsApp: {ad.telefono_whatsapp})
              </option>
            ))}
          </select>
        </div>

        {/* Entrega y modalidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Fecha de Entrega</label>
            <input
              type="date"
              required
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Modalidad de Entrega</label>
            <select
              name="modalidad_entrega"
              value={formData.modalidad_entrega}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
            >
              <option value="llevado al domicilio">Llevado al domicilio (Recomendado)</option>
              <option value="retirado por el adoptante">Retirado por el adoptante</option>
            </select>
          </div>
        </div>

        {/* Compromiso de Castración */}
        <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="compromiso_castracion"
              name="compromiso_castracion"
              checked={formData.compromiso_castracion}
              onChange={handleChange}
              className="w-4 h-4 text-patita-600 rounded border-stone-300 focus:ring-patita-500"
            />
            <label htmlFor="compromiso_castracion" className="text-xs font-bold text-stone-800 cursor-pointer">
              Firma de compromiso de castración pendiente
            </label>
          </div>

          {formData.compromiso_castracion && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Fecha límite acordada para la castración
              </label>
              <input
                type="date"
                name="fecha_limite_castracion"
                value={formData.fecha_limite_castracion}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Observaciones</label>
          <textarea
            name="observaciones"
            rows="2"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Detalles del acuerdo, pautas de convivencia acordadas..."
            className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
          />
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Al confirmar, el sistema programará automáticamente los recordatorios de contacto para: <strong>48-72 hs, 15 días, 1 mes, 3 meses, 6 meses y 1 año</strong>.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-sm shadow-md shadow-patita-600/30 flex items-center gap-1.5"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Confirmar Adopción</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
