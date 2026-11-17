import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { Round, SeriesListing } from '../../../../../shared/types';
import { circuitUsage, layoutFields, outgrown } from '../circuit-usage.ts';

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

/**
 * A listing of a championship of the given field, racing the given layouts.
 * @param name The championship's name
 * @param seats Cars on its grid
 * @param layouts Each round's recommended layout
 * @returns The listing
 */
const fielding = (name: string, seats: number, layouts: string[]): SeriesListing => ({
  series: {
    id: name,
    name,
    rounds: layouts.map((layout, index) => ({ id: `r${index}`, name: `R${index}`, track: { recommended: layout, id: 'x' } })),
    entries: [{ seats: Array.from({ length: seats }, (_, at) => ({ id: `s${at}` })) }],
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

  describe('layoutFields', () => {
    it('keeps the biggest field racing each layout, and who fields it', () => {
      const fields = layoutFields([
        fielding('Small Cup', 20, ['spa/gp']),
        fielding('Big Series', 36, ['spa/gp', 'monza/gp']),
        fielding('Mid Series', 26, ['monza/gp']),
      ]);

      expect(fields.get('spa/gp')).toEqual({ field: 36, name: 'Big Series' });
      expect(fields.get('monza/gp')).toEqual({ field: 36, name: 'Big Series' });
    });

    it('lists only the layouts something races', () => {
      expect([...layoutFields([fielding('Cup', 20, ['spa/gp', 'spa/gp'])]).keys()]).toEqual(['spa/gp']);
    });
  });

  describe('outgrown', () => {
    const listings = [
      fielding('Small Cup', 20, ['spa/gp']),
      fielding('Big Series', 36, ['monza/gp', 'spa/gp', 'spa/gp']),
      fielding('Elsewhere', 40, ['monza/gp']),
    ];

    it('lists each championship at the layout fielding more cars than the boxes, with its rounds there', () => {
      const short = outgrown(listings, 'spa/gp', 24);

      expect(short.map(({ series, rounds, field }) => [series.name, rounds.map((round) => round.id), field]))
        .toEqual([['Big Series', ['r1', 'r2'], 36]]);
    });

    it('lists nothing for a track that does not say how many boxes it has', () => {
      expect(outgrown(listings, 'spa/gp', null)).toEqual([]);
    });

    it('lists nothing for a track that says it has none', () => {
      expect(outgrown(listings, 'spa/gp', 0)).toEqual([]);
    });
  });
});
