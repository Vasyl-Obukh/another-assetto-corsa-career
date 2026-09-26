import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../../core/series/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type { Championship, Round } from '../../../shared/types/index.ts';
import type { RaceProgress } from '../../race-store/index.ts';
import { isEditable, weekendOf } from '../utils.ts';

/**
 * A championship holding the rounds a test matches against.
 *
 * Written out rather than cast from a partial, so the fixture cannot drift out
 * of the shape it claims to be.
 * @param id What the championship is called
 * @param rounds The round ids it should hold
 * @returns The championship
 */
const series = (id: string, rounds = ['magione', 'monza']): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id,
  name: id,
  rounds: rounds.map((round): Round => ({ id: round, name: round, track: { id: round } })),
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 5 },
    seats: [{ id: 'main-1' }],
    eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
  }],
  weekendFormats: [{ id: 'sprint', name: 'Sprint', sessions: [{ type: 'race', laps: 5 }] }],
  defaultWeekendFormat: 'sprint',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10] }],
  defaultPointsSystem: 'race',
});

/**
 * Progress as the race store reports it.
 * @param raceId Which race has started
 * @param overrides What else to say about it
 * @returns The progress
 */
const progress = (raceId: string, overrides: Partial<RaceProgress> = {}): RaceProgress => ({
  raceId, completed: 1, inFlight: false, ...overrides,
});

describe('main/series-store/utils', () => {
  describe('weekendOf', () => {
    it('names the round a live weekend belongs to', () => {
      expect(weekendOf(series('lotus-cup'), progress('lotus-cup/monza')))
        .toEqual({ round: 'monza', completed: 1, inFlight: false });
    });

    it('says nothing when no weekend has started', () => {
      expect(weekendOf(series('lotus-cup'), null)).toBeNull();
    });

    it('says nothing for a weekend of a different championship', () => {
      expect(weekendOf(series('lotus-cup'), progress('gt3-sprint-series/monza'))).toBeNull();
    });

    it('carries the launch count and the launch in flight through', () => {
      expect(weekendOf(series('lotus-cup'), progress('lotus-cup/magione', {
        completed: 3, inFlight: true,
      }))).toEqual({ round: 'magione', completed: 3, inFlight: true });
    });

    // Guards a bug: ids were joined with a hyphen, so series `lotus-cup` round
    // `2` and a weekend of `lotus-cup-2` read as the same race.
    it('does not mistake a championship whose id starts the same way', () => {
      expect(weekendOf(series('lotus-cup-2', ['monza']), progress('lotus-cup/2'))).toBeNull();
      expect(weekendOf(series('lotus-cup', ['2']), progress('lotus-cup-2/monza'))).toBeNull();
      expect(weekendOf(series('lotus-cup', ['2']), progress('lotus-cup/2'))).toEqual({
        round: '2', completed: 1, inFlight: false,
      });
    });

    // A renamed or deleted round stops matching and the lock lifts, which is
    // the same stale state assertStateMatches already discards. Recorded rather
    // than defended against, so nobody reads it as a bug later.
    it('lifts the lock when the round it was running is gone', () => {
      expect(weekendOf(series('lotus-cup', ['magione']), progress('lotus-cup/monza'))).toBeNull();
    });
  });

  describe('isEditable', () => {
    it('lets the user edit their own and their replacement of a shipped one', () => {
      expect(isEditable('user')).toBe(true);
      expect(isEditable('adjusted')).toBe(true);
    });

    it('refuses one the app ships, which has no file to write', () => {
      expect(isEditable('shipped')).toBe(false);
    });
  });
});
