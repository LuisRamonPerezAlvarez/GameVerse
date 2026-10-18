import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Trash2, Star, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { formatRating } from '../utils/validation.js';

const DEFAULT_COVER = '/src/assets/images/default_game_placeholder_1792208712389.jpg';

export const Favorites: React.FC = () => {
  const { user, favorites, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const handleRemove = async (fav: any) => {
    try {
      const res = await toggleFavorite({
        id: fav.game_id,
        name: fav.game_name,
        genres: [],
        platforms: [],
        source: 'freetogame',
      });
      showToast(res.message, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar favorito.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Colección Personal
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mis Videojuegos Favoritos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Colección persistente vinculada a la cuenta de{' '}
              <span className="text-white font-medium">{user?.username}</span>.
            </p>
          </div>

          <div className="text-xs text-slate-300 font-mono bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <span>{favorites.length} guardados</span>
          </div>
        </div>
      </div>

      {/* ESTADO CON FAVORITOS */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <article
              key={fav.id}
              className="group bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 h-[380px]"
            >
              {/* Portada */}
              <div className="relative w-full h-48 bg-slate-950 overflow-hidden shrink-0">
                <img
                  src={fav.game_image || DEFAULT_COVER}
                  alt={fav.game_name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_COVER;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Botón de eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemove(fav)}
                  aria-label={`Eliminar ${fav.game_name} de favoritos`}
                  title="Eliminar de favoritos"
                  className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-slate-950/80 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 backdrop-blur-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {fav.game_rating && (
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs font-semibold text-amber-300 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-mono">{formatRating(fav.game_rating)}</span>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1.5 truncate">
                    <span>{fav.game_genre || 'Videojuego'}</span>
                    {fav.game_platform && (
                      <>
                        <span aria-hidden="true" className="mx-1">·</span>
                        <span>{fav.game_platform}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    <Link to={`/juegos/${fav.game_id}`}>
                      {fav.game_name}
                    </Link>
                  </h3>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-400">
                    Añadido {new Date(fav.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/juegos/${fav.game_id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* ESTADO VACÍO */
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Tu colección está vacía</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Aún no has añadido ningún videojuego a tus favoritos. Explora nuestro catálogo y presiona el icono de marcador en cualquier título que te llame la atención.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/juegos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
            >
              <Compass className="w-4 h-4" />
              <span>Explorar catálogo ahora</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
