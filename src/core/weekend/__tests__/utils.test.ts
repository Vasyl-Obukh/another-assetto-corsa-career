import { describe, expect, it } from '@jest/globals';

import {
  lap, makeContent, makeKnockout, makeSession, makeWeekend,
} from './fixtures.ts';
import type {
  Content, GridEntry, LaunchRecord, RaceDefinition, WeekendPlan, WeekendState,
} from '../../../shared/types/index.ts';
import { RAIN_FOR_FULL_WASH } from '../constants.ts';
import {
  bestLapOrder,
  chainOf,
  composeOrder,
  dayOf,
  defaultOrder,
  fieldFor,
  gripAfter,
  lastQualifying,
  launchOf,
  materialiseRace,
  playerFirst,
  runsToClock,
  sessionRain,
  simulateSegment,
} from '../utils.ts';
import { planWeekend } from '../weekend.ts';

/**
 * Builds a grid entry, defaulting everything but the fields being tested.
 * @param driver Driver name
 * @param aiLevel AI skill, omitted for the player
 * @returns A complete GridEntry
 */
const entry = (driver: string, aiLevel?: number): GridEntry => ({
  model: 'test_car',
  skin: 'skin_0',
  driver,
  nationality: '',
  nationCode: '',
  setup: '',
  ballast: 0,
  restrictor: 0,
  ...(aiLevel == null ? {} : { aiLevel, aiAggression: 30 }),
});

/**
 * A field of the given size, the player first and the AI slowing steadily.
 * @param size How many cars
 * @returns The grid
 */
const makeGrid = (size: number): GridEntry[] => Array.from(
  { length: size },
  (unused, index) => (index === 0 ? entry('Player') : entry(`AI ${index}`, 95 - index)),
);

/**
 * Plans a weekend against the fixture content.
 * @param race The weekend to plan
 * @returns The plan
 */
const planned = (race: RaceDefinition): WeekendPlan => planWeekend(race, makeContent());

/**
 * A completed launch carrying a classification, as the state holds one.
 * @param index Which launch it records
 * @param qualifyingOrder The order it classified, or null when it classified none
 * @returns The record
 */
const record = (index: number, qualifyingOrder: number[] | null): LaunchRecord => ({
  index,
  completedAt: '2026-01-01T00:00:00.000Z',
  archive: 'archive.json',
  gridOrder: [0, 1, 2, 3, 4, 5],
  qualifyingOrder,
});

/**
 * Progress holding the given records, for the functions that read one.
 * @param records What has run
 * @returns The state
 */
const stateOf = (records: LaunchRecord[]): WeekendState => ({
  raceId: 'test-knockout',
  launchCount: 4,
  completed: records,
});

/**
 * The rain of a run of dry sessions, as gripAfter reads what came before.
 * @param sessions How many sessions ran
 * @returns One zero per session
 */
const dry = (sessions: number): number[] => Array.from({ length: sessions }, () => 0);

/**
 * The fixture content with a preset that carries rain of its own.
 * @returns Content holding a wet preset beside the clear one
 */
const withWetPreset = (): Content => {
  const content = makeContent();
  content.weather.push({
    ...content.weather[0],
    id: 'test_wet',
    type: 7,
    rain: { intensity: 0.3, wetness: 0.5, water: 0.2 },
  });

  return content;
};

