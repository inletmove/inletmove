import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const revalidate = 30;

const SEED = [
  { id: 's1', minutes_ago: 2, from_neighborhood: 'Mt Pleasant', to_neighborhood: 'Yaletown', size: '1bed', quote_amount_cents: 60000 },
  { id: 's2', minutes_ago: 14, from_neighborhood: 'Burnaby', to_neighborhood: 'North Van', size: '2bed', quote_amount_cents: 115000 },
  { id: 's3', minutes_ago: 28, from_neighborhood: 'Kitsilano', to_neighborhood: 'Kerrisdale', size: 'studio', quote_amount_cents: 45000 },
  { id: 's4', minutes_ago: 41, from_neighborhood: 'Surrey', to_neighborhood: 'New West', size: 'multigen', quote_amount_cents: 165000 },
  { id: 's5', minutes_ago: 53, from_neighborhood: 'West End', to_neighborhood: 'Mt Pleasant', size: '1bed', quote_amount_cents: 58000 },
];

/**
 * GET /api/feed
 *
 * Returns up to 5 recent quote requests for the homepage <LiveBookingFeed>.
 * Reads from the masked `live_quote_feed` Supabase view (no PII, safe for public).
 * Falls back to seed data if Supabase isn't configured (Week 1 scaffold mode)
 * or if the view returns empty.
 */
export async function GET() {
  const supabase = serverClient();

  if (!supabase) {
    return NextResponse.json({ items: SEED, mode: 'scaffold' });
  }

  const { data, error } = await supabase
    .from('live_quote_feed')
    .select('id, minutes_ago, from_neighborhood, to_neighborhood, size, quote_amount_cents')
    .limit(5);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ items: SEED, mode: error ? 'fallback_error' : 'fallback_empty' });
  }

  return NextResponse.json({ items: data, mode: 'live' });
}
