import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { quoteServerSchema } from '@/components/quote/schema';
import { serverClient } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/quote
 *
 * Week 1 stub behavior:
 *   - Validates the payload against quoteServerSchema (server-side mirror of the client schema).
 *   - If Supabase is configured (env vars present): inserts into `quotes`, returns the row id.
 *   - If Supabase is NOT configured: logs the payload to the server console and returns
 *     a synthesized UUID so the client UX still works during local scaffold.
 *   - Twilio + Resend integration are documented as TODO and will land in the integration session
 *     once credentials are provided.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Body must be JSON.' },
      { status: 400 },
    );
  }

  const parsed = quoteServerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Validation failed.',
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const h = headers();
  const userAgent = h.get('user-agent') ?? undefined;
  const ip = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? undefined;

  const supabase = serverClient();

  if (!supabase) {
    // Scaffold mode: log + return synthetic id.
    const id = randomUUID();
    // eslint-disable-next-line no-console
    console.log('[/api/quote] scaffold mode — Supabase not configured. Payload:', {
      id,
      ...data,
      _meta: { userAgent, ip },
    });
    return NextResponse.json({
      ok: true,
      id,
      mode: 'scaffold',
      note: 'Supabase + Twilio + Resend are not wired in this Path B scaffold. The submission was logged server-side. Wire credentials per .env.example to enable real persistence.',
    });
  }

  // Real path (Supabase configured).
  const { data: row, error } = await supabase
    .from('quotes')
    .insert({
      from_address: data.from_address,
      to_address: data.to_address,
      size: data.size,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes ?? null,
      contact_name: data.contact_name,
      contact_email: data.contact_email ?? null,
      contact_phone: data.contact_phone,
      contact_lang: 'en',
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_term: data.utm_term ?? null,
      utm_content: data.utm_content ?? null,
      referrer: data.referrer ?? null,
      landing_page: data.landing_page ?? null,
    })
    .select('id')
    .single();

  if (error || !row) {
    // eslint-disable-next-line no-console
    console.error('[/api/quote] supabase insert failed', error);
    return NextResponse.json(
      { ok: false, message: 'Database error. Try again or call us.' },
      { status: 500 },
    );
  }

  // TODO (integration session): trigger Twilio SMS to FEROZ_NOTIFY_PHONE
  // TODO (integration session): trigger Resend confirmation email to data.contact_email

  return NextResponse.json({ ok: true, id: row.id, mode: 'live' });
}
