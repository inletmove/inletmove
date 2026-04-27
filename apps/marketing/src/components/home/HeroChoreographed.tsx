import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import HeroPhoneScreens from './HeroPhoneScreens';

/**
 * Cinematic hero with two modes:
 *
 * - DESKTOP (≥768px, motion allowed): 180vh outer with a sticky-positioned
 *   inner stage. Scroll progress (0 → 1) drives:
 *     0–15%   headline fade-in, phone scales 0.85→1.0 + y 60→0
 *     15–35%  headline locked, stats fade-up + counter, phone shows step 4
 *     35–55%  headline fades to 0.4, phone shows step 5, booking feed slides in
 *     55–75%  headline 0, phone shows step 6
 *     75–100% phone shows success screen, all content released
 *
 * - MOBILE (<768px) and reduced-motion: simpler. No scroll-pinning.
 *   Phone screen auto-cycles 4 → 5 → 6 → 7 → 4 every 2.5s using setInterval.
 *   Counters animate on viewport-enter (whileInView).
 *
 * Honesty contracts: still says "Currently booking same-week local moves",
 * still labels the response/overage/on-time numbers as Target, no
 * "owner-operated" or "Bodycam Live · Recording" claims.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

interface Counter {
  key: string;
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

const COUNTERS: Counter[] = [
  { key: 'response', value: 11, suffix: 'min', label: 'Target response' },
  { key: 'overage', value: 4.1, suffix: '%', decimals: 1, label: 'Target overage' },
  { key: 'ontime', value: 98, suffix: '%', label: 'Target on-time' },
  { key: 'rate', prefix: '$', value: 150, suffix: '/hr', label: '$300 minimum' },
];

interface FeedItem {
  size: string;
  from: string;
  to: string;
  ago: string;
  amount: string;
}

const FEED: FeedItem[] = [
  { size: '1-bed', from: 'Mt Pleasant', to: 'Yaletown', ago: '2 min', amount: '$600' },
  { size: '2-bed', from: 'Burnaby', to: 'North Van', ago: '14 min', amount: '$1,150' },
  { size: 'studio', from: 'Kitsilano', to: 'Kerrisdale', ago: '28 min', amount: '$450' },
  { size: 'multigen', from: 'Surrey', to: 'New West', ago: '41 min', amount: '$1,650' },
];

/** Animated numeric counter that ticks up when `play` flips true. */
function CounterValue({ value, decimals = 0, prefix = '', suffix = '', play, durationMs = 1600 }: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  play: boolean;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!play) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, value, durationMs, reduced]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();
  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="phone-mockup-3d relative z-10 mx-auto h-[560px] w-[270px] rounded-[44px] bg-gradient-to-br from-[#1a1d28] to-[#0a0d18] p-2 shadow-phone md:h-[580px] md:w-[280px]"
      style={{
        boxShadow:
          '0 0 0 2px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(31, 122, 140, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        willChange: 'transform',
      }}
      aria-label="Inlet Move app quote flow preview"
    >
      <div
        className="absolute left-1/2 top-2 z-20 h-[26px] w-[100px] -translate-x-1/2 rounded-[14px] bg-black"
        aria-hidden
      />
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[36px] bg-paper">
        <div className="flex items-center justify-between px-6 pt-3.5 font-mono text-xs font-semibold text-charcoal">
          <span>9:41</span>
          <span className="inline-flex items-end gap-[3px]" aria-hidden>
            <span className="h-1 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-1.5 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-2 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-2.5 w-[3px] rounded-sm bg-charcoal" />
          </span>
        </div>
        <div className="relative flex-1">{children}</div>
      </div>
    </div>
  );
}

function HeadlineBlock() {
  return (
    <>
      <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-success">
        <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-success shadow-[0_0_10px_rgba(77,139,110,0.8)]" />
        Currently booking same-week local moves
      </span>
      <h1 className="mb-6 font-display font-medium text-bone display-soft text-display-1">
        Moving in Metro Vancouver,{' '}
        <em className="display-italic bg-gradient-to-br from-ember-warm to-ember bg-clip-text text-transparent">
          with care.
        </em>
      </h1>
      <p className="mb-9 max-w-prose font-body text-[1.0625rem] leading-relaxed text-mist">
        Two movers + cargo van. From <strong className="font-medium text-bone">$150/hr</strong>,{' '}
        <strong className="font-medium text-bone">$300 minimum</strong>. Same-week local moves
        across Metro Vancouver.
      </p>
      <div className="mb-9 flex flex-wrap gap-4">
        <a
          href="/quote"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-md bg-ember px-6 py-3 font-body text-base font-semibold text-bone shadow-cta transition-all hover:-translate-y-px hover:scale-[1.02] hover:bg-ember-warm active:scale-[0.98]"
        >
          Get your quote in 60 seconds <span aria-hidden>→</span>
        </a>
        <a
          href="tel:6040000000"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-line-darker bg-white/5 px-6 py-3 font-body text-base font-semibold text-bone transition hover:bg-white/10"
        >
          <span aria-hidden>📞</span> (604) 000-0000
        </a>
      </div>
      <p className="mb-6 font-body text-sm text-mist-dim">
        Real humans. Vancouver-based. Trained, vetted, branded crew · introduced by name.
      </p>
    </>
  );
}

