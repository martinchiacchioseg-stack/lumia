import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { SmartCameraInput } from '../common/SmartCameraInput';
import { AIFieldBadge, getAIFieldClass } from '../common/AIFieldBadge';
import { ShieldCheck, User, MapPin, Phone, Home, Lock, Sparkles } from 'lucide-react';

const ADOPTANTE_SCHEMA = [
  { name: 'nombre_apellido', label: 'Nombre y Apellido completo', type: 'string', context: 'Titular de la adopción según DNI o formulario' },
  { name: 'dni_cuit', label: 'Número de DNI o CUIT', type: 'string', context: '8 u 11 dígitos, sin puntos' },
  { name: 'telefono_whatsapp', label: 'Teléfono celular / WhatsApp', type: 'string' },
  { name: 'telefono_secundario', label: 'Teléfono secundario o de línea', type: 'string' },
  { name: 'direccion_calle', label: 'Calle', type: 'string' },
  { name: 'direccion_numero', label: 'Altura / Número de calle', type: 'string' },
  { name: 'direccion_piso_depto', label: 'Piso y Departamento', type: 'string' },
  { name: 'direccion_barrio', label: 'Barrio', type: 'string' },
  { name: 'direccion_localidad', label: 'Localidad o Ciudad', type: 'string' },
  { name: 'direccion_provincia', label: 'Provincia', type: 'string' },
  { name: 'tipo_vivienda', label: 'Tipo de vivienda', type: 'select', options: ['departamento', 'casa con patio cerrado', 'casa con patio abierto', 'ph', 'quinta/campo'] },
  { name: 'condicion_vivienda', label: 'Condición de vivienda', type: 'select', options: ['propietario', 'inquilino'] },
  { name: 'redes_instagram', label: 'Usuario de Instagram', type: 'string' },
  { name: 'redes_facebook', label: 'Usuario o perfil de Facebook', type: 'string' }
];

