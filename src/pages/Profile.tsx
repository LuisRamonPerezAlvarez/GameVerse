import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Bookmark, ShieldCheck, LogOut, Lock, KeyRound, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';

export const Profile: React.FC = () => {
  const { user, favorites, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sesión finalizada con éxito.', 'info');
      navigate('/');
    } catch {
      showToast('Error al cerrar sesión.', 'error');
    }
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Fecha no registrada';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Encabezado del Perfil */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              Perfil de Jugador
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user.username}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-medium border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas y Colección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Tarjeta de Favoritos */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Colección Personal
            </span>
            <Bookmark className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono">{favorites.length}</div>
            <p className="text-xs text-slate-400 mt-1">Videojuegos guardados en tu biblioteca</p>
          </div>
          <div className="pt-2">
            <Link
              to="/favoritos"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Ver y gestionar mis favoritos →</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta de Fecha de Registro */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Antigüedad de Cuenta
            </span>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">{formattedDate}</div>
            <p className="text-xs text-slate-400 mt-1">Miembro registrado de la comunidad GameVerse</p>
          </div>
          <div className="pt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Cuenta activa y verificada</span>
          </div>
        </div>
      </div>

      {/* Auditoría de Seguridad Académica */}
      <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2>Seguridad y Protección de tus Datos</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta plataforma implementa estándares de seguridad requeridos para proyectos de desarrollo web full-stack:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Contraseña Cifrada</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tu contraseña original nunca se guarda en texto plano; únicamente se almacena su hash seguro con bcrypt y salt dinámico.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Cookies HttpOnly</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tu sesión se gestiona con tokens JWT encapsulados en cookies con bandera HttpOnly, imposibles de ser leídas por scripts maliciosos de terceros.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Consultas Parametrizadas</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tus favoritos están vinculados a tu ID en SQLite mediante consultas preparadas que bloquean ataques de inyección SQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
