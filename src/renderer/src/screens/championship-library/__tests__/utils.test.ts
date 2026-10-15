import { describe, expect, it } from '@jest/globals';

import { nextSort } from '../utils.ts';
import type { ChampionshipCriteria } from '@/hooks';

/**
 * The list's criteria, sorted as a test says and narrowed by one pick.
 * @param overrides What to change about them
 * @returns The criteria
 */
const criteria = (overrides: Partial<ChampionshipCriteria> = {}): ChampionshipCriteria => ({
  picked: { disciplines: ['road'] },
  sort: 'name',
  direction: 'asc',
  ...overrides,
});

describe('renderer/screens/championship-library/utils', () => {
  describe('nextSort', () => {
    it('sorts by another column from its start', () => {
      expect(nextSort(criteria({ sort: 'name', direction: 'desc' }), 'ladder'))
        .toEqual(criteria({ sort: 'ladder', direction: 'asc' }));
    });

    it('turns the column already sorted by the other way', () => {
      expect(nextSort(criteria({ direction: 'asc' }), 'name').direction).toBe('desc');
      expect(nextSort(criteria({ direction: 'desc' }), 'name').direction).toBe('asc');
    });

    it('leaves the filters as they were', () => {
      expect(nextSort(criteria(), 'ladder').picked).toEqual({ disciplines: ['road'] });
    });
  });
});
