import { describe, expect, it } from '@jest/globals';

import { addDays, toDayNumber } from '../../../shared/utils/calendar-days/index.ts';
import { weekdayOnOrAfter } from '../utils.ts';

// getUTCDay's Sunday and Wednesday.
const SUNDAY = 0;
const WEDNESDAY = 3;

describe('core/season-calendar/utils', () => {
  describe('weekdayOnOrAfter', () => {
    it('leaves a date on the wanted weekday where it is', () => {
      expect(weekdayOnOrAfter('2026-01-04', SUNDAY)).toBe('2026-01-04');
    });

    it('advances a midweek date to the Sunday that follows', () => {
      // 2026-01-01 is a Thursday.
      expect(weekdayOnOrAfter('2026-01-01', SUNDAY)).toBe('2026-01-04');
      // 2026-01-07 is a Wednesday.
      expect(weekdayOnOrAfter('2026-01-07', SUNDAY)).toBe('2026-01-11');
    });

    it('advances a Saturday by the single day it needs', () => {
      expect(weekdayOnOrAfter('2026-01-03', SUNDAY)).toBe('2026-01-04');
    });

    it('finds a weekday other than Sunday', () => {
      expect(weekdayOnOrAfter('2026-01-01', WEDNESDAY)).toBe('2026-01-07');
    });

    it('always lands on the wanted weekday, whichever weekday it starts from', () => {
      Array.from({ length: 14 }, (unused, at) => addDays('2026-01-01', at)).forEach((date) => {
        [SUNDAY, WEDNESDAY].forEach((weekday) => {
          const found = weekdayOnOrAfter(date, weekday);

          expect(new Date(`${found}T00:00:00Z`).getUTCDay()).toBe(weekday);
          expect(toDayNumber(found)).toBeGreaterThanOrEqual(toDayNumber(date));
        });
      });
    });
  });
});
