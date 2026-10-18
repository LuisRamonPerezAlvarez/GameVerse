import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ShieldCheck, Database, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Columna 1: Marca y descripción */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="tracking-tight text-white font-extrabold text-xl">GameVerse</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Plataforma web de exploración de videojuegos y gestión de colecciones personalizadas. Proyecto de desarrollo full-stack para demostración académica universitaria.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bcrypt + JWT + Cookies HttpOnly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>SQLite Persistente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>REST API Externa</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/juegos" className="hover:text-indigo-400 transition-colors">
                  Catálogo de videojuegos
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="hover:text-indigo-400 transition-colors">
                  Colección de favoritos
                </Link>
              </li>
              <li>
                <Link to="/registro" className="hover:text-indigo-400 transition-colors">
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Arquitectura Académica */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Unidad 3: Web</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Seguridad web y protección XSS/CSRF</li>
              <li>• Hash seguro de contraseñas con bcrypt</li>
              <li>• Consultas SQL parametrizadas</li>
              <li>• Consumo seguro de APIs externas</li>
              <li>• Manejo de sesiones y tokens JWT</li>
              <li>• Variables de entorno .env</li>
            </ul>
          </div>
        </div>

        {/* Separador y Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GameVerse. Diseñado para fines educativos y demostración en vivo.</p>
          <div className="flex items-center gap-4">
            <span>Datos provistos por FreeToGame & RAWG API</span>
            <span aria-hidden="true">·</span>
            <span>Node.js + React + SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
