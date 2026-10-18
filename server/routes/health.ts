import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { GamesService } from '../services/gamesService.js';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  let dbStatus = 'disconnected';
  try {
    const testStmt = db.prepare('SELECT 1 as alive');
    const result = testStmt.get() as { alive: number } | undefined;
    if (result && result.alive === 1) {
      dbStatus = 'connected';
    }
  } catch (e) {
    dbStatus = 'error';
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'GameVerse Web Services & REST API',
      database: {
        engine: 'SQLite (node:sqlite)',
        status: dbStatus,
      },
      external_api: {
        rawg_key_configured: GamesService.hasRawgKey(),
        active_provider: GamesService.hasRawgKey()
          ? 'RAWG Video Games Database'
          : 'FreeToGame REST API (Modo Abierto)',
      },
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
