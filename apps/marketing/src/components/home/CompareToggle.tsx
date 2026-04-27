import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/cn';

type View = 'old' | 'new';

const VIEWS: Record<
  View,
  { title: string; titleEm: string; list: string[]; iconClass: string; icon: string }
> = {
  old: {
    title: 'How a move',
    titleEm: 'typically goes (the old way).',
    list: [
      'Phone tag for days',
      'Strangers in your home for an "estimate"',
      'Surprise fees on move day',
      'Anonymous crews · no introduction · no accountability',
      'Heavy item upcharges per piano, fridge, sofa',
      'No accountability if something is damaged',
      'One-size-fits-all crews · no senior expertise',
      'English-only contracts and crews',
    ],
    iconClass: 'bg-ember/15 text-ember',
    icon: '×',
  },
  new: {
    title: 'How a move',
    titleEm: 'actually works at Inlet.',
    list: [
      'Real human texts back inside an hour',
      'Quote in 60 seconds online — no site visit',
      'Quote = bill · target overage under 5%',
      'Trained, vetted, branded crew · introduced by name',
      'Honest hourly billing — no per-item fees',
      'Photo documentation on every job · insured',
      'Trained for senior, multigen, & cultural moves',
      'Multi-language: English (live), 中文, ਪੰਜਾਬੀ, हिंदी (coming soon)',
    ],
    iconClass: 'bg-pacific/15 text-pacific',
    icon: '✓',
  },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CompareToggle() {
  const [view, setView] = useState<View>('new');
  const v = VIEWS[view];

  return (
    <section aria-label="Compare" className="bg-bone px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
            See the difference
          </p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Two ways to <em className="display-italic text-ember">move.</em>
          </h2>
        </div>

        {/* Toggle with shared-element animated underline */}
        <div
          className="mb-10 flex w-full max-w-md flex-col rounded-full border border-line-mid bg-bone-warm p-1 sm:inline-flex sm:w-auto sm:flex-row"
          role="tablist"
        >
          {(['old', 'new'] as View[]).map((k) => {
            const active = view === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(k)}
                className={cn(
                  'relative flex min-h-[48px] flex-1 items-center justify-center rounded-full px-6 py-3 font-body text-sm font-semibold transition-colors duration-200',
                  active ? 'text-bone' : 'text-graphite hover:text-charcoal',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="compare-toggle-active-bg"
                    className="absolute inset-0 rounded-full bg-inlet-navy"
                    transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                    aria-hidden
                  />
                )}
                <span className="relative z-10">
                  {k === 'old' ? '⊘ The old way' : '→ The Inlet way'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-line-light bg-paper p-7 md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'new' ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'new' ? -18 : 18 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <h3 className="mb-5 font-display text-3xl font-medium leading-tight tracking-tight text-inlet-navy display-soft">
                {v.title} <em className="display-italic text-ember">{v.titleEm}</em>
              </h3>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {v.list.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 py-2 font-body text-[0.9375rem] text-charcoal"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        v.iconClass,
                      )}
                    >
                      {v.icon}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
