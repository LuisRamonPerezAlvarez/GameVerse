import { Router, Request, Response, NextFunction } from 'express';
import { GamesService } from '../services/gamesService.js';
import { gamesLimiter } from '../middleware/security.js';

const router = Router();

/**
 * GET /api/genres
 * Lista los géneros de videojuegos disponibles
 */
router.get('/genres', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const genres = await GamesService.getGenres();
    res.status(200).json({
      success: true,
      data: {
        genres,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/games
 * Consulta el catálogo con filtros, búsqueda y paginación
 */
router.get('/', gamesLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const pageSize = req.query.page_size ? parseInt(String(req.query.page_size), 10) : 12;
    const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const ordering = typeof req.query.ordering === 'string' ? req.query.ordering : undefined;

    const data = await GamesService.getGames({
      search,
      page,
      pageSize,
      genre,
      ordering,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/games/:id
 * Consulta la ficha detallada de un videojuego
 */
router.get('/:id', gamesLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gameId = req.params.id;
    if (!gameId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Identificador de videojuego no proporcionado.',
        },
      });
      return;
    }

    const game = await GamesService.getGameById(gameId);
    res.status(200).json({
      success: true,
      data: {
        game,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
