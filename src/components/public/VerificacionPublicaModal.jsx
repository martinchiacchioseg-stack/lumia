import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { Badge } from '../common/Badge';
import { formatDate } from '../../lib/formatters';
import { generateQrBase64, downloadCredencialPdf } from '../../services/pdfService';
import { 
  ShieldCheck, 
  Phone, 
  MapPin, 
  QrCode, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ExternalLink 
} from 'lucide-react';

export function VerificacionPublicaModal({ isOpen, onClose, animal, adoptante, adopcion, eventosSalud = [] }) {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const verificationLink = `https://lumia.ar/verificar/${animal?.codigo_interno || 'LUM-001'}`;

  useEffect(() => {
    if (isOpen && animal) {
      generateQrBase64(verificationLink).then(dataUrl => setQrCodeUrl(dataUrl));
    }
  }, [isOpen, animal]);

  if (!animal) return null;

  // Comprobar estado de vacunación antirrábica
  const rabiesEvent = eventosSalud.find(e => e.tipo_evento?.toLowerCase().includes('antirrábica'));
  const isRabiesValid = rabiesEvent?.fecha_proximo_refuerzo_o_vencimiento
    ? new Date(rabiesEvent.fecha_proximo_refuerzo_o_vencimiento) > new Date()
    : false;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = async () => {
    setDownloadingCard(true);
    try {
      await downloadCredencialPdf({
        mascota: animal,
        adoptante: adoptante || { telefono: '+5491100000000' },
        adopcion: adopcion || {},
        historial: eventosSalud
      });
    } catch (e) {
      alert('Error al descargar la credencial.');
    } finally {
      setDownloadingCard(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Digital Pública y Verificación QR"
      subtitle="Portal de autenticidad accesible al escanear la chapita o libreta LUMIA"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Encabezado Institucional */}
        <div className="p-4 rounded-3xl bg-lumia-50 border border-lumia-200 text-center space-y-2">
          <div className="flex justify-center">
            <Logo variant="full" size="md" className="h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>REGISTRO OFICIAL VERIFICADO EN RED LUMIA</span>
          </div>
        </div>

        {/* Ficha Resumida de la Mascota */}
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
            <img
              src={animal.foto_portada || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
              alt={animal.nombre_actual}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-stone-900 truncate">{animal.nombre_actual}</h3>
              <Badge variant="primary" className="font-mono text-xs">
                {animal.codigo_interno}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 capitalize mt-0.5">
              {animal.especie} • {animal.sexo} • {animal.edad_estimada}
            </p>
            <p className="text-xs text-stone-600 mt-1 truncate">
              {animal.pelaje_color_senas_particulares || 'Sin señas especiales.'}
            </p>
          </div>
        </div>

        {/* Estado Sanitario Oficial */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-400 font-bold uppercase text-[10px] block">Vacunación Antirrábica</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${isRabiesValid ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="font-bold text-stone-800">
                {isRabiesValid ? 'Al Día (Vigente)' : 'A Verificar / Reforzar'}
              </span>
            </div>
            {rabiesEvent && (
              <span className="text-[11px] text-stone-500 block">
                Vence: {formatDate(rabiesEvent.fecha_proximo_refuerzo_o_vencimiento)}
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-400 font-bold uppercase text-[10px] block">Castración / Esterilización</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-stone-800">
                {adopcion?.compromiso_castracion ? 'En compromiso' : 'Realizada / Protegido'}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 block">No apto para reproducción</span>
          </div>
        </div>

        {/* Código QR Dinámico y Enlace */}
        <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-stone-300 shadow-sm shrink-0 flex items-center justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Código QR LUMIA" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-12 h-12 text-stone-400 animate-pulse" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h4 className="text-xs font-bold text-stone-900">Enlace de Verificación Permanente</h4>
            <p className="text-[11px] text-stone-500">
              Cualquier persona que escanee este código o ingrese al link podrá corroborar que la mascota está registrada en la red sin vulnerar datos privados.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={downloadingCard}
                className="px-3.5 py-1.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingCard ? 'Generando...' : 'Descargar Credencial de Bolsillo (PDF)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nota de Privacidad Ley 25.326 */}
        <p className="text-[11px] text-center text-stone-400">
          🔒 Ley 25.326: Los datos filiatorios sensibles del adoptante permanecen cifrados. Ante emergencias, la red coordina la restitución del animal de forma segura.
        </p>
      </div>
    </Modal>
  );
}
