import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Star,
  Calendar,
  Globe,
  Monitor,
  Cpu,
  Layers,
  Building,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { GameDetail as GameDetailType } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { formatRating, extractReleaseYear } from '../utils/validation.js';

const DEFAULT_COVER = '/src/assets/images/default_game_placeholder_1792208712389.jpg';

export const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, favoriteIds, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const [game, setGame] = useState<GameDetailType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadGame() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.games.getById(id);
        if (mounted) {
          setGame(data.game);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'No fue posible cargar la información de este videojuego.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadGame();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Consultando detalles con el servicio de videojuegos...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Videojuego no encontrado</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {error || 'El título solicitado no existe en la base de datos o fue removido del catálogo.'}
        </p>
        <div className="pt-2">
          <Link
            to="/juegos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const isFavorited = favoriteIds.has(String(game.id));

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Inicia sesión para guardar este título en tus favoritos.', 'info');
      navigate('/login');
      return;
    }

    try {
      setIsUpdatingFavorite(true);
      const res = await toggleFavorite(game);
      showToast(res.message, res.added ? 'success' : 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar favoritos.', 'error');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const releaseYear = extractReleaseYear(game.released);
  const ratingText = formatRating(game.rating);

  return (
    <div className="pb-24 space-y-12">
      {/* SECCIÓN HERO CON BACKDROP */}
      <section className="relative min-h-[420px] lg:min-h-[480px] flex items-end overflow-hidden border-b border-white/10">
        {/* Fondo de pantalla / Backdrop */}
        <div className="absolute inset-0 bg-slate-950">
          <img
            src={imgError || !game.background_image ? DEFAULT_COVER : game.background_image}
            alt={game.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top opacity-35 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Botón flotante para regresar */}
        <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20">
          <Link
            to="/juegos"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>

        {/* Contenido superpuesto en el Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end gap-6 sm:gap-8">
            {/* Portada en miniatura destacada */}
            <div className="w-40 sm:w-48 lg:w-56 aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 shrink-0">
              <img
                src={imgError || !game.background_image ? DEFAULT_COVER : game.background_image}
                alt={`Portada de ${game.name}`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Datos principales */}
            <div className="space-y-4 flex-1">
              {/* Metadatos unboxed */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                {game.genres && game.genres.length > 0 && (
                  <span>{game.genres.map((g) => g.name).join(' / ')}</span>
                )}
                {releaseYear !== 'N/D' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Lanzamiento: {releaseYear}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {game.name}
              </h1>

              {/* Badges de puntuación y botón de favorito */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {game.rating && game.rating > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{ratingText} / 5.0</span>
                  </div>
                ) : null}

                {game.metacritic && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                    <span>Metacritic: {game.metacritic}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isUpdatingFavorite}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isFavorited
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500'
                      : 'bg-slate-900/90 text-slate-200 border border-white/10 hover:border-indigo-500/40 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? 'En tus favoritos' : 'Guardar en favoritos'}</span>
                </button>

                {game.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Sitio Oficial</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUERPO PRINCIPAL: DESCRIPCIÓN Y ESPECIFICACIONES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Columna Izquierda: Descripción y Capturas */}
        <div className="lg:col-span-2 space-y-10">
          {/* Descripción Sanitizada */}
          <section className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Acerca del videojuego</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {game.description}
            </div>
          </section>

          {/* Galería de capturas de pantalla si existen */}
          {game.screenshots && game.screenshots.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Capturas de pantalla</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.screenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video group"
                  >
                    <img
                      src={shot}
                      alt={`Captura ${idx + 1} de ${game.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requisitos del sistema si están disponibles */}
          {game.requirements && Object.values(game.requirements).some(Boolean) && (
            <section className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h2>Requisitos Mínimos del Sistema (PC)</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                {game.requirements.os && (
                  <div>
                    <span className="block text-slate-400 font-medium">Sistema Operativo:</span>
                    <span>{game.requirements.os}</span>
                  </div>
                )}
                {game.requirements.processor && (
                  <div>
                    <span className="block text-slate-400 font-medium">Procesador:</span>
                    <span>{game.requirements.processor}</span>
                  </div>
                )}
                {game.requirements.memory && (
                  <div>
                    <span className="block text-slate-400 font-medium">Memoria RAM:</span>
                    <span>{game.requirements.memory}</span>
                  </div>
                )}
                {game.requirements.graphics && (
                  <div>
                    <span className="block text-slate-400 font-medium">Gráficos:</span>
                    <span>{game.requirements.graphics}</span>
                  </div>
                )}
                {game.requirements.storage && (
                  <div>
                    <span className="block text-slate-400 font-medium">Almacenamiento:</span>
                    <span>{game.requirements.storage}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Columna Derecha: Ficha Técnica */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">
              Ficha Técnica
            </h3>

            {/* Plataformas */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span>Plataformas compatibles</span>
              </span>
              <p className="text-white font-medium">
                {game.platforms && game.platforms.length > 0
                  ? game.platforms.map((p) => p.name).join(', ')
                  : 'PC (Windows)'}
              </p>
            </div>

            {/* Desarrollador */}
            {game.developers && game.developers.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Desarrollador</span>
                </span>
                <p className="text-white font-medium">{game.developers.join(', ')}</p>
              </div>
            )}

            {/* Editor / Publisher */}
            {game.publishers && game.publishers.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Editor</span>
                </span>
                <p className="text-white font-medium">{game.publishers.join(', ')}</p>
              </div>
            )}

            {/* Fecha de lanzamiento */}
            {game.released && (
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fecha de lanzamiento</span>
                </span>
                <p className="text-white font-medium">{game.released}</p>
              </div>
            )}

            {/* Identificador de API */}
            <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
              <span className="block font-medium">Origen de información:</span>
              <span className="font-mono text-slate-300">
                {game.source === 'rawg' ? 'RAWG Database' : 'FreeToGame API'} (ID: {game.id})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
