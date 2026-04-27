import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrustBadges } from '@/components/home/TrustBadges';
import { CompareToggle } from '@/components/home/CompareToggle';
import { FinalCTA } from '@/components/home/FinalCTA';
import neighborhoodsData from '@/content/neighborhoods.json';

type Neighborhood = {
  slug: string;
  display_name: string;
  city: string;
  region: string;
  postal_codes: string[];
  tier: number;
  primary_persona: string;
  intro: string;
  common_moves: string;
  common_pickup_addresses_hint: string;
  average_move_hours: number;
  active: boolean;
};

const NEIGHBORHOODS: Neighborhood[] = neighborhoodsData.neighborhoods as Neighborhood[];

export function generateStaticParams() {
  return NEIGHBORHOODS.filter((n) => n.active).map((n) => ({ neighborhood: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { neighborhood: string };
}): Promise<Metadata> {
  const n = NEIGHBORHOODS.find((x) => x.slug === params.neighborhood);
  if (!n) return { title: 'Movers' };
  const title = `Movers in ${n.display_name}, ${n.city}`;
  const description = `Inlet Move Co. handles ${n.display_name} moves from $150/hr, $300 minimum. Same-week availability. Quote in 60 seconds.`;
  return { title, description };
}

export default function NeighborhoodPage({
  params,
}: {
  params: { neighborhood: string };
}) {
  const n = NEIGHBORHOODS.find((x) => x.slug === params.neighborhood && x.active);
  if (!n) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: `Inlet Move Co. — ${n.display_name}`,
    description: n.intro,
    areaServed: {
      '@type': 'Place',
      name: `${n.display_name}, ${n.city}, BC`,
    },
    priceRange: '$150-$300/hr (2-mover crew, hourly billing, $300 minimum)',
    telephone: '+1-604-000-0000',
    url: `https://inletmove.com/movers/${n.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="bg-paper px-6 pb-12 pt-32 md:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
            <Link className="hover:text-inlet-navy" href="/movers">
              Service area
            </Link>{' '}
            · {n.city}
          </p>
          <h1 className="mb-4 font-display text-display-1 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Movers in <em className="display-italic text-ember">{n.display_name}.</em>
          </h1>
          <p className="mb-3 font-mono text-sm text-graphite">
            {n.region} · {n.postal_codes.join(' · ')}
          </p>

          <div className="space-y-6 font-body text-lg leading-relaxed text-charcoal">
            <p>{n.intro}</p>

            <h2 className="pt-4 font-display text-2xl font-medium leading-tight text-inlet-navy display-soft">
              Common moves we run in {n.display_name}
            </h2>
            <p>{n.common_moves}</p>
            <p className="font-mono text-sm text-graphite">
              Typical pickup addresses: {n.common_pickup_addresses_hint}
              <br />
              Average move duration: {n.average_move_hours} hours.
            </p>

            <h2 className="pt-4 font-display text-2xl font-medium leading-tight text-inlet-navy display-soft">
              Pricing
            </h2>
            <p>
              $150/hr per two-mover crew + cargo van. $300 minimum. Hourly rate includes wrap,
              padding, basic disassembly and reassembly, fuel, and insurance. No surcharges for
              stairs, weekends, or fuel.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              href={`/quote?from=${encodeURIComponent(n.display_name)}`}
              variant="primary"
              size="lg"
              icon={<span className="arrow">→</span>}
            >
              Get a quote
            </Button>
            <Button href="/movers" variant="ghost-light" size="lg">
              Other neighborhoods
            </Button>
          </div>
        </div>
      </article>

      <CompareToggle />
      <TrustBadges />
      <FinalCTA />
    </>
  );
}
