import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { Dog, Cat, Sparkles, MapPin, Heart, Stethoscope, Camera } from 'lucide-react';

export function ModalNuevoAnimal({ isOpen, onClose, initialData = null }) {
  const { addAnimal, updateAnimal, generateAnimalCode } = useData();
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre_actual: '',
    nombre_anterior_apodo: '',
    especie: 'perro',
    sexo: 'hembra',
    edad_estimada: 'joven',
    tamano: 'mediano',
    pelaje_color_senas_particulares: '',
    estado_caso: 'rescatado',
    fecha_rescate: new Date().toISOString().split('T')[0],
    ubicacion_rescate: '',
    transito_nombre: '',
    transito_telefono: '',
    transito_direccion: '',
    relacion_con_perros: 'Sociable',
    relacion_con_gatos: 'A evaluar',
    relacion_con_personas: 'Cariñoso/a',
    nivel_energia: 'moderado',
    manejo_correa_paseos: 'Bueno',
    notas_conducta: '',
    alimentacion_recomendada: 'Alimento premium balanceado acorde a tamaño y peso.',
    foto_portada: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    ...(initialData || {})
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre_actual) return;

    const payload = {
      ...formData,
      transito_previo: {
        nombre: formData.transito_nombre,
        telefono: formData.transito_telefono,
        direccion: formData.transito_direccion
      }
    };

    if (initialData?.id) {
      updateAnimal(initialData.id, payload);
    } else {
      addAnimal(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? `Editar a ${formData.nombre_actual}` : "Ficha de Nuevo Animal Rescatado"}
      subtitle="Completá los datos básicos del caso para centralizar su seguimiento"
    >
      {/* Pasos / Tabs del formulario */}
      <div className="flex border-b border-stone-200 mb-5 overflow-x-auto scrollbar-hide text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 transition-colors ${
            activeStep === 1 ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          1. Identificación y Físico
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 transition-colors ${
            activeStep === 2 ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          2. Rescate y Tránsito
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 transition-colors ${
            activeStep === 3 ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          3. Conducta y Cuidados
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PASO 1: Identificación y Físico */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre actual *</label>
                <input
                  type="text"
                  required
                  name="nombre_actual"
                  value={formData.nombre_actual}
                  onChange={handleChange}
                  placeholder="Ej: Luna, Milo, Negrito"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Apodo o nombre anterior</label>
                <input
                  type="text"
                  name="nombre_anterior_apodo"
                  value={formData.nombre_anterior_apodo}
                  onChange={handleChange}
                  placeholder="Ej: Lunita, El barbas"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Especie</label>
                <select
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="perro">Perro 🐕</option>
                  <option value="gato">Gato 🐈</option>
                  <option value="otro">Otro 🐾</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="hembra">Hembra</option>
                  <option value="macho">Macho</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Edad estimada</label>
                <select
                  name="edad_estimada"
                  value={formData.edad_estimada}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="cachorro lactante">Lactante</option>
                  <option value="cachorro 2-6 meses">Cachorro 2-6m</option>
                  <option value="joven">Joven</option>
                  <option value="adulto">Adulto</option>
                  <option value="senior">Senior (Viejito)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tamaño</label>
                <select
                  name="tamano"
                  value={formData.tamano}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="mini">Mini</option>
                  <option value="chico">Chico</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                  <option value="gigante">Gigante</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pelaje, color y señas particulares
              </label>
              <textarea
                name="pelaje_color_senas_particulares"
                rows="2"
                value={formData.pelaje_color_senas_particulares}
                onChange={handleChange}
                placeholder="Ej: Negro azabache con manchita blanca en el pecho, oreja izquierda caída..."
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Foto de portada (URL o enlace de imagen)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="foto_portada"
                  value={formData.foto_portada}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 rounded-xl bg-patita-600 text-white font-bold text-xs"
              >
                Siguiente: Rescate y Tránsito →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Rescate y Tránsito */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Estado del caso</label>
                <select
                  name="estado_caso"
                  value={formData.estado_caso}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="rescatado">Recién Rescatado/a</option>
                  <option value="en tránsito">En Hogar de Tránsito</option>
                  <option value="en adopción">En Adopción Activa</option>
                  <option value="adoptado">Adoptado/a</option>
                  <option value="fallecido">Fallecido/a</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Fecha de rescate</label>
                <input
                  type="date"
                  name="fecha_rescate"
                  value={formData.fecha_rescate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ubicación del rescate (barrio, localidad o calle)
              </label>
              <input
                type="text"
                name="ubicacion_rescate"
                value={formData.ubicacion_rescate}
                onChange={handleChange}
                placeholder="Ej: Parque Patricios, CABA / Estación Lanús"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Hogar de tránsito actual / previo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="transito_nombre"
                  value={formData.transito_nombre}
                  onChange={handleChange}
                  placeholder="Nombre de la persona"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  name="transito_telefono"
                  value={formData.transito_telefono}
                  onChange={handleChange}
                  placeholder="Teléfono / WhatsApp"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
                <input
                  type="text"
                  name="transito_direccion"
                  value={formData.transito_direccion}
                  onChange={handleChange}
                  placeholder="Dirección o barrio"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 rounded-xl bg-patita-600 text-white font-bold text-xs"
              >
                Siguiente: Conducta →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Conducta y Convivencia */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Relación con otros perros</label>
                <input
                  type="text"
                  name="relacion_con_perros"
                  value={formData.relacion_con_perros}
                  onChange={handleChange}
                  placeholder="Ej: Muy sociable, juguetón, prefiere hembras..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Relación con gatos</label>
                <input
                  type="text"
                  name="relacion_con_gatos"
                  value={formData.relacion_con_gatos}
                  onChange={handleChange}
                  placeholder="Ej: Indiferente, convive bien, los persigue..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nivel de energía</label>
                <select
                  name="nivel_energia"
                  value={formData.nivel_energia}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
                >
                  <option value="tranquilo">Tranquilo (sillón y mimos)</option>
                  <option value="moderado">Moderado (paseos diarios normales)</option>
                  <option value="muy activo">Muy activo (necesita correr y descargar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Manejo de correa y paseos</label>
                <input
                  type="text"
                  name="manejo_correa_paseos"
                  value={formData.manejo_correa_paseos}
                  onChange={handleChange}
                  placeholder="Ej: Camina relajado, tira un poco, usa pretal..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Notas de conducta y miedos</label>
              <textarea
                name="notas_conducta"
                rows="2"
                value={formData.notas_conducta}
                onChange={handleChange}
                placeholder="Ej: Miedo a los truenos o motos, ansiedad por separación, cariñoso con niños..."
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Alimentación recomendada</label>
              <input
                type="text"
                name="alimentacion_recomendada"
                value={formData.alimentacion_recomendada}
                onChange={handleChange}
                placeholder="Marca sugerida, ración diaria o dieta especial..."
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
              >
                ← Anterior
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-sm shadow-md shadow-patita-600/30"
              >
                {initialData?.id ? 'Guardar Cambios' : 'Crear Ficha de Animal'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
