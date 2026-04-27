/**
 * INLET MOVE QUOTE HANDLER — INTERFACE CONTRACT (binding)
 * =======================================================
 *
 * This file is the source of truth for the shape of a quote submission
 * crossing the network boundary between the marketing site (Astro,
 * inletmove.ca on Hostinger) and the quote backend.
 *
 * In v1 the backend is `apps/marketing/public/quote-handler.php` — a
 * Hostinger PHP shim that emails Feroz via Resend.
 *
 * In v1.1 the backend is `apps/quote/app/api/quote/route.ts` — a Next.js
 * route on Vercel at https://quote.inletmove.ca/api/quote that writes
 * to Supabase and triggers Twilio SMS + Resend confirmation.
 *
 * The swap is a single env var change in `apps/marketing/.env`:
 *   PUBLIC_QUOTE_ENDPOINT=/quote-handler.php                    (v1)
 *   PUBLIC_QUOTE_ENDPOINT=https://quote.inletmove.ca/api/quote (v1.1)
 *
 * Field names below MUST match what the form posts and what BOTH backends
 * accept. snake_case is canonical (matches the apps/quote schema and the
 * Supabase `quotes` table). DO NOT introduce camelCase aliases in either
 * direction without updating both backends and the form simultaneously.
 *
 * If you change a field here, you must also change:
 *   - apps/marketing/src/components/quote/QuoteForm.tsx  (form input names)
 *   - apps/marketing/public/quote-handler.php            (validation list)
 *   - apps/quote/components/quote/schema.ts              (zod schema)
 *   - supabase/migrations/0001_initial.sql               (table columns)
 */

export type QuoteSize =
  | 'studio'
  | '1bed'
  | '2bed'
  | '3bed'
  | 'multigen'
  | 'senior'
  | 'single_item';

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible';

export type ContactLanguage = 'en' | 'zh' | 'pa' | 'hi';

export interface QuoteSubmission {
  // ---- Move details ----
  size: QuoteSize;
  from_address: string;
  to_address: string;
  preferred_date: string;            // ISO date (YYYY-MM-DD)
  preferred_time?: PreferredTime;
  notes?: string;

  // ---- Contact ----
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  contact_language?: ContactLanguage;

  // ---- Source attribution (for Demandra reporting) ----
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;

  // ---- Internal ----
  submitted_at: string;              // ISO timestamp
  user_agent?: string;
}

export interface QuoteHandlerResult {
  /** True on a confirmed submission. */
  success: boolean;
  /** Server-issued ID, useful for follow-up + tracking. */
  quoteId?: string;
  /** Optional user-facing message. */
  message?: string;
  /** Server-side error string. Never shown directly to the user. */
  error?: string;
}
