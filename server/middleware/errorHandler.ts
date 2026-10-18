import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    res.status(400).json({
      success: false,
      error: {
        message: firstIssue?.message || 'Los datos enviados contienen errores de validación.',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Manejo de errores controlados con código de estado
  const statusCode = Number(err.statusCode || err.status || 500);
  const message =
    statusCode >= 500
      ? 'Ocurrió un error inesperado en el servidor. Por favor intenta más tarde.'
      : err.message || 'La solicitud no pudo ser procesada.';

  // En desarrollo mostramos el log en consola del servidor (sin exponer secretos)
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error('[Error de Servidor]:', err.message || err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
}
