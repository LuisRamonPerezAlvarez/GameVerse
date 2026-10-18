import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.ts';
import { ENV } from '../config/env.ts';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export class UsersService {
  /**
   * Registra un nuevo usuario con hash de contraseña seguro.
   */
  static async register(username: string, email: string, passwordPlain: string): Promise<SafeUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Comprobar si el correo ya existe (consulta parametrizada)
    const existingEmailStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingEmail = existingEmailStmt.get(normalizedEmail);
    if (existingEmail) {
      const error: any = new Error('Ya existe una cuenta registrada con este correo electrónico.');
      error.statusCode = 409;
      throw error;
    }

    // Comprobar si el nombre de usuario ya existe
    const existingUserStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const existingUser = existingUserStmt.get(cleanUsername);
    if (existingUser) {
      const error: any = new Error('El nombre de usuario ya está en uso. Por favor elige otro.');
      error.statusCode = 409;
      throw error;
    }

    // Hash de la contraseña con bcryptjs (coste 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    // Inserción parametrizada para prevenir inyección SQL
    const insertStmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const result = insertStmt.run(cleanUsername, normalizedEmail, passwordHash);

    const newUserId = Number(result.lastInsertRowid);

    const userStmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    const createdUser = userStmt.get(newUserId) as unknown as SafeUser;

    return createdUser;
  }

  /**
   * Verifica credenciales de inicio de sesión.
   */
  static async login(email: string, passwordPlain: string): Promise<SafeUser> {
    const normalizedEmail = email.trim().toLowerCase();

    // Consulta parametrizada
    const userStmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = userStmt.get(normalizedEmail) as UserRecord | undefined;

    if (!user) {
      const error: any = new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
      error.statusCode = 401;
      throw error;
    }

    // Comparar hash con bcrypt
    const passwordMatches = await bcrypt.compare(passwordPlain, user.password_hash);
    if (!passwordMatches) {
      const error: any = new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
      error.statusCode = 401;
      throw error;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    };
  }

  /**
   * Obtiene la información de un usuario por su ID sin exponer hash.
   */
  static getById(id: number): SafeUser | null {
    const userStmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    const user = userStmt.get(id) as SafeUser | undefined;
    return user || null;
  }

  /**
   * Genera un token JWT firmado.
   */
  static generateToken(user: SafeUser): string {
    return jwt.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifica un token JWT.
   */
  static verifyToken(token: string): { sub: number; username: string; email: string } {
    return jwt.verify(token, ENV.JWT_SECRET) as unknown as { sub: number; username: string; email: string };
  }
}
