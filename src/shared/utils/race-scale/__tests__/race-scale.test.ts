import { describe, expect, it } from '@jest/globals';

import { MAX_TIME_MULTIPLIER, RACE_SCALES } from '../constants.ts';
import { scaledClock, scaledLaps, scalesFor } from '../race-scale.ts';

describe('shared/utils/race-scale', () => {
  describe('scaledLaps', () => {
    it('divides the laps by the step, to the nearest whole lap', () => {
      expect(scaledLaps(781, 48)).toBe(16);
      expect(scaledLaps(22, 4)).toBe(6);
    });

    it('leaves the full race at its own laps', () => {
      expect(scaledLaps(781, 1)).toBe(781);
    });
  });

  describe('scalesFor', () => {
    it('offers every step to a race long enough for all of them', () => {
      expect(scalesFor(781)).toEqual([...RACE_SCALES]);
    });

    it('stops short of any step that would go under five laps', () => {
      expect(scalesFor(22)).toEqual([1, 2, 3, 4]);
    });

    it('keeps a step that comes to exactly five laps', () => {
      expect(scalesFor(10)).toEqual([1, 2]);
    });

    it('offers only the full race to a race too short to shorten', () => {
      expect(scalesFor(8)).toEqual([1]);
      expect(scalesFor(1)).toEqual([1]);
    });
  });

  describe('scaledClock', () => {
    it('runs the clock faster by the step', () => {
      expect(scaledClock(1, 48)).toBe(48);
      expect(scaledClock(2, 4)).toBe(8);
    });

    it('never sends the clock faster than the most it is ever sent at', () => {
      expect(scaledClock(2, 48)).toBe(MAX_TIME_MULTIPLIER);
    });

    // A fixed bug: the cap alone took a race whose own clock is past it down to
    // the cap, so shortening it slowed its day down.
    it('never runs a shortened race\'s clock slower than its own', () => {
      expect(scaledClock(60, 2)).toBe(60);
    });
  });
});
