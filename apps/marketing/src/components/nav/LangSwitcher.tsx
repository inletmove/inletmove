import { useState } from 'react';
import { cn } from '@/lib/cn';

type Locale = 'en' | 'zh' | 'pa' | 'hi';

const LOCALES: {
  code: Locale;
  native: string;
  english: string;
  status: 'live' | 'coming_soon';
}[] = [
  { code: 'en', native: 'English', english: 'English', status: 'live' },
  { code: 'zh', native: '中文', english: 'Mandarin / Cantonese', status: 'coming_soon' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', status: 'coming_soon' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi', status: 'coming_soon' },
];

export default function LangSwitcher({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const active: Locale = 'en';
  const activeLabel = LOCALES.find((l) => l.code === active)?.native ?? 'English';

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 font-body text-sm font-medium opacity-80 hover:opacity-100',
          inverted ? 'text-bone' : 'text-inlet-navy',
        )}
      >
        <span aria-hidden>🌐</span>
        <span>{activeLabel}</span>
        <span className={cn('text-[0.6rem] transition-transform', open && 'rotate-180')}>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[14rem] overflow-hidden rounded-md border border-line-light bg-paper shadow-lg"
        >
          {LOCALES.map((loc) => {
            const disabled = loc.status === 'coming_soon';
            return (
              <button
                key={loc.code}
                type="button"
                role="menuitem"
                disabled={disabled}
                aria-disabled={disabled}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-body text-sm',
                  disabled
                    ? 'cursor-not-allowed text-graphite'
                    : 'text-inlet-navy hover:bg-bone-warm',
                  loc.code === active && 'bg-bone-warm font-semibold',
                )}
              >
                <span>
                  <span className="block">{loc.native}</span>
                  <span className="block text-[0.7rem] text-graphite">{loc.english}</span>
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
