import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  ShieldAlert,
  ShieldCheck,
  Phone,
  PhoneCall,
  MessageCircle,
  Newspaper,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  PlusCircle,
  Save,
  ExternalLink,
  CheckCircle2,
  Globe,
  Settings,
  Mail,
  MapPin,
  Calendar,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

export function PanelSuperadminView() {
  const { currentUser } = useAuth();
  const { 
    noticias, 
    addNoticia, 
    updateNoticia, 
    deleteNoticia, 
    toggleNoticiaPublicada,
    configPortal,
    updateConfigPortal 
  } = useData();

  // Verificar rol de Superadministrador
  const isSuperadmin = currentUser?.rol === 'Superadministrador';

  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'noticias'
  
  // Estado local para la configuración del portal
  const [formConfig, setFormConfig] = useState({
    telefono_guardia: configPortal?.telefono_guardia || '+54 9 11 9988-7766',
    telefono_whatsapp: configPortal?.telefono_whatsapp || '5491199887766',
    nombre_guardia: configPortal?.nombre_guardia || 'Guardia y Rescate LUMIA',
    email_contacto: configPortal?.email_contacto || 'contacto@patitaaliada.org.ar',
    zona_cobertura: configPortal?.zona_cobertura || 'Buenos Aires, Argentina',
    mensaje_bienvenida: configPortal?.mensaje_bienvenida || 'Ellos esperan una segunda oportunidad'
  });

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Estados para modal de crear/editar noticia
  const [modalNoticiaOpen, setModalNoticiaOpen] = useState(false);
  const [editingNoticiaId, setEditingNoticiaId] = useState(null);
  const [formNoticia, setFormNoticia] = useState({
    titulo: '',
    categoria: 'Novedades',
    resumen: '',
    cuerpo: '',
    foto_url: '',
    publicado: true
  });

  if (!isSuperadmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-2">
          Acceso Restringido a Superadministración
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
          Esta consola de control global solo puede ser operada por el perfil Superadministrador de LUMIA.
        </p>
      </div>
    );
  }

  // Guardar configuración del portal
  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateConfigPortal(formConfig);
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3500);
  };

  // Abrir modal para crear nueva noticia
  const handleOpenCreateNoticia = () => {
    setEditingNoticiaId(null);
    setFormNoticia({
      titulo: '',
      categoria: 'Novedades',
      resumen: '',
      cuerpo: '',
      foto_url: '',
      publicado: true
    });
    setModalNoticiaOpen(true);
  };

  // Abrir modal para editar noticia existente
  const handleOpenEditNoticia = (noticia) => {
    setEditingNoticiaId(noticia.id);
    setFormNoticia({
      titulo: noticia.titulo || '',
      categoria: noticia.categoria || 'Novedades',
      resumen: noticia.resumen || '',
      cuerpo: noticia.cuerpo || '',
      foto_url: noticia.foto_url || '',
      publicado: noticia.publicado !== false
    });
    setModalNoticiaOpen(true);
  };

  // Guardar noticia (creación o edición)
  const handleSubmitNoticia = (e) => {
    e.preventDefault();
    if (!formNoticia.titulo || !formNoticia.resumen) return;

    if (editingNoticiaId) {
      updateNoticia(editingNoticiaId, formNoticia);
    } else {
      addNoticia({
        ...formNoticia,
        foto_url: formNoticia.foto_url || 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80'
      });
    }

    setModalNoticiaOpen(false);
  };

  const portalUrl = `${window.location.origin}${window.location.pathname}?portal=adopciones`;

  const totalNoticias = noticias.length;
  const publicadasCount = noticias.filter(n => n.publicado !== false).length;
  const borradoresCount = totalNoticias - publicadasCount;

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Encabezado Superior con Identidad LUMIA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 bg-lumia-500/20 text-lumia-400 border border-lumia-500/30 rounded-2xl shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-lumia-500 text-white">
                Consola Exclusiva Superadmin
              </span>
              <span className="text-xs text-stone-400">
                Gestión Institucional
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Panel Administrativo del Portal Público
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              Controlá el número telefónico de contacto oficial, canales de WhatsApp y seleccioná con un clic qué noticias se publican o se ocultan en el portal abierto.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all backdrop-blur-sm shadow-sm"
          >
            <Globe className="w-4 h-4 text-lumia-400" />
            <span>Ver Portal Público en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
          </a>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-lumia-500 text-white shadow-md shadow-lumia-500/20'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Teléfono y Datos de Contacto</span>
        </button>

        <button
          onClick={() => setActiveTab('noticias')}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'noticias'
              ? 'bg-lumia-500 text-white shadow-md shadow-lumia-500/20'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Gestión de Noticias ({publicadasCount} activas / {totalNoticias})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: CONFIGURACIÓN DE TELÉFONO Y CONTACTO           */}
      {/* ========================================================= */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Configuración */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-lumia-600" />
                <span>Datos Oficiales de Contacto del Portal</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Estos datos se sincronizan al instante en el portal web de adopciones (`?portal=adopciones`), en el pie de página institucional y en los flyers oficiales de redes sociales.
              </p>
            </div>

            {guardadoExitoso && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-bold">
                  ¡Configuración actualizada y guardada con éxito en el sistema! Ya se refleja en el portal público.
                </div>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teléfono Visible de Guardia */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-lumia-600" />
                    <span>Teléfono Oficial de Guardia (Visible)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formConfig.telefono_guardia}
                    onChange={(e) => setFormConfig({ ...formConfig, telefono_guardia: e.target.value })}
                    placeholder="Ej: +54 9 11 9988-7766"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 font-semibold text-stone-900 text-sm"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Formato legible que verán los usuarios en pantalla y flyers.
                  </p>
                </div>

                {/* Número de WhatsApp (Solo Dígitos) */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Número WhatsApp (Código País + Área)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formConfig.telefono_whatsapp}
                    onChange={(e) => setFormConfig({ ...formConfig, telefono_whatsapp: e.target.value })}
                    placeholder="Ej: 5491199887766"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-stone-900 text-sm"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Sin signos (+) ni espacios. Es el destino de los botones "Consultar por WhatsApp".
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre de Referencia / Guardia */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nombre / Guardia a Cargo
                  </label>
                  <input
                    type="text"
                    value={formConfig.nombre_guardia}
                    onChange={(e) => setFormConfig({ ...formConfig, nombre_guardia: e.target.value })}
                    placeholder="Ej: Guardia y Rescate LUMIA"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 font-medium text-stone-900 text-sm"
                  />
                </div>

                {/* Email de Contacto */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    <span>Email Institucional</span>
                  </label>
                  <input
                    type="email"
                    value={formConfig.email_contacto}
                    onChange={(e) => setFormConfig({ ...formConfig, email_contacto: e.target.value })}
                    placeholder="contacto@patitaaliada.org.ar"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 font-medium text-stone-900 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zona de Cobertura */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>Zona Geográfica de Cobertura</span>
                  </label>
                  <input
                    type="text"
                    value={formConfig.zona_cobertura}
                    onChange={(e) => setFormConfig({ ...formConfig, zona_cobertura: e.target.value })}
                    placeholder="Buenos Aires, Argentina"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 font-medium text-stone-900 text-sm"
                  />
                </div>

                {/* Lema / Mensaje de Bienvenida */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1.5">
                    Título de Bienvenida del Portal
                  </label>
                  <input
                    type="text"
                    value={formConfig.mensaje_bienvenida}
                    onChange={(e) => setFormConfig({ ...formConfig, mensaje_bienvenida: e.target.value })}
                    placeholder="Ellos esperan una segunda oportunidad"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 font-medium text-stone-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-black text-sm shadow-lg shadow-lumia-500/25 flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios de Contacto</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tarjeta de Previsualización en Vivo */}
          <div className="space-y-6">
            <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-md">
              <h3 className="text-xs font-black text-lumia-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Vista Previa del Contacto Público</span>
              </h3>
              
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-stone-200">
                  <PhoneCall className="w-4 h-4 text-lumia-400" />
                  <div>
                    <span className="text-[10px] text-stone-400 block">Guardia / Emergencias:</span>
                    <strong className="text-sm font-bold text-white">{formConfig.telefono_guardia || 'No especificado'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-200">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-stone-400 block">Enlace WhatsApp:</span>
                    <strong className="text-xs font-mono text-emerald-300">wa.me/{formConfig.telefono_whatsapp || '...'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-200">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-stone-400 block">Ubicación / Cobertura:</span>
                    <span className="text-xs text-stone-300">{formConfig.zona_cobertura || 'Buenos Aires'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-800 text-[11px] text-stone-400 leading-relaxed">
                Cada vez que un adoptante haga clic en <strong>"WhatsApp"</strong> dentro de una ficha o flyer, el chat se abrirá automáticamente con este número y el código del animal.
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <h4 className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Seguridad de Datos y Privacidad</span>
              </h4>
              <p className="leading-relaxed text-[11px]">
                El número de guardia configurado aquí es el único expuesto al público. Los datos personales de los adoptantes y rescatistas particulares permanecen resguardados bajo control de acceso estricto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: GESTIÓN Y PUBLICACIÓN DE NOTICIAS              */}
      {/* ========================================================= */}
      {activeTab === 'noticias' && (
        <div className="space-y-6">
          {/* Barra de Herramientas y Resumen */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs">
                  {publicadasCount} Publicadas en Portal
                </span>
                <span className="px-3 py-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 font-bold text-xs">
                  {borradoresCount} Borradores / Ocultas
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenCreateNoticia}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs shadow-md shadow-lumia-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Redactar Nueva Noticia</span>
            </button>
          </div>

          {/* Listado de Noticias con Controles de Publicación */}
          <div className="space-y-4">
            {noticias.map((item) => {
              const estaPublicado = item.publicado !== false;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all ${
                    estaPublicado 
                      ? 'border-emerald-200 shadow-sm ring-1 ring-emerald-500/20' 
                      : 'border-stone-200 opacity-80 bg-stone-50/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    {/* Contenido e Imagen */}
                    <div className="flex items-start gap-4 flex-1">
                      {item.foto_url ? (
                        <img
                          src={item.foto_url}
                          alt={item.titulo}
                          className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                          <Newspaper className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lumia-100 text-lumia-800 border border-lumia-200">
                            {item.categoria || 'Novedades'}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.fecha || 'Reciente'}
                          </span>
                          <span className="text-xs text-stone-400">
                            • Autor: <strong className="text-stone-700">{item.autor || 'Admin'}</strong>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                          {item.titulo}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2">
                          {item.resumen}
                        </p>
                      </div>
                    </div>

                    {/* Controles de Publicación y Edición */}
                    <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                      {/* Switch Publicado / Oculto */}
                      <button
                        onClick={() => toggleNoticiaPublicada(item.id)}
                        className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                          estaPublicado
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                        }`}
                        title={estaPublicado ? "Clic para ocultar del portal público" : "Clic para publicar en el portal público"}
                      >
                        {estaPublicado ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Publicada en Portal</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Borrador / Oculta</span>
                          </>
                        )}
                      </button>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditNoticia(item)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Editar noticia"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar la noticia "${item.titulo}"?`)) {
                              deleteNoticia(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar noticia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PARA CREAR O EDITAR NOTICIA                          */}
      {/* ========================================================= */}
      {modalNoticiaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lumia-100 text-lumia-700 flex items-center justify-center font-bold">
                  📰
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {editingNoticiaId ? 'Editar Noticia / Comunicado' : 'Redactar Nueva Noticia'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Controlá el título, contenido y visibilidad en el portal público.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalNoticiaOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNoticia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Título de la Noticia *
                </label>
                <input
                  type="text"
                  required
                  value={formNoticia.titulo}
                  onChange={(e) => setFormNoticia({ ...formNoticia, titulo: e.target.value })}
                  placeholder="Ej: Jornada Nacional de Castración y Vacunación Masiva"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-sm font-semibold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formNoticia.categoria}
                    onChange={(e) => setFormNoticia({ ...formNoticia, categoria: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-sm font-medium text-stone-900"
                  >
                    <option value="Novedades">Novedades</option>
                    <option value="Jornada">Jornada</option>
                    <option value="Campaña">Campaña</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Final Feliz">Final Feliz</option>
                    <option value="Institucional">Institucional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={formNoticia.publicado ? 'publicado' : 'borrador'}
                    onChange={(e) => setFormNoticia({ ...formNoticia, publicado: e.target.value === 'publicado' })}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-sm font-bold text-stone-900"
                  >
                    <option value="publicado">Publicada en el Portal</option>
                    <option value="borrador">Borrador / Oculta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL de Imagen de Portada
                </label>
                <input
                  type="url"
                  value={formNoticia.foto_url}
                  onChange={(e) => setFormNoticia({ ...formNoticia, foto_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-xs font-mono text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Resumen Corto (Aparece en la portada) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formNoticia.resumen}
                  onChange={(e) => setFormNoticia({ ...formNoticia, resumen: e.target.value })}
                  placeholder="Breve introducción que enganche al visitante..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-xs text-stone-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Cuerpo Extenso / Comunicado Completo
                </label>
                <textarea
                  rows={4}
                  value={formNoticia.cuerpo}
                  onChange={(e) => setFormNoticia({ ...formNoticia, cuerpo: e.target.value })}
                  placeholder="Detalles de la fecha, lugar, requisitos, horarios y recomendaciones..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-xs text-stone-900 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalNoticiaOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-black text-xs shadow-md shadow-lumia-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNoticiaId ? 'Guardar Cambios' : 'Publicar Noticia'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
