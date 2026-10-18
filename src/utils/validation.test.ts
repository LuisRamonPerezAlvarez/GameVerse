import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkPasswordStrength,
  validateUsername,
  validateEmail,
  sanitizeSearchQuery,
  formatRating,
  extractReleaseYear,
} from './validation.ts';

test('checkPasswordStrength: rejects short passwords', () => {
  const result = checkPasswordStrength('Ab1!');
  assert.equal(result.minLength, false);
  assert.equal(result.isValid, false);
});

test('checkPasswordStrength: requires uppercase, lowercase, and numbers', () => {
  assert.equal(checkPasswordStrength('password123').hasUpper, false);
  assert.equal(checkPasswordStrength('PASSWORD123').hasLower, false);
  assert.equal(checkPasswordStrength('PasswordOnly').hasNumber, false);

  const valid = checkPasswordStrength('GameVerse2026!');
  assert.equal(valid.minLength, true);
  assert.equal(valid.hasUpper, true);
  assert.equal(valid.hasLower, true);
  assert.equal(valid.hasNumber, true);
  assert.equal(valid.isValid, true);
});

test('validateUsername: enforces length and character rules', () => {
  assert.equal(validateUsername('ab').valid, false);
  assert.equal(validateUsername('valid_user-123').valid, true);
  assert.equal(validateUsername('invalid user!').valid, false);
  assert.equal(validateUsername('<script>').valid, false);
});

test('validateEmail: validates and normalizes correctly', () => {
  const bad = validateEmail('invalid-email');
  assert.equal(bad.valid, false);

  const good = validateEmail('  Player@GameVerse.com  ');
  assert.equal(good.valid, true);
  assert.equal(good.normalized, 'player@gameverse.com');
});

test('sanitizeSearchQuery: strips unsafe characters and trims', () => {
  const dirty = "  Cyberpunk <script>alert('xss')</script> & 2077  ";
  const cleaned = sanitizeSearchQuery(dirty);
  assert.equal(cleaned.includes('<'), false);
  assert.equal(cleaned.includes('>'), false);
  assert.equal(cleaned.includes("'"), false);
  assert.equal(cleaned.includes('&'), false);
  assert.equal(cleaned.includes('Cyberpunk'), true);
});

test('formatRating: handles null, undefined and valid numbers', () => {
  assert.equal(formatRating(null), 'S/C');
  assert.equal(formatRating(undefined), 'S/C');
  assert.equal(formatRating(0), 'S/C');
  assert.equal(formatRating(4.67), '4.7');
});

test('extractReleaseYear: extracts 4 digit year or returns N/D', () => {
  assert.equal(extractReleaseYear('2023-10-20'), '2023');
  assert.equal(extractReleaseYear('November 2021'), '2021');
  assert.equal(extractReleaseYear(null), 'N/D');
  assert.equal(extractReleaseYear(''), 'N/D');
});
