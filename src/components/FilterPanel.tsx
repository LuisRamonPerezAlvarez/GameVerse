import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  genres: Array<{ id: string | number; name: string }>;
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  selectedOrdering: string;
  onOrderingChange: (ordering: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  genres,
  selectedGenre,
  onGenreSelect,
  selectedOrdering,
  onOrderingChange,
  onReset,
  isFiltered,
}) => {
  return (
    <div className="space-y-4">
      {/* Barra superior con ordenamiento y reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="font-medium whitespace-nowrap">Ordenar por:</span>
          <select
            value={selectedOrdering}
            onChange={(e) => onOrderingChange(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Relevancia y destacados</option>
            <option value="-released">Lanzamientos más recientes</option>
            <option value="name">Alfabético (A - Z)</option>
            <option value="-name">Alfabético (Z - A)</option>
          </select>
        </div>

        {/* Botón de limpiar filtros */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-indigo-400 transition-colors px-2.5 py-1 rounded-md bg-slate-900/60 border border-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer filtros</span>
          </button>
        )}
      </div>

      {/* Tabs segmentados de géneros (controles funcionales interactivos) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {genres.map((g) => {
          const isSelected = selectedGenre === String(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onGenreSelect(String(g.id))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
