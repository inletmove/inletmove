import type { Metadata } from 'next';
import Link from 'next/link';
import neighborhoodsData from '@/content/neighborhoods.json';

type Neighborhood = {
  slug: string;
  display_name: string;
  city: string;
  region: string;
  tier: number;
  primary_persona: string;
  intro: string;
  active: boolean;
};

const NEIGHBORHOODS: Neighborhood[] = (neighborhoodsData.neighborhoods as Neighborhood[]).filter(
  (n) => n.active,
);

export const metadata: Metadata = {
  title: 'Service area · Metro Vancouver',
  description:
    'Inlet Move Co. serves all of Metro Vancouver. Same-week local moves from $150/hr, $300 minimum.',
};

export default function MoversIndexPage() {
  // Group by city
  const byCity = NEIGHBORHOODS.reduce<Record<string, Neighborhood[]>>((acc, n) => {
    (acc[n.city] ??= []).push(n);
    return acc;
  }, {});

  const cities = Object.keys(byCity).sort();

  return (
    <article className="bg-paper px-6 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-container">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
          Service area
        </p>
        <h1 className="mb-3 font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
          Where we <em className="display-italic text-ember">work.</em>
        </h1>
        <p className="mb-12 max-w-2xl font-body text-lg text-graphite">
          Inlet Move Co. serves all of Metro Vancouver. Below is the active list of neighborhoods
          with dedicated guides; if your neighborhood isn't listed yet, we still service it — just{' '}
          <Link className="text-pacific underline" href="/quote">
            grab a quote
          </Link>
          .
        </p>

        <div className="space-y-12">
          {cities.map((city) => (
            <section key={city}>
              <h2 className="mb-4 font-display text-2xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
                {city}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byCity[city]?.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/movers/${n.slug}`}
                      className="group block rounded-xl border border-line-light bg-bone p-5 transition-all hover:-translate-y-0.5 hover:border-pacific/40 hover:bg-paper"
                    >
                      <h3 className="font-display text-lg font-medium tracking-tight text-inlet-navy display-soft">
                        {n.display_name}
                      </h3>
                      <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-graphite">
                        {n.region}
                      </p>
                      <span className="mt-3 inline-block font-body text-sm text-pacific">
                        Movers in {n.display_name} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-12 font-mono text-[0.7rem] text-mist-dim">
          {NEIGHBORHOODS.length} neighborhoods live · 35 planned for full launch (Week 3).
        </p>
      </div>
    </article>
  );
}
