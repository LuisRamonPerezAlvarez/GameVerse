import rateLimit from 'express-rate-limit';

/**
 * Limitador estricto para operaciones de autenticación (Login y Registro)
 * Previene ataques de fuerza bruta y saturación de cuentas
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 intentos por IP en 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes de autenticación desde esta dirección. Por favor inténtalo nuevamente en 15 minutos.',
    },
  },
});

/**
 * Limitador general para consultas a endpoints de videojuegos
 * Protege contra abuso de cuotas en servicios externos
 */
export const gamesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 150, // Máximo 150 consultas cada 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Has alcanzado el límite temporal de consultas de videojuegos. Espera un momento antes de continuar explorando.',
    },
  },
});
