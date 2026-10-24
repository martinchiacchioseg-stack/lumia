import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Indicador visual sutil de campo autocompletado con IA
 */
export function AIFieldBadge({ isAIFilled }) {
  if (!isAIFilled) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-1.5 py-0.2 rounded-md ml-1.5 animate-in fade-in">
      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
      <span>Autocompletado con IA</span>
    </span>
  );
}

/**
 * Retorna la clase css correspondiente si el campo fue autocompletado por IA
 */
export function getAIFieldClass(isAIFilled, baseClass = '') {
  if (!isAIFilled) return baseClass;
  return `${baseClass} border-emerald-400 ring-2 ring-emerald-100/80 bg-emerald-50/20 transition-all`;
}
