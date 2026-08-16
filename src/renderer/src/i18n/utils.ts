// Locale-aware formatting. Nothing in the app constructs an Intl formatter
// directly - a career is full of dates, money and durations, and getting the
// Ukrainian forms right later costs far more than routing them through here now.

import { DEFAULT_CURRENCY, FALLBACK_LANGUAGE, LOCALES } from './constants.ts';
import type { Formatters } from './types.ts';
import { MS_PER_SECOND } from '../../../shared/constants';
import type { Language } from '../../../shared/types';

/**
 * Intl formatters are expensive to build and are reused constantly.
 */
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

/**
 * Reads a formatter from the cache, building it on first use.
 * @param key Cache key, which must capture every option that varies
 * @param build Builds the formatter when it is not already cached
 * @returns The cached formatter
 */
const cached = <T extends Intl.DateTimeFormat | Intl.NumberFormat>(key: string, build: () => T): T => {
  const hit = cache.get(key);
  if (hit) return hit as T;

  const made = build();
  cache.set(key, made);

  return made;
};

/**
 * Builds the formatters for one language.
 * @param language The language to bind to
 * @returns Formatters for dates, numbers, money and durations
 */
export const formattersFor = (language: Language): Formatters => {
  const locale = LOCALES[language] ?? LOCALES[FALLBACK_LANGUAGE];

  return {
    locale,

    formatDate: (value) => cached(
      `d:${locale}`,
      () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    ).format(new Date(value)),

    formatDateTime: (value) => cached(
      `dt:${locale}`,
      () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    ).format(new Date(value)),

    formatNumber: (value) => cached(
      `n:${locale}`,
      () => new Intl.NumberFormat(locale),
    ).format(value),

    formatMoney: (value, currency = DEFAULT_CURRENCY) => cached(
      `m:${locale}:${currency}`,
      () => new Intl.NumberFormat(locale, {
        style: 'currency', currency, maximumFractionDigits: 0,
      }),
    ).format(value),

    formatDuration: (ms) => {
      if (ms < MS_PER_SECOND) {
        return cached(
          `u:${locale}:ms`,
          () => new Intl.NumberFormat(locale, {
            style: 'unit', unit: 'millisecond', unitDisplay: 'narrow',
          }),
        ).format(Math.round(ms));
      }

      return cached(
        `u:${locale}:s`,
        () => new Intl.NumberFormat(locale, {
          style: 'unit', unit: 'second', unitDisplay: 'narrow', maximumFractionDigits: 1,
        }),
      ).format(ms / MS_PER_SECOND);
    },
  };
};
