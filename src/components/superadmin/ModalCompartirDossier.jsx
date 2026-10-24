import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Lock,
  Layers
} from 'lucide-react';

export function ModalCompartirDossier({ isOpen, onClose, onOpenInternalDossier }) {
  const { currentUser } = useAuth();
  const [downloading, setDownloading] = useState(false);

  if (currentUser?.rol !== 'Superadministrador') {
    return null;
  }

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dossier Técnico de Funcionalidades (Acceso Autenticado)"
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
                <span className="text-xs font-bold text-lumia-700 uppercase tracking-wider">Acceso Protegido por Sesión</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Superadministrador
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-700 leading-relaxed">
                Por políticas de seguridad de LUMIA, ningún privilegio ni vista administrativa se habilita mediante tokens en la URL. 
                El <strong>Dossier Técnico de los 13 Módulos</strong> está protegido por sesión activa y verificación de rol.
              </p>
            </div>
          </div>
        </div>

        {onOpenInternalDossier && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInternalDossier();
            }}
            className="w-full p-3.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-lumia-500/20"
          >
            <Layers className="w-4 h-4" />
            <span>Abrir Dossier Técnico en Sesión Autenticada</span>
          </button>
        )}

        {/* Descarga del manual adjunta */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-lumia-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-stone-800">Manual Operativo en PDF (6 Páginas)</p>
              <p className="text-[11px] text-stone-500">Documento institucional listo para compartir sin exponer sesiones</p>
            </div>
          </div>
          <button
            onClick={handleDownloadManual}
            disabled={downloading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-lumia-600" />
            <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
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
