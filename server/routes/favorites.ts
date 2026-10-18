import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { favoriteSchema } from '../schemas/authSchemas.js';
import { db } from '../database/db.js';

const router = Router();

// Todas las rutas de favoritos exigen autenticación
router.use(requireAuth);

/**
 * GET /api/favorites
 * Obtiene la colección de favoritos exclusiva del usuario autenticado
 */
router.get('/', (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user!.id;

    // Consulta parametrizada garantizando aislamiento entre usuarios
    const stmt = db.prepare(
      'SELECT id, user_id, game_id, game_name, game_image, game_genre, game_platform, game_rating, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
    );
    const favorites = stmt.all(userId);

    res.status(200).json({
      success: true,
      data: {
        favorites,
        count: favorites.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/favorites
 * Añade un videojuego a los favoritos del usuario autenticado
 */
router.post('/', (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user!.id;
    const validated = favoriteSchema.parse(req.body);

    // Verificar si ya existe en favoritos
    const checkStmt = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND game_id = ?');
    const existing = checkStmt.get(userId, validated.game_id);

    if (existing) {
      res.status(200).json({
        success: true,
        data: {
          message: 'El videojuego ya se encuentra en tu colección de favoritos.',
          favoriteId: (existing as any).id,
          alreadyFavorited: true,
        },
      });
      return;
    }

    // Inserción parametrizada protegida contra SQL injection
    const insertStmt = db.prepare(`
      INSERT INTO favorites (user_id, game_id, game_name, game_image, game_genre, game_platform, game_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      userId,
      validated.game_id,
      validated.game_name,
      validated.game_image || null,
      validated.game_genre || null,
      validated.game_platform || null,
      validated.game_rating ?? null
    );

    const getCreatedStmt = db.prepare('SELECT * FROM favorites WHERE id = ?');
    const created = getCreatedStmt.get(Number(result.lastInsertRowid));

    res.status(201).json({
      success: true,
      data: {
        message: 'Videojuego guardado en tu colección de favoritos.',
        favorite: created,
        alreadyFavorited: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/favorites/:gameId
 * Elimina un videojuego de los favoritos del usuario autenticado
 */
router.delete('/:gameId', (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user!.id;
    const gameId = String(req.params.gameId).trim();

    if (!gameId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Identificador de juego inválido.',
        },
      });
      return;
    }

    // Eliminación parametrizada vinculada al user_id para impedir manipular datos ajenos
    const deleteStmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?');
    const result = deleteStmt.run(userId, gameId);

    if (result.changes === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'El juego no estaba en tu lista de favoritos o no tienes permiso para eliminarlo.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Videojuego eliminado de tus favoritos con éxito.',
        gameId,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
