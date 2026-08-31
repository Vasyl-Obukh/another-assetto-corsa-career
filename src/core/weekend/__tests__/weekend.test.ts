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
 * @param race The weekend, defaulting to the four-session fixture
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

/**
 * Runs the fixture's practice and then its qualifying, which is what leaves a
 * grid for the sprint to inherit. The two launches ahead of it have to be
 * recorded in order, since progress is a count rather than a set.
 * @param weekendPlan The plan
 * @param order The order qualifying classified the field in
 * @returns The state with launches 0 and 1 recorded
 */
const throughQualifying = (weekendPlan: WeekendPlan, order: number[]): WeekendState => {
  const afterPractice = complete(weekendPlan, initWeekendState(weekendPlan), [
    makeSession(1, 'Practice'),
  ]);

  return complete(weekendPlan, afterPractice, [makeQualifying(order)]);
};

describe('core/weekend', () => {
  describe('planWeekend', () => {
    it('runs every session as a launch of its own', () => {
      expect(plan().launches.map((launch) => (launch.race.sessions ?? []).map((s) => s.name)))
        .toEqual([['Practice'], ['Qualifying'], ['Sprint'], ['Feature']]);
    });

    it('makes the second race reachable, which bundling never could', () => {
      // A launch used to end at its first race, so the feature was listed in
      // the weekend structure and could not be run. Guards that.
      const { launches } = plan();

      expect(launches).toHaveLength(4);
      expect(launches[3].session.name).toBe('Feature');
    });

    it('carries the session each launch runs', () => {
      expect(plan().launches.map((launch) => launch.session.type))
        .toEqual(['practice', 'qualify', 'race', 'race']);
    });

    it('materialises the entry list once, so a driver is the same all weekend', () => {
      const { launches, grid } = plan();
      const fields = launches.map((launch) => launch.race.grid?.opponents);

      expect(grid).toHaveLength(6);
      fields.forEach((field) => expect(field).toEqual(fields[0]));
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

    it('carries rubber onto every later launch', () => {
      // A green track starts at 80% and closes a quarter of the gap, damped by
      // the preset's own transfer, for each session already run.
      expect(plan().launches.map((launch) => launch.race.conditions?.startGrip))
        .toEqual([undefined, 83, 86, 88]);
    });

    it('takes each launch its day from its session', () => {
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'practice', day: 0 }, { type: 'qualify', day: 1 }, { type: 'race', day: 2 },
      ];

      expect(plan(weekend).launches.map((launch) => launch.day)).toEqual([0, 1, 2]);
    });

    it('gives every session its own time of day, not just the first', () => {
      // A launch is one INI and [LIGHTING] SUN_ANGLE is written once per INI,
      // which is why a start time used to belong to a launch rather than a
      // session. One session per launch makes the two the same thing.
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'practice', conditions: { timeOfDay: '09:00' } },
        { type: 'qualify', conditions: { timeOfDay: '12:30' } },
        { type: 'race', day: 1, conditions: { timeOfDay: '15:00' } },
      ];

      expect(plan(weekend).launches.map((launch) => launch.race.conditions?.timeOfDay))
        .toEqual(['09:00', '12:30', '15:00']);
    });

    it('resolves a session over the weekend, weather as a group', () => {
      const weekend = makeWeekend();
      weekend.conditions = {
        trackState: 'green', weather: 'test_clear', ambient: 20, windMin: 4,
      };
      weekend.sessions = [
        { type: 'practice' },
        { type: 'race', conditions: { weatherType: 7, ambient: 14 } },
      ];

      const [practice, race] = plan(weekend).launches.map((launch) => launch.race.conditions);

      expect(practice).toMatchObject({ weather: 'test_clear', ambient: 20, windMin: 4 });
      // The session named a type, so it replaces the weekend's preset outright
      // rather than sitting beside it - but wind it said nothing about carries.
      expect(race?.weatherType).toBe(7);
      expect(race?.weather).toBeUndefined();
      expect(race).toMatchObject({ ambient: 14, windMin: 4 });
    });

    it('lets a session override the rubber carried into it', () => {
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'practice' }, { type: 'race', conditions: { startGrip: 99 } },
      ];

      expect(plan(weekend).launches[1].race.conditions?.startGrip).toBe(99);
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
        raceId: 'test-weekend', launchCount: 4, completed: [],
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
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(nextLaunch(weekendPlan, after)?.index).toBe(1);
    });

    it('offers nothing once every launch has run', () => {
      const weekendPlan = plan();
      let state = initWeekendState(weekendPlan);
      state = complete(weekendPlan, state, [makeSession(1, 'Practice')]);
      state = complete(weekendPlan, state, [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(weekendPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(weekendPlan, state, [makeSession(3, 'Feature')]);

      expect(nextLaunch(weekendPlan, state)).toBeNull();
    });
  });

  describe('startingGrid', () => {
    it('is ours to write for a race, since qualifying can no longer own it', () => {
      // The case this replaces: a launch holding qualifying and a race had its
      // grid built by AC, and STARTING_POSITION was silently disregarded. That
      // launch cannot exist now, so a race session always gets a grid.
      const weekendPlan = plan();

      expect(startingGrid(weekendPlan, initWeekendState(weekendPlan), 2)).not.toBeNull();
    });

    it('leaves it alone for a session that lines nobody up', () => {
      const weekendPlan = plan();
      const state = initWeekendState(weekendPlan);

      expect(startingGrid(weekendPlan, state, 0)).toBeNull();
      expect(startingGrid(weekendPlan, state, 1)).toBeNull();
    });

    it('inherits the order of the qualifying session that ran before it', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [3, 1, 5, 0, 2, 4]);

      expect(startingGrid(weekendPlan, after, 2)).toEqual({
        order: [3, 1, 5, 0, 2, 4], playerSlot: 4,
      });
    });

    it('counts the player slot from one, as AC does', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [0, 1, 2, 3, 4, 5]);

      expect(startingGrid(weekendPlan, after, 2)?.playerSlot).toBe(1);
    });

    it('starts the player last when the weekend qualifies nowhere', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const weekendPlan = plan(weekend);
      const grid = startingGrid(weekendPlan, initWeekendState(weekendPlan), 1);

      expect(grid?.playerSlot).toBe(6);
      expect(grid?.order[5]).toBe(0);
    });
  });

  describe('appliedOrder', () => {
    it('leaves the entry list alone for a session with no grid', () => {
      const weekendPlan = plan();
      expect(appliedOrder(weekendPlan, initWeekendState(weekendPlan), 1))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('keeps the player at CAR_0 and reorders only the AI behind them', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [3, 1, 5, 0, 2, 4]);

      // AC inserts the player at STARTING_POSITION rather than swapping, so
      // the INI carries them first whatever slot they line up in.
      expect(appliedOrder(weekendPlan, after, 2)).toEqual([0, 3, 1, 5, 2, 4]);
    });
  });

  describe('prepareLaunch', () => {
    it('hands back a session that lines nobody up untouched', () => {
      const weekendPlan = plan();
      const state = initWeekendState(weekendPlan);

      expect(prepareLaunch(weekendPlan, state, 1)).toBe(weekendPlan.launches[1].race);
    });

    it('writes the inherited order into the entry list', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [3, 1, 5, 0, 2, 4]);
      const sprint = prepareLaunch(weekendPlan, after, 2);

      expect(sprint.grid?.opponents?.map((entry) => entry.driver)).toEqual(
        [3, 1, 5, 2, 4].map((car) => weekendPlan.grid[car].driver),
      );
    });

    it('places the player with a starting position on the race session', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [3, 1, 5, 0, 2, 4]);

      expect(prepareLaunch(weekendPlan, after, 2).sessions?.[0].startingPosition).toBe(4);
    });

    it('leaves a starting position off anything that is not a race', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const weekendPlan = plan(weekend);
      const state = initWeekendState(weekendPlan);

      expect(prepareLaunch(weekendPlan, state, 0).sessions?.[0].startingPosition).toBeUndefined();
      expect(prepareLaunch(weekendPlan, state, 1).sessions?.[0].startingPosition).toBe(6);
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
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(after.completed).toHaveLength(1);
      expect(after.completed[0]).toMatchObject({
        index: 0, archive: 'archive.json', completedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('keeps the qualifying order the launch produced', () => {
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [2, 0, 4, 1, 3, 5]);

      expect(after.completed[1].qualifyingOrder).toEqual([2, 0, 4, 1, 3, 5]);
    });

    it('records nothing to inherit when the launch ran no qualifying', () => {
      const weekendPlan = plan();
      const after = complete(weekendPlan, initWeekendState(weekendPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(after.completed[0].qualifyingOrder).toBeNull();
    });

    it('records the order the launch was actually run with', () => {
      // A qualifying session is run on entry order, because nothing lines that
      // field up - which is what makes the recorded order directly usable.
      // Pinned here so the two cannot drift apart unnoticed.
      const weekendPlan = plan();
      const after = throughQualifying(weekendPlan, [3, 1, 5, 0, 2, 4]);

      expect(after.completed[1].gridOrder).toEqual([0, 1, 2, 3, 4, 5]);
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
      state = complete(weekendPlan, state, [makeSession(1, 'Practice')]);
      state = complete(weekendPlan, state, [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(weekendPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(weekendPlan, state, [makeSession(3, 'Feature')]);

      expect(() => complete(weekendPlan, state, [makeSession(3, 'Again')]))
        .toThrow(/already been run/);
    });

    it('leaves the state it was given alone', () => {
      const weekendPlan = plan();
      const before = initWeekendState(weekendPlan);
      complete(weekendPlan, before, [makeSession(1, 'Practice')]);

      expect(before.completed).toEqual([]);
    });
  });
});