export function ModalNuevoAdoptante({ isOpen, onClose, initialData = null }) {
  const { addAdoptante, updateAdoptante } = useData();
  const [aiFilledFields, setAiFilledFields] = useState([]);

  const [formData, setFormData] = useState({
    nombre_apellido: '',
    dni_cuit: '',
    telefono_whatsapp: '',
    telefono_secundario: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_entrecalles: '',
    direccion_piso_depto: '',
    direccion_barrio: '',
    direccion_localidad: 'CABA',
    direccion_provincia: 'Buenos Aires',
    tipo_vivienda: 'departamento',
    condicion_vivienda: 'propietario',
    redes_instagram: '',
    redes_facebook: '',
    foto_dni_frente: '',
    foto_dni_dorso: '',
    consentimiento_datos: true,
    ...(initialData || {})
  });

  // Sincronizar datos al abrir para editar
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre_apellido: initialData.nombre_apellido || '',
          dni_cuit: initialData.dni_cuit || '',
          telefono_whatsapp: initialData.telefono_whatsapp || '',
          telefono_secundario: initialData.telefono_secundario || '',
          direccion_calle: initialData.direccion_calle || '',
          direccion_numero: initialData.direccion_numero || '',
          direccion_entrecalles: initialData.direccion_entrecalles || '',
          direccion_piso_depto: initialData.direccion_piso_depto || '',
          direccion_barrio: initialData.direccion_barrio || '',
          direccion_localidad: initialData.direccion_localidad || 'CABA',
          direccion_provincia: initialData.direccion_provincia || 'Buenos Aires',
          tipo_vivienda: initialData.tipo_vivienda || 'departamento',
          condicion_vivienda: initialData.condicion_vivienda || 'propietario',
          redes_instagram: initialData.redes_sociales?.instagram || initialData.redes_instagram || '',
          redes_facebook: initialData.redes_sociales?.facebook || initialData.redes_facebook || '',
          foto_dni_frente: initialData.foto_dni_frente || '',
          foto_dni_dorso: initialData.foto_dni_dorso || '',
          consentimiento_datos: initialData.consentimiento_datos !== false,
          ...initialData
        });
      } else {
        setFormData({
          nombre_apellido: '',
          dni_cuit: '',
          telefono_whatsapp: '',
          telefono_secundario: '',
          direccion_calle: '',
          direccion_numero: '',
          direccion_entrecalles: '',
          direccion_piso_depto: '',
          direccion_barrio: '',
          direccion_localidad: 'CABA',
          direccion_provincia: 'Buenos Aires',
          tipo_vivienda: 'departamento',
          condicion_vivienda: 'propietario',
          redes_instagram: '',
          redes_facebook: '',
          foto_dni_frente: '',
          foto_dni_dorso: '',
          consentimiento_datos: true
        });
      }
      setAiFilledFields([]);
    }
  }, [isOpen, initialData]);

  const handleAIScanComplete = (extractedData, filledKeys) => {
    setFormData(prev => ({ ...prev, ...extractedData }));
    setAiFilledFields(filledKeys || []);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre_apellido || !formData.telefono_whatsapp) return;

    const payload = {
      ...formData,
      redes_sociales: {
        instagram: formData.redes_instagram,
        facebook: formData.redes_facebook
      }
    };

    if (initialData?.id) {
      updateAdoptante(initialData.id, payload);
    } else {
      addAdoptante(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? "Editar Adoptante" : "Ficha de Nueva Familia Adoptante"}
      subtitle="Datos de contacto y habitacionales para seguimiento responsable"
      maxWidth="max-w-2xl"
    >
      {/* Barra de Autocompletado con Visión por IA */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50/70 via-lumia-50/70 to-emerald-50/70 border border-lumia-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-lumia-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-stone-900">Autocompletar con Visión por IA</span>
            <span className="block text-[11px] text-stone-500">Fotografiá el DNI, solicitud de adopción o servicio</span>
          </div>
        </div>

        <SmartCameraInput
          schema={ADOPTANTE_SCHEMA}
          formTitle="Ficha del Adoptante"
          onScanComplete={handleAIScanComplete}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviso de Confidencialidad Ley 25.326 */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Protección de Datos (Ley 25.326):</strong> Los datos filiatorios, DNI y domicilio se resguardan de forma privada con permisos de acceso restringido para fines exclusivos del bienestar animal.
          </span>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nombre y Apellido *
              <AIFieldBadge isAIFilled={aiFilledFields.includes('nombre_apellido')} />
            </label>
            <input
              type="text"
              required
              name="nombre_apellido"
              value={formData.nombre_apellido}
              onChange={handleChange}
              placeholder="Ej: Carla Rossi"
              className={getAIFieldClass(
                aiFilledFields.includes('nombre_apellido'),
                "w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              DNI o CUIT *
              <AIFieldBadge isAIFilled={aiFilledFields.includes('dni_cuit')} />
            </label>
            <input
              type="text"
              required
              name="dni_cuit"
              value={formData.dni_cuit}
              onChange={handleChange}
              placeholder="Ej: 35.442.119"
              className={getAIFieldClass(
                aiFilledFields.includes('dni_cuit'),
                "w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              )}
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              WhatsApp Principal *
              <AIFieldBadge isAIFilled={aiFilledFields.includes('telefono_whatsapp')} />
            </label>
            <input
              type="text"
              required
              name="telefono_whatsapp"
              value={formData.telefono_whatsapp}
              onChange={handleChange}
              placeholder="Ej: +54 9 11 5544-3322"
              className={getAIFieldClass(
                aiFilledFields.includes('telefono_whatsapp'),
                "w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Teléfono Alternativo
              <AIFieldBadge isAIFilled={aiFilledFields.includes('telefono_secundario')} />
            </label>
            <input
              type="text"
              name="telefono_secundario"
              value={formData.telefono_secundario}
              onChange={handleChange}
              placeholder="Fijo o de familiar"
              className={getAIFieldClass(
                aiFilledFields.includes('telefono_secundario'),
                "w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500"
              )}
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-patita-600" /> Domicilio de Convivencia
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                name="direccion_calle"
                value={formData.direccion_calle}
                onChange={handleChange}
                placeholder="Calle"
                className={getAIFieldClass(
                  aiFilledFields.includes('direccion_calle'),
                  "w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                )}
              />
            </div>
            <div>
              <input
                type="text"
                name="direccion_numero"
                value={formData.direccion_numero}
                onChange={handleChange}
                placeholder="Número"
                className={getAIFieldClass(
                  aiFilledFields.includes('direccion_numero'),
                  "w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="direccion_entrecalles"
              value={formData.direccion_entrecalles}
              onChange={handleChange}
              placeholder="Entre calles"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
            <input
              type="text"
              name="direccion_piso_depto"
              value={formData.direccion_piso_depto}
              onChange={handleChange}
              placeholder="Piso / Depto"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="direccion_barrio"
              value={formData.direccion_barrio}
              onChange={handleChange}
              placeholder="Barrio (ej: Boedo, Flores)"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
            <input
              type="text"
              name="direccion_localidad"
              value={formData.direccion_localidad}
              onChange={handleChange}
              placeholder="Localidad / Ciudad"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>
        </div>

        {/* Tipo de vivienda y condición */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Tipo de Vivienda</label>
            <select
              name="tipo_vivienda"
              value={formData.tipo_vivienda}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
            >
              <option value="casa con patio cerrado">Casa con patio cerrado (tapial/rejas)</option>
              <option value="casa con cerco abierto">Casa con cerco abierto</option>
              <option value="departamento">Departamento (con/sin balcón)</option>
              <option value="campo">Quinta / Campo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Condición Habitacional</label>
            <select
              name="condicion_vivienda"
              value={formData.condicion_vivienda}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white"
            >
              <option value="propietario">Propietario</option>
              <option value="inquilino con permiso para mascotas">Inquilino con permiso para mascotas</option>
            </select>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Instagram</label>
            <input
              type="text"
              name="redes_instagram"
              value={formData.redes_instagram}
              onChange={handleChange}
              placeholder="@usuario"
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Facebook u otra red</label>
            <input
              type="text"
              name="redes_facebook"
              value={formData.redes_facebook}
              onChange={handleChange}
              placeholder="Perfil o link"
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-sm shadow-md shadow-patita-600/30"
          >
            {initialData?.id ? 'Guardar Cambios' : 'Registrar Adoptante'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
