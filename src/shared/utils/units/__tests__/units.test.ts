import { describe, expect, it } from '@jest/globals';

import type { Quantity } from '../types.ts';
import {
  regionOfLocale, toMetric, toShown, unitOf, unitsOfRegion, usesMph,
} from '../units.ts';

/**
 * Every quantity a system decides.
 */
const QUANTITIES: readonly Quantity[] = ['speed', 'distance', 'length', 'weight', 'torque', 'temperature'];

describe('shared/utils/units', () => {
  describe('unitOf', () => {
    it('keeps every quantity in its metric unit under metric', () => {
      expect(QUANTITIES.map((quantity) => unitOf(quantity, 'metric'))).toEqual(['kph', 'km', 'm', 'kg', 'nm', 'c']);
    });

    it('reads the UK in mph and miles beside kilograms, metres and Celsius', () => {
      expect(QUANTITIES.map((quantity) => unitOf(quantity, 'uk'))).toEqual(['mph', 'mi', 'm', 'kg', 'lbft', 'c']);
    });

    it('reads the US in imperial units throughout', () => {
      expect(QUANTITIES.map((quantity) => unitOf(quantity, 'us'))).toEqual(['mph', 'mi', 'ft', 'lb', 'lbft', 'f']);
    });
  });

  describe('toShown', () => {
    it('leaves a metric figure as it is under metric', () => {
      QUANTITIES.forEach((quantity) => expect(toShown(quantity, 123.4, 'metric')).toBe(123.4));
    });

    it('converts a speed and a distance to miles', () => {
      expect(toShown('speed', 100, 'us')).toBeCloseTo(62.137, 3);
      expect(toShown('distance', 1.609344, 'uk')).toBeCloseTo(1, 9);
    });

    it('converts a length to feet, a weight to pounds and a torque to pound-feet', () => {
      expect(toShown('length', 0.3048, 'us')).toBeCloseTo(1, 9);
      expect(toShown('weight', 0.45359237, 'us')).toBeCloseTo(1, 9);
      expect(toShown('torque', 1.3558179483, 'us')).toBeCloseTo(1, 9);
    });

    it('offsets a temperature as well as scaling it', () => {
      expect(toShown('temperature', 0, 'us')).toBe(32);
      expect(toShown('temperature', 100, 'us')).toBe(212);
      expect(toShown('temperature', -40, 'us')).toBe(-40);
    });

    it('keeps what the UK reads in metric as it is', () => {
      expect(toShown('weight', 1420, 'uk')).toBe(1420);
      expect(toShown('temperature', 21, 'uk')).toBe(21);
    });
  });

  describe('toMetric', () => {
    it('undoes toShown for every quantity in every system', () => {
      (['metric', 'uk', 'us'] as const).forEach((system) => QUANTITIES.forEach((quantity) => {
        expect(toMetric(quantity, toShown(quantity, 37.5, system), system)).toBeCloseTo(37.5, 9);
      }));
    });

    it('reads Fahrenheit back as Celsius', () => {
      expect(toMetric('temperature', 212, 'us')).toBe(100);
    });
  });

  describe('usesMph', () => {
    it('is true for the UK and the US and false for metric', () => {
      expect(usesMph('metric')).toBe(false);
      expect(usesMph('uk')).toBe(true);
      expect(usesMph('us')).toBe(true);
    });
  });

  describe('unitsOfRegion', () => {
    it('reads the US and its territories in US units', () => {
      expect(unitsOfRegion('US')).toBe('us');
      expect(unitsOfRegion('PR')).toBe('us');
    });

    it('reads Great Britain in UK units', () => {
      expect(unitsOfRegion('GB')).toBe('uk');
    });

    it('ignores the case a region is written in', () => {
      expect(unitsOfRegion('us')).toBe('us');
    });

    it('reads everywhere else, and an unknown region, in metric', () => {
      expect(unitsOfRegion('UA')).toBe('metric');
      expect(unitsOfRegion('IE')).toBe('metric');
      expect(unitsOfRegion(null)).toBe('metric');
    });
  });

  describe('regionOfLocale', () => {
    it('reads the region a locale names', () => {
      expect(regionOfLocale('en-US')).toBe('US');
      expect(regionOfLocale('uk-UA')).toBe('UA');
    });

    it('is null for a locale naming no region', () => {
      expect(regionOfLocale('en')).toBeNull();
    });

    it('is null for something that is not a locale', () => {
      expect(regionOfLocale('not a locale!')).toBeNull();
    });
  });
});
