import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { Round, SeriesListing } from '../../../../../shared/types';
import { circuitUsage } from '../circuit-usage.ts';

/**
 * A listing of a championship racing the given rounds, its classes entering at
 * the given disciplines.
 * @param tracks Each round's track
 * @param disciplines Each class's discipline
 * @returns The listing
 */
const listing = (tracks: Round['track'][], disciplines: Discipline[]): SeriesListing => ({
  series: {
    rounds: tracks.map((track, index) => ({ id: `r${index}`, name: `R${index}`, track })),
    entries: disciplines.map((discipline) => ({ ladder: { discipline } })),
  },
} as unknown as SeriesListing);

describe('renderer/lib/circuit-usage', () => {
  describe('circuitUsage', () => {
    it('counts each championship once per circuit, however many of its layouts it races', () => {
      const usage = circuitUsage([
        listing([{ recommended: 'suzuka/gp', id: 'a' }, { recommended: 'suzuka/east', id: 'b' }], [Discipline.SPORTSCAR]),
        listing([{ recommended: 'suzuka/gp', id: 'a' }], [Discipline.TOURING]),
      ]);

      expect(usage.get('suzuka')?.championships).toBe(2);
    });

    it('counts a championship once per discipline its classes enter at', () => {
      const usage = circuitUsage([
        listing([{ recommended: 'spa/gp', id: 'spa' }], [Discipline.SPORTSCAR, Discipline.SPORTSCAR, Discipline.TOURING]),
        listing([{ recommended: 'spa/gp', id: 'spa' }], [Discipline.SPORTSCAR]),
      ]);

      expect(usage.get('spa')?.disciplines).toEqual(new Map([[Discipline.SPORTSCAR, 2], [Discipline.TOURING, 1]]));
    });

    it('leaves out rounds at a plain folder, and circuits nothing races', () => {
      const usage = circuitUsage([listing([{ id: 'spa' }, { recommended: 'nowhere/gp', id: 'x' }], [Discipline.ROAD])]);

      expect(usage.size).toBe(0);
    });
  });
});
