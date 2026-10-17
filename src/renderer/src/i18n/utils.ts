// Locale-aware formatting. Nothing in the app constructs an Intl formatter
// directly - a career is full of dates, money and durations, and getting the
// Ukrainian forms right later costs far more than routing them through here now.

import type { TFunction } from 'i18next';

import {
  DAYS_PER_MONTH, DAYS_PER_YEAR, DEFAULT_CURRENCY, FALLBACK_LANGUAGE, HOME_NATION_NAMES, LOCALES,
} from './constants.ts';
import type { Formatters } from './types.ts';
import {
  CONTENT_ISSUE_REASONS, DAYS_PER_WEEK, HOURS_PER_DAY, M_PER_KM, MINUTES_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND,
} from '../../../shared/constants';
import type { AppErrorInfo } from '../../../shared/errors';
import type { ContentIssueReason, Language } from '../../../shared/types';
import { nationName } from '../../../shared/utils/nations';

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
 * Writes the days an event runs: one day alone, or the first and last.
 * @param t The translator from useTranslation
 * @param formatDay How to write one day, such as formatDay or formatDayShort
 * @param first Its first day, ISO YYYY-MM-DD
 * @param last Its last day, ISO YYYY-MM-DD
 * @returns The days, formatted
 */
export const formatDayRange = (
  t: TFunction,
  formatDay: (value: string) => string,
  first: string,
  last: string,
): string => {
  const from = formatDay(first);
  const to = formatDay(last);

  return from === to ? from : t('event.dates', { from, to });
};

/**
 * Intl formatters are expensive to build and are reused constantly.
 */
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat | Intl.Collator | Intl.RelativeTimeFormat>();

/**
 * Reads a formatter from the cache, building it on first use.
 * @param key Cache key, which must capture every option that varies
 * @param build Builds the formatter when it is not already cached
 * @returns The cached formatter
 */
const cached = <T extends Intl.DateTimeFormat | Intl.NumberFormat | Intl.Collator | Intl.RelativeTimeFormat>(
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
 * Formats an ISO calendar date, read back in UTC so the day stays the day -
 * see `formatDay` for why.
 * @param locale The locale to format in
 * @param key What the options are called in the cache
 * @param options How to write it
 * @param value An ISO YYYY-MM-DD date
 * @returns The date, formatted
 */
const formatIsoDay = (
  locale: string,
  key: string,
  options: Intl.DateTimeFormatOptions,
  value: string,
): string => cached(
  `${key}:${locale}`,
  () => new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }),
).format(new Date(`${value}T00:00:00Z`));

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

    formatDay: (value) => formatIsoDay(locale, 'day', { dateStyle: 'medium' }, value),
    formatDayShort: (value) => formatIsoDay(locale, 'dayShort', {
      weekday: 'short', day: 'numeric', month: 'short',
    }, value),
    formatWeekday: (value) => formatIsoDay(locale, 'weekday', { weekday: 'short' }, value),
    formatMonth: (value) => formatIsoDay(locale, 'month', { month: 'long', year: 'numeric' }, value),
    formatMonthShort: (value) => formatIsoDay(locale, 'monthShort', { month: 'short' }, value),

    formatDateTime: (value) => cached(
      `dt:${locale}`,
      () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    ).format(new Date(value)),

    formatNumber: (value) => cached(
      `n:${locale}`,
      () => new Intl.NumberFormat(locale),
    ).format(value),

    formatSigned: (value) => cached(
      `s:${locale}`,
      () => new Intl.NumberFormat(locale, { signDisplay: 'exceptZero' }),
    ).format(value),

    formatYear: (value) => cached(
      `y:${locale}`,
      () => new Intl.NumberFormat(locale, { useGrouping: false }),
    ).format(value),

    formatMoney: (value, currency = DEFAULT_CURRENCY) => cached(
      `m:${locale}:${currency}`,
      // narrowSymbol rather than the locale's default: en-GB renders USD as
      // "US$1,200", which is correct English and wrong for a game currency -
      // the decision is a plain dollar sign, and uk-UA gets its own placement
      // of one rather than the "USD" it would otherwise spell out.
      () => new Intl.NumberFormat(locale, {
        style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
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

    formatNation: (code) => HOME_NATION_NAMES[language]?.[code] ?? nationName(code, locale),

    formatAgo: (value, now = Date.now()) => {
      const format = cached(
        `r:${locale}`,
        () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
      );
      const minutes = Math.round((new Date(value).getTime() - now) / MS_PER_MINUTE);
      const hours = Math.round(minutes / MINUTES_PER_HOUR);
      const days = Math.round(hours / HOURS_PER_DAY);

      if (Math.abs(minutes) < MINUTES_PER_HOUR) return format.format(minutes, 'minute');
      if (Math.abs(hours) < HOURS_PER_DAY) return format.format(hours, 'hour');
      if (Math.abs(days) < DAYS_PER_WEEK) return format.format(days, 'day');
      if (Math.abs(days) < DAYS_PER_MONTH) return format.format(Math.round(days / DAYS_PER_WEEK), 'week');
      if (Math.abs(days) < DAYS_PER_YEAR) return format.format(Math.round(days / DAYS_PER_MONTH), 'month');

      return format.format(Math.round(days / DAYS_PER_YEAR), 'year');
    },
  };
};
