import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.ts';

// Asegurar que el directorio de persistencia existe
const dir = path.dirname(ENV.DATABASE_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Inicializar conexión persistente a SQLite
export const db = new DatabaseSync(ENV.DATABASE_PATH);

// Activar integridad referencial y claves foráneas en SQLite
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Crear tablas requeridas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    game_image TEXT,
    game_genre TEXT,
    game_platform TEXT,
    game_rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
  );

  CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
`);
