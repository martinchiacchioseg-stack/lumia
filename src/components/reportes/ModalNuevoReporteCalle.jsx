import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { SmartCameraInput } from '../common/SmartCameraInput';
import { AIFieldBadge, getAIFieldClass } from '../common/AIFieldBadge';
import { Camera, MapPin, AlertTriangle, Navigation, Upload, Sparkles } from 'lucide-react';

const REPORTE_SCHEMA = [
  { name: 'descripcion', label: 'Descripción de lo observado y estado del animal', type: 'string', context: 'Especie, tamaño, color, heridas, comportamiento y estado' },
  { name: 'nivel_urgencia', label: 'Nivel de urgencia', type: 'select', options: ['bajo', 'medio', 'alto', 'crítico'], context: 'Gravedad del animal' },
  { name: 'direccion_aproximada', label: 'Dirección o punto de referencia', type: 'string', context: 'Calle, esquina, comercio o punto geográfico' }
];

export function ModalNuevoReporteCalle({ isOpen, onClose }) {
  const { addReporteCalle } = useData();
  const [aiFilledFields, setAiFilledFields] = useState([]);

  const [formData, setFormData] = useState({
    descripcion: '',
    nivel_urgencia: 'medio',
    direccion_aproximada: '',
    latitud: -34.6037, // CABA default
    longitud: -58.3816,
    fotos: ['https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=800&q=80']
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const handleAIScanComplete = (extractedData, filledKeys) => {
    setFormData(prev => ({ ...prev, ...extractedData }));
    setAiFilledFields(filledKeys || []);
  };

  // Capturar geolocalización del celular
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          direccion_aproximada: prev.direccion_aproximada || `Ubicación GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        }));
        setGeoLoading(false);
      },
      (error) => {
        console.error('Error GPS:', error);
        setGeoLoading(false);
        alert('No se pudo obtener la ubicación GPS automática. Por favor escribí la dirección o punto de referencia.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput) return;
    setFormData(prev => ({ ...prev, fotos: [...prev.fotos, photoUrlInput] }));
    setPhotoUrlInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.descripcion) return;

    addReporteCalle(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar Animal en la Vía Pública"
      subtitle="Alerta comunitaria para relevar animales heridos, perdidos o en riesgo"
      maxWidth="max-w-lg"
    >
      {/* Barra de Autocompletado con Visión por IA */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50/70 via-lumia-50/70 to-emerald-50/70 border border-lumia-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-lumia-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-stone-900">Autocompletar con Visión por IA</span>
            <span className="block text-[11px] text-stone-500">Fotografiá al animal en la calle o subí una captura del aviso</span>
          </div>
        </div>

        <SmartCameraInput
          schema={REPORTE_SCHEMA}
          formTitle="Reporte de Calle"
          onScanComplete={handleAIScanComplete}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nivel de Urgencia */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
            Nivel de Urgencia *
            <AIFieldBadge isAIFilled={aiFilledFields.includes('nivel_urgencia')} />
          </label>
          <div className="grid grid-cols-4 gap-2 text-xs font-bold text-center">
            {[
              { id: 'bajo', label: 'Bajo', color: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
              { id: 'medio', label: 'Medio', color: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
              { id: 'alto', label: 'Alto', color: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
              { id: 'crítico', label: 'Crítico', color: 'border-rose-400 text-rose-700 hover:bg-rose-50' }
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setFormData({ ...formData, nivel_urgencia: lvl.id })}
                className={`p-2 rounded-2xl border-2 transition-all ${
                  formData.nivel_urgencia === lvl.id
                    ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                    : lvl.color
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            ¿Qué viste y en qué estado está el animal? *
            <AIFieldBadge isAIFilled={aiFilledFields.includes('descripcion')} />
          </label>
          <textarea
            required
            rows="3"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Ej: Perrito mestizo atropellado, renguea mucho y está asustado debajo de un banco..."
            className={getAIFieldClass(
              aiFilledFields.includes('descripcion'),
              "w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
            )}
          />
        </div>

        {/* Ubicación y Botón GPS */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              Dirección o punto de referencia
              <AIFieldBadge isAIFilled={aiFilledFields.includes('direccion_aproximada')} />
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={geoLoading}
              className="text-xs text-patita-600 hover:text-patita-700 font-bold flex items-center gap-1 disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{geoLoading ? 'Obteniendo GPS...' : 'Usar mi ubicación GPS actual'}</span>
            </button>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={formData.direccion_aproximada}
              onChange={(e) => setFormData({ ...formData, direccion_aproximada: e.target.value })}
              placeholder="Ej: Av. Rivadavia 4300, Almagro, CABA"
              className={getAIFieldClass(
                aiFilledFields.includes('direccion_aproximada'),
                "w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              )}
            />
          </div>
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Fotos del reporte (URL o imagen)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-xs"
            />
            <button
              type="button"
              onClick={handleAddPhotoUrl}
              className="px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0"
            >
              Agregar
            </button>
          </div>

          {/* Miniaturas de fotos */}
          <div className="flex gap-2 mt-2 overflow-x-auto py-1">
            {formData.fotos.map((url, idx) => (
              <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                <img src={url} alt="Foto reporte" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
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
            <AlertTriangle className="w-4 h-4" />
            <span>Publicar Reporte</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
