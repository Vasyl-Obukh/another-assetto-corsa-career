import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import {
  CONTENT_ISSUE_REASONS, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE,
} from '../../../../shared/constants';
import type { ContentIssueReason } from '../../../../shared/types';
import { formatContentIssueReason, formatDayRange, formattersFor } from '../utils.ts';

/**
 * A translator standing in for i18next.
 *
 * Real catalogue lookups are i18next's job, not this module's; what matters
 * here is which key is asked for and what happens when nothing answers it.
 * @param catalogue The keys this language actually has
 * @returns Something shaped enough like TFunction to call
 */
const translator = (catalogue: Record<string, string>) => ((
  key: string,
  options?: { defaultValue?: string },
) => catalogue[key] ?? options?.defaultValue ?? key) as unknown as TFunction;

/**
 * The moment formatAgo measures from in these tests.
 */
const NOW = Date.parse('2026-10-17T12:00:00Z');

/**
 * A moment some time before NOW.
 * @param ms How long before, in milliseconds; negative for after
 * @returns The moment as an ISO string
 */
const ago = (ms: number): string => new Date(NOW - ms).toISOString();

describe('renderer/i18n/utils', () => {
  describe('formattersFor', () => {
    it('binds English to en-GB', () => {
      expect(formattersFor('en').locale).toBe('en-GB');
    });

    it('binds Ukrainian to uk-UA', () => {
      expect(formattersFor('uk').locale).toBe('uk-UA');
    });

    it('falls back to English for an unknown language', () => {
      expect(formattersFor('martian' as never).locale).toBe('en-GB');
    });

    it('formats the same date differently per language', () => {
      const date = new Date('2026-08-16T17:15:00Z');
      const en = formattersFor('en').formatDate(date);
      const uk = formattersFor('uk').formatDate(date);

      expect(en).not.toBe(uk);
      expect(en).toContain('2026');
      expect(uk).toContain('2026');
    });

    it('accepts an ISO string as well as a Date', () => {
      const format = formattersFor('en');
      expect(format.formatDate('2026-08-16T17:15:00Z')).toBe(format.formatDate(new Date('2026-08-16T17:15:00Z')));
    });

    it('includes a time in formatDateTime but not in formatDate', () => {
      const format = formattersFor('en');
      const date = new Date('2026-08-16T17:15:00Z');

      expect(format.formatDateTime(date).length).toBeGreaterThan(format.formatDate(date).length);
    });

    it('groups thousands per locale', () => {
      expect(formattersFor('en').formatNumber(1234567)).toBe('1,234,567');
      // Ukrainian groups with a narrow no-break space rather than a comma.
      expect(formattersFor('uk').formatNumber(1234567)).not.toContain(',');
    });

    it('formats an offset with its sign, and none as a plain zero', () => {
      const { formatSigned } = formattersFor('en');

      expect([formatSigned(3), formatSigned(-3), formatSigned(0)]).toEqual(['+3', '-3', '0']);
    });

    it('signs an offset in Ukrainian too', () => {
      expect(formattersFor('uk').formatSigned(4)).toBe('+4');
    });

    // A year is an identifier, not a quantity: 2,019 in English and 2 019 in
    // Ukrainian both read as something other than the year 2019.
    it('formats a year without the grouping a plain number gets', () => {
      expect(formattersFor('en').formatYear(2019)).toBe('2019');
      expect(formattersFor('uk').formatYear(2019)).toBe('2019');
    });

    it('groups the same value when it is a count rather than a year', () => {
      expect(formattersFor('en').formatNumber(2019)).toBe('2,019');
    });

    it('leaves a year outside the grouping range alone', () => {
      expect(formattersFor('en').formatYear(987)).toBe('987');
    });

    it('joins names as the language joins them', () => {
      expect(formattersFor('en').formatList(['GT3', 'GT4', 'LMP2'])).toBe('GT3, GT4 and LMP2');
      expect(formattersFor('uk').formatList(['GT3', 'GT4'])).toBe('GT3 і GT4');
    });

    it('leaves a single name as it is', () => {
      expect(formattersFor('en').formatList(['GT3'])).toBe('GT3');
    });

    it('formats money without a fractional part', () => {
      const money = formattersFor('en').formatMoney(1500);

      expect(money).toContain('1,500');
      expect(money).not.toContain('.00');
    });

    it('honours a currency other than the default', () => {
      expect(formattersFor('en').formatMoney(1500, 'EUR')).not
        .toBe(formattersFor('en').formatMoney(1500, 'USD'));
    });

    it('reports sub-second durations in milliseconds', () => {
      expect(formattersFor('en').formatDuration(214)).toContain('214');
    });

    it('reports longer durations in seconds', () => {
      const duration = formattersFor('en').formatDuration(4500);

      expect(duration).toContain('4.5');
      expect(duration).not.toContain('4500');
    });

    it('rounds fractional milliseconds', () => {
      expect(formattersFor('en').formatDuration(213.7)).toContain('214');
    });

    // A bare date parses as UTC midnight, which a local zone west of Greenwich
    // would show as the day before; every day format reads it back in UTC.
    it('keeps a calendar day the day it names', () => {
      const format = formattersFor('en');

      expect(format.formatDay('2026-01-24')).toBe('24 Jan 2026');
      expect(format.formatDayShort('2026-01-24')).toBe('Sat 24 Jan');
      expect(format.formatWeekday('2026-01-24')).toBe('Sat');
    });

    it('names a day\'s month with its year, or short and alone', () => {
      const format = formattersFor('en');

      expect(format.formatMonth('2026-01-24')).toBe('January 2026');
      expect(format.formatMonthShort('2026-01-24')).toBe('Jan');
    });

    it('writes the same day in each language\'s own words', () => {
      expect(formattersFor('uk').formatMonth('2026-01-24')).not.toBe(formattersFor('en').formatMonth('2026-01-24'));
    });

    it('names a nation in the active language', () => {
      expect(formattersFor('en').formatNation('ITA')).toBe('Italy');
      expect(formattersFor('uk').formatNation('ITA')).not.toBe('Italy');
    });

    // Intl names regions and not the home nations, so those are translated here.
    it('names the four home nations itself', () => {
      expect(formattersFor('uk').formatNation('SCT')).toBe('Шотландія');
      expect(formattersFor('en').formatNation('SCT')).toBe('Scotland');
    });

    it('says how long ago in minutes under an hour', () => {
      const { formatAgo } = formattersFor('en');

      expect(formatAgo(ago(5 * MS_PER_MINUTE), NOW)).toBe('5 minutes ago');
      expect(formatAgo(ago(59 * MS_PER_MINUTE), NOW)).toBe('59 minutes ago');
      expect(formatAgo(ago(0), NOW)).toBe('this minute');
    });

    it('moves up to hours at an hour and to days at a day', () => {
      const { formatAgo } = formattersFor('en');

      expect(formatAgo(ago(60 * MS_PER_MINUTE), NOW)).toBe('1 hour ago');
      expect(formatAgo(ago(23 * MS_PER_HOUR), NOW)).toBe('23 hours ago');
      expect(formatAgo(ago(24 * MS_PER_HOUR), NOW)).toBe('yesterday');
    });

    it('moves up to weeks, months and years as the days pass', () => {
      const { formatAgo } = formattersFor('en');

      expect(formatAgo(ago(6 * MS_PER_DAY), NOW)).toBe('6 days ago');
      expect(formatAgo(ago(7 * MS_PER_DAY), NOW)).toBe('last week');
      expect(formatAgo(ago(29 * MS_PER_DAY), NOW)).toBe('4 weeks ago');
      expect(formatAgo(ago(30 * MS_PER_DAY), NOW)).toBe('last month');
      expect(formatAgo(ago(364 * MS_PER_DAY), NOW)).toBe('12 months ago');
      expect(formatAgo(ago(365 * MS_PER_DAY), NOW)).toBe('last year');
      expect(formatAgo(ago(730 * MS_PER_DAY), NOW)).toBe('2 years ago');
    });

    it('words a moment still to come as the future', () => {
      const { formatAgo } = formattersFor('en');

      expect(formatAgo(ago(-24 * MS_PER_HOUR), NOW)).toBe('tomorrow');
      expect(formatAgo(ago(-3 * MS_PER_HOUR), NOW)).toBe('in 3 hours');
    });

    it('words it in the active language', () => {
      expect(formattersFor('uk').formatAgo(ago(24 * MS_PER_HOUR), NOW))
        .not.toBe(formattersFor('en').formatAgo(ago(24 * MS_PER_HOUR), NOW));
    });
  });
  describe('formatContentIssueReason', () => {
    it('renders the reason from the active catalogue', () => {
      const t = translator({ 'issueReasons.noSkins': 'zhodnykh livrei' });

      expect(formatContentIssueReason(t, 'noSkins')).toBe('zhodnykh livrei');
    });

    it('asks for the key the catalogues are keyed by', () => {
      const t = translator({ 'issueReasons.uiMissing': 'found it' });

      expect(formatContentIssueReason(t, 'uiMissing')).toBe('found it');
    });

    // The reason type is what the scan produces. A member added to it before a
    // catalogue catches up must still read as a sentence, not as a bare code.
    it('falls back to the English table the CLI prints', () => {
      const t = translator({});

      for (const reason of Object.keys(CONTENT_ISSUE_REASONS) as ContentIssueReason[]) {
        expect(formatContentIssueReason(t, reason)).toBe(CONTENT_ISSUE_REASONS[reason]);
      }
    });
  });

  describe('formatDayRange', () => {
    const t = ((key: string, params?: { from?: string; to?: string }) => (
      key === 'event.dates' ? `${params?.from} to ${params?.to}` : key
    )) as unknown as TFunction;

    it('writes a one-day event as that day alone', () => {
      expect(formatDayRange(t, formattersFor('en').formatDay, '2026-03-07', '2026-03-07')).toBe('7 Mar 2026');
    });

    it('writes a longer event as its first and last days', () => {
      expect(formatDayRange(t, formattersFor('en').formatDay, '2026-03-06', '2026-03-08'))
        .toBe('6 Mar 2026 to 8 Mar 2026');
    });

    it('writes each day the way it is handed', () => {
      expect(formatDayRange(t, (day) => `<${day}>`, '2026-03-06', '2026-03-08'))
        .toBe('<2026-03-06> to <2026-03-08>');
    });
  });
});
