import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Cycling booking feed. v1 ships with seed data only and is labeled "Sample".
 * When PUBLIC_FEED_URL is set (v1.1, after the Vercel quote app deploys at
 * quote.inletmove.ca), the component fetches real masked booking data and
 * the badge swaps from "Sample" to "Live". This is the network-boundary
 * abstraction: zero code change between v1 and v1.1.
 */

type FeedItem = {
  id: string;
  minutes_ago: number;
  from_neighborhood: string;
  to_neighborhood: string;
  size: string;
  quote_amount_cents: number | null;
};

const SEED: FeedItem[] = [
  { id: 's1', minutes_ago: 2, from_neighborhood: 'Mt Pleasant', to_neighborhood: 'Yaletown', size: '1bed', quote_amount_cents: 60000 },
  { id: 's2', minutes_ago: 14, from_neighborhood: 'Burnaby', to_neighborhood: 'North Van', size: '2bed', quote_amount_cents: 115000 },
  { id: 's3', minutes_ago: 28, from_neighborhood: 'Kitsilano', to_neighborhood: 'Kerrisdale', size: 'studio', quote_amount_cents: 45000 },
  { id: 's4', minutes_ago: 41, from_neighborhood: 'Surrey', to_neighborhood: 'New West', size: 'multigen', quote_amount_cents: 165000 },
  { id: 's5', minutes_ago: 53, from_neighborhood: 'West End', to_neighborhood: 'Mt Pleasant', size: '1bed', quote_amount_cents: 58000 },
];

const SIZE_LABEL: Record<string, string> = {
  studio: 'studio',
  '1bed': '1-bed',
  '2bed': '2-bed',
  '3bed': '3-bed',
  multigen: 'multigen',
  senior: 'senior move',
  single_item: 'single item',
};

function formatPrice(cents: number | null): string {
  if (cents == null) return '—';
  return `$${Math.round(cents / 100)}`;
}

function formatSize(size: string): string {
  return SIZE_LABEL[size] ?? size;
}

const FEED_URL = import.meta.env.PUBLIC_FEED_URL ?? '';

export default function LiveBookingFeed() {
  const [feed, setFeed] = useState<FeedItem[]>(SEED);
  const [isLive, setIsLive] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (feed.length <= 1) return;
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % feed.length), 3000);
    return () => clearInterval(t);
  }, [feed.length]);

  useEffect(() => {
    if (!FEED_URL) return; // v1: stay on seed data, badge stays "Sample"
    let cancelled = false;
    const refresh = async () => {
      try {
        const r = await fetch(FEED_URL, { cache: 'no-store' });
        if (!r.ok) return;
        const data = (await r.json()) as { items?: FeedItem[] } | FeedItem[];
        const items = Array.isArray(data) ? data : data.items;
        if (!cancelled && items && items.length > 0) {
          setFeed(items);
          setIsLive(true);
        }
      } catch {
        /* keep seed */
      }
    };
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const active = feed[activeIdx];
  if (!active) return null;

  return (
    <div className="border-t border-line-dark pt-6">
      <div
        className={cn(
          'mb-3 flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-widest',
          isLive ? 'text-success' : 'text-amber',
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 animate-live-pulse rounded-full',
            isLive ? 'bg-success' : 'bg-amber',
          )}
        />
        {isLive ? 'Live · Recent quote requests' : 'Sample · Recent quote requests'}
      </div>
      <div className="relative h-7 overflow-hidden">
        {feed.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'absolute inset-0 flex items-center gap-3 transition-all duration-500',
              i === activeIdx ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          >
            <span className="w-14 font-mono text-xs text-mist-dim">{item.minutes_ago} min</span>
            <span className="flex-1 truncate font-mono text-sm text-bone">
              {formatSize(item.size)} ·{' '}
              <span className="text-teal-glow">{item.from_neighborhood}</span> →{' '}
              <span className="text-teal-glow">{item.to_neighborhood}</span>
            </span>
            <span className="font-mono text-sm text-ember-warm">
              {formatPrice(item.quote_amount_cents)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
