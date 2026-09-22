import { describe, expect, it } from '@jest/globals';

import { isAppError } from '../../../shared/errors/index.ts';
import {
  addDays, fromDayNumber, raceDayOnOrAfter, toDayNumber,
} from '../utils.ts';

/**
 * Runs something that is expected to refuse, and reports the code it refused with.
 * @param run The call under test
 * @returns The AppError code, or a marker where nothing useful was thrown
 */
const codeFrom = (run: () => void): string | null => {
  try {
    run();

    return null;
  } catch (error) {
    return isAppError(error) ? error.code : 'not-an-app-error';
  }
};

describe('core/season-calendar/utils', () => {
  describe('toDayNumber', () => {
    it('reads the epoch itself as day zero', () => {
      expect(toDayNumber('1970-01-01')).toBe(0);
    });

    it('counts whole days forward from the epoch', () => {
      expect(toDayNumber('1970-01-02')).toBe(1);
      expect(toDayNumber('1971-01-01')).toBe(365);
    });

    it('counts backward through dates before the epoch', () => {
      expect(toDayNumber('1969-12-31')).toBe(-1);
    });

    it('reads a date well past the epoch as the whole days between', () => {
      expect(toDayNumber('2026-01-04')).toBe(20457);
    });

    it('refuses a string that is not shaped like a calendar date', () => {
      expect(codeFrom(() => toDayNumber('4 January 2026'))).toBe('season.date.invalid');
      expect(codeFrom(() => toDayNumber('2026-1-4'))).toBe('season.date.invalid');
      expect(codeFrom(() => toDayNumber(''))).toBe('season.date.invalid');
    });

    it('refuses a date that could never fall on a calendar', () => {
      expect(codeFrom(() => toDayNumber('2026-13-01'))).toBe('season.date.invalid');
      expect(codeFrom(() => toDayNumber('2026-01-32'))).toBe('season.date.invalid');
    });

    // Guards a bug: Date.parse refuses a month past 12 or a day past 31, but
    // rolls a day impossible for its own month forward, so 30 February was read
    // as 2 March and a season quietly opened two days late.
    it('refuses a day that does not exist in its own month', () => {
      expect(codeFrom(() => toDayNumber('2026-02-30'))).toBe('season.date.invalid');
      expect(codeFrom(() => toDayNumber('2026-04-31'))).toBe('season.date.invalid');
    });

    it('refuses a leap day in a year that has none, and keeps one that has', () => {
      expect(codeFrom(() => toDayNumber('2025-02-29'))).toBe('season.date.invalid');
      expect(toDayNumber('2024-02-29')).toBe(19782);
    });

    it('names the offending date in the refusal', () => {
      try {
        toDayNumber('not-a-date');
        throw new Error('expected a refusal');
      } catch (error) {
        expect(isAppError(error) && error.params).toEqual({ date: 'not-a-date' });
      }
    });
  });

  describe('fromDayNumber', () => {
    it('writes day zero back as the epoch', () => {
      expect(fromDayNumber(0)).toBe('1970-01-01');
    });

    it('round-trips every date it is handed, before the epoch included', () => {
      ['1952-07-19', '1969-12-31', '1970-01-01', '2000-02-29', '2026-09-22'].forEach((date) => {
        expect(fromDayNumber(toDayNumber(date))).toBe(date);
      });
    });

    it('writes a negative day back as a date before the epoch', () => {
      expect(fromDayNumber(-1)).toBe('1969-12-31');
    });
  });

  describe('addDays', () => {
    it('moves a date forward', () => {
      expect(addDays('2026-01-04', 7)).toBe('2026-01-11');
    });

    it('moves a date backward when handed a negative count', () => {
      expect(addDays('2026-01-11', -7)).toBe('2026-01-04');
    });

    it('leaves the date alone when asked for no days at all', () => {
      expect(addDays('2026-01-04', 0)).toBe('2026-01-04');
    });

    it('crosses into the next month', () => {
      expect(addDays('2026-03-31', 1)).toBe('2026-04-01');
    });

    it('crosses into the next year, and back out of it', () => {
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('counts the leap day in a leap year and skips it otherwise', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
      expect(addDays('2023-02-28', 1)).toBe('2023-03-01');
    });

    it('spans a leap year as three hundred and sixty-six days', () => {
      expect(addDays('2024-01-01', 366)).toBe('2025-01-01');
    });
  });

  describe('raceDayOnOrAfter', () => {
    it('leaves a Sunday where it is', () => {
      expect(raceDayOnOrAfter('2026-01-04')).toBe('2026-01-04');
    });

    it('advances a midweek date to the Sunday that follows', () => {
      // 2026-01-01 is a Thursday.
      expect(raceDayOnOrAfter('2026-01-01')).toBe('2026-01-04');
      // 2026-01-07 is a Wednesday.
      expect(raceDayOnOrAfter('2026-01-07')).toBe('2026-01-11');
    });

    it('advances a Saturday by the single day it needs', () => {
      expect(raceDayOnOrAfter('2026-01-03')).toBe('2026-01-04');
    });

    it('always lands on a Sunday, whichever weekday it starts from', () => {
      Array.from({ length: 14 }, (unused, at) => addDays('2026-01-01', at)).forEach((date) => {
        const raceDay = raceDayOnOrAfter(date);

        expect(new Date(`${raceDay}T00:00:00Z`).getUTCDay()).toBe(0);
        expect(toDayNumber(raceDay)).toBeGreaterThanOrEqual(toDayNumber(date));
      });
    });
  });
});
