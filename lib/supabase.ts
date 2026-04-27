import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Centralized Supabase access.
 *
 * Two clients:
 *   - browserClient: uses NEXT_PUBLIC_SUPABASE_ANON_KEY. Safe to ship to the browser.
 *     Anon role can only INSERT into `quotes` and SELECT from the `live_quote_feed` view
 *     (RLS enforced server-side; see supabase/migrations/0001_initial.sql).
 *   - serverClient: uses SUPABASE_SERVICE_ROLE_KEY. NEVER ship to the browser.
 *     Used only inside /api/* routes.
 *
 * Both functions return null if env vars are missing — callers MUST handle that.
 * This is intentional: it lets the app boot in scaffold mode (Path B) without creds.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function browserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export function serverClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
