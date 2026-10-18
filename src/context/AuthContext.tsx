import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, GameSummary, FavoriteItem } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  favorites: FavoriteItem[];
  favoriteIds: Set<string>;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (game: GameSummary) => Promise<{ added: boolean; message: string }>;
  refreshFavorites: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await api.favorites.list();
      setFavorites(data.favorites || []);
      const idSet = new Set((data.favorites || []).map((f) => String(f.game_id)));
      setFavoriteIds(idSet);
    } catch {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, []);

  // Cargar usuario y sesión inicial
  useEffect(() => {
    let mounted = true;
    async function initSession() {
      try {
        const { user: fetchedUser } = await api.auth.me();
        if (mounted) {
          setUser(fetchedUser);
          await fetchFavorites();
        }
      } catch {
        if (mounted) {
          setUser(null);
          setFavorites([]);
          setFavoriteIds(new Set());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();
    return () => {
      mounted = false;
    };
  }, [fetchFavorites]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
    await fetchFavorites();
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const res = await api.auth.register({ username, email, password, confirmPassword });
    setUser(res.user);
    await fetchFavorites();
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setFavorites([]);
    setFavoriteIds(new Set());
  };

  const toggleFavorite = async (game: GameSummary): Promise<{ added: boolean; message: string }> => {
    if (!user) {
      throw new Error('Debes iniciar sesión para guardar videojuegos en tus favoritos.');
    }

    const gameIdStr = String(game.id);
    const isCurrentlyFavorited = favoriteIds.has(gameIdStr);

    if (isCurrentlyFavorited) {
      // Eliminar de favoritos
      await api.favorites.remove(gameIdStr);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(gameIdStr);
        return next;
      });
      setFavorites((prev) => prev.filter((f) => String(f.game_id) !== gameIdStr));
      return { added: false, message: `"${game.name}" ha sido eliminado de tus favoritos.` };
    } else {
      // Añadir a favoritos
      const primaryGenre = game.genres && game.genres.length > 0 ? game.genres[0].name : 'General';
      const primaryPlatform = game.platforms && game.platforms.length > 0 ? game.platforms[0].name : 'Multi';

      const res = await api.favorites.add({
        game_id: gameIdStr,
        game_name: game.name,
        game_image: game.background_image || null,
        game_genre: primaryGenre,
        game_platform: primaryPlatform,
        game_rating: game.rating || null,
      });

      setFavoriteIds((prev) => new Set([...prev, gameIdStr]));
      if (res.favorite) {
        setFavorites((prev) => [res.favorite, ...prev]);
      }
      return { added: true, message: `"${game.name}" ha sido agregado a tu colección de favoritos.` };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        favorites,
        favoriteIds,
        login,
        register,
        logout,
        toggleFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
