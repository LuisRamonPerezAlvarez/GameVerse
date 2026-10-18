import { Request, Response, NextFunction } from 'express';
import { UsersService, SafeUser } from '../services/usersService.js';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export function extractToken(req: Request): string | null {
  // 1. Extraer desde cookie HttpOnly
  if (req.cookies && req.cookies.gv_token) {
    return req.cookies.gv_token;
  }
  // 2. Extraer desde cabecera Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Middleware para rutas estrictamente protegidas
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Acceso no autorizado. Inicia sesión para continuar.',
      },
    });
    return;
  }

  try {
    const payload = UsersService.verifyToken(token);
    const user = UsersService.getById(payload.sub);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Sesión inválida o el usuario ya no existe.',
        },
      });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Tu sesión ha expirado o el token es inválido. Por favor inicia sesión nuevamente.',
      },
    });
  }
}

/**
 * Middleware para rutas donde el usuario puede estar autenticado o ser invitado
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = UsersService.verifyToken(token);
    const user = UsersService.getById(payload.sub);
    if (user) {
      req.user = user;
    }
  } catch {
    // Token inválido ignorado silenciosamente para invitados
  }
  next();
}
