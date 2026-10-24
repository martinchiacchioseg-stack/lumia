import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Share2, 
  Copy, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  Sparkles, 
  Newspaper, 
  Dog, 
  Calendar, 
  ArrowLeft, 
  Check, 
  PlusCircle, 
  X, 
  Send,
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export function PortalAdopcionesView({ onBackToApp }) {
  const { animales, noticias, addNoticia, addAdoptante } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('adopciones'); // 'adopciones' | 'noticias'
  const [filtroEspecie, setFiltroEspecie] = useState('todos'); // 'todos' | 'perro' | 'gato'
  const [busqueda, setBusqueda] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modales
  const [selectedAnimalPostular, setSelectedAnimalPostular] = useState(null);
  const [showNuevaNoticiaModal, setShowNuevaNoticiaModal] = useState(false);
  const [postulacionEnviada, setPostulacionEnviada] = useState(false);

  // Formulario de Postulación de Adopción
  const [formPostulacion, setFormPostulacion] = useState({
    nombre: '',
    telefono: '',
    email: '',
    localidad: '',
    tipoVivienda: 'Casa con patio cerrado',
    conviveAnimales: 'Sí',
    motivo: ''
  });

  // Formulario de Nueva Noticia (Admin)
  const [formNoticia, setFormNoticia] = useState({
    titulo: '',
    categoria: 'Novedades',
    resumen: '',
    cuerpo: '',
    foto_url: ''
  });

  const portalUrl = `${window.location.origin}${window.location.pathname}?portal=adopciones`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsAppPortal = () => {
    const text = encodeURIComponent(
      `🐾 *Portal de Adopciones y Noticias - LUMIA*\n` +
      `¡Conocé a todos los perritos y gatitos que están buscando un hogar lleno de amor!\n\n` +
      `Ingresá acá para ver las fotos y postularte: ${portalUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Filtrar animales en adopción (excluyendo adoptados o archivados)
  const animalesDisponibles = animales.filter(a => {
    const estado = (a.estado_caso || '').toLowerCase();
    const esDisponible = estado === 'en adopción' || estado === 'en adopcion' || estado === 'en tránsito' || estado === 'en transito' || estado === 'rescatado';
    const coincideEspecie = filtroEspecie === 'todos' || (a.especie || '').toLowerCase() === filtroEspecie;
    const coincideBusqueda = !busqueda || 
      (a.nombre_actual || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.codigo_interno || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.pelaje_color_senas_particulares || '').toLowerCase().includes(busqueda.toLowerCase());
    return esDisponible && coincideEspecie && coincideBusqueda;
  });

  const handleOpenPostular = (animal) => {
    setSelectedAnimalPostular(animal);
    setPostulacionEnviada(false);
  };

  const handleSubmitPostulacion = (e) => {
    e.preventDefault();
    if (!formPostulacion.nombre || !formPostulacion.telefono) return;

    // Registrar adoptante o postulante en el sistema
    addAdoptante({
      nombre_completo: formPostulacion.nombre,
      telefono_whatsapp: formPostulacion.telefono,
      email: formPostulacion.email,
      localidad: formPostulacion.localidad || 'Buenos Aires',
      tipo_vivienda: formPostulacion.tipoVivienda,
      observaciones_evaluacion: `Postulación web para ${selectedAnimalPostular?.nombre_actual} (${selectedAnimalPostular?.codigo_interno}). Motivo: ${formPostulacion.motivo}`,
      estado_adoptante: 'en evaluación'
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    setPostulacionEnviada(true);
    setTimeout(() => {
      setSelectedAnimalPostular(null);
      setPostulacionEnviada(false);
      setFormPostulacion({
        nombre: '',
        telefono: '',
        email: '',
        localidad: '',
        tipoVivienda: 'Casa con patio cerrado',
        conviveAnimales: 'Sí',
        motivo: ''
      });
    }, 2500);
  };

  const handleConsultarWhatsAppAnimal = (animal) => {
    const phone = '5491199887766'; // Teléfono oficial de guardia
    const text = encodeURIComponent(
      `¡Hola! Estoy en el Portal de Adopciones LUMIA y me gustaría consultar por ${animal.nombre_actual} (código ${animal.codigo_interno}). ¿Sigue disponible para adopción?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleCreateNoticia = (e) => {
    e.preventDefault();
    if (!formNoticia.titulo || !formNoticia.resumen) return;

    addNoticia({
      ...formNoticia,
      foto_url: formNoticia.foto_url || 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80'
    });

    setShowNuevaNoticiaModal(false);
    setFormNoticia({
      titulo: '',
      categoria: 'Novedades',
      resumen: '',
      cuerpo: '',
      foto_url: ''
    });
  };

  const isAdmin = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Superadministrador';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Barra superior de navegación */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo
              variant="full"
              background="transparent"
              size="md"
              className="h-12 w-auto"
              priority={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-lumia-50 hover:bg-lumia-100 text-lumia-800 border border-lumia-200 transition-all flex items-center gap-1.5 shadow-sm"
              title="Copiar enlace libre del portal para compartir"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-lumia-600" />}
              <span className="hidden sm:inline">{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <button
              onClick={handleShareWhatsAppPortal}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
              title="Compartir por WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar a Gestión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Institucional con Logo Grande y Visible */}
      <div className="bg-gradient-to-b from-white via-lumia-50/40 to-stone-50 border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo en versión destacada */}
          <div className="flex justify-center mb-3">
            <Logo
              variant="full"
              background="transparent"
              size="xl"
              className="h-28 sm:h-36 w-auto max-w-[340px] object-contain drop-shadow-sm"
              priority={true}
            />
          </div>

          <p className="text-xs sm:text-sm font-extrabold text-lumia-800 uppercase tracking-widest mb-2">
            Portal Oficial de Adopciones Responsables y Noticias
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            Ellos esperan una segunda oportunidad
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Todos nuestros animales se entregan vacunados, desparasitados y con compromiso de castración 
            bajo contrato oficial de seguimiento posadopción LUMIA.
          </p>

          {/* Selector de Pestañas: Adopciones / Noticias */}
          <div className="mt-6 inline-flex p-1.5 bg-stone-200/80 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('adopciones')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'adopciones'
                  ? 'bg-white text-lumia-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Heart className="w-4 h-4 text-lumia-600" />
              <span>Animales en Adopción ({animalesDisponibles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('noticias')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'noticias'
                  ? 'bg-white text-lumia-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Newspaper className="w-4 h-4 text-lumia-600" />
              <span>Noticias y Novedades ({noticias.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ========================================================= */}
        {/* PESTAÑA 1: CATÁLOGO DE ANIMALES EN ADOPCIÓN              */}
        {/* ========================================================= */}
        {activeTab === 'adopciones' && (
          <div className="space-y-6">
            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filtros de especie */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFiltroEspecie('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filtroEspecie === 'todos' ? 'bg-lumia-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroEspecie('perro')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filtroEspecie === 'perro' ? 'bg-lumia-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🐶 Perros
                </button>
                <button
                  onClick={() => setFiltroEspecie('gato')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filtroEspecie === 'gato' ? 'bg-lumia-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🐱 Gatos
                </button>
              </div>

              {/* Buscador */}
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, seña o código..."
                className="w-full sm:w-72 px-3.5 py-2 rounded-2xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
              />
            </div>

            {/* Grilla de Animales */}
            {animalesDisponibles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <Dog className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-700 font-bold text-sm">No encontramos animales con esos filtros</p>
                <p className="text-xs text-stone-400 mt-1">Probá cambiando los criterios de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animalesDisponibles.map((animal) => {
                  const photo = animal.foto_portada || animal.foto_portada_url || 
                    (animal.especie === 'gato' 
                      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
                      : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80');

                  return (
                    <div 
                      key={animal.id}
                      className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Imagen con Badges */}
                      <div className="relative h-56 bg-stone-100 overflow-hidden">
                        <img
                          src={photo}
                          alt={animal.nombre_actual}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-bold font-mono">
                            {animal.codigo_interno}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-lumia-600 text-white text-[11px] font-bold">
                            {animal.especie === 'gato' ? '🐱 Gato' : '🐶 Perro'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-bold">
                            {animal.sexo} • {animal.edad_estimada || animal.edad_estimada_categoria || 'Joven'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-bold">
                            Tamaño: {animal.tamano || 'Mediano'}
                          </span>
                        </div>
                      </div>

                      {/* Información del animal */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-black text-stone-900 tracking-tight">
                              {animal.nombre_actual}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              En Adopción
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                            {animal.pelaje_color_senas_particulares || animal.color_pelaje_senas || 'Hermoso animal en adopción responsable.'}
                          </p>

                          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1 text-[11px] text-stone-600 mb-4">
                            <p className="line-clamp-2">
                              <strong>Carácter:</strong> {animal.relacion_con_personas || animal.notas_conducta || 'Sociable, cariñoso y adaptado a hogar.'}
                            </p>
                            <p className="flex items-center gap-1 text-stone-500 text-[10px]">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{animal.ubicacion_rescate || 'CABA / GBA'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción directa */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => handleConsultarWhatsAppAnimal(animal)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleOpenPostular(animal)}
                            className="py-2.5 px-3 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Heart className="w-4 h-4" />
                            <span>Postularme</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 2: NOTICIAS Y NOVEDADES PUBLICADAS                */}
        {/* ========================================================= */}
        {activeTab === 'noticias' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Botón para Administrador */}
            {isAdmin && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNuevaNoticiaModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-md shadow-lumia-500/20 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Nueva Noticia</span>
                </button>
              </div>
            )}

            {/* Listado de Noticias */}
            <div className="space-y-6">
              {noticias.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center"
                >
                  {item.foto_url && (
                    <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={item.foto_url}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lumia-100 text-lumia-800 border border-lumia-200">
                        {item.categoria || 'Novedades'}
                      </span>
                      <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.fecha}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {item.titulo}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {item.resumen}
                    </p>

                    {item.cuerpo && (
                      <p className="text-xs text-stone-500 leading-relaxed pt-1">
                        {item.cuerpo}
                      </p>
                    )}

                    <div className="pt-2 text-[11px] font-semibold text-stone-400">
                      Publicado por: <span className="text-stone-700">{item.autor}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer del Portal con Datos de Contacto y Logo */}
      <footer className="mt-16 bg-white border-t border-stone-200 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center">
            <Logo
              variant="full"
              background="transparent"
              size="lg"
              className="h-20 w-auto max-w-[260px]"
            />
          </div>

          <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Red de Rescatistas Independientes de Animales • República Argentina
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-600 pt-2">
            <span className="flex items-center gap-1 font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-lumia-600" />
              Guardia / Consultas: +54 9 11 9988-7766
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-lumia-600" />
              Buenos Aires, Argentina
            </span>
          </div>

          <p className="text-[11px] text-stone-400 pt-3">
            LUMIA • Plataforma Nacional Protegida bajo Ley Nacional N° 25.326 de Protección de Datos Personales.
          </p>
        </div>
      </footer>

      {/* Modal de Postulación de Adopción */}
      {selectedAnimalPostular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lumia-100 text-lumia-700 flex items-center justify-center font-bold">
                  🐾
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Postularme para adoptar a {selectedAnimalPostular.nombre_actual}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">Código: {selectedAnimalPostular.codigo_interno}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnimalPostular(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postulacionEnviada ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-stone-900">¡Muchas gracias por postularte!</h4>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  La rescatista a cargo se contactará con vos por WhatsApp a la brevedad para coordinar la entrevista.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPostulacion} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formPostulacion.nombre}
                    onChange={(e) => setFormPostulacion({ ...formPostulacion, nombre: e.target.value })}
                    placeholder="Ej: Laura Gómez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">WhatsApp de Contacto *</label>
                    <input
                      type="text"
                      required
                      value={formPostulacion.telefono}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, telefono: e.target.value })}
                      placeholder="+54 9 11 ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-lumia-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Localidad / Barrio *</label>
                    <input
                      type="text"
                      required
                      value={formPostulacion.localidad}
                      onChange={(e) => setFormPostulacion({ ...formPostulacion, localidad: e.target.value })}
                      placeholder="Ej: Flores, CABA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Tipo de Vivienda</label>
                  <select
                    value={formPostulacion.tipoVivienda}
                    onChange={(e) => setFormPostulacion({ ...formPostulacion, tipoVivienda: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500 bg-white"
                  >
                    <option value="Casa con patio cerrado">Casa con patio cerrado / cerco seguro</option>
                    <option value="Departamento con red">Departamento con red de protección</option>
                    <option value="Departamento sin red">Departamento sin red</option>
                    <option value="Quinta / Campo">Quinta / Campo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">¿Por qué te gustaría adoptarlo/a?</label>
                  <textarea
                    rows={2}
                    value={formPostulacion.motivo}
                    onChange={(e) => setFormPostulacion({ ...formPostulacion, motivo: e.target.value })}
                    placeholder="Contanos sobre tu hogar, tu rutina y si tenés otros animales..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAnimalPostular(null)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold shadow-md shadow-lumia-500/20"
                  >
                    Enviar Postulación
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal para Administrador: Publicar Nueva Noticia */}
      {showNuevaNoticiaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">Publicar Noticia en el Portal</h3>
              <button
                onClick={() => setShowNuevaNoticiaModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNoticia} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Título de la Noticia *</label>
                <input
                  type="text"
                  required
                  value={formNoticia.titulo}
                  onChange={(e) => setFormNoticia({ ...formNoticia, titulo: e.target.value })}
                  placeholder="Ej: Jornada de Castración Gratuita"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Categoría</label>
                <input
                  type="text"
                  value={formNoticia.categoria}
                  onChange={(e) => setFormNoticia({ ...formNoticia, categoria: e.target.value })}
                  placeholder="Ej: Campaña Sanitaria, Caso de Éxito, Tránsitos..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Resumen Breve (Copete) *</label>
                <textarea
                  rows={2}
                  required
                  value={formNoticia.resumen}
                  onChange={(e) => setFormNoticia({ ...formNoticia, resumen: e.target.value })}
                  placeholder="Breve párrafo explicativo que se verá en el portal..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Contenido Completo (Opcional)</label>
                <textarea
                  rows={3}
                  value={formNoticia.cuerpo}
                  onChange={(e) => setFormNoticia({ ...formNoticia, cuerpo: e.target.value })}
                  placeholder="Detalles, horarios, direcciones, requisitos..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">URL de la Foto</label>
                <input
                  type="url"
                  value={formNoticia.foto_url}
                  onChange={(e) => setFormNoticia({ ...formNoticia, foto_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNuevaNoticiaModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold shadow-md shadow-lumia-500/20"
                >
                  Publicar Noticia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortalAdopcionesView;
