import { describe, expect, it } from '@jest/globals';

import {
  parsePower, parseSeconds, parseSpeed, parseTorque, parseWeight,
} from '../utils.ts';

describe('core/car-performance/utils', () => {
  describe('parsePower', () => {
    it('takes hp, ps, cv and bare numbers as bhp', () => {
      expect(parsePower('560 bhp')).toBe(560);
      expect(parsePower('560 hp')).toBe(560);
      expect(parsePower('560 PS')).toBe(560);
      expect(parsePower('560')).toBe(560);
    });

    it('converts kilowatts', () => {
      expect(parsePower('412 kW')).toBeCloseTo(552.5, 0);
      // No word boundary before the unit when it is written against the number.
      expect(parsePower('412kW')).toBeCloseTo(552.5, 0);
    });

    it('refuses a figure no car could have', () => {
      expect(parsePower('99999 bhp')).toBeNull();
      expect(parsePower('0 bhp')).toBeNull();
    });
  });

  describe('parseTorque', () => {
    it('reads newton metres', () => {
      expect(parseTorque('682 Nm')).toBe(682);
    });

    it('converts pound-feet, however the author hyphenated it', () => {
      expect(parseTorque('500 lb-ft')).toBeCloseTo(677.9, 0);
      expect(parseTorque('500 lbft')).toBeCloseTo(677.9, 0);
      expect(parseTorque('500 ft-lb')).toBeCloseTo(677.9, 0);
    });

    it('refuses a figure no car could have', () => {
      expect(parseTorque('90000 Nm')).toBeNull();
    });
  });

  describe('parseWeight', () => {
    it('reads kilograms', () => {
      expect(parseWeight('1450 kg')).toBe(1450);
    });

    it('converts pounds', () => {
      expect(parseWeight('2900 lbs')).toBeCloseTo(1315.4, 0);
      expect(parseWeight('2900 lb')).toBeCloseTo(1315.4, 0);
    });

    it('refuses a weight that is not a car', () => {
      expect(parseWeight('12 kg')).toBeNull();
      expect(parseWeight('90000 kg')).toBeNull();
    });
  });

  describe('parseSpeed', () => {
    it('reads kilometres per hour', () => {
      expect(parseSpeed('350 km/h')).toBe(350);
    });

    it('converts miles per hour', () => {
      expect(parseSpeed('217 mph')).toBeCloseTo(349.2, 0);
    });

    it('refuses a speed no car could reach', () => {
      expect(parseSpeed('5000 km/h')).toBeNull();
    });
  });

  describe('parseSeconds', () => {
    it('reads a time written before the range', () => {
      expect(parseSeconds('7.4s 0-100')).toBeCloseTo(7.4);
    });

    // The first number of "0-100 in 7.4s" is 0, which would be a catastrophic
    // figure to derive anything from. Anchoring on the unit is what avoids it.
    it('reads a time written after the range', () => {
      expect(parseSeconds('0-100 in 7.4s')).toBeCloseTo(7.4);
      expect(parseSeconds('0-100 km/h in 3.5 seconds')).toBeCloseTo(3.5);
    });

    it('reads a decimal comma with the unit spaced off', () => {
      expect(parseSeconds('3,5 s 0-100')).toBeCloseTo(3.5);
    });

    it('falls back to the first number when no unit is written', () => {
      expect(parseSeconds('2.8')).toBeCloseTo(2.8);
    });

    it('is null for the placeholders mods leave behind', () => {
      expect(parseSeconds('--s 0-100')).toBeNull();
      expect(parseSeconds('---')).toBeNull();
      expect(parseSeconds('s 0-100')).toBeNull();
    });

    it('refuses a time that is not a nought-to-hundred', () => {
      expect(parseSeconds('600 s')).toBeNull();
    });
  });
});
