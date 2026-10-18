import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env si existe
dotenv.config();

export const ENV = {
  PORT: 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  RAWG_API_KEY: process.env.RAWG_API_KEY && process.env.RAWG_API_KEY !== 'PEGA_AQUI_TU_CLAVE_RAWG_REAL'
    ? process.env.RAWG_API_KEY.trim()
    : '',
  JWT_SECRET: process.env.JWT_SECRET || 'gameverse_dev_secret_key_academic_demonstration_secure_salt_2026',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/gameverse.sqlite'),
  isProduction: process.env.NODE_ENV === 'production',
};
