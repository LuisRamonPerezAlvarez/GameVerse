/**
 * Reglas puras de validación y formateo para GameVerse.
 * Desacopladas del DOM para pruebas unitarias con node:test.
 */

export interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

export function checkPasswordStrength(password: string): PasswordChecks {
  const minLength = (password || '').length >= 8;
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    isValid: minLength && hasUpper && hasLower && hasNumber,
  };
}

export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'El nombre de usuario es obligatorio.' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, message: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  }
  if (trimmed.length > 25) {
    return { valid: false, message: 'El nombre de usuario no puede exceder 25 caracteres.' };
  }
  // Permitir letras, números, guiones y guiones bajos
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      message: 'El nombre de usuario solo puede contener letras, números, guiones (-) y guiones bajos (_).',
    };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; message?: string; normalized: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'El correo electrónico es obligatorio.', normalized: '' };
  }
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, message: 'Ingresa un formato de correo electrónico válido.', normalized };
  }
  return { valid: true, normalized };
}

export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  // Eliminar caracteres de control y limitar longitud a 80 caracteres
  return query
    .replace(/[<>'"&;`$]/g, '')
    .trim()
    .slice(0, 80);
}

export function formatRating(rating?: number | null): string {
  if (rating === undefined || rating === null || isNaN(rating) || rating <= 0) {
    return 'S/C'; // Sin calificación
  }
  return rating.toFixed(1);
}

export function extractReleaseYear(dateStr?: string | null): string {
  if (!dateStr) return 'N/D';
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : 'N/D';
}
