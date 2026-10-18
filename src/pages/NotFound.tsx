import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Gamepad2, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Gamepad2 className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-black text-indigo-400 font-mono tracking-tight">
            404
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Misión no encontrada
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            La ruta o coordenadas que estás buscando no existen en el universo de GameVerse o han sido reubicadas.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
          <Link
            to="/juegos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explorar catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
