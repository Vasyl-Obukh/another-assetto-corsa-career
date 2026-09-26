import { describe, expect, it } from '@jest/globals';

import { addDays, toDayNumber } from '../../../shared/utils/calendar-days/index.ts';
import { raceDayOnOrAfter } from '../utils.ts';

describe('core/season-calendar/utils', () => {
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
