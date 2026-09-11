import { describe, expect, it } from '@jest/globals';

import { MIGRATABLE_VERSION, SEATS_VERSION } from '../constants.ts';
import { migrateSeries } from '../utils.ts';

/**
 * A revision 2 championship, which carried an entrant count rather than seats.
 * @param entries What its class entries look like
 * @returns The value JSON.parse would have returned
 */
const olderFile = (entries: unknown[]): Record<string, unknown> => ({
  version: MIGRATABLE_VERSION,
  id: 'sunday-cup',
  name: 'Sunday Cup',
  entries,
});

describe('core/series-file/utils', () => {
  describe('migrateSeries', () => {
    it('turns an entrant count into that many seats', () => {
      const migrated = migrateSeries(olderFile([{ id: 'main', entrants: 3 }]));
      const [entry] = migrated.entries as Record<string, unknown>[];

      expect(entry.seats).toEqual([{ id: 'main-1' }, { id: 'main-2' }, { id: 'main-3' }]);
    });

    it('drops the count it replaced', () => {
      const migrated = migrateSeries(olderFile([{ id: 'main', entrants: 2 }]));

      expect((migrated.entries as Record<string, unknown>[])[0]).not.toHaveProperty('entrants');
    });

    it('keeps everything else about the entry and the file', () => {
      const migrated = migrateSeries({
        ...olderFile([{ id: 'main', name: 'Main', entrants: 1 }]),
        entryFee: 500,
      });

      expect(migrated.id).toBe('sunday-cup');
      expect(migrated.entryFee).toBe(500);
      expect((migrated.entries as Record<string, unknown>[])[0].name).toBe('Main');
    });

    // A migration may only claim the revision it actually wrote. Stamping
    // whatever the build currently reads would let a later revision 4 find its
    // own step quietly skipped, which is what the version field exists to stop.
    it('stamps the revision it produced rather than the current one', () => {
      expect(migrateSeries(olderFile([{ id: 'main', entrants: 1 }])).version).toBe(SEATS_VERSION);
    });

    it('leaves a file at any other revision completely alone', () => {
      const current = { version: SEATS_VERSION, entries: [{ id: 'main', seats: [{ id: 'a' }] }] };
      const ancient = olderFile([{ id: 'main', entrants: 2 }]);

      expect(migrateSeries(current)).toBe(current);
      expect(migrateSeries({ ...ancient, version: 1 }).version).toBe(1);
    });

    // parseSeries reports the shape afterwards, so anything unconvertible is
    // passed through to be refused there rather than guessed at here.
    it('passes through an entry it cannot convert', () => {
      const entries = ['nope', { id: 'main' }, { id: 'other', entrants: 'eight' }];

      expect(migrateSeries(olderFile(entries)).entries).toEqual(entries);
    });

    it('reads a nonsense entrant count as fielding nobody', () => {
      const migrated = migrateSeries(olderFile([{ id: 'main', entrants: -3 }]));

      expect((migrated.entries as Record<string, unknown>[])[0].seats).toEqual([]);
    });
  });
});
