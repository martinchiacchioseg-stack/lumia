import React, { useState, useRef, useEffect } from 'react';
import { usePatitaChat } from '../../context/PatitaChatContext';
import { 
  Send, 
  X, 
  RotateCcw, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  AlertTriangle,
  PawPrint,
  HeartHandshake,
  Stethoscope,
  Info
} from 'lucide-react';

const SUGGESTIONS = [
  'Encontré un perro atropellado',
  'Cachorros abandonados',
  'Redactar una publicación de adopción',
  'Cómo hacer una denuncia por maltrato'
];

export function PatitaAliadaChat() {
  const {
    isOpen,
    setIsOpen,
    isOnline,
    canUseChat,
    messages,
    loading,
    animalContext,
    setAnimalContext,
    remainingQuota,
    sendMessage,
    resetConversation
  } = usePatitaChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  if (!canUseChat || !isOnline) {
    return null;
  }

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;
    sendMessage(text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Renderizador simple de texto formateado (negritas y viñetas)
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Reemplazo básico de **texto** a <strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block leading-relaxed">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-stone-900">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Botón flotante móvil y desktop (por encima de BottomNav móvil) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 p-3.5 rounded-full bg-lumia-500 hover:bg-lumia-600 text-white shadow-xl shadow-lumia-500/35 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 group border-2 border-white"
          title="Consultar a Patita Aliada (Asistente con IA para Rescatistas)"
        >
          <PawPrint className="w-6 h-6 animate-pulse" />
          <span className="hidden md:inline font-black text-xs pr-1">Patita Aliada</span>
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-2 left-2 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:w-96 md:w-[420px] max-h-[85vh] h-[580px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-lumia-500 to-lumia-600 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg shadow-inner">
                🐾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight">Patita Aliada</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-white/25 uppercase">
                    IA
                  </span>
                </div>
                <p className="text-[11px] text-lumia-100 font-medium">
                  Compañera de rescate y bienestar animal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetConversation}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contexto del animal si fue invocado desde una ficha */}
          {animalContext && (
            <div className="bg-lumia-50/90 border-b border-lumia-200 px-3.5 py-2 flex items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 text-lumia-900 font-semibold truncate">
                <Stethoscope className="w-3.5 h-3.5 text-lumia-600 shrink-0" />
                <span className="truncate">
                  Ficha vinculada: <strong>{animalContext.nombre_actual}</strong> ({animalContext.codigo_interno})
                </span>
              </div>
              <button
                onClick={() => setAnimalContext(null)}
                className="p-1 rounded-full text-lumia-700 hover:bg-lumia-200 shrink-0"
                title="Desvincular ficha"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Lista de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-stone-50/60 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] shadow-sm ${
                      isBot
                        ? msg.isError
                          ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-sm'
                          : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'
                        : 'bg-lumia-500 text-white rounded-tr-sm font-medium'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Acciones de la respuesta del bot (Copiar y WhatsApp) */}
                  {isBot && !msg.isError && msg.id !== 'welcome-init' && (
                    <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-stone-500">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-stone-800 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-stone-200/60 transition-colors"
                        title="Copiar texto de la respuesta"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(msg.text)}
                        className="hover:text-emerald-700 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-emerald-50 transition-colors"
                        title="Compartir por WhatsApp"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicador de "Escribiendo..." */}
            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-2xl rounded-tl-sm w-fit text-stone-500 text-xs shadow-sm">
                <div className="w-2 h-2 rounded-full bg-lumia-500 animate-ping"></div>
                <span>Patita Aliada está escribiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas al inicio */}
          {messages.length <= 1 && (
            <div className="p-2.5 bg-white border-t border-stone-100 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="px-2.5 py-1 rounded-xl bg-lumia-50 hover:bg-lumia-100 text-lumia-800 text-[11px] font-bold border border-lumia-200 transition-colors text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input de texto */}
          <div className="p-2.5 bg-white border-t border-stone-200 shrink-0">
            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-lumia-500 text-xs text-stone-900 resize-none max-h-24"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-3 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white disabled:opacity-40 transition-all shrink-0 shadow-sm"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Disclaimer permanente */}
            <p className="mt-2 text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-stone-400 shrink-0" />
              <span>Orientación general. Ante una urgencia, consultá con un veterinario.</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
