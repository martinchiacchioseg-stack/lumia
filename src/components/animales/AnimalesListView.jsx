import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Badge } from '../common/Badge';
import { formatDate } from '../../lib/formatters';
import { ModalFlyerRedes } from './ModalFlyerRedes';
import { Search, Plus, Filter, Dog, Cat, MapPin, Calendar, Heart, Share2, ExternalLink, Sparkles } from 'lucide-react';

export function AnimalesListView({ onSelectAnimal, onOpenNewAnimal }) {
  const { animales } = useData();
  const { hasPermission } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterEspecie, setFilterEspecie] = useState('todos');
  const [flyerAnimal, setFlyerAnimal] = useState(null);

  // Filtrado
  const filtered = animales.filter(animal => {
    if (animal.archivado) return false;

    const matchesSearch = 
      animal.nombre_actual.toLowerCase().includes(search.toLowerCase()) ||
      animal.codigo_interno.toLowerCase().includes(search.toLowerCase()) ||
      (animal.nombre_anterior_apodo && animal.nombre_anterior_apodo.toLowerCase().includes(search.toLowerCase()));

    const matchesEstado = filterEstado === 'todos' || animal.estado_caso === filterEstado;
    const matchesEspecie = filterEspecie === 'todos' || animal.especie === filterEspecie;

    return matchesSearch && matchesEstado && matchesEspecie;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Dog className="w-6 h-6 text-patita-600" />
            <span>Animales Rescatados</span>
          </h1>
          <p className="text-xs text-stone-500">Gestión de fichas, historias clínicas y estados de caso</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${window.location.origin}${window.location.pathname}?portal=adopciones`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-lumia-700 font-bold text-xs sm:text-sm border border-lumia-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
            title="Abrir el Portal Público de Adopciones y Noticias (Link libre para compartir)"
          >
            <ExternalLink className="w-4 h-4 text-lumia-600" />
            <span className="hidden sm:inline">Portal Adopciones (Link Libre)</span>
            <span className="sm:hidden">Portal</span>
          </a>

          {hasPermission('animales', 'crear') && (
            <button
              onClick={onOpenNewAnimal}
              className="px-4 py-2.5 rounded-2xl bg-lumia-500 hover:bg-lumia-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-lumia-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Rescate</span>
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código (ej: Luna, DOG-001)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:ring-2 focus:ring-patita-500 bg-white shadow-sm"
          />
        </div>

        {/* Pills de Filtros */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          {['todos', 'rescatado', 'en tránsito', 'en adopción', 'adoptado'].map(st => (
            <button
              key={st}
              onClick={() => setFilterEstado(st)}
              className={`px-3 py-1.5 rounded-full capitalize transition-all ${
                filterEstado === st 
                  ? 'bg-stone-900 text-white shadow-sm' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-stone-400 ml-2 mr-1">Especie:</span>
          {['todos', 'perro', 'gato'].map(esp => (
            <button
              key={esp}
              onClick={() => setFilterEspecie(esp)}
              className={`px-3 py-1.5 rounded-full capitalize transition-all ${
                filterEspecie === esp 
                  ? 'bg-patita-600 text-white shadow-sm' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {esp === 'perro' ? 'Perros 🐶' : esp === 'gato' ? 'Gatos 🐱' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {/* Listado en Tarjetas (Mobile-First) */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm">
          <Dog className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700">No se encontraron animales con esos filtros.</p>
          <p className="text-xs text-stone-500 mt-1">Probá cambiando el texto de búsqueda o limpiando los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(animal => (
            <div
              key={animal.id}
              onClick={() => onSelectAnimal(animal)}
              className="bg-white rounded-3xl border border-stone-200/90 hover:border-patita-400 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
            >
              {/* Foto superior */}
              <div className="h-52 bg-stone-100 relative overflow-hidden">
                <img
                  src={animal.foto_portada || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                  alt={animal.nombre_actual}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges superpuestos */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant={
                    animal.estado_caso === 'adoptado' ? 'success' :
                    animal.estado_caso === 'en adopción' ? 'primary' :
                    animal.estado_caso === 'en tránsito' ? 'warning' : 'info'
                  }>
                    {animal.estado_caso}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  {animal.codigo_interno}
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-stone-900 text-lg group-hover:text-patita-600 transition-colors">
                      {animal.nombre_actual}
                    </h3>
                    <span className="text-xs text-stone-500 font-medium capitalize">
                      {animal.especie} • {animal.sexo}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-1">
                    {animal.edad_estimada} • Tamaño {animal.tamano}
                  </p>

                  <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                    {animal.pelaje_color_senas_particulares || 'Sin señas especiales.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Rescate: {formatDate(animal.fecha_rescate)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlyerAnimal(animal);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                    title="Generar Flyer personalizado para Redes Sociales"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flyer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Generador de Flyer para Redes Sociales */}
      {flyerAnimal && (
        <ModalFlyerRedes
          animal={flyerAnimal}
          isOpen={Boolean(flyerAnimal)}
          onClose={() => setFlyerAnimal(null)}
        />
      )}
    </div>
  );
}
