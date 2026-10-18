import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import { validateEmail } from '../utils/validation.js';

const AUTH_ART = '/src/assets/images/auth_gaming_art_1792208713065.jpg';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/juegos';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.message || 'Ingresa un correo electrónico válido.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor introduce tu contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(emailCheck.normalized, password);
      showToast('¡Sesión iniciada con éxito! Bienvenido.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Credenciales incorrectas o error en el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Columna Izquierda: Imagen decorativa */}
        <div className="relative hidden md:block bg-slate-950 overflow-hidden">
          <img
            src={AUTH_ART}
            alt="Ilustración Gaming GameVerse"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2 text-white">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Autenticación Segura</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">Accede a tu biblioteca</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inicia sesión para gestionar tus títulos marcados, consultar plataformas disponibles y mantener tu colección sincronizada.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-slate-400 mt-1">
              Ingresa tus credenciales para acceder a GameVerse.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Correo electrónico */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/60 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enlace a Registro */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>¿Aún no tienes cuenta? </span>
            <Link to="/registro" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Crea tu cuenta aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
