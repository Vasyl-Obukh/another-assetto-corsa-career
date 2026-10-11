import { describe, expect, it } from '@jest/globals';

import {
  makeContent, makeEvent, makeKnockout, makeQualifying, makeRaceOut, makeSession,
} from './fixtures.ts';
import type {
  EventPlan, EventState, RaceDefinition, RaceOutSession,
} from '../../../shared/types/index.ts';
import {
  advanceEvent,
  appliedOrder,
  assertStateMatches,
  initEventState,
  launchRunnable,
  nextLaunch,
  planEvent,
  prepareLaunch,
  skipEliminated,
  skipLaunch,
  startingGrid,
} from '../event.ts';

/**
 * Plans an event against the fixture content.
 * @param race The event, defaulting to the four-session fixture
 * @returns The plan
 */
const plan = (race: RaceDefinition = makeEvent()): EventPlan => (
  planEvent(race, makeContent())
);

/**
 * Runs a launch through the state machine.
 * @param eventPlan The plan
 * @param state Where the event had got to
 * @param sessions What AC wrote for the launch
 * @returns The state with that launch recorded
 */
const complete = (
  eventPlan: EventPlan,
  state: EventState,
  sessions: Parameters<typeof makeRaceOut>[0],
): EventState => advanceEvent(
  eventPlan,
  state,
  makeRaceOut(sessions),
  { archive: 'archive.json', completedAt: '2026-01-01T00:00:00.000Z' },
);

/**
 * Runs the fixture's practice and then its qualifying, which is what leaves a
 * grid for the sprint to inherit. The two launches ahead of it have to be
 * recorded in order, since progress is a count rather than a set.
 * @param eventPlan The plan
 * @param order The order qualifying classified the field in
 * @returns The state with launches 0 and 1 recorded
 */
const throughQualifying = (eventPlan: EventPlan, order: number[]): EventState => {
  const afterPractice = complete(eventPlan, initEventState(eventPlan), [
    makeSession(1, 'Practice'),
  ]);

  return complete(eventPlan, afterPractice, [makeQualifying(order)]);
};

/**
 * Runs the first qualifying segment of the knockout fixture.
 * @param eventPlan The plan
 * @param order The order Q1 classified the six cars in
 * @returns The state with launch 0 recorded
 */
const throughFirstSegment = (eventPlan: EventPlan, order: number[]): EventState => complete(
  eventPlan,
  initEventState(eventPlan),
  [makeQualifying(order)],
);

/**
 * An event whose second race follows the first, with its front reversed.
 * @param reverse How many of the sprint's finishers the feature turns round
 * @returns The event
 */
const makeReverseEvent = (reverse: number): RaceDefinition => ({
  ...makeEvent(),
  sessions: [
    { id: 'q', type: 'qualify', name: 'Qualifying', minutes: 10 },
    {
      id: 'sprint', type: 'race', name: 'Sprint', laps: 2, inherit: { from: 'q' },
    },
    {
      type: 'race', name: 'Feature', laps: 6, inherit: { from: 'sprint', reverse },
    },
  ],
});

/**
 * A race session AC classified in the given order.
 * @param order Car indices, winner first
 * @returns The session
 */
const makeRace = (order: number[]): RaceOutSession => ({
  ...makeSession(3, 'Sprint'),
  raceResult: order,
});

