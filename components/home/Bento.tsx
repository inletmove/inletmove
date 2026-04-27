import { cn } from '@/lib/cn';
import { useTranslations } from '@/lib/i18n';

type Card = {
  key: string;
  tag: string;
  status: 'live' | 'soon';
  title: string;
  body: string;
  span: 'sm' | 'md' | 'lg';
  imageLabel: string; // placeholder caption until Week 3 Figma exports land
};

const CARDS: Card[] = [
  {
    key: 'ai_inventory',
    tag: 'Coming Q3 2026',
    status: 'soon',
    title: 'AI photo inventory',
    body: 'Walk your home with the camera. We identify items, estimate volume, and price the move — without a site visit.',
    span: 'lg',
    imageLabel: 'AI inventory UI mockup · Figma export Week 3',
  },
  {
    key: 'documentation',
    tag: 'Real today',
    status: 'live',
    title: 'Photo documentation',
    body: 'Every job gets photo records. Fragile items, before-and-after, load-out. If anything is questioned, there is proof.',
    span: 'md',
    imageLabel: 'Crew with phone · photo Week 2',
  },
  {
    key: 'bodycam',
    tag: 'Pilot Q4 2026',
    status: 'soon',
    title: 'Bodycam ops',
    body: 'For senior and multigen moves. You see what we see. Footage archived 90 days.',
    span: 'sm',
    imageLabel: 'Bodycam viewfinder · Figma export Week 3',
  },
  {
    key: 'live_tracking',
    tag: 'Coming Q3 2026',
    status: 'soon',
    title: 'Live crew tracking',
    body: 'Watch the truck en route. SMS updates today; live map by Q3.',
    span: 'sm',
    imageLabel: 'Map mockup · Figma export Week 3',
  },
  {
    key: 'quote_receipt',
    tag: 'Real today',
    status: 'live',
    title: 'Itemized quote',
    body: 'Hourly billing. No fuel surcharge, no stair fee, no weekend upcharge. Quote = bill.',
    span: 'md',
    imageLabel: 'Receipt mockup · Figma export Week 3',
  },
];

const spanClasses: Record<Card['span'], string> = {
  sm: 'md:col-span-2',
  md: 'md:col-span-3',
  lg: 'md:col-span-4',
};

export function Bento() {
  const t = useTranslations();
  return (
    <section
      id="how-it-works"
      aria-label="What you get"
      className="bg-paper px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-container">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
            {t('bento.eyebrow')}
          </p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            The whole move, <em className="display-italic text-pacific">on one page.</em>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {CARDS.map((card) => (
            <BentoCard key={card.key} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ card }: { card: Card }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-line-light bg-bone p-7 transition-all hover:-translate-y-1 hover:shadow-lg',
        spanClasses[card.span],
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.6875rem] font-medium uppercase tracking-wider',
            card.status === 'live'
              ? 'bg-success/10 text-success'
              : 'bg-amber/15 text-amber',
          )}
        >
          {card.status === 'live' && (
            <span className="h-1 w-1 rounded-full bg-success" aria-hidden />
          )}
          {card.tag}
        </span>
      </div>

      <h3 className="mb-3 font-display text-2xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
        {card.title}
      </h3>
      <p className="mb-6 font-body text-[0.9375rem] leading-relaxed text-graphite">{card.body}</p>

      {/* Asset placeholder. Replaced Week 3 with real Figma export. */}
      <div
        className="mt-auto flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-line-mid bg-bone-warm/60 p-4 text-center"
        aria-label={card.imageLabel}
      >
        <span className="font-mono text-xs text-mist-dim">[ {card.imageLabel} ]</span>
      </div>
    </article>
  );
}
