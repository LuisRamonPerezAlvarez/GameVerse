import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.')
      .max(25, 'El nombre de usuario no puede exceder 25 caracteres.')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'El nombre de usuario solo puede contener letras, números, guiones (-) y guiones bajos (_).'
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('El correo electrónico no tiene un formato válido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Z]/, 'La contraseña debe incluir al menos una letra mayúscula.')
      .regex(/[a-z]/, 'La contraseña debe incluir al menos una letra minúscula.')
      .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.'),
    confirmPassword: z
      .string()
      .min(1, 'La confirmación de la contraseña es obligatoria.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Ingresa un correo electrónico válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria.'),
});

export const favoriteSchema = z.object({
  game_id: z.union([z.string(), z.number()]).transform((val) => String(val).trim()),
  game_name: z.string().trim().min(1, 'El nombre del juego es obligatorio.').max(150),
  game_image: z.string().nullable().optional(),
  game_genre: z.string().nullable().optional(),
  game_platform: z.string().nullable().optional(),
  game_rating: z.number().nullable().optional(),
});
