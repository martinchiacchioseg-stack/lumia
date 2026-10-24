import React from 'react';
import { LUMIA_COLORS, LUMIA_ASSETS } from '../../lib/brandingAssets';

/**
 * Componente Oficial de Identidad Visual LUMIA
 * 
 * Variantes soportadas:
 * - variant="full": Logo oficial completo (Corazón con huella + LUMIA + subtítulo obligatorio)
 * - variant="mini-lumia": Isotipo + sigla LUMIA
 * - variant="mini-text": Isotipo + subtítulo LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
 * - variant="icon-only": Isotipo corazón outline conteniendo huella centrada (#C94A2A)
 * 
 * Fondos:
 * - background="transparent" (por defecto, para headers, PDFs y fondos oscuros o claros)
 * - background="white" (para tarjetas con contraste)
 */
export function Logo({
  variant = 'full',
  background = 'transparent',
  size = 'md',
  className = '',
  alt = 'LUMIA - Libreta Única de Mascotas, Informes y Adopciones',
  priority = false
}) {
  // Tamaños proporcionales
  const sizeClasses = {
    sm: variant === 'icon-only' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon-only' ? 'w-10 h-10' : 'h-11 sm:h-12',
    lg: variant === 'icon-only' ? 'w-16 h-16' : 'h-16 sm:h-20',
    xl: variant === 'icon-only' ? 'w-24 h-24' : 'h-24 sm:h-28',
    '2xl': variant === 'icon-only' ? 'w-36 h-36' : 'h-40 sm:h-52 md:h-60',
  };

  const bgClasses = background === 'white' ? 'bg-white p-2 rounded-2xl shadow-sm' : '';

  // 1. VARIANTE ICON-ONLY (Vector SVG exacto #C94A2A)
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size] || sizeClasses.md} ${bgClasses} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label={alt}
        >
          {/* Corazón Outline Oficial en #C94A2A */}
          <path
            d="M50 86.5C48.5 86.5 20 66 12 48C5 32 14 16 30 16C38.5 16 46 21 50 26.5C54 21 61.5 16 70 16C86 16 95 32 88 48C80 66 51.5 86.5 50 86.5Z"
            stroke={LUMIA_COLORS.primary}
            strokeWidth="9"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Huellita grande centrada Oficial #C94A2A */}
          <ellipse cx="50" cy="56" rx="14" ry="11" fill={LUMIA_COLORS.primary} />
          <circle cx="34" cy="40" r="6" fill={LUMIA_COLORS.primary} />
          <circle cx="45" cy="30" r="6" fill={LUMIA_COLORS.primary} />
          <circle cx="55" cy="30" r="6" fill={LUMIA_COLORS.primary} />
          <circle cx="66" cy="40" r="6" fill={LUMIA_COLORS.primary} />
        </svg>
      </div>
    );
  }

  // 2. VARIANTE MINI-TEXT (Corazón + Texto Completo)
  if (variant === 'mini-text') {
    return (
      <img
        src={LUMIA_ASSETS.logoMiniTexto}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`object-contain ${sizeClasses[size] || sizeClasses.md} ${bgClasses} ${className}`}
      />
    );
  }

  // 3. VARIANTE MINI-LUMIA (Isotipo + sigla)
  if (variant === 'mini-lumia') {
    return (
      <div className={`inline-flex items-center gap-2 ${bgClasses} ${className}`}>
        <Logo variant="icon-only" size={size} />
        <span
          className="font-extrabold tracking-tight"
          style={{
            color: LUMIA_COLORS.primary,
            fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '1.8rem' : size === 'xl' ? '2.4rem' : '1.4rem'
          }}
        >
          LUMIA
        </span>
      </div>
    );
  }

  // 4. VARIANTE FULL (OFICIAL COMPLETO TRANSPARENTE O BLANCO)
  const imageSrc = background === 'white'
    ? LUMIA_ASSETS.logoOficialBlanco
    : LUMIA_ASSETS.logoFinalTransparente;

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${sizeClasses[size] || sizeClasses.md} ${bgClasses} ${className}`}
    />
  );
}

export default Logo;
