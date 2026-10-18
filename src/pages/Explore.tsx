import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { api } from '../services/api.js';
import { GameSummary } from '../types/index.js';
import { GameCard } from '../components/GameCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';
import { SearchBar } from '../components/SearchBar.js';
import { FilterPanel } from '../components/FilterPanel.js';

export const Explore: React.FC = () => {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [genres, setGenres] = useState<Array<{ id: string | number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y parámetros
  const [search, setSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedOrdering, setSelectedOrdering] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [apiSource, setApiSource] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const querySequenceRef = useRef<number>(0);

  // Cargar géneros iniciales
  useEffect(() => {
    let mounted = true;
    async function loadGenres() {
      try {
        const res = await api.games.genres();
        if (mounted && res.genres) {
          setGenres(res.genres);
        }
      } catch (err) {
        // Ignorar fallo no crítico en géneros
      }
    }
    loadGenres();
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar videojuegos según filtros
  const fetchGames = useCallback(async () => {
    // Cancelar solicitud anterior en vuelo para evitar condiciones de carrera (out-of-order)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentSequence = ++querySequenceRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.games.list(
        {
          search,
          page,
          pageSize: 12,
          genre: selectedGenre !== 'all' ? selectedGenre : undefined,
          ordering: selectedOrdering || undefined,
        },
        controller.signal
      );

      // Descartar si una solicitud más reciente ya se completó
      if (currentSequence === querySequenceRef.current) {
        setGames(data.results || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.count || 0);
        setApiSource(data.apiSource || '');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Cancelado intencionalmente
      if (currentSequence === querySequenceRef.current) {
        setError(err.message || 'Error al conectar con el catálogo de videojuegos.');
        setGames([]);
      }
    } finally {
      if (currentSequence === querySequenceRef.current) {
        setIsLoading(false);
      }
    }
  }, [search, page, selectedGenre, selectedOrdering]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1); // Reiniciar a la primera página en nueva búsqueda
  };

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    setPage(1);
  };

  const handleOrderingChange = (ord: string) => {
    setSelectedOrdering(ord);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('all');
    setSelectedOrdering('');
    setPage(1);
  };

  const isFiltered = Boolean(search || (selectedGenre && selectedGenre !== 'all') || selectedOrdering);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Encabezado de la página */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Catálogo Global
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explorar Videojuegos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Filtra por género, busca tus títulos favoritos y consúltalos en detalle.
            </p>
          </div>

          {totalCount > 0 && (
            <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              <span>{totalCount} títulos encontrados</span>
            </div>
          )}
        </div>
      </div>

      {/* Aviso informativo de la API externa activa */}
      {apiSource && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-start sm:items-center gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <span className="font-medium text-white">Servicio activo:</span> {apiSource}.{' '}
            <span className="text-slate-400">
              (Puedes configurar opcionalmente tu propia clave RAWG_API_KEY en <code className="text-indigo-300">server/.env</code>).
            </span>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y controles de filtrado */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-5">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          isLoading={isLoading}
        />

        <FilterPanel
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
          selectedOrdering={selectedOrdering}
          onOrderingChange={handleOrderingChange}
          onReset={handleResetFilters}
          isFiltered={isFiltered}
        />
      </div>

      {/* ESTADO 1: ERROR CON BOTÓN DE REINTENTO */}
      {error && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-rose-500/20 p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No se pudo cargar el catálogo</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchGames()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar carga</span>
          </button>
        </div>
      )}

      {/* ESTADO 2: CARGANDO CON SKELETON CARDS */}
      {!error && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ESTADO 3: RESULTADOS ENCONTRADOS */}
      {!error && !isLoading && games.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Paginación accesible y fluida */}
          {totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-xs font-mono text-slate-300 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-white/5">
                Página <span className="text-indigo-400 font-bold">{page}</span> de {totalPages}
              </div>

              <button
                type="button"
                onClick={() => {
                  setPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= totalPages}
                aria-label="Página siguiente"
                className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ESTADO 4: SIN RESULTADOS */}
      {!error && !isLoading && games.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 p-8 space-y-4">
          <Gamepad2 className="w-14 h-14 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No se encontraron videojuegos</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              No hay títulos que coincidan con tus criterios de búsqueda o filtros actuales.
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              <span>Restablecer búsqueda</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
