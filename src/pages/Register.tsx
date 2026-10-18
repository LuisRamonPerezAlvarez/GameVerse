import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Check, X as XIcon, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/Toast.js';
import {
  checkPasswordStrength,
  validateUsername,
  validateEmail,
} from '../utils/validation.js';

const AUTH_ART = '/src/assets/images/auth_gaming_art_1792208713065.jpg';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Comprobación de reglas de contraseña en vivo
  const passwordChecks = checkPasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones en cliente antes de enviar
    const userCheck = validateUsername(username);
    if (!userCheck.valid) {
      setErrorMessage(userCheck.message || 'Nombre de usuario inválido.');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.message || 'Correo electrónico inválido.');
      return;
    }

    if (!passwordChecks.isValid) {
      setErrorMessage('La contraseña no cumple con todos los requisitos de seguridad requeridos.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(username.trim(), emailCheck.normalized, password, confirmPassword);
      showToast('¡Cuenta creada con éxito! Bienvenido a GameVerse.', 'success');
      navigate('/juegos');
    } catch (err: any) {
      setErrorMessage(err.message || 'No fue posible registrar la cuenta. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Columna Izquierda: Imagen artística y contexto */}
        <div className="relative hidden md:block bg-slate-950 overflow-hidden">
          <img
            src={AUTH_ART}
            alt="Ilustración Gaming GameVerse"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2 text-white">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Protección y Privacidad</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">Tu colección segura</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tus credenciales están protegidas con el algoritmo de hash bcrypt y sesiones HttpOnly inmunes al acceso no autorizado por scripts.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Formulario interactivo */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Crear cuenta en GameVerse</h2>
            <p className="text-sm text-slate-400 mt-1">
              Únete para guardar videojuegos y sincronizar tus favoritos.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed flex items-start gap-2">
              <XIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre de usuario */}
            <div>
              <label htmlFor="reg-username" className="block text-xs font-medium text-slate-300 mb-1.5">
                Nombre de usuario
              </label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. alex_gamer"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-colors"
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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

              {/* Indicador de requisitos de seguridad de la contraseña */}
              <div className="mt-2.5 p-2.5 bg-slate-950/40 rounded-lg border border-white/5 space-y-1 text-xs">
                <span className="text-slate-400 block font-medium">Requisitos de contraseña:</span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${passwordChecks.minLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {passwordChecks.minLength ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 text-center">•</span>}
                    <span>8+ caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {passwordChecks.hasUpper ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 text-center">•</span>}
                    <span>1 mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {passwordChecks.hasLower ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 text-center">•</span>}
                    <span>1 minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {passwordChecks.hasNumber ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 text-center">•</span>}
                    <span>1 número</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/60 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-rose-400 mt-1">Las contraseñas no coinciden todavía.</p>
              )}
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
                    <span>Creando cuenta segura...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear cuenta</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enlace a Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>¿Ya tienes una cuenta registrada? </span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
