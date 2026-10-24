import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Download, 
  Share2, 
  Sparkles,
  Lock
} from 'lucide-react';

export function ModalCompartirDossier({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const dossierUrl = `${window.location.origin}${window.location.pathname}?dossier=true&token=patita-superadmin-auth`;

  const handleCopy = () => {
    navigator.clipboard.writeText(dossierUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenPreview = () => {
    window.open(dossierUrl, '_blank');
  };

  const handleDownloadManual = async () => {
    setDownloading(true);
    try {
      await downloadManualAdministradorPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el manual en PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🐾 *LUMIA - Catálogo Oficial de Funciones y Plataforma para Rescatistas*\n\n` +
      `Te comparto el enlace oficial con el detalle de todas las capacidades y módulos del sistema LUMIA (Libreta Única de Mascotas, Informes y Adopciones):\n\n` +
      `${dossierUrl}\n\n` +
      `_Enlace oficial validado por la Superadministración técnica._`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enlace Oficial de Funcionalidades del Sistema"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Banner exclusivo de Superadministrador */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-lumia-50 to-stone-50 border border-lumia-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-lumia-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-lumia-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-lumia-700 uppercase tracking-wider">Facultad Exclusiva</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Superadministrador
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-700 leading-relaxed">
                Solamente vos como <strong>Superadministrador</strong> tenés la autorización de generar y enviar este enlace. 
                Cualquier persona que lo reciba podrá ver el <strong>Catálogo Completo de Funciones</strong> del sistema 
                sin necesidad de credenciales de acceso.
              </p>
            </div>
          </div>
        </div>

        {/* Campo con el enlace generado */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Enlace Oficial para Compartir
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={dossierUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-700 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleOpenPreview}
            className="p-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <span>Abrir Vista Previa</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>

        {/* Descarga del manual adjunta */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-lumia-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-stone-800">Manual Operativo en PDF (6 Páginas)</p>
              <p className="text-[11px] text-stone-500">Documento estructurado con logotipo y tablas de gestión</p>
            </div>
          </div>
          <button
            onClick={handleDownloadManual}
            disabled={downloading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-lumia-600" />
            <span>{downloading ? 'Generando...' : 'Descargar'}</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalCompartirDossier;
