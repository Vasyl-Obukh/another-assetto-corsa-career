import { describe, expect, it } from '@jest/globals';

import { parseCarCurves, parseCarPerformance, parseYear } from '../car-performance.ts';

describe('core/car-performance', () => {
  describe('parseCarPerformance', () => {
    it('reads a complete specs block', () => {
      const specs = parseCarPerformance({
        bhp: '751 bhp',
        torque: '682 Nm',
        weight: '1450 kg',
        topspeed: '350 km/h',
        acceleration: '2.8s 0-100',
        pwratio: '1.93 kg/hp',
      });

      expect(specs).toMatchObject({
        bhp: 751,
        torqueNm: 682,
        weightKg: 1450,
        topSpeedKph: 350,
        accelerationSeconds: 2.8,
      });
    });

    it('derives power to weight in bhp per tonne', () => {
      const specs = parseCarPerformance({ bhp: '560', weight: '1400 kg' });
      expect(specs.powerToWeight).toBeCloseTo(400);
    });

    // Mod authors retune a car and leave pwratio behind, so it is kept for
    // display but never used as the number.
    it('derives power to weight rather than trusting the author"s pwratio', () => {
      const specs = parseCarPerformance({ bhp: '560', weight: '1400 kg', pwratio: '99 kg/hp' });

      expect(specs.powerToWeight).toBeCloseTo(400);
      expect(specs.raw.pwratio).toBe('99 kg/hp');
    });

    it('leaves power to weight null unless both figures parsed', () => {
      expect(parseCarPerformance({ bhp: '560' }).powerToWeight).toBeNull();
      expect(parseCarPerformance({ weight: '1400 kg' }).powerToWeight).toBeNull();
      expect(parseCarPerformance({ bhp: 'N/A', weight: '1400 kg' }).powerToWeight).toBeNull();
    });

    it('keeps the author"s own words for anything it could not read', () => {
      const specs = parseCarPerformance({ topspeed: '300+ km/h', weight: '--- kg' });

      // No number came out of "--- kg", but showing the user what the mod
      // actually says beats showing them a blank.
      expect(specs.weightKg).toBeNull();
      expect(specs.raw.weight).toBe('--- kg');
      expect(specs.raw.topspeed).toBe('300+ km/h');
    });

    it('keeps nothing at all when the author wrote a placeholder', () => {
      const specs = parseCarPerformance({ weight: 'N/A', topspeed: '-' });

      expect(specs.raw.weight).toBeNull();
      expect(specs.raw.topspeed).toBeNull();
    });

    it('survives a specs block that is not an object at all', () => {
      const empty = {
        bhp: null,
        torqueNm: null,
        weightKg: null,
        topSpeedKph: null,
        accelerationSeconds: null,
        powerToWeight: null,
        raw: {
          bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
        },
      };

      expect(parseCarPerformance(undefined)).toEqual(empty);
      expect(parseCarPerformance(null)).toEqual(empty);
      expect(parseCarPerformance('560bhp')).toEqual(empty);
      expect(parseCarPerformance(['560bhp'])).toEqual(empty);
    });

    it('reads a partial block without inventing the rest', () => {
      const specs = parseCarPerformance({ bhp: '400bhp' });

      expect(specs.bhp).toBe(400);
      expect(specs.torqueNm).toBeNull();
      expect(specs.topSpeedKph).toBeNull();
    });
  });

  describe('parseYear', () => {
    it('reads a year written as a number or a string', () => {
      expect(parseYear(1998)).toBe(1998);
      expect(parseYear('1998')).toBe(1998);
    });

    it('is null outside the years a car could be from', () => {
      expect(parseYear(1200)).toBeNull();
      expect(parseYear(9999)).toBeNull();
    });

    it('is null for a year that is not a whole number', () => {
      expect(parseYear('1998.5')).toBeNull();
    });

    it('is null when the mod omits it', () => {
      expect(parseYear(undefined)).toBeNull();
      expect(parseYear('')).toBeNull();
      expect(parseYear('N/A')).toBeNull();
    });
  });

  describe('parseCarCurves', () => {
    it('reads pairs written as strings or as numbers', () => {
      expect(parseCarCurves([['1000', '50'], [6000, 300]], [[1000, '200'], ['6000', 350]])).toEqual({
        power: [[1000, 50], [6000, 300]],
        torque: [[1000, 200], [6000, 350]],
      });
    });

    it('puts the points in rpm order, keeping the first of a repeated engine speed', () => {
      const { power } = parseCarCurves([[6000, 300], [1000, 50], [3000, 150], [3000, 999]], undefined) ?? {};

      expect(power).toEqual([[1000, 50], [3000, 150], [6000, 300]]);
    });

    it('drops a pair that does not read, or reads as nothing an engine makes', () => {
      const { power } = parseCarCurves([
        [1000, 50], ['idle', 10], [2000], 'flat', [99999, 100], [4000, 99999], [5000, 250],
      ], undefined) ?? {};

      expect(power).toEqual([[1000, 50], [5000, 250]]);
    });

    // A fixed bug: the loose reader skips a minus sign, so -5 came back as a
    // plausible 5 and put a spike in the curve.
    it('drops a negative point rather than reading it as a positive one', () => {
      const { power } = parseCarCurves([[1000, 50], [3000, -5], ['4000', '-40'], [5000, 250]], undefined) ?? {};

      expect(power).toEqual([[1000, 50], [5000, 250]]);
    });

    it('leaves a curve empty when fewer than two points survive', () => {
      expect(parseCarCurves([[1000, 50]], [[1000, 200], [6000, 350]])?.power).toEqual([]);
    });

    it('is null when neither curve reads', () => {
      expect(parseCarCurves(undefined, 'n/a')).toBeNull();
      expect(parseCarCurves([[1000, 50]], [])).toBeNull();
    });
  });
});
