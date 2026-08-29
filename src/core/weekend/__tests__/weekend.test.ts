import { describe, expect, it } from '@jest/globals';

import {
  makeContent, makeQualifying, makeRaceOut, makeSession, makeWeekend,
} from './fixtures.ts';
import type { RaceDefinition, WeekendPlan, WeekendState } from '../../../shared/types/index.ts';
import {
  advanceWeekend,
  appliedOrder,
  assertStateMatches,
  initWeekendState,
  nextLaunch,
  planWeekend,
  prepareLaunch,
  startingGrid,
} from '../weekend.ts';

/**
 * Plans a weekend against the fixture content.
 * @param race The weekend, defaulting to the two-launch fixture
 * @returns The plan
 */
const plan = (race: RaceDefinition = makeWeekend()): WeekendPlan => (
  planWeekend(race, makeContent())
);

/**
 * Runs a launch through the state machine.
 * @param weekendPlan The plan
 * @param state Where the weekend had got to
 * @param sessions What AC wrote for the launch
 * @returns The state with that launch recorded
 */
const complete = (
  weekendPlan: WeekendPlan,
  state: WeekendState,
  sessions: Parameters<typeof makeRaceOut>[0],
): WeekendState => advanceWeekend(
  weekendPlan,
  state,
  makeRaceOut(sessions),
  { archive: 'archive.json', completedAt: '2026-01-01T00:00:00.000Z' },
);

