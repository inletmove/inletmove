'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { LangSwitcher } from './LangSwitcher';

/**
 * Sticky nav. Translucent over dark hero, switches to a light treatment
 * once the user scrolls past the hero. Mobile collapses to a hamburger.
 */
export function Nav() {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-8',
        'backdrop-blur-xl backdrop-saturate-150',
        scrolledPastHero
          ? 'bg-paper/85 text-inlet-navy border-b border-line-light'
          : 'bg-black/70 text-bone border-b border-line-dark',
      )}
      aria-label="Primary"
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 font-display text-[1.2rem] tracking-tight display-soft"
      >
        <span>
          inlet move <span className="text-ember">.</span>
        </span>
        <span
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wider',
            'bg-success/10 text-success',
          )}
        >
          <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-success" />
          Live
        </span>
      </Link>

      <ul className="hidden items-center gap-7 md:flex">
        <li>
          <Link
            href="/#how-it-works"
            className="font-body text-sm font-medium opacity-80 hover:opacity-100"
          >
            How it works
          </Link>
        </li>
        <li>
          <Link
            href="/movers"
            className="font-body text-sm font-medium opacity-80 hover:opacity-100"
          >
            Service area
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="font-body text-sm font-medium opacity-80 hover:opacity-100"
          >
            About
          </Link>
        </li>
        <li>
          <LangSwitcher inverted={!scrolledPastHero} />
        </li>
        <li>
          <Link
            href="/quote"
            className="rounded-full bg-ember px-4 py-2 font-body text-sm font-semibold text-bone transition-all hover:-translate-y-px hover:bg-ember-warm"
          >
            Get a quote →
          </Link>
        </li>
      </ul>

      <button
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span
          className={cn(
            'block h-px w-5 bg-current transition-all',
            mobileOpen && 'translate-y-[7px] rotate-45',
          )}
        />
        <span className={cn('block h-px w-5 bg-current transition-all', mobileOpen && 'opacity-0')} />
        <span
          className={cn(
            'block h-px w-5 bg-current transition-all',
            mobileOpen && '-translate-y-[7px] -rotate-45',
          )}
        />
      </button>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-line-light bg-paper/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <Link href="/quote" className="rounded-md py-2 text-inlet-navy hover:bg-bone-warm">
            Get a quote
          </Link>
          <Link href="/#how-it-works" className="rounded-md py-2 text-inlet-navy hover:bg-bone-warm">
            How it works
          </Link>
          <Link href="/movers" className="rounded-md py-2 text-inlet-navy hover:bg-bone-warm">
            Service area
          </Link>
          <Link href="/about" className="rounded-md py-2 text-inlet-navy hover:bg-bone-warm">
            About
          </Link>
          <div className="mt-2 border-t border-line-light pt-3">
            <LangSwitcher inverted={false} />
          </div>
        </div>
      )}
    </nav>
  );
}
