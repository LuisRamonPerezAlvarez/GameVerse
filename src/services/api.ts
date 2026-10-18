import { ApiResponse, User, GameSummary, GameDetail, FavoriteItem } from '../types/index.js';

const API_BASE = '/api';

// Soporte para token en memoria además de cookies HttpOnly
let memoryToken: string | null = null;

export function setMemoryToken(token: string | null): void {
  memoryToken = token;
  if (token) {
    try {
      sessionStorage.setItem('gv_token_backup', token);
    } catch {
      // sessionStorage puede no estar disponible
    }
  } else {
    try {
      sessionStorage.removeItem('gv_token_backup');
    } catch {
      // ignore
    }
  }
}

export function getMemoryToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    return sessionStorage.getItem('gv_token_backup');
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = getMemoryToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Enviar cookies HttpOnly automáticamente
  });

  let payload: ApiResponse<any>;
  try {
    payload = await response.json();
  } catch (err) {
    throw new Error('Respuesta inválida del servidor.');
  }

  if (!response.ok || payload.success === false) {
    const errorMsg =
      payload.error?.message ||
      `Error del servidor (${response.status} ${response.statusText})`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.details = payload.error?.details;
    throw error;
  }

  return payload.data;
}

export const api = {
  auth: {
    async register(data: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    }): Promise<{ user: User; token: string; message: string }> {
      const res = await request<{ user: User; token: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setMemoryToken(res.token);
      return res;
    },

    async login(data: {
      email: string;
      password: string;
    }): Promise<{ user: User; token: string; message: string }> {
      const res = await request<{ user: User; token: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setMemoryToken(res.token);
      return res;
    },

    async me(): Promise<{ user: User }> {
      return request<{ user: User }>('/auth/me');
    },

    async logout(): Promise<{ message: string }> {
      try {
        const res = await request<{ message: string }>('/auth/logout', {
          method: 'POST',
        });
        setMemoryToken(null);
        return res;
      } catch (err) {
        setMemoryToken(null);
        return { message: 'Sesión finalizada.' };
      }
    },
  },

  games: {
    async list(
      params: {
        search?: string;
        page?: number;
        pageSize?: number;
        genre?: string;
        ordering?: string;
      } = {},
      signal?: AbortSignal
    ): Promise<{
      results: GameSummary[];
      count: number;
      currentPage: number;
      totalPages: number;
      nextPage: number | null;
      prevPage: number | null;
      apiSource: string;
    }> {
      const q = new URLSearchParams();
      if (params.search) q.set('search', params.search);
      if (params.page) q.set('page', String(params.page));
      if (params.pageSize) q.set('page_size', String(params.pageSize));
      if (params.genre && params.genre !== 'all') q.set('genre', params.genre);
      if (params.ordering) q.set('ordering', params.ordering);

      const qs = q.toString() ? `?${q.toString()}` : '';
      return request(`/games${qs}`, { signal });
    },

    async getById(id: string | number): Promise<{ game: GameDetail }> {
      return request<{ game: GameDetail }>(`/games/${id}`);
    },

    async genres(): Promise<{ genres: Array<{ id: string | number; name: string }> }> {
      return request<{ genres: Array<{ id: string | number; name: string }> }>('/games/genres');
    },
  },

  favorites: {
    async list(): Promise<{ favorites: FavoriteItem[]; count: number }> {
      return request<{ favorites: FavoriteItem[]; count: number }>('/favorites');
    },

    async add(game: {
      game_id: string | number;
      game_name: string;
      game_image?: string | null;
      game_genre?: string | null;
      game_platform?: string | null;
      game_rating?: number | null;
    }): Promise<{ message: string; favorite: FavoriteItem; alreadyFavorited: boolean }> {
      return request('/favorites', {
        method: 'POST',
        body: JSON.stringify(game),
      });
    },

    async remove(gameId: string | number): Promise<{ message: string; gameId: string }> {
      return request(`/favorites/${gameId}`, {
        method: 'DELETE',
      });
    },
  },

  health: {
    async check(): Promise<any> {
      return request('/health');
    },
  },
};
