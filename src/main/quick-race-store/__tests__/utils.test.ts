import { describe, expect, it } from '@jest/globals';

import type { QuickRace, QuickRaceView, Track } from '../../../shared/types/index.ts';
import { newQuickRace, QUICK_RACE_VERSION } from '../../../shared/utils/quick-race/index.ts';
import {
  byRecency, phaseOf, readQuickFile, titleOf,
} from '../utils.ts';

/**
 * A new quick race, with whatever the test says differently.
 * @param over What differs
 * @returns The race
 */
const makeRace = (over: Partial<QuickRace> = {}): QuickRace => ({
  ...newQuickRace('race-1', '2026-09-11T18:00:00.000Z'),
  ...over,
});

/**
 * An installed layout.
 * @param id Track folder name
 * @param layout Layout folder name, empty for a single-layout track
 * @param name What it is called
 * @returns As much of a Track as titleOf reads
 */
const makeLayout = (id: string, layout: string, name: string): Track => ({ id, layout, name }) as Track;

/**
 * A race as the Race tab lists it.
 * @param phase Where it is up to
 * @param updatedAt When it last changed
 * @returns As much of a view as the listing order reads
 */
const makeView = (phase: QuickRaceView['phase'], updatedAt: string): QuickRaceView => ({
  phase, race: makeRace({ updatedAt }),
}) as QuickRaceView;

describe('main/quick-race-store/utils', () => {
  describe('titleOf', () => {
    const tracks = [
      makeLayout('ks_nordschleife', 'endurance', 'Nordschleife - Endurance'),
      makeLayout('ks_nordschleife', 'tourist', 'Nordschleife - Tourist'),
      makeLayout('magione', '', 'Magione'),
    ];

    it('goes by the name the player gave it', () => {
      expect(titleOf(makeRace({ name: '  Friday night  ', track: { id: 'magione' } }), tracks))
        .toBe('Friday night');
    });

    it('goes by its layout\'s name when it has none of its own', () => {
      expect(titleOf(makeRace({ track: { id: 'ks_nordschleife', layout: 'tourist' } }), tracks))
        .toBe('Nordschleife - Tourist');
      expect(titleOf(makeRace({ track: { id: 'magione' } }), tracks)).toBe('Magione');
    });

    it('treats a blank name as none', () => {
      expect(titleOf(makeRace({ name: '   ', track: { id: 'magione' } }), tracks)).toBe('Magione');
    });

    it('falls back to the folder for a track no longer installed', () => {
      expect(titleOf(makeRace({ track: { id: 'gone' } }), tracks)).toBe('gone');
    });

    it('is empty while there is neither a name nor a track', () => {
      expect(titleOf(makeRace(), tracks)).toBe('');
    });
  });

  describe('phaseOf', () => {
    it('is setting up until a launch has run or gone out', () => {
      expect(phaseOf(0, 3, false)).toBe('setup');
      expect(phaseOf(0, null, false)).toBe('setup');
    });

    it('is running part-way through, or while a launch is out', () => {
      expect(phaseOf(1, 3, false)).toBe('running');
      expect(phaseOf(0, 3, true)).toBe('running');
      expect(phaseOf(3, 3, true)).toBe('running');
    });

    it('is finished once every launch it plans has run', () => {
      expect(phaseOf(3, 3, false)).toBe('finished');
    });

    // A race that no longer plans cannot be said to be finished, whatever ran.
    it('is still running when it cannot be planned', () => {
      expect(phaseOf(3, null, false)).toBe('running');
    });
  });

  describe('readQuickFile', () => {
    it('reads a race and what of it has run', () => {
      const race = makeRace();
      const completed = [{
        index: 0, completedAt: '2026-09-11T18:00:00.000Z', archive: '0.json', gridOrder: [0], classification: null,
      }];

      expect(readQuickFile({ race, completed })).toEqual({ race, completed });
    });

    it('reads a file with no progress as a race nothing of which has run', () => {
      expect(readQuickFile({ race: makeRace() })?.completed).toEqual([]);
    });

    it('refuses anything that is not a race at this version', () => {
      expect(readQuickFile(null)).toBeNull();
      expect(readQuickFile('race')).toBeNull();
      expect(readQuickFile({ race: null })).toBeNull();
      expect(readQuickFile({ race: { ...makeRace(), version: QUICK_RACE_VERSION + 1 } })).toBeNull();
      expect(readQuickFile({ race: { ...makeRace(), id: 7 } })).toBeNull();
      expect(readQuickFile({ race: { ...makeRace(), classes: 'none' } })).toBeNull();
      expect(readQuickFile({ race: { ...makeRace(), sessions: undefined } })).toBeNull();
    });
  });

  describe('byRecency', () => {
    it('lists the races part-way through first, then the latest changed', () => {
      const views = [
        makeView('setup', '2026-09-03T00:00:00.000Z'),
        makeView('running', '2026-09-01T00:00:00.000Z'),
        makeView('finished', '2026-09-05T00:00:00.000Z'),
        makeView('running', '2026-09-02T00:00:00.000Z'),
      ];

      expect([...views].sort(byRecency).map((one) => [one.phase, one.race.updatedAt.slice(0, 10)])).toEqual([
        ['running', '2026-09-02'],
        ['running', '2026-09-01'],
        ['finished', '2026-09-05'],
        ['setup', '2026-09-03'],
      ]);
    });
  });
});
