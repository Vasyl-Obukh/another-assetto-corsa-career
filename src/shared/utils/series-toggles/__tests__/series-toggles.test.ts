import { describe, expect, it } from '@jest/globals';

import { hiddenAsFiller, isSeriesActive, withSeriesActive } from '../series-toggles.ts';

/**
 * A listing carrying only what the switches read.
 * @param activeByDefault Whether it starts switched on
 * @param filler Whether it only fills an empty rung
 * @returns The listing
 */
const listing = (activeByDefault: boolean, filler = false) => ({
  series: { id: 'lotus-cup' } as never,
  activeByDefault,
  filler,
});

describe('shared/utils/series-toggles', () => {
  describe('isSeriesActive', () => {
    it('is how the championship starts out where the user flipped nothing', () => {
      expect(isSeriesActive(listing(true), { seriesActive: {} })).toBe(true);
      expect(isSeriesActive(listing(false), { seriesActive: {} })).toBe(false);
    });

    it('is the user\'s own switch where they flipped one, either way', () => {
      expect(isSeriesActive(listing(true), { seriesActive: { 'lotus-cup': false } })).toBe(false);
      expect(isSeriesActive(listing(false), { seriesActive: { 'lotus-cup': true } })).toBe(true);
    });
  });

  describe('withSeriesActive', () => {
    it('records a switch away from how the championship starts out', () => {
      expect(withSeriesActive(listing(false), { other: true }, true))
        .toEqual({ other: true, 'lotus-cup': true });
    });

    // Recording the default would pin it, and the library could never change
    // how a championship starts out for someone who once flipped it back.
    it('forgets a switch put back to how the championship starts out', () => {
      expect(withSeriesActive(listing(true), { 'lotus-cup': false, other: true }, true))
        .toEqual({ other: true });
    });
  });

  describe('hiddenAsFiller', () => {
    it('hides a filler championship only while fillers are switched off', () => {
      expect(hiddenAsFiller(listing(true, true), { showFillerSeries: false })).toBe(true);
      expect(hiddenAsFiller(listing(true, true), { showFillerSeries: true })).toBe(false);
    });

    it('never hides a championship that is not a filler', () => {
      expect(hiddenAsFiller(listing(true), { showFillerSeries: false })).toBe(false);
    });
  });
});
