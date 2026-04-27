import { useEffect, useRef, useState } from 'react';

/**
 * NumberTicker — counter-up that triggers when the element enters the
 * viewport. Replaces the inline implementation in BigNumbers/HeroCounters
 * so the easing and reduced-motion handling lives in exactly one place.
 *
 * Honors prefers-reduced-motion (renders the final value immediately).
 */
interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function NumberTicker({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1100,
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [reduced, setReduced] = useState(false);
  const triggered = useRef(false);

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
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !triggered.current) {
            triggered.current = true;
            if (reduced) {
              setDisplay(value);
              return;
            }
            const start = performance.now();
            let raf = 0;
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(value * eased);
              if (t < 1) raf = requestAnimationFrame(tick);
              else setDisplay(value);
            };
            raf = requestAnimationFrame(tick);
            return () => cancelAnimationFrame(raf);
          }
        }
      },
      { rootMargin: '-10%' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration, reduced]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
