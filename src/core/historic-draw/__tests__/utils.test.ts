import { describe, expect, it } from '@jest/globals';

import {
  daysFrom, isHistoricDay, monthStart, pickOne,
} from '../utils.ts';

describe('core/historic-draw/utils', () => {
  describe('isHistoricDay', () => {
    it('allows every day from Monday to Friday', () => {
      ['2027-01-04', '2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08'].forEach((day) => {
        expect(isHistoricDay(day)).toBe(true);
      });
    });

    it('keeps a historic event off the weekend', () => {
      expect(isHistoricDay('2027-01-02')).toBe(false);
      expect(isHistoricDay('2027-01-03')).toBe(false);
    });
  });

  describe('daysFrom', () => {
    it('lists every day between two dates, both included', () => {
      expect(daysFrom('2027-01-30', '2027-02-02')).toEqual(['2027-01-30', '2027-01-31', '2027-02-01', '2027-02-02']);
    });

    it('lists the one day of a stretch that starts and ends on it', () => {
      expect(daysFrom('2027-12-31', '2027-12-31')).toEqual(['2027-12-31']);
    });

    it('lists nothing when the end comes before the start', () => {
      expect(daysFrom('2027-02-02', '2027-01-30')).toEqual([]);
    });
  });

  describe('monthStart', () => {
    it('finds the first of the month itself, from any day of it', () => {
      expect(monthStart('2027-01-31', 0)).toBe('2027-01-01');
    });

    it('counts months on into the next year', () => {
      expect(monthStart('2027-11-15', 3)).toBe('2028-02-01');
    });

    it('lands on the first of a short month', () => {
      expect(monthStart('2027-01-31', 1)).toBe('2027-02-01');
    });
  });

  describe('pickOne', () => {
    it('picks by where the draw falls across the list', () => {
      expect(pickOne(['a', 'b', 'c'], () => 0)).toBe('a');
      expect(pickOne(['a', 'b', 'c'], () => 0.5)).toBe('b');
      expect(pickOne(['a', 'b', 'c'], () => 0.999)).toBe('c');
    });
  });
});