function StatsRow({ play }: { play: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line-dark pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
      {COUNTERS.map((c) => (
        <div key={c.key} className="flex flex-col gap-0.5">
          <div className="font-display text-[1.75rem] font-medium leading-none tabular-nums tracking-tight text-bone display-soft">
            <CounterValue
              value={c.value}
              decimals={c.decimals}
              prefix={c.prefix}
              suffix=""
              play={play}
            />
            <span className="font-display text-[0.7em] italic text-ember display-italic">
              {c.suffix}
            </span>
          </div>
          <div className="font-mono text-[0.6875rem] uppercase tracking-widest text-mist-dim">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingFeed() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FEED.length), 3000);
    return () => clearInterval(t);
  }, []);
  const active = FEED[idx];
  return (
    <div className="border-t border-line-dark pt-6">
      <div className="mb-3 flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-amber">
        <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-amber" />
        Sample · Recent quote requests
      </div>
      <div className="relative h-7 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.size + active.from + active.to}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0 flex items-center gap-3"
          >
            <span className="w-14 font-mono text-xs text-mist-dim">{active.ago}</span>
            <span className="flex-1 truncate font-mono text-sm text-bone">
              {active.size} ·{' '}
              <span className="text-teal-glow">{active.from}</span>
              {' → '}
              <span className="text-teal-glow">{active.to}</span>
            </span>
            <span className="font-mono text-sm text-ember-warm">{active.amount}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Background atmospherics — aurora drift via CSS keyframes (defined in global.css). */
function HeroBackground() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(31, 122, 140, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(231, 111, 81, 0.06), transparent 70%), linear-gradient(180deg, #050810 0%, #0E1F36 100%)',
        }}
      />
      <div aria-hidden className="hero-aurora absolute inset-0 pointer-events-none" />
    </>
  );
}

/* ===================================================================
 * MOBILE — static layout, auto-cycling phone screen, viewport counter
 * =================================================================== */
function HeroMobile() {
  const [step, setStep] = useState(4);
  const [counterPlay, setCounterPlay] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s >= 7 ? 4 : s + 1));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!counterRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setCounterPlay(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: '-10%' },
    );
    obs.observe(counterRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-black px-6 pb-12 pt-24"
    >
      <HeroBackground />
      <div className="relative z-10 mx-auto flex max-w-container flex-col gap-10">
        <div>
          <HeadlineBlock />
        </div>
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute h-[80%] w-[80%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(31, 122, 140, 0.25) 0%, transparent 60%)',
              filter: 'blur(40px)',
            }}
          />
          <PhoneFrame>
            <HeroPhoneScreens step={step} />
          </PhoneFrame>
        </div>
        <div ref={counterRef}>
          <StatsRow play={counterPlay} />
        </div>
        <BookingFeed />
      </div>
    </section>
  );
}

/* ===================================================================
 * DESKTOP — sticky-positioned scroll choreography
 * =================================================================== */
function HeroDesktop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // 0–15: headline fade-in. 15–55: locked. 55–75: fades to 0. >75: off.
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.7], [0, 1, 1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 0.15, 0.7], [24, 0, -20]);

  const phoneScale = useTransform(scrollYProgress, [0, 0.35], [0.88, 1]);
  const phoneY = useTransform(scrollYProgress, [0, 0.35], [50, 0]);

  const statsOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.45, 0.6], [0, 1, 1, 0]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.25], [16, 0]);

  const feedOpacity = useTransform(scrollYProgress, [0.4, 0.55, 0.7, 0.85], [0, 1, 1, 0]);
  const feedX = useTransform(scrollYProgress, [0.4, 0.55], [40, 0]);

  // Phone "step" derived from scroll progress
  const [step, setStep] = useState(4);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let s = 4;
    if (v >= 0.35 && v < 0.55) s = 5;
    else if (v >= 0.55 && v < 0.75) s = 6;
    else if (v >= 0.75) s = 7;
    setStep((prev) => (prev === s ? prev : s));
  });

  // Counter triggers when stats become visible
  const [counterPlay, setCounterPlay] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!counterPlay && v > 0.18) setCounterPlay(true);
  });

  // Reduced-motion fallback: render a static, fully-revealed version
  if (reduced) {
    return (
      <section
        aria-label="Hero"
        className="relative overflow-hidden bg-black px-6 pb-16 pt-28 md:px-8 md:pt-32"
      >
        <HeroBackground />
        <div className="relative z-10 mx-auto grid max-w-container items-center gap-12 md:min-h-[80vh] md:grid-cols-[1.05fr_1fr]">
          <div>
            <HeadlineBlock />
            <StatsRow play={true} />
            <div className="mt-6">
              <BookingFeed />
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden
              className="absolute h-[90%] w-[90%] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(31, 122, 140, 0.25) 0%, transparent 60%)',
                filter: 'blur(40px)',
              }}
            />
            <PhoneFrame>
              <HeroPhoneScreens step={4} />
            </PhoneFrame>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Hero"
      className="hero-stage relative bg-black"
      style={{ height: '180vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-8">
        <HeroBackground />
        <div className="relative z-10 mx-auto grid w-full max-w-container items-center gap-12 md:grid-cols-[1.05fr_1fr]">
          <motion.div style={{ opacity: headlineOpacity, y: headlineY }}>
            <HeadlineBlock />
            <motion.div style={{ opacity: statsOpacity, y: statsY }}>
              <StatsRow play={counterPlay} />
            </motion.div>
            <motion.div className="mt-6" style={{ opacity: feedOpacity, x: feedX }}>
              <BookingFeed />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center"
            style={{ scale: phoneScale, y: phoneY }}
          >
            <div
              aria-hidden
              className="absolute h-[90%] w-[90%] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(31, 122, 140, 0.25) 0%, transparent 60%)',
                filter: 'blur(40px)',
              }}
            />
            <PhoneFrame>
              <HeroPhoneScreens step={step} />
            </PhoneFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
 * Top-level — picks desktop vs mobile based on viewport
 * =================================================================== */
export default function HeroChoreographed() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // SSR / first paint — render the desktop layout; mobile re-renders on mount
  if (isMobile === null || !isMobile) return <HeroDesktop />;
  return <HeroMobile />;
}