describe('core/event', () => {
  describe('planEvent', () => {
    it('runs every session as a launch of its own', () => {
      expect(plan().launches.map((launch) => (launch.race.sessions ?? []).map((s) => s.name)))
        .toEqual([['Practice'], ['Qualifying'], ['Sprint'], ['Feature']]);
    });

    it('makes the second race reachable, which bundling never could', () => {
      // A launch used to end at its first race, so the feature was listed in
      // the event structure and could not be run. Guards that.
      const { launches } = plan();

      expect(launches).toHaveLength(4);
      expect(launches[3].session.name).toBe('Feature');
    });

    it('carries the session each launch runs', () => {
      expect(plan().launches.map((launch) => launch.session.type))
        .toEqual(['practice', 'qualify', 'race', 'race']);
    });

    it('materialises the entry list once, so a driver is the same all event', () => {
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

    it('starts a session after a wet one on a greener track than after a dry one', () => {
      const after = (weatherType: number): number | undefined => {
        const event = makeEvent();
        event.sessions = [{ type: 'practice', conditions: { weatherType } }, { type: 'qualify' }];

        return plan(event).launches[1].race.conditions?.startGrip;
      };

      expect(after(7)).toBeLessThan(after(15) ?? 0);
    });

    it('takes each launch its day from its session', () => {
      const event = makeEvent();
      event.sessions = [
        { type: 'practice', day: 0 }, { type: 'qualify', day: 1 }, { type: 'race', day: 2 },
      ];

      expect(plan(event).launches.map((launch) => launch.day)).toEqual([0, 1, 2]);
    });

    it('gives every session its own time of day, not just the first', () => {
      // A launch is one INI and [LIGHTING] SUN_ANGLE is written once per INI,
      // which is why a start time used to belong to a launch rather than a
      // session. One session per launch makes the two the same thing.
      const event = makeEvent();
      event.sessions = [
        { type: 'practice', conditions: { timeOfDay: '09:00' } },
        { type: 'qualify', conditions: { timeOfDay: '12:30' } },
        { type: 'race', day: 1, conditions: { timeOfDay: '15:00' } },
      ];

      expect(plan(event).launches.map((launch) => launch.race.conditions?.timeOfDay))
        .toEqual(['09:00', '12:30', '15:00']);
    });

    it('resolves a session over the event, weather as a group', () => {
      const event = makeEvent();
      event.conditions = {
        trackState: 'green', weather: 'test_clear', ambient: 20, windMin: 4,
      };
      event.sessions = [
        { type: 'practice' },
        { type: 'race', conditions: { weatherType: 7, ambient: 14 } },
      ];

      const [practice, race] = plan(event).launches.map((launch) => launch.race.conditions);

      expect(practice).toMatchObject({ weather: 'test_clear', ambient: 20, windMin: 4 });
      // The session named a type, so it replaces the event's preset outright
      // rather than sitting beside it - but wind it said nothing about carries.
      expect(race?.weatherType).toBe(7);
      expect(race?.weather).toBeUndefined();
      expect(race).toMatchObject({ ambient: 14, windMin: 4 });
    });

    it('lets a session override the rubber carried into it', () => {
      const event = makeEvent();
      event.sessions = [
        { type: 'practice' }, { type: 'race', conditions: { startGrip: 99 } },
      ];

      expect(plan(event).launches[1].race.conditions?.startGrip).toBe(99);
    });

    it('falls back to a single race when the event defines no sessions', () => {
      const event = makeEvent();
      delete event.sessions;

      const { launches } = plan(event);
      expect(launches).toHaveLength(1);
      expect(launches[0].race.sessions?.[0].type).toBe('race');
    });

    it('carries the strength each class races at, for its launches to record', () => {
      expect(plan({ ...makeEvent(), classStrength: { gt3: 84, gt4: 79 } }).classStrength)
        .toEqual({ gt3: 84, gt4: 79 });
    });

    it('carries no strength for a race with no classes', () => {
      expect(plan()).not.toHaveProperty('classStrength');
    });
  });

  describe('initEventState', () => {
    it('starts with nothing run and remembers how many launches there were', () => {
      expect(initEventState(plan())).toEqual({
        raceId: 'test-event', launchCount: 4, completed: [],
      });
    });
  });

  describe('assertStateMatches', () => {
    it('accepts progress that still describes the event', () => {
      const eventPlan = plan();
      expect(() => assertStateMatches(eventPlan, initEventState(eventPlan))).not.toThrow();
    });

    it('rejects progress from before the event was edited', () => {
      const eventPlan = plan();
      const stale = { ...initEventState(eventPlan), launchCount: 3 };

      expect(() => assertStateMatches(eventPlan, stale)).toThrow(/covers 3 launches/);
    });
  });

  describe('nextLaunch', () => {
    it('offers the first launch of an event nothing has been run of', () => {
      const eventPlan = plan();
      expect(nextLaunch(eventPlan, initEventState(eventPlan))?.index).toBe(0);
    });

    it('moves on once a launch has been recorded', () => {
      const eventPlan = plan();
      const after = complete(eventPlan, initEventState(eventPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(nextLaunch(eventPlan, after)?.index).toBe(1);
    });

    it('offers nothing once every launch has run', () => {
      const eventPlan = plan();
      let state = initEventState(eventPlan);
      state = complete(eventPlan, state, [makeSession(1, 'Practice')]);
      state = complete(eventPlan, state, [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(eventPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(eventPlan, state, [makeSession(3, 'Feature')]);

      expect(nextLaunch(eventPlan, state)).toBeNull();
    });
  });

  describe('startingGrid', () => {
    it('is ours to write for a race, since qualifying can no longer own it', () => {
      // The case this replaces: a launch holding qualifying and a race had its
      // grid built by AC, and STARTING_POSITION was silently disregarded. That
      // launch cannot exist now, so a race session always gets a grid.
      const eventPlan = plan();

      expect(startingGrid(eventPlan, initEventState(eventPlan), 2)).not.toBeNull();
    });

    it('leaves it alone for a session that lines nobody up', () => {
      const eventPlan = plan();
      const state = initEventState(eventPlan);

      expect(startingGrid(eventPlan, state, 0)).toBeNull();
      expect(startingGrid(eventPlan, state, 1)).toBeNull();
    });

    it('inherits the order of the qualifying session that ran before it', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [3, 1, 5, 0, 2, 4]);

      expect(startingGrid(eventPlan, after, 2)).toEqual({
        order: [3, 1, 5, 0, 2, 4], playerSlot: 4,
      });
    });

    it('counts the player slot from one, as AC does', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [0, 1, 2, 3, 4, 5]);

      expect(startingGrid(eventPlan, after, 2)?.playerSlot).toBe(1);
    });

    it('reverses the front of the race it follows', () => {
      const eventPlan = plan(makeReverseEvent(4));
      let state = complete(eventPlan, initEventState(eventPlan), [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(eventPlan, state, [makeRace([5, 4, 3, 2, 1, 0])]);

      expect(startingGrid(eventPlan, state, 2)).toEqual({
        order: [2, 3, 4, 5, 1, 0], playerSlot: 6,
      });
    });

    // A grid lined up on skill has no result behind it to turn round.
    it('reverses nothing when there is no result to follow', () => {
      const event = makeEvent();
      event.sessions = [{ type: 'race', name: 'Race', inherit: { from: 'nothing', reverse: 4 } }];
      const eventPlan = plan(event);
      const grid = startingGrid(eventPlan, initEventState(eventPlan), 0);

      expect(grid?.order[5]).toBe(0);
    });

    it('starts the player last when the event qualifies nowhere', () => {
      const event = makeEvent();
      event.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const eventPlan = plan(event);
      const grid = startingGrid(eventPlan, initEventState(eventPlan), 1);

      expect(grid?.playerSlot).toBe(6);
      expect(grid?.order[5]).toBe(0);
    });

    it('starts the player where a race nothing lines up says', () => {
      const event = makeEvent();
      event.sessions = [{ type: 'race', name: 'Race', start: 'pole' }];
      const eventPlan = plan(event);

      expect(startingGrid(eventPlan, initEventState(eventPlan), 0)?.playerSlot).toBe(1);
    });

    it('ignores where the session says to start behind a qualifying', () => {
      const event = makeEvent();
      event.sessions = [{ type: 'qualify', name: 'Q', minutes: 10 }, { type: 'race', name: 'Race', start: 'pole' }];
      const eventPlan = plan(event);
      const state = complete(eventPlan, initEventState(eventPlan), [makeQualifying([1, 2, 0, 3, 4, 5])]);

      expect(startingGrid(eventPlan, state, 1)?.playerSlot).toBe(3);
    });
  });

  describe('appliedOrder', () => {
    it('leaves the entry list alone for a session with no grid', () => {
      const eventPlan = plan();
      expect(appliedOrder(eventPlan, initEventState(eventPlan), 1))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('keeps the player at CAR_0 and reorders only the AI behind them', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [3, 1, 5, 0, 2, 4]);

      // AC inserts the player at STARTING_POSITION rather than swapping, so
      // the INI carries them first whatever slot they line up in.
      expect(appliedOrder(eventPlan, after, 2)).toEqual([0, 3, 1, 5, 2, 4]);
    });
  });

  describe('prepareLaunch', () => {
    it('hands back a session that lines nobody up untouched', () => {
      const eventPlan = plan();
      const state = initEventState(eventPlan);

      expect(prepareLaunch(eventPlan, state, 1)).toBe(eventPlan.launches[1].race);
    });

    it('writes the inherited order into the entry list', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [3, 1, 5, 0, 2, 4]);
      const sprint = prepareLaunch(eventPlan, after, 2);

      expect(sprint.grid?.opponents?.map((entry) => entry.driver)).toEqual(
        [3, 1, 5, 2, 4].map((car) => eventPlan.grid[car].driver),
      );
    });

    it('places the player with a starting position on the race session', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [3, 1, 5, 0, 2, 4]);

      expect(prepareLaunch(eventPlan, after, 2).sessions?.[0].startingPosition).toBe(4);
    });

    it('leaves a starting position off anything that is not a race', () => {
      const event = makeEvent();
      event.sessions = [{ type: 'practice' }, { type: 'race', name: 'Race' }];
      const eventPlan = plan(event);
      const state = initEventState(eventPlan);

      expect(prepareLaunch(eventPlan, state, 0).sessions?.[0].startingPosition).toBeUndefined();
      expect(prepareLaunch(eventPlan, state, 1).sessions?.[0].startingPosition).toBe(6);
    });

    it('refuses a launch the event does not have', () => {
      const eventPlan = plan();
      expect(() => prepareLaunch(eventPlan, initEventState(eventPlan), 9))
        .toThrow(/Launch 9 does not exist/);
    });
  });

  describe('launchRunnable', () => {
    it('says yes to every launch of an event that eliminates nobody', () => {
      const eventPlan = plan();
      const state = initEventState(eventPlan);

      expect(eventPlan.launches.map((launch) => launchRunnable(eventPlan, state, launch.index)))
        .toEqual([true, true, true, true]);
    });

    it('says yes to a segment the player is still in', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);

      expect(launchRunnable(knockout, state, 1)).toBe(true);
    });

    it('says no to a segment the player was knocked out of', () => {
      // Assetto Corsa has no session without them, so this is not a launch that
      // can be run at all rather than one that would run badly.
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);

      expect(launchRunnable(knockout, state, 1)).toBe(false);
    });
  });

  describe('skipLaunch', () => {
    it('records the segment as simulated, with nothing archived', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);
      const after = skipLaunch(knockout, state, '2026-01-02T00:00:00.000Z');

      expect(after.completed[1]).toMatchObject({
        index: 1, skipped: true, archive: '', completedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it('invents an order over the cars that went through, and only those', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);
      const { classification, gridOrder } = skipLaunch(knockout, state, 'now').completed[1];

      expect(gridOrder).toEqual([3, 1, 5, 2]);
      expect([...(classification ?? [])].sort((left, right) => left - right)).toEqual([1, 2, 3, 5]);
    });

    it('invents the same order every time, so a reload never reshuffles a grid', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);

      expect(skipLaunch(knockout, state, 'now').completed[1].classification)
        .toEqual(skipLaunch(knockout, state, 'later').completed[1].classification);
    });

    it('refuses a launch the player is in, which has to be driven', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);

      expect(() => skipLaunch(knockout, state, 'now')).toThrow(/has to be driven/);
    });

    it('refuses once the event is finished', () => {
      const knockout = plan(makeKnockout());
      const state: EventState = {
        ...initEventState(knockout),
        completed: knockout.launches.map((launch) => ({
          index: launch.index,
          completedAt: 'now',
          archive: '',
          gridOrder: [],
          classification: null,
        })),
      };

      expect(() => skipLaunch(knockout, state, 'now')).toThrow(/already been run/);
    });

    it('leaves the state it was given alone', () => {
      const knockout = plan(makeKnockout());
      const before = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);
      skipLaunch(knockout, before, 'now');

      expect(before.completed).toHaveLength(1);
    });
  });

  describe('skipEliminated', () => {
    it('hands back the same state when the player is still in', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);

      // The same object, which is what tells a caller nothing was written.
      expect(skipEliminated(knockout, state, 'now')).toBe(state);
    });

    it('skips every segment the player is out of, and stops at the race', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);
      const after = skipEliminated(knockout, state, 'now');

      expect(after.completed.map((done) => done.skipped)).toEqual([undefined, true, true]);
      expect(nextLaunch(knockout, after)?.session.name).toBe('Race');
    });

    it('leaves a finished event where it is rather than running off the end', () => {
      const eventPlan = plan();
      let state = initEventState(eventPlan);
      state = complete(eventPlan, state, [makeSession(1, 'Practice')]);
      state = complete(eventPlan, state, [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(eventPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(eventPlan, state, [makeSession(3, 'Feature')]);

      expect(skipEliminated(eventPlan, state, 'now')).toBe(state);
    });
  });

  describe('knockout qualifying', () => {
    it('runs a segment with only the cars its link let through', () => {
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);
      const q2 = prepareLaunch(knockout, state, 1);

      expect(q2.grid?.size).toBe(4);
      expect(appliedOrder(knockout, state, 1)).toEqual([0, 3, 1, 5]);
      expect(q2.grid?.opponents?.map((car) => car.driver))
        .toEqual([3, 1, 5].map((car) => knockout.grid[car].driver));
    });

    it('reads a short segment back rather than throwing its result away', () => {
      // Sized on the launch's own field: on the whole grid the result would
      // read as untranslatable and the segment would be lost in silence.
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);
      const after = advanceEvent(knockout, state, makeRaceOut([makeQualifying([1, 0, 3, 2])], 4), {
        archive: 'q2.json', completedAt: 'now',
      });

      // The result indexes the launch's [CAR_n] order, so 1 is car 3 and 3 is 5.
      expect(after.completed[1].classification).toEqual([3, 0, 5, 1]);
    });

    it('composes the race grid across the whole chain', () => {
      const knockout = plan(makeKnockout());
      let state = throughFirstSegment(knockout, [0, 3, 1, 5, 2, 4]);
      state = advanceEvent(knockout, state, makeRaceOut([makeQualifying([1, 0, 3, 2])], 4), {
        archive: 'q2.json', completedAt: 'now',
      });
      state = advanceEvent(knockout, state, makeRaceOut([makeQualifying([1, 0])], 2), {
        archive: 'q3.json', completedAt: 'now',
      });

      // Q3 ran cars 3 and 0 and put 0 second; then Q2's eliminated, 5 and 1;
      // then Q1's, 2 and 4.
      expect(startingGrid(knockout, state, 3)?.order).toEqual([3, 0, 5, 1, 2, 4]);
    });

    it('lines the player up where their last driven segment left them', () => {
      const knockout = plan(makeKnockout());
      const eliminated = skipEliminated(
        knockout,
        throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]),
        'now',
      );
      const grid = startingGrid(knockout, eliminated, 3);

      expect(grid?.playerSlot).toBe(5);
      expect(grid?.order.slice(4)).toEqual([0, 4]);
    });

    it('does not simply reuse the order of the segment the player went out in', () => {
      // If it did, the front of the grid would stand as Q1 left it, which is to
      // say the two segments after it never happened.
      const knockout = plan(makeKnockout());
      const state = throughFirstSegment(knockout, [3, 1, 5, 2, 0, 4]);
      const eliminated = skipEliminated(knockout, state, 'now');

      expect(startingGrid(knockout, eliminated, 3)?.order.slice(0, 4))
        .not.toEqual([3, 1, 5, 2]);
    });
  });

  describe('advanceEvent', () => {
    it('records the launch that ran, with where its result went', () => {
      const eventPlan = plan();
      const after = complete(eventPlan, initEventState(eventPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(after.completed).toHaveLength(1);
      expect(after.completed[0]).toMatchObject({
        index: 0, archive: 'archive.json', completedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('records the strength each class raced the launch at', () => {
      const eventPlan = plan({ ...makeEvent(), classStrength: { gt3: 84 } });
      const after = complete(eventPlan, initEventState(eventPlan), [makeSession(1, 'Practice')]);

      expect(after.completed[0].classStrength).toEqual({ gt3: 84 });
    });

    it('records no strength for a launch of a race with no classes', () => {
      const eventPlan = plan();
      const after = complete(eventPlan, initEventState(eventPlan), [makeSession(1, 'Practice')]);

      expect(after.completed[0]).not.toHaveProperty('classStrength');
    });

    it('keeps the qualifying order the launch produced', () => {
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [2, 0, 4, 1, 3, 5]);

      expect(after.completed[1].classification).toEqual([2, 0, 4, 1, 3, 5]);
    });

    it('keeps a race\'s finishing order, so a later race can follow it', () => {
      const eventPlan = plan(makeReverseEvent(4));
      let state = complete(eventPlan, initEventState(eventPlan), [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(eventPlan, state, [makeRace([5, 4, 3, 2, 1, 0])]);

      expect(state.completed[1].classification).toEqual([5, 4, 3, 2, 1, 0]);
    });

    it('records nothing to inherit when the launch ran no qualifying', () => {
      const eventPlan = plan();
      const after = complete(eventPlan, initEventState(eventPlan), [
        makeSession(1, 'Practice'),
      ]);

      expect(after.completed[0].classification).toBeNull();
    });

    it('records the order the launch was actually run with', () => {
      // A qualifying session is run on entry order, because nothing lines that
      // field up - which is what makes the recorded order directly usable.
      // Pinned here so the two cannot drift apart unnoticed.
      const eventPlan = plan();
      const after = throughQualifying(eventPlan, [3, 1, 5, 0, 2, 4]);

      expect(after.completed[1].gridOrder).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('declines to read a result whose field is not the size we launched', () => {
      const eventPlan = plan();
      const shortField = makeRaceOut([makeQualifying([2, 0, 1])], 3);
      const after = advanceEvent(eventPlan, initEventState(eventPlan), shortField, {
        archive: 'a.json', completedAt: 'now',
      });

      expect(after.completed[0].classification).toBeNull();
    });

    it('refuses to record a launch when the event is already finished', () => {
      const eventPlan = plan();
      let state = initEventState(eventPlan);
      state = complete(eventPlan, state, [makeSession(1, 'Practice')]);
      state = complete(eventPlan, state, [makeQualifying([0, 1, 2, 3, 4, 5])]);
      state = complete(eventPlan, state, [makeSession(3, 'Sprint')]);
      state = complete(eventPlan, state, [makeSession(3, 'Feature')]);

      expect(() => complete(eventPlan, state, [makeSession(3, 'Again')]))
        .toThrow(/already been run/);
    });

    it('leaves the state it was given alone', () => {
      const eventPlan = plan();
      const before = initEventState(eventPlan);
      complete(eventPlan, before, [makeSession(1, 'Practice')]);

      expect(before.completed).toEqual([]);
    });
  });
});
