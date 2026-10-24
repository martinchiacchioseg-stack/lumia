import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scanFormWithAI } from '../../services/aiScannerService';
import { Camera, Upload, Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

/**
 * Componente Reutilizable: SmartCameraInput / AIFormScanner
 * Permite tomar una foto con la cámara del dispositivo o subir una imagen
 * para autocompletar automáticamente los campos del formulario activo mediante visión por IA.
 * 
 * @param {Object} props
 * @param {Array} props.schema - Definición de campos del formulario ({ name, label, type, options, context })
 * @param {Function} props.onScanComplete - Callback invocado con (extractedData, filledKeys)
 * @param {string} [props.buttonText="Autocompletar con Foto"] - Texto del botón
 * @param {string} [props.formTitle="formulario"] - Título o contexto del formulario
 * @param {boolean} [props.disabled=false] - Deshabilitar escaneo
 * @param {string} [props.className=""] - Clases css adicionales
 */
export function SmartCameraInput({
  schema = [],
  onScanComplete,
  buttonText = 'Escanear con IA',
  formTitle = 'formulario',
  disabled = false,
  className = ''
}) {
  const { currentUser } = useAuth() || {};
  const [isScanning, setIsScanning] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    // Resetear valor para permitir seleccionar la misma imagen si reintenta
    e.target.value = '';
    setShowOptions(false);

    if (!file) return;

    setIsScanning(true);
    setFeedback(null);

    try {
      const result = await scanFormWithAI({
        file,
        schema,
        currentUser
      });

      const { extractedData, fieldsExtractedCount } = result;

      // Filtrar claves que vinieron con datos válidos (no nulos)
      const validEntries = Object.entries(extractedData).filter(
        ([_, val]) => val !== null && val !== undefined && val !== ''
      );

      if (validEntries.length === 0) {
        setFeedback({
          type: 'warning',
          message: 'No se detectaron datos legibles para este formulario en la imagen. Podés probar con una foto más nítida o continuar manualmente.'
        });
        return;
      }

      const validObj = Object.fromEntries(validEntries);
      const filledFieldNames = Object.keys(validObj);

      // Inyectar al formulario activo
      if (onScanComplete) {
        onScanComplete(validObj, filledFieldNames);
      }

      setFeedback({
        type: 'success',
        message: `✨ ¡Se autocompletaron ${fieldsExtractedCount} campo${fieldsExtractedCount > 1 ? 's' : ''} a partir de la imagen! Revisalos antes de guardar.`
      });

      // Auto ocultar feedback positivo a los 6 segundos
      setTimeout(() => {
        setFeedback(prev => prev?.type === 'success' ? null : prev);
      }, 6000);

    } catch (err) {
      console.error('[SmartCameraInput Error]:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Error al analizar la imagen. Podés intentar nuevamente o cargar los datos a mano.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Inputs de archivo ocultos */}
      {/* 1. Cámara directa en móvil (capture="environment") */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
        disabled={isScanning || disabled}
      />

      {/* 2. Galería o selector de archivo estándar (PC / móvil) */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
        disabled={isScanning || disabled}
      />

      {/* Botón principal integrado */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setShowOptions(prev => !prev)}
          disabled={isScanning || disabled}
          className={`group px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
            isScanning
              ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-wait'
              : 'bg-lumia-50 hover:bg-lumia-100 border-lumia-300 text-lumia-800 hover:text-lumia-900 shadow-sm'
          }`}
          title="Autocompletar campos automáticamente con una foto de ticket, receta o documento"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Analizando imagen y completando campos...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-lumia-600 group-hover:scale-110 transition-transform" />
              <Camera className="w-3.5 h-3.5 text-stone-700" />
              <span>{buttonText}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Menú desplegable para Cámara o Galería */}
      {showOptions && !isScanning && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 sm:left-0 top-full mt-1.5 z-40 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 text-xs">
            <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
              Completar con foto o documento
            </div>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-lumia-50 text-stone-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-lumia-100 text-lumia-700 flex items-center justify-center shrink-0">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block font-bold">Tomar foto</span>
                <span className="text-[10px] text-stone-400 font-normal">Abrir cámara trasera</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-lumia-50 text-stone-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block font-bold">Subir imagen</span>
                <span className="text-[10px] text-stone-400 font-normal">Galería o archivo PC</span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Feedback Toast / Notificación contextual */}
      {feedback && (
        <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-start gap-2 shadow-sm animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : feedback.type === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {feedback.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
          {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          <div className="flex-1 leading-snug">
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 font-bold ml-1 text-sm leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Export alternativo
export const AIFormScanner = SmartCameraInput;
