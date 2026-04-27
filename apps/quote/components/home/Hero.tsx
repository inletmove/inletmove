'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LiveBookingFeed } from './LiveBookingFeed';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/cn';

const COUNTERS = [
  { key: 'response', value: '11', unit: 'min', label: 'Avg response' },
  { key: 'overage', value: '4.1', unit: '%', label: 'Avg overage on quote' },
  { key: 'ontime', value: '98', unit: '%', label: 'On-time arrivals (YTD)' },
  { key: 'rate', value: '$150', unit: '/hr', label: '$300 minimum' },
] as const;

export function Hero() {
  const t = useTranslations();
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const reduced = useReducedMotion();

  // Get the headline list from the dictionary. For Week 1 this is wired
  // through useTranslations using dot-paths, so we read the array via JSON.
  // The dictionary is small and this is a one-time read; no need to memoize.
  const headlines = [
    t('hero.h1.0'),
    t('hero.h1.1'),
    t('hero.h1.2'),
  ];

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setHeadlineIdx((i) => (i + 1) % headlines.length), 4000);
    return () => clearInterval(id);
  }, [headlines.length, reduced]);

  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen overflow-hidden bg-black px-6 pb-16 pt-28 md:px-8 md:pt-32"
    >
      {/* Background gradient + noise overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(31, 122, 140, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(231, 111, 81, 0.06), transparent 70%), linear-gradient(180deg, #050810 0%, #0E1F36 100%)',
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-container items-center gap-12 md:min-h-[80vh] md:grid-cols-[1.05fr_1fr]">
        {/* Left column */}
        <div>
          <span
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-success"
          >
            <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-success shadow-[0_0_10px_rgba(77,139,110,0.8)]" />
            {t('hero.status')}
          </span>

          <h1
            className="mb-6 font-display font-medium text-bone display-soft text-display-1"
          >
            <motion.span
              key={headlineIdx}
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              dangerouslySetInnerHTML={{
                __html: (headlines[headlineIdx] ?? headlines[0] ?? '').replaceAll(
                  '<em>',
                  '<em class="display-italic bg-gradient-to-br from-ember-warm to-ember bg-clip-text text-transparent">',
                ),
              }}
            />
          </h1>

          <p
            className="mb-9 max-w-prose font-body text-[1.0625rem] leading-relaxed text-mist"
            dangerouslySetInnerHTML={{
              __html: t('hero.sub').replaceAll(
                '<strong>',
                '<strong class="font-medium text-bone">',
              ),
            }}
          />

          <div className="mb-9 flex flex-wrap gap-4">
            <Button href="/quote" variant="primary" size="lg" icon={<span className="arrow">→</span>}>
              {t('hero.cta_primary')}
            </Button>
            <Button href="tel:6040000000" variant="ghost-dark" size="lg">
              📞 {t('footer.phone_placeholder')}
            </Button>
          </div>

          <p className="mb-9 font-body text-sm text-mist-dim">{t('hero.trust_line')}</p>

          {/* Counters */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line-dark pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            {COUNTERS.map((c) => (
              <div key={c.key} className="flex flex-col gap-0.5">
                <div className="font-display text-[1.75rem] font-medium leading-none tabular-nums tracking-tight text-bone display-soft">
                  {c.value}
                  <span className="font-display text-[0.7em] italic text-ember display-italic">
                    {c.unit}
                  </span>
                </div>
                <div className="font-mono text-[0.6875rem] uppercase tracking-widest text-mist-dim">
                  {c.label}
                </div>
              </div>
            ))}
          </div>

          {/* Live feed */}
          <div className="mt-6">
            <LiveBookingFeed title={t('hero.live_feed_title')} />
          </div>
        </div>

        {/* Right column — phone mockup placeholder */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute h-[90%] w-[90%] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(31, 122, 140, 0.25) 0%, transparent 60%)',
              filter: 'blur(40px)',
            }}
          />
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

/**
 * Phone mockup — Week 1 placeholder: a hand-coded device frame
 * showing a stylized "Step 4 of 6" of the quote flow. Week 3 swaps
 * in the real Figma export at public/images/ui-mockups/phone-quote-step4.webp.
 */
function PhoneMockup() {
  return (
    <div
      className={cn(
        'relative z-10 mx-auto h-[580px] w-[280px] rounded-[44px] p-2 shadow-phone transition-transform duration-700 hover:-translate-y-1.5',
        'bg-gradient-to-br from-[#1a1d28] to-[#0a0d18]',
      )}
      style={{
        boxShadow:
          '0 0 0 2px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(31, 122, 140, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="absolute left-1/2 top-2 z-20 h-[26px] w-[100px] -translate-x-1/2 rounded-[14px] bg-black"
        aria-hidden
      />
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[36px] bg-paper">
        <div className="flex items-center justify-between px-6 pt-3.5 font-mono text-xs font-semibold text-charcoal">
          <span>9:41</span>
          <span className="inline-flex items-end gap-[3px]">
            <span className="h-1 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-1.5 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-2 w-[3px] rounded-sm bg-charcoal" />
            <span className="h-2.5 w-[3px] rounded-sm bg-charcoal" />
          </span>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-base font-medium tracking-tight text-inlet-navy display-soft">
              inlet move <span className="text-ember">.</span>
            </span>
            <span className="font-mono text-[0.625rem] font-medium uppercase tracking-widest text-graphite">
              Step 4 / 6
            </span>
          </div>

          <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-bone-warm">
            <div
              className="h-full rounded-full"
              style={{
                width: '67%',
                background: 'linear-gradient(90deg, #1F7A8C, #E76F51)',
              }}
            />
          </div>

          <div className="mb-2 font-display text-[1.4rem] font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            When are you moving?
          </div>
          <div className="mb-6 font-body text-sm text-graphite">Same-week available.</div>

          <div className="space-y-2">
            {['This Saturday', 'Next Tuesday', 'Next Saturday', 'Choose a date'].map((opt, i) => (
              <div
                key={opt}
                className={cn(
                  'flex items-center justify-between rounded-md border px-3.5 py-3 font-body text-sm',
                  i === 0
                    ? 'border-pacific bg-pacific/5 text-inlet-navy font-medium'
                    : 'border-line-mid text-charcoal',
                )}
              >
                <span>{opt}</span>
                {i === 0 && <span className="font-mono text-[0.625rem] text-pacific">SELECTED</span>}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-md bg-ember py-3 text-center font-body text-sm font-semibold text-bone shadow-cta">
            Continue →
          </div>
        </div>
      </div>
    </div>
  );
}
