import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Star, Monitor, Smartphone, Gamepad } from 'lucide-react';
import { GameSummary } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from './Toast.js';
import { formatRating, extractReleaseYear } from '../utils/validation.js';

interface GameCardProps {
  game: GameSummary;
  onFavoriteChange?: (gameId: string, added: boolean) => void;
}

const DEFAULT_COVER = '/src/assets/images/default_game_placeholder_1792208712389.jpg';

export const GameCard: React.FC<GameCardProps> = ({ game, onFavoriteChange }) => {
  const { isAuthenticated, favoriteIds, toggleFavorite } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isFavorited = favoriteIds.has(String(game.id));

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Inicia sesión para guardar este juego en tus favoritos.', 'info');
      navigate('/login');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await toggleFavorite(game);
      showToast(res.message, res.added ? 'success' : 'info');
      if (onFavoriteChange) {
        onFavoriteChange(String(game.id), res.added);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar favoritos.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const primaryGenre = game.genres && game.genres.length > 0 ? game.genres[0].name : 'Videojuego';
  const releaseYear = extractReleaseYear(game.released);
  const ratingText = formatRating(game.rating);

  return (
    <article className="group relative bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-[380px]">
      {/* Portada del juego */}
      <div className="relative w-full h-48 bg-slate-950 overflow-hidden shrink-0">
        <img
          src={imgError || !game.background_image ? DEFAULT_COVER : game.background_image}
          alt={`Portada de ${game.name}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Botón de favorito flotante en la esquina */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isUpdating}
          aria-label={isFavorited ? `Eliminar ${game.name} de favoritos` : `Guardar ${game.name} en favoritos`}
          title={isFavorited ? 'Eliminar de favoritos' : 'Guardar en favoritos'}
          className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            isFavorited
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Calificación unboxed */}
        {game.rating && game.rating > 0 ? (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs font-semibold text-amber-300 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono">{ratingText}</span>
          </div>
        ) : null}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata unboxed según constitución de diseño */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <span>{primaryGenre}</span>
            <span aria-hidden="true">·</span>
            <span>{releaseYear}</span>
          </div>

          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            <Link to={`/juegos/${game.id}`} className="hover:underline focus:outline-none">
              {game.name}
            </Link>
          </h3>
        </div>

        {/* Footer de la tarjeta con plataformas y enlace */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-[180px]">
            {game.platforms && game.platforms.length > 0 ? (
              game.platforms.slice(0, 2).map((p, idx) => (
                <span key={idx} className="truncate">
                  {p.name}
                  {idx < Math.min(1, game.platforms.length - 1) && ', '}
                </span>
              ))
            ) : (
              <span>Plataforma PC</span>
            )}
          </div>
          <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
            Ver detalle →
          </span>
        </div>
      </div>
    </article>
  );
};