describe('core/weekend/utils', () => {
  describe('dayOf', () => {
    it('reads the day a session names', () => {
      expect(dayOf({ type: 'race', day: 2 })).toBe(2);
    });

    it('puts a session with no day on the opening day', () => {
      expect(dayOf({ type: 'race' })).toBe(0);
    });
  });

  describe('runsToClock', () => {
    it('runs a timed session to its clock', () => {
      expect(runsToClock({ type: 'practice', minutes: 10 })).toBe(true);
    });

    it('runs a race with a lap count to its laps, even when it names minutes', () => {
      expect(runsToClock({ type: 'race', laps: 5, minutes: 30 })).toBe(false);
    });

    it('does not know the length of a session naming no minutes', () => {
      expect(runsToClock({ type: 'qualify' })).toBe(false);
      expect(runsToClock({ type: 'race', laps: 5 })).toBe(false);
    });
  });

  describe('gripAfter', () => {
    it('leaves an untouched track on the preset for the opening launch', () => {
      expect(gripAfter({ trackState: 'green' }, dry(0))).toBe(80);
      expect(gripAfter({ trackState: 'fast' }, dry(0))).toBe(95);
    });

    it('rubbers the track in as sessions are run', () => {
      const green = [0, 1, 2, 3].map((sessions) => gripAfter({ trackState: 'green' }, dry(sessions)));
      expect(green).toEqual([80, 83, 86, 88]);
    });

    it('never climbs past a fully rubbered track', () => {
      expect(gripAfter({ trackState: 'green' }, dry(500))).toBe(100);
    });

    it('leaves an already optimum track where it is', () => {
      expect(gripAfter({ trackState: 'optimum' }, dry(4))).toBe(100);
    });

    it('assumes the same default track state buildRaceIni does', () => {
      expect(gripAfter(undefined, dry(0))).toBe(gripAfter({ trackState: 'fast' }, dry(0)));
    });

    it('builds on an explicit starting grip rather than the preset', () => {
      expect(gripAfter({ trackState: 'green', startGrip: 90 }, dry(0))).toBe(90);
      expect(gripAfter({ trackState: 'green', startGrip: 90 }, dry(1))).toBeGreaterThan(90);
    });

    // Guards a fix: rain used to lay rubber down exactly as a dry session did.
    it('washes a steadily rained session back to the grip the track started on', () => {
      expect(gripAfter({ trackState: 'green' }, [RAIN_FOR_FULL_WASH])).toBe(80);
      expect(gripAfter({ trackState: 'green' }, [0, RAIN_FOR_FULL_WASH])).toBe(80);
    });

    it('washes less off under lighter rain, in proportion', () => {
      const wetter = gripAfter({ trackState: 'green' }, [0, 0, RAIN_FOR_FULL_WASH]);
      const lighter = gripAfter({ trackState: 'green' }, [0, 0, RAIN_FOR_FULL_WASH / 2]);
      const dryRun = gripAfter({ trackState: 'green' }, dry(3));

      expect(lighter).toBeGreaterThan(wetter);
      expect(lighter).toBeLessThan(dryRun);
    });

    it('never washes below a green track or the grip the author set, whichever is lower', () => {
      expect(gripAfter({ trackState: 'green', startGrip: 90 }, [1])).toBe(80);
      expect(gripAfter({ trackState: 'green', startGrip: 70 }, [1, 1])).toBe(70);
    });

    it('leaves a weekend with a wet session in the middle greener than a dry one', () => {
      expect(gripAfter({ trackState: 'green' }, [0, RAIN_FOR_FULL_WASH, 0]))
        .toBeLessThan(gripAfter({ trackState: 'green' }, dry(3)));
    });
  });

  describe('sessionRain', () => {
    it('reads a dry session, or one naming no weather, as no rain', () => {
      expect(sessionRain({ type: 'race' }, { weatherType: 15 }, makeContent())).toBe(0);
      expect(sessionRain({ type: 'race' }, {}, makeContent())).toBe(0);
    });

    it('reads a static weather type off the rain table', () => {
      expect(sessionRain({ type: 'race' }, { weatherType: 7 }, makeContent())).toBe(0.125);
    });

    it('takes the rain a named preset carries over the table value for its type', () => {
      expect(sessionRain({ type: 'race' }, { weather: 'test_wet' }, withWetPreset())).toBe(0.3);
    });

    // Guards a fix: a single-step plan used to ignore the step's own rain.
    it('honours the rain a single-step plan states for its step', () => {
      const conditions = { weatherSteps: [{ weather: 7 as const, rain: 0.4 }] };

      expect(sessionRain({ type: 'race' }, conditions, makeContent())).toBe(0.4);
    });

    it('weights a timed plan by minutes, the last step taking what the session has left', () => {
      const conditions = { weatherSteps: [{ weather: 15 as const, minutes: 10 }, { weather: 7 as const }] };

      // Ten dry minutes, then twenty at 0.125.
      expect(sessionRain({ type: 'practice', minutes: 30 }, conditions, makeContent()))
        .toBeCloseTo((0.125 * 20) / 30);
    });

    it('gives the open last step of a lap race the mean length of the steps before it', () => {
      const conditions = {
        weatherSteps: [
          { weather: 15 as const, minutes: 10 }, { weather: 8 as const, minutes: 20 }, { weather: 7 as const },
        ],
      };

      // 10 dry, 20 at 0.6, then the mean of 15 at 0.125.
      expect(sessionRain({ type: 'race', laps: 10 }, conditions, makeContent()))
        .toBeCloseTo((0.6 * 20 + 0.125 * 15) / 45);
    });

    it('takes a step own rain over what its weather type implies', () => {
      const conditions = {
        weatherSteps: [{ weather: 15 as const, minutes: 10, rain: 0.2 }, { weather: 15 as const }],
      };

      expect(sessionRain({ type: 'practice', minutes: 20 }, conditions, makeContent())).toBeCloseTo(0.1);
    });
  });

  describe('defaultOrder', () => {
    it('starts the player last, having earned nothing', () => {
      const order = defaultOrder(makeGrid(6), 'test:1');
      expect(order[order.length - 1]).toBe(0);
    });

    it('lines every car up exactly once', () => {
      expect([...defaultOrder(makeGrid(6), 'test:1')].sort((a, b) => a - b))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('reproduces the same grid from the same label', () => {
      expect(defaultOrder(makeGrid(8), 'test:1')).toEqual(defaultOrder(makeGrid(8), 'test:1'));
    });

    it('gives a different launch a different grid', () => {
      expect(defaultOrder(makeGrid(8), 'test:1')).not.toEqual(defaultOrder(makeGrid(8), 'test:2'));
    });

    it('keeps a clearly faster driver ahead of a clearly slower one', () => {
      const grid = [entry('Player'), entry('Quick', 99), entry('Slow', 60)];
      expect(defaultOrder(grid, 'test:1')).toEqual([1, 2, 0]);
    });

    it('copes with a field of nothing but the player', () => {
      expect(defaultOrder([entry('Player')], 'test:1')).toEqual([0]);
    });
  });

  describe('bestLapOrder', () => {
    it('classifies on the fastest valid lap', () => {
      const session = makeSession(2, 'Q', [lap(0, 62_000), lap(1, 60_000), lap(2, 61_000)]);
      expect(bestLapOrder(session, 3)).toEqual([1, 2, 0]);
    });

    it('ignores an invalidated lap rather than reading -1 as a pole time', () => {
      const session = makeSession(2, 'Q', [lap(0, -1), lap(0, 63_000), lap(1, 62_000)]);
      expect(bestLapOrder(session, 2)).toEqual([1, 0]);
    });

    it('puts a car that set no time behind every car that did', () => {
      const session = makeSession(2, 'Q', [lap(1, 60_000), lap(2, 61_000)]);
      expect(bestLapOrder(session, 3)).toEqual([1, 2, 0]);
    });

    it('keeps entry order among cars that all set nothing', () => {
      expect(bestLapOrder(makeSession(2, 'Q', []), 3)).toEqual([0, 1, 2]);
    });

    it('still returns a slot for every car, so the order can be indexed', () => {
      const session = makeSession(2, 'Q', [lap(0, 60_000)]);
      expect(bestLapOrder(session, 4)).toHaveLength(4);
    });
  });

  describe('launchOf', () => {
    it('finds the launch carrying a session id', () => {
      expect(launchOf(planned(makeKnockout()), 'q2', 3)).toBe(1);
    });

    it('will not look forwards, so a link can only ever point back', () => {
      expect(launchOf(planned(makeKnockout()), 'q3', 1)).toBe(-1);
    });

    it('answers -1 for an id the weekend does not carry', () => {
      expect(launchOf(planned(makeKnockout()), 'sq1', 3)).toBe(-1);
    });
  });

  describe('chainOf', () => {
    it('follows a declared link back segment by segment', () => {
      expect(chainOf(planned(makeKnockout()), 3)).toEqual([2, 1, 0]);
    });

    it('takes every earlier qualifying, newest first, when nothing is declared', () => {
      // Which is exactly what the weekend did before links existed, and why
      // every weekend authored without them comes out unchanged.
      const weekend = makeWeekend();
      weekend.sessions = [
        { type: 'qualify' }, { type: 'practice' }, { type: 'qualify' }, { type: 'race' },
      ];

      expect(chainOf(planned(weekend), 3)).toEqual([2, 0]);
    });

    it('gives a race with nothing behind it an empty chain', () => {
      const weekend = makeWeekend();
      weekend.sessions = [{ type: 'practice' }, { type: 'race' }];

      expect(chainOf(planned(weekend), 1)).toEqual([]);
    });

    it('drops a link naming a session the weekend does not have', () => {
      const weekend = makeKnockout();
      weekend.sessions = [{ type: 'qualify', id: 'q1' }, { type: 'race', inherit: { from: 'x' } }];

      expect(chainOf(planned(weekend), 1)).toEqual([]);
    });

    it('stops rather than spinning on a weekend hand-edited into a cycle', () => {
      // Validation refuses one, but a races/*.json file is not validated.
      const weekend = makeKnockout();
      weekend.sessions = [
        { id: 'a', type: 'qualify', inherit: { from: 'b' } },
        { id: 'b', type: 'qualify', inherit: { from: 'a' } },
        { type: 'race', inherit: { from: 'b' } },
      ];

      expect(chainOf(planned(weekend), 2)).toEqual([1, 0]);
    });
  });

  describe('composeOrder', () => {
    it('returns a single full-field classification exactly as it stands', () => {
      expect(composeOrder([1], [record(1, [3, 1, 5, 0, 2, 4])], 6)).toEqual([3, 1, 5, 0, 2, 4]);
    });

    it('lines a knockout up finalists first, each segment behind the next', () => {
      const records = [
        record(0, [3, 1, 5, 0, 2, 4]),
        record(1, [1, 3, 0, 5]),
        record(2, [3, 1]),
      ];

      // Q3's two, then the two Q2 knocked out in Q2's order, then Q1's.
      expect(composeOrder([2, 1, 0], records, 6)).toEqual([3, 1, 0, 5, 2, 4]);
    });

    it('puts anything the chain never classified at the back, in grid order', () => {
      expect(composeOrder([0], [record(0, [4, 2])], 6)).toEqual([4, 2, 0, 1, 3, 5]);
    });

    it('skips a launch that classified nobody', () => {
      expect(composeOrder([1, 0], [record(0, [2, 1, 0]), record(1, null)], 3)).toEqual([2, 1, 0]);
    });

    it('skips a classification that cannot be mapped back onto the field', () => {
      expect(composeOrder([0], [record(0, [0, 0, 9])], 6)).toBeNull();
    });

    it('returns nothing when the chain has run nothing yet', () => {
      expect(composeOrder([2, 1], [], 6)).toBeNull();
      expect(composeOrder([], [record(0, [1, 0])], 6)).toBeNull();
    });
  });

  describe('fieldFor', () => {
    it('narrows a segment to the cars its link lets through', () => {
      const knockout = planned(makeKnockout());
      const state = stateOf([record(0, [3, 1, 5, 0, 2, 4])]);

      expect(fieldFor(knockout, state, 1)).toEqual([3, 1, 5, 0]);
    });

    it('leaves a session with no link to the whole field', () => {
      expect(fieldFor(planned(makeKnockout()), stateOf([]), 0)).toBeNull();
    });

    it('leaves a race to the whole field, since a chain orders without eliminating', () => {
      // The race links to Q3 but sets no top: it lines up on that chain and
      // everyone starts, which is why nothing here has to ask what type it is.
      const state = stateOf([
        record(0, [3, 1, 5, 0, 2, 4]), record(1, [1, 3, 0, 5]), record(2, [3, 1]),
      ]);

      expect(fieldFor(planned(makeKnockout()), state, 3)).toBeNull();
    });

    it('leaves the field alone until the segment it follows has run', () => {
      expect(fieldFor(planned(makeKnockout()), stateOf([]), 1)).toBeNull();
    });

    it('takes what there is when the link lets more through than ran', () => {
      // A format written for twenty cars run on six eliminates nobody rather
      // than failing to plan.
      const weekend = makeKnockout();
      weekend.sessions = [
        { id: 'q1', type: 'qualify' },
        { type: 'qualify', inherit: { from: 'q1', top: 20 } },
      ];

      expect(fieldFor(planned(weekend), stateOf([record(0, [2, 0, 1])]), 1)).toEqual([2, 0, 1]);
    });

    it('lets at least one car through whatever the link says', () => {
      const weekend = makeKnockout();
      weekend.sessions = [
        { id: 'q1', type: 'qualify' },
        { type: 'qualify', inherit: { from: 'q1', top: 0 } },
      ];

      expect(fieldFor(planned(weekend), stateOf([record(0, [2, 0, 1])]), 1)).toEqual([2]);
    });
  });

  describe('playerFirst', () => {
    it('moves the player to CAR_0 and leaves the rest in order', () => {
      expect(playerFirst([3, 1, 0, 5])).toEqual([0, 3, 1, 5]);
    });

    it('leaves a field already led by the player alone', () => {
      expect(playerFirst([0, 2, 4])).toEqual([0, 2, 4]);
    });
  });

  describe('simulateSegment', () => {
    it('classifies exactly the cars that were still in the segment', () => {
      const order = simulateSegment([4, 2, 7, 1, 9], 'race:simulate:2');

      expect([...order].sort((left, right) => left - right)).toEqual([1, 2, 4, 7, 9]);
    });

    it('invents the same order every time, so a reload never reshuffles a grid', () => {
      const previous = [4, 2, 7, 1, 9, 3];

      expect(simulateSegment(previous, 'race:simulate:2'))
        .toEqual(simulateSegment(previous, 'race:simulate:2'));
    });

    it('invents a different one for a different segment', () => {
      const previous = [4, 2, 7, 1, 9, 3, 8, 5];

      expect(simulateSegment(previous, 'race:simulate:1'))
        .not.toEqual(simulateSegment(previous, 'race:simulate:2'));
    });

    it('moves the field rather than handing back the order it was given', () => {
      // The whole point of simulating it: leaving the order alone would say the
      // segment never happened.
      const previous = Array.from({ length: 12 }, (unused, car) => car);

      expect(simulateSegment(previous, 'race:simulate:2')).not.toEqual(previous);
    });

    it('keeps the quick near the front, so nobody climbs from last to pole', () => {
      const previous = Array.from({ length: 12 }, (unused, car) => car);
      const moved = simulateSegment(previous, 'race:simulate:2')
        .map((car, position) => Math.abs(position - car));

      expect(Math.max(...moved)).toBeLessThanOrEqual(3);
    });

    it('copes with a segment nobody is left in', () => {
      expect(simulateSegment([], 'race:simulate:2')).toEqual([]);
    });
  });

  describe('lastQualifying', () => {
    it('finds the qualifying session among the others', () => {
      const raceOut = {
        track: 't',
        number_of_sessions: 3,
        players: [],
        sessions: [makeSession(1, 'P'), makeSession(2, 'Q'), makeSession(3, 'R')],
      };

      expect(lastQualifying(raceOut, 2)?.name).toBe('Q');
    });

    it('takes the last of several qualifying sessions', () => {
      const raceOut = {
        track: 't',
        number_of_sessions: 2,
        players: [],
        sessions: [makeSession(2, 'Q1'), makeSession(2, 'Q2')],
      };

      expect(lastQualifying(raceOut, 2)?.name).toBe('Q2');
    });

    it('returns null when the launch ran no qualifying', () => {
      const raceOut = {
        track: 't', number_of_sessions: 1, players: [], sessions: [makeSession(3, 'R')],
      };

      expect(lastQualifying(raceOut, 2)).toBeNull();
    });
  });

  describe('materialiseRace', () => {
    it('writes the grid out entry by entry rather than as a bulk description', () => {
      const grid = makeGrid(6);
      const race = materialiseRace(makeWeekend(), grid, { type: 'race' });

      expect(race.grid?.size).toBe(6);
      expect(race.grid?.opponents).toHaveLength(5);
      expect(race.grid?.opponents?.[0].driver).toBe('AI 1');
      expect(race.playerCar.driver).toBe('Player');
    });

    it('carries only the session this launch runs', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'practice' });
      expect(race.sessions).toEqual([{ type: 'practice' }]);
    });

    it('strips the session conditions once they are resolved onto the race', () => {
      // Otherwise a materialised launch carries conditions in two places and
      // buildRaceIni could read the wrong one.
      const race = materialiseRace(makeWeekend(), makeGrid(2), {
        type: 'race', conditions: { ambient: 11 },
      });

      expect(race.sessions).toEqual([{ type: 'race' }]);
      expect(race.conditions?.ambient).toBe(11);
    });

    it('leaves the weekend conditions alone when the session overrides nothing', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'practice' });
      expect(race.conditions?.startGrip).toBeUndefined();
      expect(race.conditions?.trackState).toBe('green');
    });

    it('applies the starting grip it is handed', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'race' }, 97);
      expect(race.conditions?.startGrip).toBe(97);
    });

    it('lets the session keep its own starting grip over the carried one', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), {
        type: 'race', conditions: { startGrip: 62 },
      }, 97);

      expect(race.conditions?.startGrip).toBe(62);
    });

    it('does not mutate the weekend it was built from', () => {
      const weekend = makeWeekend();
      materialiseRace(weekend, makeGrid(6), { type: 'race' }, 97);

      expect(weekend.sessions).toHaveLength(4);
      expect(weekend.grid?.opponents).toBeUndefined();
      expect(weekend.conditions?.startGrip).toBeUndefined();
    });
  });
});
