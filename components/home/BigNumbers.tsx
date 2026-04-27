'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

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
    label: 'Average response to a quote request',
  },
  {
    key: 'overage',
    value: 4.1,
    unit: '%',
    decimals: 1,
    label: 'Average overage from quote to final bill',
    caveat: 'Industry: ~22%',
  },
  {
    key: 'ontime',
    value: 98,
    unit: '%',
    label: 'On-time arrivals (year-to-date)',
  },
  {
    key: 'coverage',
    prefix: '$',
    value: 2,
    unit: 'M',
    label: 'Cargo + liability coverage on every move',
  },
];

export function BigNumbers() {
  return (
    <section
      aria-label="By the numbers"
      className="bg-inlet-deep px-6 py-24 text-bone md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-container">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teal-glow">
            By the numbers
          </p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-bone display-soft">
            What honest moving <em className="display-italic text-ember-warm">looks like.</em>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <NumberCard key={n.key} num={n} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NumberCard({ num }: { num: Num }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? num.value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // eased
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(num.value * eased);
      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(num.value);
    };
    requestAnimationFrame(tick);
  }, [inView, num.value, reduced]);

  const formatted = (num.decimals ?? 0) > 0
    ? display.toFixed(num.decimals)
    : Math.round(display).toString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-line-darker pt-6"
    >
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
    </motion.div>
  );
}
