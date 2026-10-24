import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Inbox, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  PlusCircle, 
  X, 
  Trash2, 
  User, 
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Database,
  Smartphone,
  Share2,
  FileText
} from 'lucide-react';

export function MensajesSistemaView() {
  const { mensajesSistema, marcarMensajeLeido, addMensajeSistema, deleteMensajeSistema } = useData();
  const { currentUser } = useAuth();

  const isSuperadmin = currentUser?.rol === 'Superadministrador';

  const [selectedMessageId, setSelectedMessageId] = useState(mensajesSistema[0]?.id || null);
  const [showNuevoModal, setShowNuevoModal] = useState(false);

  // Formulario nuevo mensaje (Superadmin)
  const [nuevoForm, setNuevoForm] = useState({
    asunto: '',
    categoria: 'Aviso de Mantenimiento',
    prioridad: 'Alta',
    destinatario: 'Administración y Equipo de Rescate',
    resumen: '',
    detalleTexto: ''
  });

  const selectedMessage = mensajesSistema.find(m => m.id === selectedMessageId) || mensajesSistema[0];
  const unreadCount = mensajesSistema.filter(m => !m.leido).length;

  const handleSelect = (id) => {
    setSelectedMessageId(id);
    marcarMensajeLeido(id);
  };

  const handleCrearMensaje = (e) => {
    e.preventDefault();
    if (!nuevoForm.asunto || !nuevoForm.resumen) return;

    const lineas = nuevoForm.detalleTexto.split('\n').filter(l => l.trim().length > 0);
    const contenido_detallado = lineas.map((line, idx) => ({
      titulo: `Punto ${idx + 1}`,
      detalle: line
    }));

    addMensajeSistema({
      asunto: nuevoForm.asunto,
      categoria: nuevoForm.categoria,
      prioridad: nuevoForm.prioridad,
      destinatario: nuevoForm.destinatario,
      resumen: nuevoForm.resumen,
      contenido_detallado: contenido_detallado.length > 0 ? contenido_detallado : [
        { titulo: 'Detalle del Comunicado', detalle: nuevoForm.resumen }
      ]
    });

    setShowNuevoModal(false);
    setNuevoForm({
      asunto: '',
      categoria: 'Aviso de Mantenimiento',
      prioridad: 'Alta',
      destinatario: 'Administración y Equipo de Rescate',
      resumen: '',
      detalleTexto: ''
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <Inbox className="w-6 h-6 text-lumia-600" />
              <span>Mensajes del Sistema</span>
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount} sin leer
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500">
            Canal de comunicación oficial técnica y operativa desde la Superadministración
          </p>
        </div>

        {isSuperadmin && (
          <button
            onClick={() => setShowNuevoModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-lumia-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Mensaje a Administradores</span>
          </button>
        )}
      </div>

      {/* Layout de Mensajes: Lista a la izquierda / Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista de Mensajes (4 columnas) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Bandeja Oficial ({mensajesSistema.length})</span>
            <span className="text-[11px] text-stone-400 font-medium">Orden cronológico</span>
          </div>

          <div className="space-y-2.5">
            {mensajesSistema.map((msg) => {
              const isSelected = msg.id === selectedMessageId;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-lumia-500 shadow-md ring-2 ring-lumia-500/20'
                      : msg.leido
                      ? 'bg-stone-50 border-stone-200 hover:bg-white'
                      : 'bg-white border-lumia-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      msg.prioridad === 'Alta' ? 'bg-rose-100 text-rose-800' : 'bg-lumia-100 text-lumia-800'
                    }`}>
                      {msg.prioridad} Prioridad
                    </span>

                    <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.fecha}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${
                    !msg.leido ? 'text-stone-900 font-black' : 'text-stone-700'
                  }`}>
                    {msg.asunto}
                  </h3>

                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {msg.resumen}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                    <span className="text-stone-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-lumia-600" />
                      {msg.remitente_nombre}
                    </span>
                    {!msg.leido && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px]">
                        NUEVO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle del Mensaje Seleccionado (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {selectedMessage ? (
            <>
              {/* Encabezado del Comunicado */}
              <div className="pb-5 border-b border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-lumia-100 text-lumia-800 border border-lumia-200">
                      {selectedMessage.categoria}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      Prioridad {selectedMessage.prioridad}
                    </span>
                  </div>

                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedMessage.fecha} a las {selectedMessage.hora || '10:00'} hs
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight">
                  {selectedMessage.asunto}
                </h2>

                {/* Ficha del Remitente */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-lumia-500 text-white flex items-center justify-center font-black">
                      🛡️
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{selectedMessage.remitente_nombre}</p>
                      <p className="text-[11px] text-lumia-700 font-semibold">{selectedMessage.remitente_rol} • {selectedMessage.remitente_email}</p>
                    </div>
                  </div>

                  <div className="text-stone-500 text-[11px]">
                    Destinatario: <strong className="text-stone-800">{selectedMessage.destinatario}</strong>
                  </div>
                </div>
              </div>

              {/* Resumen principal */}
              <div className="p-4 rounded-2xl bg-lumia-50/50 border border-lumia-200 text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {selectedMessage.resumen}
              </div>

              {/* Contenido detallado punto por punto */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Detalle de Implementaciones y Mejoras:
                </h3>

                <div className="grid grid-cols-1 gap-3.5">
                  {selectedMessage.contenido_detallado?.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-lumia-300 transition-all space-y-1.5"
                    >
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.titulo}</span>
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed pl-6">
                        {item.detalle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie de confirmación de lectura */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mensaje oficial verificado por la Superadministración</span>
                </span>

                {isSuperadmin && (
                  <button
                    onClick={() => deleteMensajeSistema(selectedMessage.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Eliminar mensaje del sistema"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-600">No hay mensaje seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para que el Superadministrador redacte un nuevo mensaje */}
      {showNuevoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lumia-600" />
                <h3 className="font-bold text-stone-900 text-base">Nuevo Mensaje Oficial del Sistema</h3>
              </div>
              <button
                onClick={() => setShowNuevoModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearMensaje} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Asunto del Comunicado *</label>
                <input
                  type="text"
                  required
                  value={nuevoForm.asunto}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, asunto: e.target.value })}
                  placeholder="Ej: Mantenimiento programado de base de datos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-lumia-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Categoría</label>
                  <select
                    value={nuevoForm.categoria}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="Actualización del Sistema">Actualización del Sistema</option>
                    <option value="Aviso de Mantenimiento">Aviso de Mantenimiento</option>
                    <option value="Protocolo de Seguridad">Protocolo de Seguridad</option>
                    <option value="Copia de Respaldo">Copia de Respaldo</option>
                    <option value="Comunicado General">Comunicado General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Prioridad</label>
                  <select
                    value={nuevoForm.prioridad}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Informativa">Informativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Destinatarios</label>
                <input
                  type="text"
                  value={nuevoForm.destinatario}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, destinatario: e.target.value })}
                  placeholder="Ej: Administradores y Rescatistas"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Resumen del Mensaje *</label>
                <textarea
                  rows={2}
                  required
                  value={nuevoForm.resumen}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, resumen: e.target.value })}
                  placeholder="Resumen claro que verá el administrador en la bandeja..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-lumia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Puntos Detallados (Una línea por cada punto o instrucción)
                </label>
                <textarea
                  rows={4}
                  value={nuevoForm.detalleTexto}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, detalleTexto: e.target.value })}
                  placeholder="1. Se actualizaron los servidores...&#10;2. Recordar solicitar fotos a los adoptantes...&#10;3. Las castraciones serán los días sábados..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNuevoModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold shadow-md shadow-lumia-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Mensaje</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MensajesSistemaView;
