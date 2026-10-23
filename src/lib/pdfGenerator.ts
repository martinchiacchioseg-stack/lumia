/**
 * LUMIA - LIBRETA ÚNICA DE MASCOTAS, INFORMES Y ADOPCIONES
 * Exportador TypeScript / Adaptador del Servicio de Generación de PDFs
 */

import { generateLibreta, downloadLibretaPdf, getLibretaPdfBlobUrl } from '../services/pdfService';
import type { jsPDF } from 'jspdf';

export interface MascotaData {
  nombre_actual?: string;
  nombre?: string;
  especie?: 'perro' | 'gato' | 'otro' | string;
  raza?: string;
  sexo?: 'macho' | 'hembra' | string;
  edad_estimada?: string;
  fecha_nacimiento_aproximada?: string;
  fecha_nacimiento?: string;
  peso?: string;
  tamano?: string;
  pelaje_color_senas_particulares?: string;
  color?: string;
  microchip?: string;
  codigo_interno?: string;
  ubicacion_rescate?: string;
  foto_portada?: string;
  foto?: string;
  alimentacion_recomendada?: string;
  notas_conducta?: string;
}

export interface AdoptanteData {
  nombre_apellido?: string;
  nombre?: string;
  dni_cuit?: string;
  dni?: string;
  telefono_whatsapp?: string;
  telefono?: string;
  email?: string;
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_piso_depto?: string;
  domicilio?: string;
  direccion_barrio?: string;
  direccion_localidad?: string;
  ciudad?: string;
  direccion_provincia?: string;
  provincia?: string;
  cp?: string;
  tipo_vivienda?: string;
}

export interface AdopcionData {
  fecha_entrega?: string;
  modalidad_entrega?: string;
  periodo_adaptacion_dias?: number;
  compromiso_castracion?: boolean;
  fecha_limite_castracion?: string;
  observaciones?: string;
}

export interface EventoSaludData {
  fecha: string;
  tipo_evento: string;
  producto_o_detalle: string;
  profesional_veterinaria?: string;
  lugar?: string;
  fecha_proximo_refuerzo_o_vencimiento?: string;
}

export interface LibretaOptions {
  qrCodeUrl?: string;
  organizationName?: string;
  organizationStampUrl?: string | null;
  includeActa?: boolean;
}

export interface LibretaPayload {
  mascota: MascotaData;
  adoptante?: AdoptanteData;
  adopcion?: AdopcionData;
  historial?: EventoSaludData[];
  options?: LibretaOptions;
}

export async function generateLibretaPdf(data: LibretaPayload): Promise<jsPDF> {
  return generateLibreta(data);
}

export async function downloadLibreta(data: LibretaPayload, customFilename?: string): Promise<string> {
  return downloadLibretaPdf(data, customFilename);
}

export async function previewLibreta(data: LibretaPayload): Promise<string> {
  return getLibretaPdfBlobUrl(data);
}
