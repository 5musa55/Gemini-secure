import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'E-mail je povinný.')
    .email('Zadejte platnou e-mailovou adresu.')
    .max(150, 'E-mail je příliš dlouhý.'),
  password: z
    .string()
    .min(6, 'Heslo musí mít alespoň 6 znaků.')
    .max(100, 'Heslo je příliš dlouhé.'),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'E-mail je povinný.')
      .email('Zadejte platnou e-mailovou adresu.')
      .max(150, 'E-mail je příliš dlouhý.'),
    password: z
      .string()
      .min(8, 'Heslo musí mít alespoň 8 znaků z důvodu bezpečnosti.')
      .max(100, 'Heslo je příliš dlouhé.')
      .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno.')
      .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno.')
      .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jedno číslo.'),
    confirmPassword: z.string().min(1, 'Zadejte heslo znovu pro kontrolu.'),
    fullName: z
      .string()
      .trim()
      .max(80, 'Jméno a příjmení je příliš dlouhé.')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Zadaná hesla se neshodují.',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(80, 'Jméno a příjmení může mít maximálně 80 znaků.')
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(25, 'Telefonní číslo může mít maximálně 25 znaků.')
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return /^[+]?[0-9\s-]{6,25}$/.test(val);
      },
      { message: 'Zadejte platné telefonní číslo (např. +420 777 123 456).' }
    )
    .optional()
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, 'O mně / bio může mít maximálně 500 znaků.')
    .optional()
    .nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

