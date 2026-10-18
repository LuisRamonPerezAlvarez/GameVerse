import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Shield, Database, ArrowRight, Gamepad2, Layers } from 'lucide-react';
import { api } from '../services/api.js';
import { GameSummary } from '../types/index.js';
import { GameCard } from '../components/GameCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';
import { useAuth } from '../context/AuthContext.js';

const HERO_IMAGE = '/src/assets/images/hero_gaming_universe_1792208711848.jpg';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiSource, setApiSource] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function loadFeatured() {
      try {
        const data = await api.games.list({ page: 1, pageSize: 6 });
        if (mounted) {
          setFeaturedGames(data.results || []);
          setApiSource(data.apiSource);
        }
      } catch (err) {
        console.warn('No fue posible cargar videojuegos destacados:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeatured();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* SECCIÓN 1: HERO PRINCIPAL */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-white/10">
        {/* Imagen de fondo con scrims medidos para legibilidad superior */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Universo Gaming GameVerse"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            {/* Kicker editorial natural sin píldoras */}
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Plataforma Digital de Descubrimiento
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] [text-wrap:balance]">
              Tu siguiente aventura comienza aquí
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Descubre nuevos videojuegos, explora sus mundos, revisa sus plataformas y crea tu propia colección de favoritos respaldada en una cuenta personal segura.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/juegos"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Explorar videojuegos</span>
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/favoritos"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Ver mi colección</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/registro"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Crear cuenta gratuita</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: VIDEOJUEGOS DESTACADOS OBTENIDOS DE LA API */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              Catálogo en Vivo
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Títulos destacados de la comunidad
            </h2>
            {apiSource && (
              <p className="text-xs text-slate-400 mt-1">
                Conectado en tiempo real con {apiSource}
              </p>
            )}
          </div>

          <Link
            to="/juegos"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cuadrícula de tarjetas destacadas */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : featuredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-white/5 p-8">
            <Gamepad2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No se pudieron cargar los juegos destacados.</p>
            <Link
              to="/juegos"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              Ir a explorar catálogo
            </Link>
          </div>
        )}
      </section>

      {/* SECCIÓN 3: ARQUITECTURA Y CARACTERÍSTICAS ACADÉMICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Ingeniería de Software Web
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Pilares técnicos de GameVerse
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Demostración práctica de los fundamentos de seguridad, persistencia, consumo de servicios REST y diseño responsivo para la materia de Desarrollo Web.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1: Seguridad */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">01. Seguridad Integral</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hash criptográfico de contraseñas mediante bcrypt (12 rondas de salt), cookies HttpOnly con atributos SameSite y protección contra inyección SQL con sentencias preparadas.
            </p>
          </div>

          {/* Pilar 2: APIs REST */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">02. Servicios Web REST</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Backend Express que actúa como intermediario seguro para consumir APIs externas (RAWG y FreeToGame), gestionando tiempos de espera, sanitización de datos y rate limiting.
            </p>
          </div>

          {/* Pilar 3: Base de Datos */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">03. Persistencia Relacional</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Base de datos SQLite persistente con integridad referencial, claves foráneas activadas y eliminación en cascada para la colección personal de favoritos de cada usuario.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: CALL TO ACTION FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¿Listo para comenzar tu colección?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Regístrate en segundos para guardar tus títulos preferidos, comparar plataformas y tener tu biblioteca digital organizada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/registro"
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg transition-all"
                >
                  Registrarse gratis
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-xl border border-white/10 transition-all"
                >
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <Link
                to="/juegos"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg transition-all"
              >
                Explorar el catálogo completo
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
