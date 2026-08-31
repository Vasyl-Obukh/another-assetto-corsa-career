// Locale-aware formatting. Nothing in the app constructs an Intl formatter
// directly - a career is full of dates, money and durations, and getting the
// Ukrainian forms right later costs far more than routing them through here now.

import type { TFunction } from 'i18next';

import { DEFAULT_CURRENCY, FALLBACK_LANGUAGE, LOCALES } from './constants.ts';
import type { Formatters } from './types.ts';
import { CONTENT_ISSUE_REASONS, M_PER_KM, MS_PER_SECOND } from '../../../shared/constants';
import type { AppErrorInfo } from '../../../shared/errors';
import type { ContentIssueReason, Language } from '../../../shared/types';

/**
 * Renders an error in the active language.
 *
 * Falls back to the English message the error carries, so a failure from the OS
 * with no code, or a code the catalogue has not caught up with, still says
 * something useful rather than showing a bare identifier.
 * @param t The translator from useTranslation
 * @param error The error to render, in its flattened form
 * @returns The message to show the user
 */
export const formatAppError = (
  t: TFunction,
  error: Partial<AppErrorInfo> & { message: string },
): string => {
  if (!error.code) return error.message;

  return t(`errors.${error.code}`, { ...error.params, defaultValue: error.message });
};

/**
 * Renders why a piece of installed content is broken, in the active language.
 *
 * Falls back to the English table the CLI prints, so a reason added to the type
 * before it reaches the catalogues still reads as a sentence rather than a code.
 * @param t The translator from useTranslation
 * @param reason The reason code carried by the issue
 * @returns The wording to show the user
 */
export const formatContentIssueReason = (t: TFunction, reason: ContentIssueReason): string => t(
  `issueReasons.${reason}`,
  { defaultValue: CONTENT_ISSUE_REASONS[reason] },
);

/**
 * Intl formatters are expensive to build and are reused constantly.
 */
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat | Intl.Collator>();

/**
 * Reads a formatter from the cache, building it on first use.
 * @param key Cache key, which must capture every option that varies
 * @param build Builds the formatter when it is not already cached
 * @returns The cached formatter
 */
const cached = <T extends Intl.DateTimeFormat | Intl.NumberFormat | Intl.Collator>(
  key: string,
  build: () => T,
): T => {
  const hit = cache.get(key);
  if (hit) return hit as T;

  const made = build();
  cache.set(key, made);

  return made;
};

/**
 * Builds the formatters for one language.
 * @param language The language to bind to
 * @returns Formatters for dates, numbers, money, durations and sorting
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

    formatYear: (value) => cached(
      `y:${locale}`,
      () => new Intl.NumberFormat(locale, { useGrouping: false }),
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

    formatDistance: (metres) => {
      if (metres < M_PER_KM) {
        return cached(
          `u:${locale}:m`,
          () => new Intl.NumberFormat(locale, {
            style: 'unit', unit: 'meter', unitDisplay: 'short', maximumFractionDigits: 0,
          }),
        ).format(metres);
      }

      return cached(
        `u:${locale}:km`,
        () => new Intl.NumberFormat(locale, {
          style: 'unit', unit: 'kilometer', unitDisplay: 'short', maximumFractionDigits: 3,
        }),
      ).format(metres / M_PER_KM);
    },

    compare: (a, b) => cached(
      `c:${locale}`,
      () => new Intl.Collator(locale, { sensitivity: 'base', numeric: true }),
    ).compare(a, b),
  };
};
