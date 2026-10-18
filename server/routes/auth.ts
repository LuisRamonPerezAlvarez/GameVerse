import { Router, Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import { UsersService } from '../services/usersService.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { ENV } from '../config/env.js';

const router = Router();

// Configuración de cookie segura
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.isProduction,
  sameSite: (ENV.isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  path: '/',
};

/**
 * POST /api/auth/register
 * Registra un nuevo usuario, realiza hash con bcrypt y devuelve cookie HttpOnly + token
 */
router.post(
  '/register',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerSchema.parse(req.body);

      const user = await UsersService.register(
        validated.username,
        validated.email,
        validated.password
      );

      const token = UsersService.generateToken(user);
      res.cookie('gv_token', token, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: {
          message: 'Cuenta creada con éxito en GameVerse.',
          user,
          token, // Enviado también para clientes que prefieran Bearer headers
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/login
 * Inicia sesión verificando hash con bcrypt y asigna cookie HttpOnly
 */
router.post(
  '/login',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body);

      const user = await UsersService.login(validated.email, validated.password);
      const token = UsersService.generateToken(user);

      res.cookie('gv_token', token, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        data: {
          message: 'Bienvenido de nuevo a GameVerse.',
          user,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/auth/me
 * Obtiene los datos del usuario autenticado actual
 */
router.get(
  '/me',
  requireAuth,
  (req: AuthenticatedRequest, res: Response): void => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
);

/**
 * POST /api/auth/logout
 * Cierra la sesión invalidando la cookie HttpOnly
 */
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('gv_token', {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: (ENV.isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Sesión finalizada correctamente.',
    },
  });
});

export default router;
