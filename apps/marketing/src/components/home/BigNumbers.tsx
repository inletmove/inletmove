import { useEffect, useRef, useState } from 'react';

/**
 * Big numbers section with count-up animation when the section enters view.
 * Uses IntersectionObserver + requestAnimationFrame (no Framer Motion needed
 * for this — keeps the JS payload minimal). Honors prefers-reduced-motion.
 *
 * Honesty contracts: the response/overage/on-time numbers are explicitly
 * labeled "Target" because they are aspirational metrics. The $2M coverage
 * is real once the certificate is uploaded (see [Pending verification] in
 * TrustBadges).
 */

type Num = {
  key: string;
  value: number;
  unit: string;
  prefix?: string;
  decimals?: number;
  label: string;
  caveat?: string;
};

const NUMBERS: Num[] = [
  {
    key: 'response',
    value: 11,
    unit: 'min',
    label: 'Target response to a quote request',
  },
  {
    key: 'overage',
    value: 4.1,
    unit: '%',
    decimals: 1,
    label: 'Target overage from quote to final bill',
    caveat: 'Industry typical: ~22%',
  },
  {
    key: 'ontime',
    value: 98,
    unit: '%',
    label: 'Target on-time arrival rate',
  },
  {
    key: 'coverage',
    prefix: '$',
    value: 2,
    unit: 'M',
    label: 'Cargo + liability coverage on every move',
    caveat: 'Certificate URL [Pending verification]',
  },
];

function NumberCard({ num }: { num: Num }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '-10%' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      setDisplay(0);
      return;
    }
    if (reduced) {
      setDisplay(num.value);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(num.value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(num.value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num.value, reduced]);

  const formatted =
    (num.decimals ?? 0) > 0 ? display.toFixed(num.decimals) : Math.round(display).toString();

  return (
    <div ref={ref} className="border-t border-line-darker pt-6">
      <div className="mb-3 font-display font-medium tabular-nums text-bone display-soft">
        <span className="text-[3.25rem] leading-none tracking-tight md:text-[4rem]">
          {num.prefix}
          {formatted}
        </span>
        <span className="ml-1 font-display text-[0.55em] italic text-ember-warm display-italic">
          {num.unit}
        </span>
      </div>
      <p className="font-body text-[0.9375rem] leading-snug text-mist">{num.label}</p>
      {num.caveat && (
        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-mist-dim">
          {num.caveat}
        </p>
      )}
    </div>
  );
}

export default function BigNumbers() {
  return (
    <section
      aria-label="By the numbers"
      className="bg-inlet-deep px-6 py-24 text-bone md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-container">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-glow">
            Targets we hold ourselves to
          </p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-bone display-soft">
            What honest moving{' '}
            <em className="display-italic text-ember-warm">looks like.</em>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <NumberCard key={n.key} num={n} />
          ))}
        </div>

        <p className="mt-10 font-mono text-[0.7rem] text-mist-dim">
          These are stated targets, not measured year-to-date averages. We will publish
          measured numbers after the first 30 jobs.
        </p>
      </div>
    </section>
  );
}
