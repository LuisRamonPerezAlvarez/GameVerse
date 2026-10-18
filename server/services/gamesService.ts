import { ENV } from '../config/env.ts';

export interface UnifiedGameSummary {
  id: string | number;
  slug?: string;
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  metacritic?: number | null;
  genres: Array<{ id?: number | string; name: string }>;
  platforms: Array<{ id?: number | string; name: string }>;
  source: 'rawg' | 'freetogame';
}

export interface UnifiedGameDetail extends UnifiedGameSummary {
  description: string;
  website?: string;
  developers?: string[];
  publishers?: string[];
  screenshots?: string[];
  requirements?: {
    os?: string;
    processor?: string;
    memory?: string;
    graphics?: string;
    storage?: string;
  };
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Función auxiliar para realizar fetch con límite de tiempo de respuesta (timeout)
 */
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GameVerse-Applet/1.0',
      },
    });
    clearTimeout(id);
    return response;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      const timeoutErr: any = new Error('El servicio externo de videojuegos tardó demasiado en responder (Tiempo de espera agotado).');
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Limpia y sanitiza texto de descripción (elimina etiquetas HTML maliciosas)
 */
function cleanDescriptionText(rawHtml?: string | null): string {
  if (!rawHtml) return 'Sin descripción disponible para este videojuego.';
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export class GamesService {
  /**
   * Indica si la clave RAWG está configurada
   */
  static hasRawgKey(): boolean {
    return Boolean(ENV.RAWG_API_KEY && ENV.RAWG_API_KEY.length > 5);
  }

  /**
   * Obtiene lista de géneros disponibles
   */
  static async getGenres(): Promise<Array<{ id: string | number; name: string; slug?: string }>> {
    const cacheKey = 'genres:list';
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    if (this.hasRawgKey()) {
      try {
        const url = `https://api.rawg.io/api/genres?key=${encodeURIComponent(ENV.RAWG_API_KEY)}`;
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          const json = await res.json();
          const genres = (json.results || []).map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
          }));
          setCached(cacheKey, genres, 60 * 60 * 1000);
          return genres;
        }
      } catch (e) {
        // Fallback a géneros estándar
      }
    }

    const defaultGenres = [
      { id: 'all', name: 'Todos los géneros' },
      { id: 'shooter', name: 'Shooter' },
      { id: 'action', name: 'Acción' },
      { id: 'rpg', name: 'RPG' },
      { id: 'strategy', name: 'Estrategia' },
      { id: 'mmo', name: 'MMO / MMORPG' },
      { id: 'sports', name: 'Deportes' },
      { id: 'racing', name: 'Carreras' },
      { id: 'fighting', name: 'Lucha' },
      { id: 'card', name: 'Cartas' },
      { id: 'battle-royale', name: 'Battle Royale' },
      { id: 'fantasy', name: 'Fantasía' },
    ];
    setCached(cacheKey, defaultGenres, 60 * 60 * 1000);
    return defaultGenres;
  }

  /**
   * Consulta el catálogo de videojuegos con filtros, búsqueda y paginación
   */
  static async getGames(params: {
    search?: string;
    page?: number;
    pageSize?: number;
    genre?: string;
    ordering?: string;
  }): Promise<{
    results: UnifiedGameSummary[];
    count: number;
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
    apiSource: string;
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(24, Math.max(4, Number(params.pageSize) || 12));
    const search = (params.search || '').trim();
    const genre = (params.genre || '').trim();
    const ordering = (params.ordering || '').trim();

    const cacheKey = `games:${page}:${pageSize}:${search}:${genre}:${ordering}:${this.hasRawgKey()}`;
    const cached = getCached<any>(cacheKey);
    if (cached) return cached;

    // 1. Si existe clave RAWG, intentar consultar RAWG API
    if (this.hasRawgKey()) {
      try {
        const queryParams = new URLSearchParams({
          key: ENV.RAWG_API_KEY,
          page: String(page),
          page_size: String(pageSize),
        });

        if (search) queryParams.set('search', search);
        if (genre && genre !== 'all') queryParams.set('genres', genre.toLowerCase());
        if (ordering) queryParams.set('ordering', ordering);

        const url = `https://api.rawg.io/api/games?${queryParams.toString()}`;
        const res = await fetchWithTimeout(url);

        if (res.ok) {
          const json = await res.json();
          const results: UnifiedGameSummary[] = (json.results || []).map((g: any) => ({
            id: g.id,
            slug: g.slug,
            name: g.name,
            released: g.released,
            background_image: g.background_image,
            rating: g.rating || null,
            metacritic: g.metacritic || null,
            genres: (g.genres || []).map((x: any) => ({ id: x.id, name: x.name })),
            platforms: (g.platforms || []).map((p: any) => ({
              id: p.platform?.id,
              name: p.platform?.name || 'Multiplataforma',
            })),
            source: 'rawg' as const,
          }));

          const totalCount = json.count || results.length;
          const totalPages = Math.ceil(totalCount / pageSize);

          const payload = {
            results,
            count: totalCount,
            currentPage: page,
            totalPages,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            apiSource: 'RAWG Video Games Database API',
          };

          setCached(cacheKey, payload);
          return payload;
        }
      } catch (err) {
        // En caso de fallo o timeout de RAWG, continuar con el fallback de FreeToGame
        console.warn('RAWG API falló o no está disponible, usando FreeToGame fallback.');
      }
    }

    // 2. Consulta a FreeToGame REST API
    try {
      let ftgUrl = 'https://www.freetogame.com/api/games';
      if (genre && genre !== 'all') {
        ftgUrl = `https://www.freetogame.com/api/games?category=${encodeURIComponent(genre.toLowerCase())}`;
      }

      const res = await fetchWithTimeout(ftgUrl);
      if (!res.ok) {
        throw new Error(`Servicio de videojuegos respondió con código de estado ${res.status}`);
      }

      let allGames: any[] = await res.json();
      if (!Array.isArray(allGames)) {
        allGames = [];
      }

      // Filtrado por búsqueda en memoria
      if (search) {
        const queryNorm = search.toLowerCase();
        allGames = allGames.filter(
          (g) =>
            (g.title && g.title.toLowerCase().includes(queryNorm)) ||
            (g.short_description && g.short_description.toLowerCase().includes(queryNorm)) ||
            (g.genre && g.genre.toLowerCase().includes(queryNorm))
        );
      }

      // Ordenamiento
      if (ordering === '-released' || ordering === 'released') {
        allGames.sort((a, b) => {
          const dateA = new Date(a.release_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || '1970-01-01').getTime();
          return ordering === '-released' ? dateB - dateA : dateA - dateB;
        });
      } else if (ordering === 'name' || ordering === '-name') {
        allGames.sort((a, b) => {
          const titleA = (a.title || '').toLowerCase();
          const titleB = (b.title || '').toLowerCase();
          return ordering === 'name' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
        });
      }

      const totalCount = allGames.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (page - 1) * pageSize;
      const slice = allGames.slice(startIndex, startIndex + pageSize);

      const results: UnifiedGameSummary[] = slice.map((g) => ({
        id: g.id,
        name: g.title,
        released: g.release_date,
        background_image: g.thumbnail,
        rating: 4.2, // Calificación estimada para datos abiertos
        metacritic: null,
        genres: [{ id: g.genre?.toLowerCase(), name: g.genre || 'General' }],
        platforms: [{ name: g.platform || 'PC' }],
        source: 'freetogame' as const,
      }));

      const payload = {
        results,
        count: totalCount,
        currentPage: page,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        apiSource: 'FreeToGame Open REST API (Sin clave requerida)',
      };

      setCached(cacheKey, payload);
      return payload;
    } catch (err: any) {
      const error: any = new Error(err.message || 'Error al conectar con la API externa de videojuegos.');
      error.statusCode = err.statusCode || 502;
      throw error;
    }
  }

  /**
   * Consulta el detalle individual de un videojuego por ID
   */
  static async getGameById(gameId: string | number): Promise<UnifiedGameDetail> {
    const idStr = String(gameId).trim();
    const cacheKey = `game:detail:${idStr}`;
    const cached = getCached<UnifiedGameDetail>(cacheKey);
    if (cached) return cached;

    // Si es numérico y tenemos RAWG key, intentamos RAWG
    if (this.hasRawgKey()) {
      try {
        const url = `https://api.rawg.io/api/games/${encodeURIComponent(idStr)}?key=${encodeURIComponent(ENV.RAWG_API_KEY)}`;
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          const g = await res.json();
          const detail: UnifiedGameDetail = {
            id: g.id,
            slug: g.slug,
            name: g.name,
            released: g.released,
            background_image: g.background_image || g.background_image_additional,
            rating: g.rating || null,
            metacritic: g.metacritic || null,
            description: cleanDescriptionText(g.description || g.description_raw),
            website: g.website || undefined,
            developers: (g.developers || []).map((d: any) => d.name),
            publishers: (g.publishers || []).map((p: any) => p.name),
            genres: (g.genres || []).map((x: any) => ({ id: x.id, name: x.name })),
            platforms: (g.platforms || []).map((p: any) => ({
              id: p.platform?.id,
              name: p.platform?.name || 'Plataforma',
            })),
            source: 'rawg',
          };
          setCached(cacheKey, detail);
          return detail;
        }
      } catch (e) {
        // Fallback a FreeToGame
      }
    }

    // FreeToGame detail
    try {
      const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(idStr)}`;
      const res = await fetchWithTimeout(url);

      if (res.status === 404) {
        const err: any = new Error('El videojuego solicitado no fue encontrado.');
        err.statusCode = 404;
        throw err;
      }

      if (!res.ok) {
        throw new Error(`Error en la API externa al obtener videojuego (${res.status})`);
      }

      const g = await res.json();
      if (!g || !g.title) {
        const err: any = new Error('El videojuego solicitado no fue encontrado.');
        err.statusCode = 404;
        throw err;
      }

      const screenshots: string[] = (g.screenshots || []).map((s: any) => s.image).filter(Boolean);

      const detail: UnifiedGameDetail = {
        id: g.id,
        name: g.title,
        released: g.release_date,
        background_image: g.thumbnail,
        rating: 4.4,
        metacritic: null,
        description: cleanDescriptionText(g.description || g.short_description),
        website: g.game_url || undefined,
        developers: g.developer ? [g.developer] : [],
        publishers: g.publisher ? [g.publisher] : [],
        screenshots,
        requirements: g.minimum_system_requirements || undefined,
        genres: [{ id: g.genre?.toLowerCase(), name: g.genre || 'General' }],
        platforms: [{ name: g.platform || 'PC' }],
        source: 'freetogame',
      };

      setCached(cacheKey, detail);
      return detail;
    } catch (err: any) {
      if (err.statusCode === 404) throw err;
      const error: any = new Error(err.message || 'No fue posible obtener los detalles del videojuego.');
      error.statusCode = err.statusCode || 502;
      throw error;
    }
  }
}
