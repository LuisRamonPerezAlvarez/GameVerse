export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface GamePlatform {
  id?: number | string;
  name: string;
}

export interface GameGenre {
  id?: number | string;
  name: string;
}

export interface GameSummary {
  id: string | number;
  slug?: string;
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  metacritic?: number | null;
  genres: GameGenre[];
  platforms: GamePlatform[];
  source: 'rawg' | 'freetogame';
}

export interface GameDetail extends GameSummary {
  description: string;
  description_raw?: string;
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

export interface FavoriteItem {
  id: number;
  user_id: number;
  game_id: string;
  game_name: string;
  game_image: string | null;
  game_genre: string | null;
  game_platform: string | null;
  game_rating: number | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface GamesListResponse {
  results: GameSummary[];
  count: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  current_page: number;
  api_source: string;
}
