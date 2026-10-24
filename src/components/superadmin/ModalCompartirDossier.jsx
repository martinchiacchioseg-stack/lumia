import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { downloadManualAdministradorPdf } from '../../services/manualPdfService';
import { downloadDossierPdf } from '../../services/dossierPdfService';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  FileDown,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export function ModalCompartirDossier({ isOpen, onClose, onOpenInternalDossier }) {
  const { currentUser } = useAuth();
  const [downloadingDossier, setDownloadingDossier] = useState(false);
  const [downloadingManual, setDownloadingManual] = useState(false);

  if (currentUser?.rol !== 'Superadministrador') {
    return null;
  }

  const handleDownloadDossier = async () => {
    setDownloadingDossier(true);
    try {
      await downloadDossierPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el dossier en PDF.');
    } finally {
      setDownloadingDossier(false);
    }
  };

  const handleDownloadManual = async () => {
    setDownloadingManual(true);
    try {
      await downloadManualAdministradorPdf();
    } catch (err) {
      console.error(err);
      alert('Error al generar el manual en PDF.');
    } finally {
      setDownloadingManual(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dossier Técnico Oficial de Capacidades LUMIA"
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
                Por políticas de ciberseguridad, ningún permiso ni vista sensible se otorga mediante tokens en la URL. 
                El <strong>Dossier Técnico de los 18 Módulos</strong> está disponible para descarga oficial en PDF y para visualización autenticada.
              </p>
            </div>
          </div>
        </div>

        {/* Opción 1: Descargar el Dossier en PDF (Recomendado) */}
        <div className="p-4 rounded-2xl bg-lumia-500 text-white shadow-lg shadow-lumia-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Descargar Dossier Oficial (PDF 5 Páginas)</p>
              <p className="text-[11px] text-white/80">Documento ejecutivo completo con los 18 módulos y especificaciones técnicas</p>
            </div>
          </div>
          <button
            onClick={handleDownloadDossier}
            disabled={downloadingDossier}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-lumia-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingDossier ? 'Generando...' : 'Descargar PDF'}</span>
          </button>
        </div>

        {/* Opción 2: Abrir Dossier interactivo en pantalla */}
        {onOpenInternalDossier && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInternalDossier();
            }}
            className="w-full p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4 text-lumia-400" />
            <span>Ver Dossier Interactivo en Pantalla (18 Módulos)</span>
          </button>
        )}

        {/* Opción 3: Descarga del Manual Operativo */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-stone-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-stone-800">Manual Operativo de Gestión en PDF</p>
              <p className="text-[11px] text-stone-500">Guía práctica paso a paso para administradores y rescatistas</p>
            </div>
          </div>
          <button
            onClick={handleDownloadManual}
            disabled={downloadingManual}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>{downloadingManual ? 'Generando...' : 'Manual PDF'}</span>
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
