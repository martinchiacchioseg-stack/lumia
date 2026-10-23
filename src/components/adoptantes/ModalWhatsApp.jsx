import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { getWhatsappLink, getWhatsappTemplate } from '../../lib/formatters';
import { Phone, Send, MessageCircle } from 'lucide-react';

export function ModalWhatsApp({ isOpen, onClose, adoptante, animal }) {
  if (!adoptante) return null;

  const defaultMsg = getWhatsappTemplate({
    adoptanteNombre: adoptante.nombre_apellido,
    animalNombre: animal?.nombre_actual || 'su compañero rescatado',
  });

  const [message, setMessage] = useState(defaultMsg);

  const handleSend = () => {
    const link = getWhatsappLink(adoptante.telefono_whatsapp, message);
    window.open(link, '_blank');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Mensaje de Seguimiento por WhatsApp"
      subtitle={`Adoptante: ${adoptante.nombre_apellido} • Tel: ${adoptante.telefono_whatsapp}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            El mensaje ya está redactado con un tono afectuoso de rescatista para pedir noticias y fotos. Podés modificarlo libremente antes de enviarlo.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Texto del Mensaje (wa.me)
          </label>
          <textarea
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-stone-300 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 font-sans"
          />
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
            type="button"
            onClick={handleSend}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Abrir en WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
