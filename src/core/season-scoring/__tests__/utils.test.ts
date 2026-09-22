import { describe, expect, it } from '@jest/globals';

import type { GridEntry, SeriesSession } from '../../../shared/types/index.ts';
import {
  classOrder, fastestIn, pointsAt, pointsSystemOf,
} from '../utils.ts';
import { gridRow, makeSeries } from './fixtures.ts';

/**
 * A two-class grid, the classes interleaved so an order cannot come out right
 * by accident.
 * @returns Four rows, alternating between the two classes
 */
const twoClassGrid = (): GridEntry[] => [
  gridRow({ entry: 'gtp' }),
  gridRow({ entry: 'gt3' }),
  gridRow({ entry: 'gtp' }),
  gridRow({ entry: 'gt3' }),
];

describe('core/season-scoring/utils', () => {
  describe('pointsSystemOf', () => {
    const series = makeSeries({
      pointsSystems: [
        { id: 'race', name: 'Race points', positions: [25, 18, 15] },
        { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6] },
      ],
      defaultPointsSystem: 'race',
    });

    it('pays what the session names rather than the championship default', () => {
      const session: SeriesSession = { type: 'race', name: 'Sprint', pointsSystem: 'sprint' };

      expect(pointsSystemOf(series, session)?.id).toBe('sprint');
    });

    it('falls back to the championship default when the session names none', () => {
      expect(pointsSystemOf(series, { type: 'race', name: 'Race' })?.id).toBe('race');
    });

    it('reports nothing when the session names a system the championship does not have', () => {
      const session: SeriesSession = { type: 'race', name: 'Race', pointsSystem: 'endurance' };

      expect(pointsSystemOf(series, session)).toBeNull();
    });
  });

  describe('classOrder', () => {
    it('narrows an overall order to one class, keeping the order it is in', () => {
      expect(classOrder([2, 1, 0, 3], twoClassGrid(), 'gt3')).toEqual([1, 3]);
      expect(classOrder([2, 1, 0, 3], twoClassGrid(), 'gtp')).toEqual([2, 0]);
    });

    it('drops a car index the grid has no row for', () => {
      expect(classOrder([0, 9, 2], twoClassGrid(), 'gtp')).toEqual([0, 2]);
    });

    it('narrows to nothing when no car on the grid is of that class', () => {
      expect(classOrder([0, 1, 2, 3], twoClassGrid(), 'lmp2')).toEqual([]);
    });
  });

  describe('fastestIn', () => {
    const times = [61_000, 59_500, null, 60_000, 58_000];

    it('finds the quickest lap the class set', () => {
      expect(fastestIn([0, 1, 3], times)).toBe(1);
    });

    it('reports nothing when nobody in the class set a valid lap', () => {
      expect(fastestIn([2], times)).toBeNull();
      expect(fastestIn([], times)).toBeNull();
    });

    it('ignores a quicker lap set by a car outside the class', () => {
      // Cars 1 and 4 are quicker than anything this class managed.
      expect(fastestIn([0, 3], times)).toBe(3);
    });

    it('keeps whichever of two identical laps comes first in the class order', () => {
      const tied = [58_000, 58_000];

      expect(fastestIn([0, 1], tied)).toBe(0);
      expect(fastestIn([1, 0], tied)).toBe(1);
    });
  });

  describe('pointsAt', () => {
    it('pays what the table holds at that position', () => {
      expect(pointsAt([25, 18, 15], 1)).toBe(25);
      expect(pointsAt([25, 18, 15], 3)).toBe(15);
    });

    it('pays nothing past the end of the table rather than repeating the last figure', () => {
      expect(pointsAt([25, 18, 15], 4)).toBe(0);
      expect(pointsAt([25, 18, 15], 40)).toBe(0);
    });

    it('pays nothing when the championship offers no such table', () => {
      expect(pointsAt(undefined, 1)).toBe(0);
    });
  });
});
