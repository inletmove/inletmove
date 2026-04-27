import { z } from 'zod';

/**
 * Quote form schema — single source of truth for client + server validation.
 * Mirrors the columns on the `quotes` table in supabase/migrations/0001_initial.sql.
 */

export const SIZE_VALUES = [
  'studio',
  '1bed',
  '2bed',
  '3bed',
  'multigen',
  'senior',
  'single_item',
] as const;
export type Size = (typeof SIZE_VALUES)[number];

export const TIME_VALUES = ['morning', 'afternoon', 'evening', 'flexible'] as const;
export type PreferredTime = (typeof TIME_VALUES)[number];

const phoneRegex = /^[\d\s()+\-.]{7,}$/;

export const quoteSchema = z.object({
  size: z.enum(SIZE_VALUES, {
    errorMap: () => ({ message: 'Pick the option that fits best.' }),
  }),
  from_address: z.string().min(5, 'Add a street and city.').max(300),
  to_address: z.string().min(5, 'Add a street and city.').max(300),
  preferred_date: z
    .string()
    .min(1, 'Pick a date.')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Pick a valid date.'),
  preferred_time: z.enum(TIME_VALUES).default('flexible'),
  notes: z.string().max(2000).optional().or(z.literal('')),
  contact_name: z.string().min(2, "What's your name?").max(120),
  contact_phone: z
    .string()
    .min(7, 'A phone number we can text.')
    .max(40)
    .regex(phoneRegex, 'Phone number looks off.'),
  contact_email: z
    .string()
    .email('Looks like that email is missing something.')
    .optional()
    .or(z.literal('')),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/**
 * Server-side payload includes attribution metadata that the client doesn't
 * fill out. Kept as a separate schema so the client form is lean.
 */
export const quoteServerSchema = quoteSchema.extend({
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  utm_term: z.string().max(120).optional(),
  utm_content: z.string().max(120).optional(),
  referrer: z.string().max(500).optional(),
  landing_page: z.string().max(500).optional(),
});

export type QuoteServerInput = z.infer<typeof quoteServerSchema>;
