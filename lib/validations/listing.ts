import { z } from 'zod';
import { LISTING_CATEGORIES } from '@/types';

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Název musí mít alespoň 3 znaky.')
    .max(120, 'Název může mít maximálně 120 znaků.'),
  description: z
    .string()
    .trim()
    .min(5, 'Popis musí mít alespoň 5 znaků.')
    .max(5000, 'Popis může mít maximálně 5000 znaků.'),
  price: z.coerce
    .number()
    .min(0, 'Cena nesmí být záporná.')
    .max(1000000, 'Cena nemůže přesáhnout 1 000 000 Kč.'),
  category: z.string().refine(
    (val) => (LISTING_CATEGORIES as readonly string[]).includes(val),
    { message: 'Vyberte platnou kategorii.' }
  ),
  image_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try {
          const url = new URL(val);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL obrázku musí být platná webová adresa (http/https).' }
    ),
  status: z.enum(['active', 'sold', 'archived']).default('active'),
});

export type ListingInput = z.infer<typeof listingSchema>;

