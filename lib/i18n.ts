/**
 * Minimal Week 1 i18n. Contract is stable — Week 3 swaps in next-intl
 * without changing the call sites in components.
 *
 * Scope: en is fully wired. zh/pa/hi keys exist with the same shape but
 * are stubs (key === English value); the LangSwitcher component disables
 * non-English options with a "(Coming soon)" label.
 */

import en from '@/i18n/en.json';
import zh from '@/i18n/zh.json';
import pa from '@/i18n/pa.json';
import hi from '@/i18n/hi.json';

export const SUPPORTED_LOCALES = ['en', 'zh', 'pa', 'hi'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  zh: { native: '中文', english: 'Chinese' },
  pa: { native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  hi: { native: 'हिन्दी', english: 'Hindi' },
};

export const LOCALE_STATUS: Record<Locale, 'live' | 'coming_soon'> = {
  en: 'live',
  zh: 'coming_soon',
  pa: 'coming_soon',
  hi: 'coming_soon',
};

const dictionaries = { en, zh, pa, hi } as const;

type Dict = typeof en;

/**
 * Lookup a translation key (dot-path, e.g. "hero.h1.0").
 * Falls back to en if locale is missing the key. Returns the key
 * itself as last resort so missing strings are visible in dev.
 */
export function t(locale: Locale, key: string): string {
  const lookup = (dict: Record<string, unknown>, path: string[]): unknown => {
    return path.reduce<unknown>((acc, k) => {
      if (acc && typeof acc === 'object' && k in (acc as object)) {
        return (acc as Record<string, unknown>)[k];
      }
      return undefined;
    }, dict);
  };

  const path = key.split('.');
  const fromLocale = lookup(dictionaries[locale] as Record<string, unknown>, path);
  if (typeof fromLocale === 'string') return fromLocale;
  const fromEn = lookup(dictionaries.en as Record<string, unknown>, path);
  if (typeof fromEn === 'string') return fromEn;
  return key;
}

export function useTranslations(locale: Locale = DEFAULT_LOCALE) {
  return (key: keyof Dict | string) => t(locale, key as string);
}
