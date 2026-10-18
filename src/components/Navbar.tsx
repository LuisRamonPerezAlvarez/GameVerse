import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, Bookmark, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from './Toast.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, favorites } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Has cerrado sesión correctamente.', 'info');
      navigate('/');
    } catch {
      showToast('Error al cerrar sesión.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            GameVerse
          </span>
        </Link>

        {/* Zone 2: Navigation Links (single-line, clean typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link
            to="/"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              isActive('/') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/juegos"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              isActive('/juegos') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Explorar
          </Link>
          <Link
            to="/favoritos"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              isActive('/favoritos') ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            <span>Favoritos</span>
            {isAuthenticated && favorites.length > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-md font-mono">
                {favorites.length}
              </span>
            )}
          </Link>
          {isAuthenticated && (
            <Link
              to="/perfil"
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                isActive('/perfil') ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Mi Perfil
            </Link>
          )}
        </nav>

        {/* Zone 3: Primary Action / User session */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/perfil"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-200 hover:text-white transition-colors"
                title="Ir a mi perfil"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25 transition-all whitespace-nowrap shrink-0"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-medium ${
              isActive('/') ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/juegos"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-medium ${
              isActive('/juegos') ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            Explorar videojuegos
          </Link>
          <Link
            to="/favoritos"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between py-2 text-base font-medium ${
              isActive('/favoritos') ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            <span>Mis favoritos</span>
            {isAuthenticated && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">
                {favorites.length}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                to="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-slate-200"
              >
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Perfil ({user.username})</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-left py-2 text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium bg-slate-900 border border-white/10 rounded-lg text-slate-200"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-medium bg-indigo-600 rounded-lg text-white"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
