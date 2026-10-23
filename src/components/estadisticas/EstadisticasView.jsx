import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatDateTime } from '../../lib/formatters';
import { BarChart3, PieChart, ShieldCheck, History, HeartHandshake, Dog, Cat, CheckCircle } from 'lucide-react';

export function EstadisticasView() {
  const { animales, adopciones, auditoria, eventosSalud } = useData();

  const [activeTab, setActiveTab] = useState('metricas'); // 'metricas' | 'auditoria'

  // Estadísticas calculadas
  const totalRescates = animales.length;
  const adoptados = animales.filter(a => a.estado_caso === 'adoptado').length;
  const enTransito = animales.filter(a => a.estado_caso === 'en tránsito').length;
  const enAdopcion = animales.filter(a => a.estado_caso === 'en adopción').length;
  const recienRescatados = animales.filter(a => a.estado_caso === 'rescatado').length;

  const perros = animales.filter(a => a.especie === 'perro').length;
  const gatos = animales.filter(a => a.especie === 'gato').length;

  // Tasa de castración
  const castraciones = eventosSalud.filter(e => e.tipo_evento === 'castración/esterilización').length;
  const tasaCastracion = totalRescates > 0 ? Math.round((castraciones / totalRescates) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-patita-600" />
          <span>Panel de Estadísticas y Registro de Auditoría</span>
        </h1>
        <p className="text-xs text-stone-500">
          Métricas de rescates, impacto de adopciones y trazabilidad completa de acciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs sm:text-sm font-bold gap-3">
        <button
          onClick={() => setActiveTab('metricas')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'metricas' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Métricas Operativas</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'auditoria' ? 'border-patita-500 text-patita-700' : 'border-transparent text-stone-500'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora de Auditoría ({auditoria.length})</span>
        </button>
      </div>

      {activeTab === 'metricas' && (
        <div className="space-y-6">
          {/* Tarjetas Superiores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Rescatados</span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">{totalRescates}</p>
              <span className="text-[11px] text-stone-500 mt-1 block">perros y gatos ingresados</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Adopciones Concretadas</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{adoptados}</p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                {totalRescates > 0 ? Math.round((adoptados / totalRescates) * 100) : 0}% de efectividad
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tasa de Castración</span>
              <p className="text-3xl font-extrabold text-purple-600 mt-1">{tasaCastracion}%</p>
              <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
                {castraciones} cirugías realizadas
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">En Tránsito Activo</span>
              <p className="text-3xl font-extrabold text-patita-600 mt-1">{enTransito + enAdopcion}</p>
              <span className="text-[11px] text-patita-700 font-semibold mt-1 block">esperando familia definitiva</span>
            </div>
          </div>

          {/* Gráficos de barra representativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estados de Casos */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Distribución de Casos Actuales</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-stone-700">Adoptados (Hogar Definitivo)</span>
                    <span className="text-emerald-700">{adoptados}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalRescates > 0 ? (adoptados / totalRescates) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-stone-700">En Adopción Activa</span>
                    <span className="text-patita-700">{enAdopcion}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-patita-500 h-full rounded-full" style={{ width: `${totalRescates > 0 ? (enAdopcion / totalRescates) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-stone-700">En Hogar de Tránsito</span>
                    <span className="text-amber-700">{enTransito}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalRescates > 0 ? (enTransito / totalRescates) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-stone-700">Recién Rescatados / En Evaluación</span>
                    <span className="text-sky-700">{recienRescatados}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${totalRescates > 0 ? (recienRescatados / totalRescates) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Especies */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Rescates por Especie</h3>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <Dog className="w-8 h-8 text-amber-600 mx-auto mb-1" />
                  <span className="text-2xl font-extrabold text-amber-900">{perros}</span>
                  <span className="text-xs text-amber-700 block font-semibold">Perros Rescatados</span>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center">
                  <Cat className="w-8 h-8 text-sky-600 mx-auto mb-1" />
                  <span className="text-2xl font-extrabold text-sky-900">{gatos}</span>
                  <span className="text-xs text-sky-700 block font-semibold">Gatos Rescatados</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 text-center pt-2">
                Rescates coordinados en Buenos Aires y Gran Buenos Aires.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= PESTAÑA: BITÁCORA DE AUDITORÍA ================= */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-100 bg-stone-50/70">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Registro Inmutable de Actividad de Usuarios
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario Responsable</th>
                  <th className="py-3 px-4">Acción Realizada</th>
                  <th className="py-3 px-4">Módulo Afectado</th>
                  <th className="py-3 px-4">Registro Involucrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditoria.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4 text-stone-500 font-mono text-[11px]">
                      {formatDateTime(log.fecha)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-900">
                      {log.usuario_nombre}
                    </td>
                    <td className="py-2.5 px-4 text-patita-700 font-semibold">
                      {log.accion}
                    </td>
                    <td className="py-2.5 px-4 text-stone-600 capitalize">
                      {log.tabla_afectada}
                    </td>
                    <td className="py-2.5 px-4 text-stone-800 font-medium">
                      {log.registro_nombre}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
