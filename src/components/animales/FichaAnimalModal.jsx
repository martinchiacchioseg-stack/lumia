import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { usePatitaChat } from '../../context/PatitaChatContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Logo } from '../common/Logo';
import { formatDate, isOverdue, getWhatsappLink, getWhatsappTemplate } from '../../lib/formatters';
import { downloadLibretaPdf, getLibretaPdfBlobUrl } from '../../services/pdfService.js';
import { VerificacionPublicaModal } from '../public/VerificacionPublicaModal';
import { ModalFlyerRedes } from './ModalFlyerRedes';
import { 
  Dog, 
  Cat, 
  Calendar, 
  MapPin, 
  Phone, 
  Heart, 
  Stethoscope, 
  Image as ImageIcon, 
  ClipboardCheck, 
  Printer, 
  Plus, 
  Download, 
  Edit3, 
  FileText,
  UserCheck,
  CheckCircle2,
  Sparkles,
  QrCode,
  Share2,
  PawPrint
} from 'lucide-react';

export function FichaAnimalModal({ isOpen, onClose, animal, onEditAnimal }) {
  const { openChatWithAnimal, canUseChat } = usePatitaChat() || {};
  const { 
    eventosSalud, 
    addEventoSalud, 
    adopciones, 
    adoptantes, 
    seguimientos, 
    addSeguimiento,
    updateAnimal
  } = useData();
  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState('datos');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  // Estado para nuevo evento de salud
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [healthForm, setHealthForm] = useState({
    tipo_evento: 'vacuna antirrábica',
    producto_o_detalle: '',
    profesional_veterinaria: '',
    lugar: '',
    fecha: new Date().toISOString().split('T')[0],
    fecha_proximo_refuerzo_o_vencimiento: '',
    medicacion_cronica: false,
    diagnostico_enfermedad: ''
  });

  // Estado para nuevo seguimiento
  const [showAddSeg, setShowAddSeg] = useState(false);
  const [segForm, setSegForm] = useState({
    fecha_contacto: new Date().toISOString().split('T')[0],
    tipo_contacto: 'WhatsApp',
    estado_general: 'normal',
    observaciones: '',
    foto_video_recibido: '',
    proxima_fecha_seguimiento: ''
  });

  // Estado para nueva foto de galería
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    url: '',
    categoria: 'evolucion',
    notas: ''
  });

  if (!animal) return null;

  // Filtrar datos vinculados al animal
  const animalHealthEvents = eventosSalud.filter(e => e.animal_id === animal.id);
  const adoption = adopciones.find(a => a.animal_id === animal.id && !a.archivado);
  const adopter = adoption ? adoptantes.find(ad => ad.id === adoption.adoptante_id) : null;
  const animalFollowups = adoption ? seguimientos.filter(s => s.adopcion_id === adoption.id) : [];

  // Descarga del PDF Oficial LUMIA
  const handleDownloadOfficialPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadLibretaPdf({
        mascota: animal,
        adoptante: adopter,
        adopcion: adoption,
        historial: animalHealthEvents,
        options: {
          organizationName: 'Red de Rescatistas Independientes - LUMIA',
          includeActa: true
        }
      });
    } catch (error) {
      alert('Error al generar el PDF oficial. Por favor intente nuevamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Guardar evento de salud
  const handleSaveHealth = (e) => {
    e.preventDefault();
    if (!healthForm.producto_o_detalle) return;

    addEventoSalud({
      ...healthForm,
      animal_id: animal.id
    });

    setShowAddHealth(false);
    setHealthForm({
      tipo_evento: 'vacuna antirrábica',
      producto_o_detalle: '',
      profesional_veterinaria: '',
      lugar: '',
      fecha: new Date().toISOString().split('T')[0],
      fecha_proximo_refuerzo_o_vencimiento: '',
      medicacion_cronica: false,
      diagnostico_enfermedad: ''
    });
  };

  // Guardar seguimiento
  const handleSaveSeg = (e) => {
    e.preventDefault();
    if (!adoption) return;

    addSeguimiento({
      ...segForm,
      adopcion_id: adoption.id
    });

    setShowAddSeg(false);
    setSegForm({
      fecha_contacto: new Date().toISOString().split('T')[0],
      tipo_contacto: 'WhatsApp',
      estado_general: 'normal',
      observaciones: '',
      foto_video_recibido: '',
      proxima_fecha_seguimiento: ''
    });
  };

  // Subir foto a galería
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!photoForm.url) return;

    const newPhoto = {
      id: `g-${Date.now()}`,
      url: photoForm.url,
      categoria: photoForm.categoria,
      fecha: new Date().toISOString().split('T')[0],
      notas: photoForm.notas
    };

    const currentGal = animal.galeria || [];
    updateAnimal(animal.id, { galeria: [...currentGal, newPhoto] });
    setShowAddPhoto(false);
    setPhotoForm({ url: '', categoria: 'evolucion', notas: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${animal.nombre_actual} (${animal.codigo_interno})`}
      subtitle={`${animal.especie === 'perro' ? 'Perro' : 'Gato'} • ${animal.sexo} • ${animal.edad_estimada} • ${animal.tamano}`}
      maxWidth="max-w-4xl"
    >
      {/* Barra de Descarga Oficial LUMIA */}
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-lumia-500 to-lumia-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shadow-lumia-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Logo variant="icon-only" size="sm" className="brightness-0 invert" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight">LIBRETA ÚNICA LUMIA IMPRIMIBLE</h4>
            <p className="text-xs text-lumia-100">
              Documento oficial de adopción y libreta sanitaria digital con membrete transparente
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowQrModal(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-lumia-800/40 hover:bg-lumia-800/60 border border-white/20 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-lumia-200" />
            <span>Ficha QR</span>
          </button>

          <button
            onClick={() => setShowFlyerModal(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Generar Flyer para publicar en Instagram, Facebook y WhatsApp"
          >
            <Share2 className="w-4 h-4 text-stone-900" />
            <span>Flyer Redes</span>
          </button>

          {canUseChat && openChatWithAnimal && (
            <button
              onClick={() => openChatWithAnimal(animal)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-lumia-900/60 hover:bg-lumia-900 border border-white/20 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Consultar a Patita Aliada sobre este animal"
            >
              <PawPrint className="w-4 h-4 text-lumia-300" />
              <span>Consultar a Patita Aliada</span>
            </button>
          )}

          <button
            onClick={handleDownloadOfficialPdf}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-lumia-700 font-extrabold text-xs hover:bg-lumia-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <div className="w-4 h-4 border-2 border-lumia-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4 text-lumia-600" />
            )}
            <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Libreta (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Principales de la Ficha */}
      <div className="flex border-b border-stone-200 mb-5 overflow-x-auto scrollbar-hide text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('datos')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'datos' ? 'border-lumia-500 text-lumia-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ficha General</span>
        </button>

        <button
          onClick={() => setActiveTab('salud')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'salud' ? 'border-lumia-500 text-lumia-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Salud & Libreta ({animalHealthEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conducta')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'conducta' ? 'border-lumia-500 text-lumia-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Conducta</span>
        </button>

        <button
          onClick={() => setActiveTab('galeria')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'galeria' ? 'border-lumia-500 text-lumia-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Galería ({(animal.galeria || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('adopcion')}
          className={`pb-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'adopcion' ? 'border-lumia-500 text-lumia-700' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Adopción & Seguimientos</span>
        </button>
      </div>

      {/* ================= PESTAÑA: DATOS GENERALES ================= */}
      {activeTab === 'datos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Foto de Portada */}
            <div className="w-full sm:w-56 h-56 rounded-3xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-sm relative group">
              <img
                src={animal.foto_portada || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                alt={animal.nombre_actual}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge variant={animal.estado_caso === 'adoptado' ? 'success' : animal.estado_caso === 'en adopción' ? 'primary' : 'warning'}>
                  {animal.estado_caso}
                </Badge>
              </div>
            </div>

            {/* Datos Resumidos */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900">{animal.nombre_actual}</h3>
                  {animal.nombre_anterior_apodo && (
                    <p className="text-xs text-stone-500">También conocido como: {animal.nombre_anterior_apodo}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasPermission('animales', 'editar') && (
                    <button
                      onClick={() => onEditAnimal && onEditAnimal(animal)}
                      className="px-3 py-1.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-lumia-500/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-semibold block mb-0.5">Código LUMIA</span>
                  <span className="font-extrabold text-lumia-600 text-sm">{animal.codigo_interno}</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-400 font-semibold block mb-0.5">Fecha de Rescate</span>
                  <span className="font-bold text-stone-800">{formatDate(animal.fecha_rescate)}</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 col-span-2">
                  <span className="text-stone-400 font-semibold block mb-0.5">Lugar del Rescate</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-lumia-500" />
                    {animal.ubicacion_rescate || 'No especificada'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Señas y Pelaje</h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {animal.pelaje_color_senas_particulares || 'Sin señas especiales registradas.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Alimentación Recomendada</h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {animal.alimentacion_recomendada || 'Alimento balanceado estándar.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: SALUD Y LIBRETA ================= */}
      {activeTab === 'salud' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Libreta Sanitaria Digital</h3>
              <p className="text-xs text-stone-500">Historial médico, vacunaciones, desparasitaciones y cirugías</p>
            </div>
            
            {hasPermission('salud', 'crear') && (
              <button
                onClick={() => setShowAddHealth(true)}
                className="px-3.5 py-2 rounded-xl bg-lumia-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Evento</span>
              </button>
            )}
          </div>

          {/* Formulario para agregar evento de salud */}
          {showAddHealth && (
            <div className="p-4 rounded-3xl bg-stone-50 border border-lumia-300 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-lumia-800 uppercase tracking-wider">Nuevo Evento Médico</h4>
              <form onSubmit={handleSaveHealth} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Tipo de Evento</label>
                    <select
                      value={healthForm.tipo_evento}
                      onChange={(e) => setHealthForm({ ...healthForm, tipo_evento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    >
                      <option value="vacuna antirrábica">Vacuna Antirrábica</option>
                      <option value="múltiple/séxtuple/triple felina">Múltiple / Séxtuple / Triple Felina</option>
                      <option value="otras vacunas">Otras Vacunas</option>
                      <option value="castración/esterilización">Castración / Esterilización</option>
                      <option value="desparasitación interna">Desparasitación Interna</option>
                      <option value="desparasitación externa">Desparasitación Externa (Pipeta)</option>
                      <option value="consulta">Consulta General</option>
                      <option value="cirugía">Cirugía</option>
                      <option value="diagnóstico">Diagnóstico de Enfermedad</option>
                      <option value="tratamiento">Tratamiento con Medicación</option>
                      <option value="estudio">Estudios (Análisis, Placa, Eco)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Producto o Detalle *</label>
                    <input
                      type="text"
                      required
                      value={healthForm.producto_o_detalle}
                      onChange={(e) => setHealthForm({ ...healthForm, producto_o_detalle: e.target.value })}
                      placeholder="Ej: Rabisin lote 34B, Cefalexina 500mg, etc."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Fecha de Aplicación</label>
                    <input
                      type="date"
                      value={healthForm.fecha}
                      onChange={(e) => setHealthForm({ ...healthForm, fecha: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Veterinario/a o MP</label>
                    <input
                      type="text"
                      value={healthForm.profesional_veterinaria}
                      onChange={(e) => setHealthForm({ ...healthForm, profesional_veterinaria: e.target.value })}
                      placeholder="Dra. Silvina Romero"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Próximo Refuerzo / Vencimiento</label>
                    <input
                      type="date"
                      value={healthForm.fecha_proximo_refuerzo_o_vencimiento}
                      onChange={(e) => setHealthForm({ ...healthForm, fecha_proximo_refuerzo_o_vencimiento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHealth(false)}
                    className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-lumia-500 text-white text-xs font-bold shadow-sm"
                  >
                    Guardar en Libreta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listado de eventos de salud */}
          {animalHealthEvents.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200">
              <Stethoscope className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-medium">Aún no se registraron eventos médicos para este animal.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {animalHealthEvents.map(event => (
                <div key={event.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lumia-50 text-lumia-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      💊
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">{event.tipo_evento}</span>
                        <span className="text-[11px] text-stone-400 font-medium">{formatDate(event.fecha)}</span>
                      </div>
                      <p className="text-xs text-stone-700 mt-0.5">{event.producto_o_detalle}</p>
                      {event.profesional_veterinaria && (
                        <p className="text-[11px] text-stone-500">Profesional: {event.profesional_veterinaria} {event.lugar ? `(${event.lugar})` : ''}</p>
                      )}
                      {event.fecha_proximo_refuerzo_o_vencimiento && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                          <Badge variant={isOverdue(event.fecha_proximo_refuerzo_o_vencimiento) ? 'danger' : 'info'}>
                            Próximo refuerzo: {formatDate(event.fecha_proximo_refuerzo_o_vencimiento)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA: CONDUCTA Y CONVIVENCIA ================= */}
      {activeTab === 'conducta' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Convivencia con Perros
              </span>
              <p className="text-xs text-stone-800 font-semibold">
                {animal.relacion_con_perros || 'A evaluar en tránsito'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Convivencia con Gatos
              </span>
              <p className="text-xs text-stone-800 font-semibold">
                {animal.relacion_con_gatos || 'No testeado con felinos'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Relación con Personas y Niños
              </span>
              <p className="text-xs text-stone-800 font-semibold">
                {animal.relacion_con_personas || 'Sociable'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Nivel de Energía
              </span>
              <Badge variant={animal.nivel_energia === 'tranquilo' ? 'success' : animal.nivel_energia === 'moderado' ? 'info' : 'warning'}>
                {animal.nivel_energia || 'Moderado'}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Manejo de Correa y Paseos en la Vía Pública
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {animal.manejo_correa_paseos || 'Camina sin problemas.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-lumia-50 border border-lumia-200">
            <span className="text-xs font-bold text-lumia-900 uppercase tracking-wider block mb-1">
              Notas de Conducta, Miedos y Sensibilidades
            </span>
            <p className="text-xs text-lumia-900 leading-relaxed font-medium">
              {animal.notas_conducta || 'No presenta fobias ni reactividades registradas.'}
            </p>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: GALERÍA MULTIMEDIA ================= */}
      {activeTab === 'galeria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Galería de Fotos Categorizada</h3>
              <p className="text-xs text-stone-500">Rescate, evolución y fotos en familia</p>
            </div>

            {hasPermission('animales', 'editar') && (
              <button
                onClick={() => setShowAddPhoto(true)}
                className="px-3.5 py-2 rounded-xl bg-lumia-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Foto</span>
              </button>
            )}
          </div>

          {(!animal.galeria || animal.galeria.length === 0) ? (
            <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200">
              <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-medium">No hay fotos adicionales en la galería aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {animal.galeria.map((pic, idx) => (
                <div key={pic.id || idx} className="rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm flex flex-col">
                  <div className="h-44 bg-stone-100 overflow-hidden relative">
                    <img src={pic.url} alt={pic.notas || 'Foto animal'} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <div className="absolute top-2 left-2">
                      <Badge variant={pic.categoria === 'rescate' ? 'warning' : pic.categoria === 'familia_adoptiva' ? 'success' : 'info'}>
                        {pic.categoria}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 text-xs">
                    <p className="font-semibold text-stone-800 line-clamp-2">{pic.notas || 'Foto registrada'}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">{formatDate(pic.fecha)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PESTAÑA: ADOPCIÓN Y SEGUIMIENTOS ================= */}
      {activeTab === 'adopcion' && (
        <div className="space-y-5">
          {!adoption ? (
            <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200">
              <Heart className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-700 font-bold">Este animal aún no tiene una adopción activa.</p>
              <p className="text-[11px] text-stone-500 mt-1">Podés concretar una adopción desde la pestaña "Adopciones" o desde la ficha de adoptantes.</p>
            </div>
          ) : (
            <>
              {/* Tarjeta del Adoptante */}
              <div className="p-4 rounded-3xl bg-lumia-50/60 border border-lumia-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-lumia-500 text-white font-bold flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{adopter?.nombre_apellido || 'Adoptante'}</h4>
                      <p className="text-xs text-stone-500">Adoptado el {formatDate(adoption.fecha_entrega)}</p>
                    </div>
                  </div>

                  {adopter?.telefono_whatsapp && (
                    <a
                      href={getWhatsappLink(adopter.telefono_whatsapp, getWhatsappTemplate({ adoptanteNombre: adopter.nombre_apellido, animalNombre: animal.nombre_actual }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Seguimiento</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Modalidad</span>
                    <span className="font-semibold text-stone-800">{adoption.modalidad_entrega}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Período Adaptación</span>
                    <span className="font-semibold text-stone-800">{adoption.periodo_adaptacion_dias} días</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Castración</span>
                    <span className="font-semibold text-stone-800">
                      {adoption.compromiso_castracion ? `Sí (hasta ${formatDate(adoption.fecha_limite_castracion)})` : 'Realizada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Estado</span>
                    <Badge variant={adoption.estado_adopcion === 'adopción consolidada' ? 'success' : 'primary'}>
                      {adoption.estado_adopcion}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bitácora de Seguimientos (Línea de tiempo) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">Línea de Tiempo de Seguimientos</h4>
                  
                  {hasPermission('seguimientos', 'crear') && (
                    <button
                      onClick={() => setShowAddSeg(true)}
                      className="px-3 py-1.5 rounded-xl bg-lumia-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar Contacto</span>
                    </button>
                  )}
                </div>

                {/* Timeline visual */}
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {animalFollowups.map(seg => {
                    const isAlert = seg.estado_general === 'alerta';
                    const isExcellent = seg.estado_general === 'excelente';

                    return (
                      <div key={seg.id} className="relative">
                        <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isAlert ? 'bg-rose-500 ring-4 ring-rose-100' : isExcellent ? 'bg-emerald-500' : 'bg-lumia-500'
                        }`} />

                        <div className={`p-4 rounded-2xl border ${
                          isAlert ? 'bg-rose-50 border-rose-300' : 'bg-stone-50 border-stone-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-stone-900">
                              {seg.tipo_contacto} • {formatDate(seg.fecha_contacto)}
                            </span>
                            <Badge variant={isAlert ? 'danger' : isExcellent ? 'success' : 'info'}>
                              {seg.estado_general.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-700 mt-1 leading-relaxed">{seg.observaciones}</p>

                          {seg.foto_video_recibido && (
                            <div className="mt-2.5">
                              <img
                                src={seg.foto_video_recibido}
                                alt="Foto enviada por la familia"
                                className="w-24 h-24 object-cover rounded-xl border border-stone-300"
                              />
                            </div>
                          )}

                          {seg.proxima_fecha_seguimiento && (
                            <p className="text-[11px] text-stone-400 mt-2 font-medium">
                              Próximo contacto agendado: {formatDate(seg.proxima_fecha_seguimiento)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Ficha Digital Pública con QR */}
      {showQrModal && (
        <VerificacionPublicaModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          animal={animal}
          adoptante={adopter}
          adopcion={adoption}
          eventosSalud={animalHealthEvents}
        />
      )}

      {/* Modal Generador de Flyer para Redes Sociales */}
      {showFlyerModal && (
        <ModalFlyerRedes
          animal={animal}
          isOpen={showFlyerModal}
          onClose={() => setShowFlyerModal(false)}
        />
      )}
    </Modal>
  );
}
