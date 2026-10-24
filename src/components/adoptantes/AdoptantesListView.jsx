import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { ModalNuevoAdoptante } from './ModalNuevoAdoptante';
import { ModalWhatsApp } from './ModalWhatsApp';
import { SmartCameraInput } from '../common/SmartCameraInput';
import { Badge } from '../common/Badge';
import { formatDate, formatDNI } from '../../lib/formatters';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  HeartHandshake, 
  Home, 
  Globe, 
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

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
  { name: 'condicion_vivienda', label: 'Condición de vivienda', type: 'select', options: ['propietario', 'inquilino'] }
];

export function AdoptantesListView() {
  const { adoptantes, adopciones, animales } = useData();
  const { hasPermission, canAccessSensitiveData } = usePermissions();

  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAdoptante, setEditingAdoptante] = useState(null);

  // WhatsApp modal state
  const [whatsAppModal, setWhatsAppModal] = useState({
    isOpen: false,
    adoptante: null,
    animal: null
  });

  const canSeeSensitive = canAccessSensitiveData();

  const filtered = adoptantes.filter(adop => {
    if (adop.archivado) return false;
    const q = search.toLowerCase();
    return (
      adop.nombre_apellido.toLowerCase().includes(q) ||
      (adop.dni_cuit && adop.dni_cuit.includes(q)) ||
      (adop.telefono_whatsapp && adop.telefono_whatsapp.includes(q)) ||
      (adop.direccion_barrio && adop.direccion_barrio.toLowerCase().includes(q))
    );
  });

  const handleOpenWhatsApp = (adoptante) => {
    // Buscar el animal que adoptó
    const adp = adopciones.find(a => a.adoptante_id === adoptante.id);
    const pet = adp ? animales.find(an => an.id === adp.animal_id) : null;
    setWhatsAppModal({
      isOpen: true,
      adoptante,
      animal: pet
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-patita-600" />
            <span>Adoptantes y Familias</span>
          </h1>
          <p className="text-xs text-stone-500">Base de datos de adoptantes con seguimiento posadopción y protección de datos</p>
        </div>

        {hasPermission('adoptantes', 'crear') && (
          <div className="flex flex-wrap items-center gap-2">
            <SmartCameraInput
              schema={ADOPTANTE_SCHEMA}
              formTitle="Nuevo Adoptante"
              buttonText="Escanear DNI con IA"
              onScanComplete={(extractedData) => {
                setEditingAdoptante(extractedData);
                setShowNewModal(true);
              }}
            />
            <button
              onClick={() => { setEditingAdoptante(null); setShowNewModal(true); }}
              className="px-4 py-2.5 rounded-2xl bg-patita-600 hover:bg-patita-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-patita-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Adoptante</span>
            </button>
          </div>
        )}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white shadow-sm"
        />
      </div>

      {/* Banner de protección de datos sensibles */}
      <div className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
        canSeeSensitive 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
          : 'bg-amber-50/80 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2">
          {canSeeSensitive ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {canSeeSensitive 
              ? 'Tenés habilitado el permiso para visualizar datos sensibles de adoptantes (DNI, fotos y domicilio completo).' 
              : 'Modo seguro: DNI, fotos de DNI y dirección exacta están ocultos conforme a la Ley 25.326 y tu rol de permisos.'}
          </span>
        </div>
      </div>

      {/* Listado de tarjetas de adoptantes */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700">No se encontraron adoptantes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(adoptante => {
            // Animales adoptados por este adoptante
            const userAdoptions = adopciones.filter(a => a.adoptante_id === adoptante.id);
            const adoptedPets = userAdoptions.map(ad => animales.find(an => an.id === ad.animal_id)).filter(Boolean);

            return (
              <div 
                key={adoptante.id} 
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-base">{adoptante.nombre_apellido}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {canSeeSensitive ? (
                          <span className="text-xs text-stone-600 font-semibold bg-stone-100 px-2 py-0.5 rounded">
                            DNI: {formatDNI(adoptante.dni_cuit)}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> DNI Protegido
                          </span>
                        )}
                        <span className="text-xs text-stone-400">• {formatDate(adoptante.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasPermission('adoptantes', 'editar') && (
                        <button
                          onClick={() => { setEditingAdoptante(adoptante); setShowNewModal(true); }}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenWhatsApp(adoptante)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        title="Enviar WhatsApp de Seguimiento"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Datos de contacto y vivienda */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-patita-600 shrink-0" />
                      <span className="font-semibold">{adoptante.telefono_whatsapp}</span>
                      {adoptante.telefono_secundario && <span className="text-stone-400">/ {adoptante.telefono_secundario}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-patita-600 shrink-0" />
                      {canSeeSensitive ? (
                        <span>
                          {adoptante.direccion_calle} {adoptante.direccion_numero} {adoptante.direccion_piso_depto} ({adoptante.direccion_barrio || adoptante.direccion_localidad})
                        </span>
                      ) : (
                        <span className="text-stone-500">
                          {adoptante.direccion_barrio || adoptante.direccion_localidad} (Calle exacta oculta por privacidad)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-patita-600 shrink-0" />
                      <span className="capitalize">{adoptante.tipo_vivienda} ({adoptante.condicion_vivienda})</span>
                    </div>

                    {adoptante.redes_sociales?.instagram && (
                      <div className="flex items-center gap-2 text-stone-500">
                        <Globe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{adoptante.redes_sociales.instagram}</span>
                      </div>
                    )}
                  </div>

                  {/* Animales adoptados */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      Animales adoptados ({adoptedPets.length})
                    </span>
                    {adoptedPets.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">Sin animales asignados aún (aprobado/a para adoptar)</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {adoptedPets.map(pet => (
                          <div key={pet.id} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-patita-50 border border-patita-200 text-xs">
                            <img
                              src={pet.foto_portada}
                              alt={pet.nombre_actual}
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                            <span className="font-bold text-patita-900">{pet.nombre_actual}</span>
                            <span className="text-[10px] text-patita-600 font-semibold">({pet.codigo_interno})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones al pie */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">Ley 25.326 Consentimiento: ✓ Aceptado</span>
                  <button
                    onClick={() => handleOpenWhatsApp(adoptante)}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Abrir chat wa.me →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo / Editar Adoptante */}
      {showNewModal && (
        <ModalNuevoAdoptante
          isOpen={showNewModal}
          onClose={() => { setShowNewModal(false); setEditingAdoptante(null); }}
          initialData={editingAdoptante}
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
