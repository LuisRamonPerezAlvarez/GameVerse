import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { ENV } from './server/config/env.js';
import authRoutes from './server/routes/auth.js';
import gamesRoutes from './server/routes/games.js';
import favoritesRoutes from './server/routes/favorites.js';
import healthRoutes from './server/routes/health.js';
import { errorHandler } from './server/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Cabeceras de seguridad con Helmet (permitiendo la carga en el iframe de AI Studio)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
    })
  );

  // Configuración de CORS para solicitudes con credenciales
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Parseo de cookies y cuerpos JSON con límite de tamaño
  app.use(cookieParser());
  app.use(express.json({ limit: '50kb' }));

  // Rutas de la API REST
  app.use('/api/auth', authRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/health', healthRoutes);

  // Integración de Vite / Archivos estáticos
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Modo Desarrollo: montar middlewares de Vite directamente en Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo Producción: servir los archivos compilados de la carpeta dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Middleware centralizado de gestión de errores
  app.use(errorHandler);

  const portArgIndex = process.argv.indexOf('--port');
  const portArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
  const PORT = !isNaN(portArg) ? portArg : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GameVerse Server] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
    console.log(`[GameVerse Server] Base de datos SQLite activa en: ${ENV.DATABASE_PATH}`);
  });
}

startServer().catch((err) => {
  console.error('[GameVerse Server Error Fatal]:', err);
  process.exit(1);
});
