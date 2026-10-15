import { describe, expect, it } from '@jest/globals';

import type { SeasonEntry } from '../../../types/index.ts';
import { championshipEntries, historicEntries, isHistoric } from '../historic.ts';

/**
 * A season entry, marked historic or not.
 * @param series Its id
 * @param historic Whether it is a historic event
 * @returns The entry, carrying only what these helpers read
 */
const entry = (series: string, historic?: true): SeasonEntry => (
  { series, ...(historic ? { historic } : {}) } as SeasonEntry
);

const season = {
  entries: [entry('gt3-sprint'), entry('british-gp-1967', true), entry('mx5-cup'), entry('monaco-gp-1961', true)],
};

describe('shared/utils/historic', () => {
  describe('isHistoric', () => {
    it('tells a historic event by its marker', () => {
      expect(isHistoric(entry('british-gp-1967', true))).toBe(true);
    });

    it('reads an entry with no marker as a championship', () => {
      expect(isHistoric(entry('gt3-sprint'))).toBe(false);
    });
  });

  describe('championshipEntries', () => {
    it('keeps the championships of a season, in order', () => {
      expect(championshipEntries(season).map((one) => one.series)).toEqual(['gt3-sprint', 'mx5-cup']);
    });
  });

  describe('historicEntries', () => {
    it('keeps the historic events of a season, in order', () => {
      expect(historicEntries(season).map((one) => one.series)).toEqual(['british-gp-1967', 'monaco-gp-1961']);
    });

    it('finds none in a season that drew none', () => {
      expect(historicEntries({ entries: [entry('gt3-sprint')] })).toEqual([]);
    });
  });
});
