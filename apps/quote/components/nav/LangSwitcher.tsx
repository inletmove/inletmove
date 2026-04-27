'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { LOCALE_LABELS, LOCALE_STATUS, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * Locale switcher. en is live; zh/pa/hi are disabled with "(Coming soon)".
 * Component contract is locked so Week 3 can swap in real routing
 * (e.g. /zh, /pa, /hi via next-intl) without changing call sites.
 */
export function LangSwitcher({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const [active] = useState<Locale>('en');

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          track('lang_switcher_opened');
        }}
        className={cn(
          'flex items-center gap-1.5 font-body text-sm font-medium opacity-80 hover:opacity-100',
          inverted ? 'text-bone' : 'text-inlet-navy',
        )}
      >
        <span aria-hidden>🌐</span>
        <span>{LOCALE_LABELS[active].native}</span>
        <span className={cn('text-[0.6rem] transition-transform', open && 'rotate-180')}>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[12rem] overflow-hidden rounded-md border border-line-light bg-paper shadow-lg"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const status = LOCALE_STATUS[loc];
            const disabled = status === 'coming_soon';
            return (
              <button
                key={loc}
                type="button"
                role="menuitem"
                disabled={disabled}
                aria-disabled={disabled}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-body text-sm',
                  disabled
                    ? 'cursor-not-allowed text-graphite'
                    : 'text-inlet-navy hover:bg-bone-warm',
                  loc === active && 'bg-bone-warm font-semibold',
                )}
              >
                <span>
                  <span className="block">{LOCALE_LABELS[loc].native}</span>
                  <span className="block text-[0.7rem] text-graphite">
                    {LOCALE_LABELS[loc].english}
                  </span>
                </span>
                {disabled && (
                  <span className="rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-amber">
                    Coming soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
