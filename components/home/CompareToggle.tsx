'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';

type View = 'old' | 'new';

const VIEWS: Record<
  View,
  {
    title: string;
    list: string[];
    iconClass: string;
    icon: string;
  }
> = {
  old: {
    title: 'How a move <em>typically</em> goes (the old way).',
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
    title: 'How a move <em>actually</em> works at Inlet.',
    list: [
      'Real human texts back inside an hour',
      'Quote in 60 seconds online — no site visit',
      'Quote = bill · 4.1% avg overage',
      'Trained, vetted, branded crew · introduced by name',
      'Honest hourly billing — no per-item fees',
      'Photo documentation on every job · insured',
      'Trained for senior, multigen, & cultural moves',
      'Multi-language: English, 中文, ਪੰਜਾਬੀ, हिंदी',
    ],
    iconClass: 'bg-pacific/15 text-pacific',
    icon: '✓',
  },
};

export function CompareToggle() {
  const [view, setView] = useState<View>('new');
  const v = VIEWS[view];

  return (
    <section
      aria-label="Compare"
      className="bg-bone px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pacific">
            See the difference
          </p>
          <h2 className="font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft">
            Two ways to <em className="display-italic text-ember">move.</em>
          </h2>
        </div>

        <div className="mb-10 inline-flex rounded-full border border-line-mid bg-bone-warm p-1">
          <button
            type="button"
            onClick={() => {
              setView('old');
              track('compare_toggle_clicked', { view: 'old' });
            }}
            aria-pressed={view === 'old'}
            className={cn(
              'rounded-full px-6 py-3 font-body text-sm font-semibold transition-colors',
              view === 'old' ? 'bg-inlet-navy text-bone' : 'text-graphite hover:text-charcoal',
            )}
          >
            ⊘ The old way
          </button>
          <button
            type="button"
            onClick={() => {
              setView('new');
              track('compare_toggle_clicked', { view: 'new' });
            }}
            aria-pressed={view === 'new'}
            className={cn(
              'rounded-full px-6 py-3 font-body text-sm font-semibold transition-colors',
              view === 'new' ? 'bg-inlet-navy text-bone' : 'text-graphite hover:text-charcoal',
            )}
          >
            → The Inlet way
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-line-light bg-paper p-8 md:p-10"
          >
            <h3
              className="mb-5 font-display text-3xl font-medium leading-tight tracking-tight text-inlet-navy display-soft"
              dangerouslySetInnerHTML={{
                __html: v.title.replaceAll(
                  '<em>',
                  '<em class="display-italic text-ember">',
                ),
              }}
            />
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {v.list.map((item) => (
                <li key={item} className="flex items-start gap-3 py-2 font-body text-[0.9375rem] text-charcoal">
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
    </section>
  );
}
