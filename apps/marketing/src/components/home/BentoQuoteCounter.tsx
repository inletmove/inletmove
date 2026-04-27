import { useEffect, useRef, useState } from 'react';

/**
 * Tiny React island for the "Itemized quote" bento card. Counts up from $0
 * to a target dollar amount once on viewport-enter. Honors reduced-motion.
 *
 * Sits as an absolutely-positioned overlay badge on top of the card photo
 * so the card itself stays static-by-default.
 */

interface Props {
  target: number;
  durationMs?: number;
  prefix?: string;
  label?: string;
}

export default function BentoQuoteCounter({
  target,
  durationMs = 1600,
  prefix = '$',
  label = 'Sample quote',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !triggered.current) {
            triggered.current = true;
            if (reduced) {
              setDisplay(target);
              obs.disconnect();
              return;
            }
            const start = performance.now();
            let raf = 0;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(target * eased);
              if (t < 1) raf = requestAnimationFrame(tick);
              else setDisplay(target);
            };
            raf = requestAnimationFrame(tick);
            obs.disconnect();
            return () => cancelAnimationFrame(raf);
          }
        }
      },
      { rootMargin: '-10%' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs]);

  const formatted = Math.round(display).toLocaleString('en-CA');

  return (
    <div
      ref={ref}
      className="absolute right-3 top-3 z-10 rounded-md bg-inlet-deep/90 px-3 py-2 text-bone shadow-md backdrop-blur"
      aria-label={`${label}: ${prefix}${formatted}`}
    >
      <div className="font-mono text-[0.55rem] uppercase tracking-widest text-mist-dim">
        {label}
      </div>
      <div className="font-display text-lg font-medium tabular-nums leading-none text-bone display-soft">
        {prefix}
        {formatted}
      </div>
    </div>
  );
}
