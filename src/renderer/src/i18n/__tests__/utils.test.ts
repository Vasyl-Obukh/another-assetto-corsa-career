import { describe, expect, it } from '@jest/globals';

import { formattersFor } from '../utils.ts';

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
  });
});
