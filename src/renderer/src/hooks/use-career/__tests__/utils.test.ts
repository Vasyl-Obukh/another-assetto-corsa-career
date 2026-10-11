import { describe, expect, it } from '@jest/globals';

import type { Career, SeasonEntry } from '../../../../../shared/types';
import { withSeasonStrength } from '../utils.ts';

/**
 * An edition of a championship, carrying only what the step is read off.
 * @param over What to say differently
 * @returns The entry
 */
const entry = (over: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'test-cup', edition: 0, ...over,
}) as SeasonEntry;

/**
 * A career of two seasons, the second holding the entries given.
 * @param entries The current season's entries
 * @returns The career
 */
const career = (entries: SeasonEntry[]): Career => ({
  seasons: [
    { index: 0, entries: [entry({ strength: 4 })] },
    { index: 1, entries },
  ],
}) as unknown as Career;

describe('renderer/hooks/use-career/utils', () => {
  describe('withSeasonStrength', () => {
    it('writes the step onto the edition named in the current season', () => {
      const next = withSeasonStrength(career([entry()]), 'test-cup', 0, -3);

      expect(next.seasons[1].entries[0].strength).toBe(-3);
    });

    it('drops the step for none, as main keeps it', () => {
      const next = withSeasonStrength(career([entry({ strength: 2 })]), 'test-cup', 0, 0);

      expect(next.seasons[1].entries[0]).not.toHaveProperty('strength');
    });

    it('leaves another edition and another championship alone', () => {
      const other = entry({ series: 'other-cup' });
      const second = entry({ edition: 1 });
      const next = withSeasonStrength(career([entry(), other, second]), 'test-cup', 0, 5);

      expect(next.seasons[1].entries[1]).toBe(other);
      expect(next.seasons[1].entries[2]).toBe(second);
    });

    it('leaves an edition the career pulled out of alone, as main does', () => {
      const gone = entry({ withdrawn: true });

      expect(withSeasonStrength(career([gone]), 'test-cup', 0, 5).seasons[1].entries[0]).toBe(gone);
    });

    it('leaves a closed season alone', () => {
      const before = career([entry()]);

      expect(withSeasonStrength(before, 'test-cup', 0, 5).seasons[0]).toBe(before.seasons[0]);
    });
  });
});