describe('core/weekend', () => {
  describe('planWeekend', () => {
    it('ends a launch at its first race, so a sprint and a feature are two', () => {
      expect(plan().launches.map((launch) => (launch.race.sessions ?? []).map((s) => s.name)))
        .toEqual([['Practice', 'Qualifying', 'Sprint'], ['Feature']]);
    });

    it('flags which launches qualify and which end in a race', () => {
      expect(plan().launches.map((launch) => [launch.hasQualifying, launch.hasRace]))
        .toEqual([[true, true], [false, true]]);
    });

    it('materialises the entry list once, so a driver is the same all weekend', () => {
      const { launches, grid } = plan();
      const [first, second] = launches.map((launch) => launch.race.grid?.opponents);

      expect(grid).toHaveLength(6);
      expect(first).toEqual(second);
      expect(new Set(grid.map((entry) => entry.skin)).size).toBe(6);
    });

    it('writes the player into every launch as an explicit entry', () => {
      plan().launches.forEach((launch) => {
        expect(launch.race.playerCar.driver).toBe('Player');
        expect(launch.race.grid?.size).toBe(6);
      });
    });

    it('leaves the opening launch on the track state preset', () => {
      expect(plan().launches[0].race.conditions?.startGrip).toBeUndefined();
    });

    it('carries rubber onto a later launch', () => {
      // Three sessions ran before the feature, on a green track.
      expect(plan().launches[1].race.conditions?.startGrip).toBe(88);
    });

    it('takes each launch its day from its opening session', () => {
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'practice', day: 0 }, { type: 'qualify', day: 1 }, { type: 'race', day: 2 },
      ];

      expect(plan(weekend).launches.map((launch) => launch.day)).toEqual([0, 1, 2]);
    });

    it('takes a launch time of day from its opening session', () => {
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'practice', timeOfDay: '09:00' }, { type: 'race', day: 1, timeOfDay: '15:00' },
      ];

      expect(plan(weekend).launches.map((launch) => launch.race.conditions?.timeOfDay))
        .toEqual(['09:00', '15:00']);
    });

    it('falls back to a single race when the weekend defines no sessions', () => {
      const weekend = makeWeekend();
      delete weekend.sessions;

      const { launches } = plan(weekend);
      expect(launches).toHaveLength(1);
      expect(launches[0].race.sessions?.[0].type).toBe('race');
    });
  });

  describe('initWeekendState', () => {
    it('starts with nothing run and remembers how many launches there were', () => {
      expect(initWeekendState(plan())).toEqual({
        raceId: 'test-weekend', launchCount: 2, completed: [],
      });
    });
  });

  describe('assertStateMatches', () => {
    it('accepts progress that still describes the weekend', () => {
      const weekendPlan = plan();
      expect(() => assertStateMatches(weekendPlan, initWeekendState(weekendPlan))).not.toThrow();
    });

    it('rejects progress from before the weekend was edited', () => {
      const weekendPlan = plan();
      const stale = { ...initWeekendState(weekendPlan), launchCount: 3 };

      expect(() => assertStateMatches(weekendPlan, stale)).toThrow(/covers 3 launches/);
    });
  });

  describe('nextLaunch', () => {
    it('offers the first launch of a weekend nothing has been run of', () => {
      const weekendPlan = plan();
      expect(nextLaunch(weekendPlan, initWeekendState(weekendPlan))?.index).toBe(0);
    });

    it('moves on once a launch has been recorded', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [makeSession(3, 'Sprint')]);

      expect(nextLaunch(weekendPlan, after)?.index).toBe(1);
    });

    it('offers nothing once every launch has run', () => {
      const weekendPlan = plan();
      let state = initWeekendState(weekendPlan);
      state = complete(weekendPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(weekendPlan, state, [makeSession(3, 'Feature')]);

      expect(nextLaunch(weekendPlan, state)).toBeNull();
    });
  });

  describe('startingGrid', () => {
    it('leaves the grid to AC when the launch qualifies for itself', () => {
      const weekendPlan = plan();
      expect(startingGrid(weekendPlan, initWeekendState(weekendPlan), 0)).toBeNull();
    });

    it('leaves it alone for a launch that runs no race', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice', day: 0 }, { type: 'race', day: 1 }];
      const weekendPlan = plan(weekend);

      expect(startingGrid(weekendPlan, initWeekendState(weekendPlan), 0)).toBeNull();
    });

    it('inherits the qualifying order of the launch before it', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([3, 1, 5, 0, 2, 4]), makeSession(3, 'Sprint'),
      ]);

      expect(startingGrid(weekendPlan, after, 1)).toEqual({
        order: [3, 1, 5, 0, 2, 4], playerSlot: 4,
      });
    });

    it('counts the player slot from one, as AC does', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([0, 1, 2, 3, 4, 5]), makeSession(3, 'Sprint'),
      ]);

      expect(startingGrid(weekendPlan, after, 1)?.playerSlot).toBe(1);
    });

    it('starts the player last when the weekend qualifies nowhere', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const weekendPlan = plan(weekend);
      const grid = startingGrid(weekendPlan, initWeekendState(weekendPlan), 0);

      expect(grid?.playerSlot).toBe(6);
      expect(grid?.order[5]).toBe(0);
    });
  });

  describe('appliedOrder', () => {
    it('leaves the entry list alone when AC owns the grid', () => {
      const weekendPlan = plan();
      expect(appliedOrder(weekendPlan, initWeekendState(weekendPlan), 0))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('keeps the player at CAR_0 and reorders only the AI behind them', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([3, 1, 5, 0, 2, 4]), makeSession(3, 'Sprint'),
      ]);

      // AC inserts the player at STARTING_POSITION rather than swapping, so
      // the INI carries them first whatever slot they line up in.
      expect(appliedOrder(weekendPlan, after, 1)).toEqual([0, 3, 1, 5, 2, 4]);
    });
  });

  describe('prepareLaunch', () => {
    it('hands back the launch untouched when AC owns its grid', () => {
      const weekendPlan = plan();
      const state = initWeekendState(weekendPlan);

      expect(prepareLaunch(weekendPlan, state, 0)).toBe(weekendPlan.launches[0].race);
    });

    it('writes the inherited order into the entry list', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([3, 1, 5, 0, 2, 4]), makeSession(3, 'Sprint'),
      ]);
      const feature = prepareLaunch(weekendPlan, after, 1);

      expect(feature.grid?.opponents?.map((entry) => entry.driver)).toEqual(
        [3, 1, 5, 2, 4].map((car) => weekendPlan.grid[car].driver),
      );
    });

    it('places the player with a starting position on the race session', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([3, 1, 5, 0, 2, 4]), makeSession(3, 'Sprint'),
      ]);

      expect(prepareLaunch(weekendPlan, after, 1).sessions?.[0].startingPosition).toBe(4);
    });

    it('leaves a starting position off anything that is not a race', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const weekendPlan = plan(weekend);
      const prepared = prepareLaunch(weekendPlan, initWeekendState(weekendPlan), 0);

      expect(prepared.sessions?.[0].startingPosition).toBeUndefined();
      expect(prepared.sessions?.[1].startingPosition).toBe(6);
    });

    it('refuses a launch the weekend does not have', () => {
      const weekendPlan = plan();
      expect(() => prepareLaunch(weekendPlan, initWeekendState(weekendPlan), 9))
        .toThrow(/Launch 9 does not exist/);
    });
  });

  describe('advanceWeekend', () => {
    it('records the launch that ran, with where its result went', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [makeSession(3, 'Sprint')]);

      expect(after.completed).toHaveLength(1);
      expect(after.completed[0]).toMatchObject({
        index: 0, archive: 'archive.json', completedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('keeps the qualifying order the launch produced', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([2, 0, 4, 1, 3, 5]), makeSession(3, 'Sprint'),
      ]);

      expect(after.completed[0].qualifyingOrder).toEqual([2, 0, 4, 1, 3, 5]);
    });

    it('records nothing to inherit when the launch ran no qualifying', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [makeSession(3, 'Sprint')]);

      expect(after.completed[0].qualifyingOrder).toBeNull();
    });

    it('records the order the launch was actually run with', () => {
      // A launch that qualifies is run on entry order, because AC owns its
      // grid - which is what makes the recorded qualifying order directly
      // usable. Pinned here so the two cannot drift apart unnoticed.
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeQualifying([3, 1, 5, 0, 2, 4]), makeSession(3, 'Sprint'),
      ]);

      expect(after.completed[0].gridOrder).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('declines to read a result whose field is not the size we launched', () => {
      const weekendPlan = plan();
      const shortField = makeRaceOut([makeQualifying([2, 0, 1])], 3);
      const after = advanceWeekend(weekendPlan, initWeekendState(weekendPlan), shortField, {
        archive: 'a.json', completedAt: 'now',
      });

      expect(after.completed[0].qualifyingOrder).toBeNull();
    });

    it('refuses to record a launch when the weekend is already finished', () => {
      const weekendPlan = plan();
      let state = initWeekendState(weekendPlan);
      state = complete(weekendPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(weekendPlan, state, [makeSession(3, 'Feature')]);

      expect(() => complete(weekendPlan, state, [makeSession(3, 'Again')]))
        .toThrow(/already been run/);
    });

    it('leaves the state it was given alone', () => {
      const weekendPlan = plan();
      const before = initWeekendState(weekendPlan);
      complete(weekendPlan, before, [makeSession(3, 'Sprint')]);

      expect(before.completed).toEqual([]);
    });
  });
});
