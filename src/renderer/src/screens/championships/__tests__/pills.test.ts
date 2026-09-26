import {
  describe, expect, it, jest,
} from '@jest/globals';
import type { TFunction } from 'i18next';

import { championshipFilters } from '../filters.ts';
import { championshipPills } from '../pills.ts';
import { provenancePills } from '@/components';
import type { ChampionshipBrowser, ChampionshipCriteria } from '@/hooks';

// The real component barrel reaches react-router, which no test may import.
jest.mock('@/components', () => ({ provenancePills: jest.fn(() => []) }));

/**
 * A translator that echoes the key it was handed.
 * @param key The catalogue key
 * @returns The key
 */
const t = ((key: string) => key) as unknown as TFunction;

/**
 * A browser holding the picks given, recording what it is set to.
 * @param picked The values picked, per dimension
 * @returns The browser, and the criteria it was last set to
 */
const browserWith = (picked: ChampionshipCriteria['picked']) => {
  const setCriteria = jest.fn<(next: ChampionshipCriteria) => void>();
  const browser = {
    criteria: { picked, sort: 'name', direction: 'asc' },
    setCriteria,
  } as unknown as ChampionshipBrowser;

  return { browser, set: () => setCriteria.mock.calls.at(-1)?.[0].picked };
};

describe('renderer/screens/championships/pills', () => {
  describe('championshipPills', () => {
    it('makes one pill per value picked, named for its filter, that lifts only that value', () => {
      const { browser, set } = browserWith({ tiers: ['1', '3'] });
      const pills = championshipPills(browser, championshipFilters(), t);

      expect(pills.map((pill) => [pill.key, pill.name])).toEqual([
        ['tiers-1', 'championships.filter.tiers'],
        ['tiers-3', 'championships.filter.tiers'],
      ]);

      pills[0].onRemove();
      expect(set()).toEqual({ tiers: ['3'] });
    });

    it('leads with the switch, which lifts as a whole', () => {
      const { browser, set } = browserWith({ switched: ['on'], origins: ['user'] });
      const pills = championshipPills(browser, championshipFilters({ seriesActive: {} }), t);

      expect(pills.map((pill) => pill.key)).toEqual(['switched', 'origins-user']);

      pills[0].onRemove();
      expect(set()).toEqual({ switched: [], origins: ['user'] });
    });

    it('hands the content picks to the source tree\'s own pills, and writes their changes back prefixed', () => {
      const { browser, set } = browserWith({ content: ['packs:red-pack', 'makers:rss'] });
      championshipPills(browser, championshipFilters(), t);

      const [picks, , onChange] = jest.mocked(provenancePills).mock.calls[0];
      expect(picks).toEqual({
        sources: [], packs: ['red-pack'], makers: ['rss'], distributors: [],
      });

      onChange({ ...picks, makers: undefined });
      expect(set()).toEqual({ content: ['packs:red-pack'] });
    });
  });
});
