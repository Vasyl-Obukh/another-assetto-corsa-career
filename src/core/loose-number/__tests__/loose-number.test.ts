import { describe, expect, it } from '@jest/globals';

import {
  inRange, parseDecimalNumber, parseLooseNumber, specString,
} from '../loose-number.ts';

describe('core/loose-number', () => {
  describe('specString', () => {
    it('trims what the author wrote', () => {
      expect(specString('  560 bhp  ')).toBe('560 bhp');
    });

    it('accepts a number, which mods ship as often as a string', () => {
      expect(specString(1200)).toBe('1200');
    });

    it('treats every way of writing "nothing" as nothing', () => {
      ['', '  ', '-', '--', '?', 'N/A', 'n/a', 'NA', 'TBD', 'Unknown'].forEach((text) => {
        expect(specString(text)).toBeNull();
      });
    });

    it('is null for anything that is not text or a finite number', () => {
      expect(specString(undefined)).toBeNull();
      expect(specString(null)).toBeNull();
      expect(specString(NaN)).toBeNull();
      expect(specString(['560'])).toBeNull();
    });
  });

  describe('parseLooseNumber', () => {
    it('reads a number written against its unit', () => {
      expect(parseLooseNumber('560bhp')).toBe(560);
      expect(parseLooseNumber('682 Nm')).toBe(682);
    });

    it('reads a thousands separator, whichever one the author used', () => {
      expect(parseLooseNumber('1,200 kg')).toBe(1200);
      expect(parseLooseNumber('1.200 kg')).toBe(1200);
      expect(parseLooseNumber('1,234,567')).toBe(1234567);
    });

    it('reads a decimal separator, whichever one the author used', () => {
      expect(parseLooseNumber('7.4')).toBe(7.4);
      expect(parseLooseNumber('6,46 kg/hp')).toBeCloseTo(6.46);
    });

    it('reads both separators in one number', () => {
      expect(parseLooseNumber('1,234.56')).toBeCloseTo(1234.56);
      expect(parseLooseNumber('1.234,56')).toBeCloseTo(1234.56);
    });

    // A lone leading zero means a decimal, not a thousands group: 0.500 is half,
    // not five hundred.
    it('does not read 0.500 as five hundred', () => {
      expect(parseLooseNumber('0.500')).toBeCloseTo(0.5);
      expect(parseLooseNumber('0,500')).toBeCloseTo(0.5);
    });

    it('takes the first number, so approximations and ranges still read', () => {
      expect(parseLooseNumber('300+ km/h')).toBe(300);
      expect(parseLooseNumber('~560 bhp')).toBe(560);
      expect(parseLooseNumber('560-580 bhp')).toBe(560);
    });

    it('is null when there is no number in there at all', () => {
      expect(parseLooseNumber('--- kg')).toBeNull();
      expect(parseLooseNumber('km/h')).toBeNull();
      expect(parseLooseNumber('N/A')).toBeNull();
    });
  });

  describe('inRange', () => {
    it('keeps a value inside its bounds, inclusive', () => {
      expect(inRange(5, 1, 10)).toBe(5);
      expect(inRange(1, 1, 10)).toBe(1);
      expect(inRange(10, 1, 10)).toBe(10);
    });

    it('rejects a value outside them, and null stays null', () => {
      expect(inRange(0, 1, 10)).toBeNull();
      expect(inRange(11, 1, 10)).toBeNull();
      expect(inRange(null, 1, 10)).toBeNull();
    });
  });

  describe('parseDecimalNumber', () => {
    // The whole reason this exists beside parseLooseNumber: a written unit has
    // already settled the magnitude, so "13.626km" is Le Mans rather than
    // thirteen thousand kilometres.
    it('reads a three-digit group after the separator as decimals', () => {
      expect(parseDecimalNumber('13.626km')).toBeCloseTo(13.626);
      expect(parseDecimalNumber('20,832')).toBeCloseTo(20.832);
      expect(parseLooseNumber('13.626km')).toBe(13626);
    });

    it('reads a plain number as itself', () => {
      expect(parseDecimalNumber('5')).toBe(5);
      expect(parseDecimalNumber('5.79 km')).toBeCloseTo(5.79);
    });

    it('takes the first number, whichever separator it used', () => {
      expect(parseDecimalNumber('~7,004 km lap')).toBeCloseTo(7.004);
    });

    it('is null when there is no number, or nothing at all', () => {
      expect(parseDecimalNumber('km')).toBeNull();
      expect(parseDecimalNumber('N/A')).toBeNull();
      expect(parseDecimalNumber(undefined)).toBeNull();
    });
  });
});
