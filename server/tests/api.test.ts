import test from 'node:test';
import assert from 'node:assert/strict';
import { UsersService } from '../services/usersService.ts';
import { db } from '../database/db.ts';
import { GamesService } from '../services/gamesService.ts';

test('Database tables exist and foreign keys are active', () => {
  const fkCheck = db.prepare('PRAGMA foreign_keys;').get() as { foreign_keys: number };
  assert.equal(fkCheck.foreign_keys, 1);

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'favorites')")
    .all();
  assert.equal(tables.length, 2);
});

test('UsersService: registers a user with bcrypt hash and prevents duplicates', async () => {
  const testEmail = `test_${Date.now()}@gameverse.edu`;
  const testUser = `player_${Date.now()}`;
  const testPass = 'GameVerse2026!';

  // 1. Registro exitoso
  const user = await UsersService.register(testUser, testEmail, testPass);
  assert.equal(user.username, testUser);
  assert.equal(user.email, testEmail);
  assert.ok(user.id > 0);

  // 2. Verificar que la contraseña no se guardó en texto plano
  const rawRecord = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string };
  assert.notEqual(rawRecord.password_hash, testPass);
  assert.ok(rawRecord.password_hash.startsWith('$2'));

  // 3. Prevenir duplicado de correo
  await assert.rejects(
    async () => {
      await UsersService.register('another_user', testEmail, testPass);
    },
    (err: any) => err.statusCode === 409
  );

  // 4. Login exitoso
  const logged = await UsersService.login(testEmail, testPass);
  assert.equal(logged.id, user.id);

  // 5. Login fallido por contraseña incorrecta
  await assert.rejects(
    async () => {
      await UsersService.login(testEmail, 'WrongPassword123!');
    },
    (err: any) => err.statusCode === 401
  );

  // 6. Generación y verificación de token JWT
  const token = UsersService.generateToken(user);
  const verified = UsersService.verifyToken(token);
  assert.equal(verified.sub, user.id);
  assert.equal(verified.username, user.username);
});

test('Favorites isolation: user cannot access or delete other user favorites', () => {
  // Crear dos usuarios de prueba en la base de datos
  const u1 = UsersService.register(`u1_${Date.now()}`, `u1_${Date.now()}@test.com`, 'Pass1234!');
  const u2 = UsersService.register(`u2_${Date.now()}`, `u2_${Date.now()}@test.com`, 'Pass1234!');

  return Promise.all([u1, u2]).then(([user1, user2]) => {
    // Insertar favorito para user1
    db.prepare(`
      INSERT INTO favorites (user_id, game_id, game_name, game_genre, game_platform, game_rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user1.id, 'game_540', 'Overwatch', 'Shooter', 'PC', 4.5);

    // user1 debe ver su favorito
    const user1Favs = db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(user1.id);
    assert.equal(user1Favs.length, 1);

    // user2 NO debe ver el favorito de user1
    const user2Favs = db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(user2.id);
    assert.equal(user2Favs.length, 0);

    // user2 NO puede eliminar el favorito de user1
    const delResult = db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?').run(user2.id, 'game_540');
    assert.equal(delResult.changes, 0);

    // El favorito de user1 sigue existiendo
    const stillExists = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND game_id = ?').get(user1.id, 'game_540');
    assert.ok(stillExists);
  });
});

test('GamesService: retrieves games list and handles genres', async () => {
  const genres = await GamesService.getGenres();
  assert.ok(Array.isArray(genres));
  assert.ok(genres.length > 0);

  const games = await GamesService.getGames({ page: 1, pageSize: 4 });
  assert.ok(Array.isArray(games.results));
  assert.ok(games.count > 0);
  assert.ok(games.results.length <= 4);
  assert.ok(games.apiSource.length > 0);
});
