import { describe, expect, it } from '@jest/globals';

import { simulateRound } from '../round-simulation.ts';
import type { SimulationRequest } from '../round-simulation.ts';
import { makeSeries } from './fixtures.ts';
import type { LaunchRecord, RacePlace, SeriesSession } from '../../../shared/types/index.ts';

const AT = '2026-05-01T12:00:00.000Z';

/**
 * A request to simulate the fixture's one round, outside any career.
 * @param overrides What to change about it
 * @returns The request
 */
const request = (overrides: Partial<SimulationRequest> = {}): SimulationRequest => ({
  series: makeSeries(),
  round: 'monza',
  salt: 'career:1',
  recordedAt: AT,
  ...overrides,
});

/**
 * Every place of a simulated round's races, keyed by seat.
 * @param places The places
 * @returns Each seat's class position
 */
const bySeat = (places: readonly RacePlace[]): Record<string, number> => Object.fromEntries(
  places.map((place) => [place.seat, place.classPosition]),
);

/**
 * The fixture championship racing the given sessions instead of its own.
 * @param sessions The event's sessions
 * @returns The request
 */
const racing = (sessions: SeriesSession[]): SimulationRequest => request({
  series: makeSeries({ eventFormats: [{ id: 'standard', name: 'Event', sessions }] }),
});

/**
 * The player qualifying on pole of the GT4 class in a launch they drove, the
 * player's seat being car 0.
 */
const DRIVEN_QUALIFYING: LaunchRecord = {
  index: 0,
  completedAt: AT,
  archive: 'qualifying.json',
  gridOrder: [0, 1, 2, 3, 4, 5, 6, 7],
  classification: [0, 1, 2, 3, 4, 5, 6, 7],
};

describe('core/round-simulation', () => {
  describe('simulateRound', () => {
    it('records every launch of the event as simulated, with a full classification', () => {
      const { sessions } = simulateRound(request());

      expect(sessions).toHaveLength(2);
      sessions.forEach((session, index) => {
        expect(session).toMatchObject({
          index, completedAt: AT, archive: '', skipped: true,
        });
        expect([...session.classification ?? []].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      });
    });

    it('comes out the same every time it is asked', () => {
      expect(simulateRound(request())).toEqual(simulateRound(request()));
    });

    it('races a season of its own for each career and season', () => {
      const orders = ['career:1', 'career:2', 'career:3', 'other:1']
        .map((salt) => JSON.stringify(simulateRound(request({ salt })).sessions[1].classification));

      expect(new Set(orders).size).toBeGreaterThan(1);
    });

    it('keeps the classes in their entry-list order overall', () => {
      const race = simulateRound(request()).sessions[1];

      expect([...race.classification ?? []].slice(0, 4).sort()).toEqual([0, 1, 2, 3]);
    });

    it('scores every race on class positions, marked simulated', () => {
      const { score } = simulateRound(request());
      const [race] = score.races;

      expect(score).toMatchObject({ round: 'monza', recordedAt: AT });
      expect(race.simulated).toBe(true);
      expect(race.places).toHaveLength(8);
      ['gt3', 'gt4'].forEach((entry) => {
        const own = race.places.filter((place) => place.entry === entry);

        expect(own.map((place) => place.classPosition).sort()).toEqual([1, 2, 3, 4]);
        expect(own.filter((place) => place.fastestLap)).toHaveLength(1);
      });
    });

    // Seeded per seat, so a round stored on entering is the one shown the day
    // before, when nobody's seat led the grid.
    it('comes out the same whether the player\'s seat leads the grid or not', () => {
      const without = simulateRound(request()).score.races[0].places;
      const withPlayer = simulateRound(request({ player: { entry: 'gt4' } })).score.races[0].places;

      expect(bySeat(withPlayer)).toEqual(bySeat(without));
    });

    it('marks the player\'s seat as raced by the driver it names', () => {
      const { places } = simulateRound(request({ player: { entry: 'gt4' } })).score.races[0];

      expect(places.filter((place) => place.substitute).map((place) => place.seat)).toEqual(['gt4-4']);
    });

    it('carries on from what was driven, keeping it as it was', () => {
      const { sessions } = simulateRound(request({
        player: { entry: 'gt4' }, completed: [DRIVEN_QUALIFYING],
      }));

      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toBe(DRIVEN_QUALIFYING);
      expect(sessions[1].skipped).toBe(true);
    });

    // The stand-in set no time, so they cannot start from the player's pole.
    it('starts a stand-in put in after the player qualified from the back', () => {
      const { sessions } = simulateRound(request({
        player: { entry: 'gt4' }, completed: [DRIVEN_QUALIFYING],
      }));

      expect(sessions[1].gridOrder.at(-1)).toBe(0);
    });

    it('leaves the qualifying points the player earned with the player, as a place of no race', () => {
      const { places } = simulateRound(request({
        player: { entry: 'gt4' }, completed: [DRIVEN_QUALIFYING],
      })).score.races[0];
      const seat = places.filter((place) => place.seat === 'gt4-4');

      expect(seat).toHaveLength(2);
      expect(seat[0]).toMatchObject({
        substitute: true, qualifyingPosition: null, qualifyingPoints: 0,
      });
      expect(seat[0].points).toBe(seat[0].finishPoints + seat[0].fastestLapPoints);
      expect(seat[1]).toMatchObject({
        bonusOnly: true, qualifyingPoints: 3, points: 3, classPosition: 0, finishPoints: 0,
      });
      expect(seat[1].substitute).toBeUndefined();
    });

    it('gives the stand-in its own qualifying when the player drove none of the event', () => {
      const { places } = simulateRound(request({ player: { entry: 'gt4' } })).score.races[0];
      const seat = places.filter((place) => place.seat === 'gt4-4');

      expect(seat).toHaveLength(1);
      expect(seat[0].qualifyingPosition).not.toBeNull();
    });

    it('narrows a knockout segment to the cars its link carries over', () => {
      const { sessions } = simulateRound(racing([
        { id: 'q1', type: 'qualify', minutes: 10 },
        {
          id: 'q2', type: 'qualify', minutes: 10, inherit: { from: 'q1', top: 4 },
        },
        { type: 'race', laps: 10 },
      ]));

      expect(sessions[1].gridOrder).toHaveLength(4);
      expect(sessions[1].gridOrder).toEqual(expect.arrayContaining(sessions[0].classification?.slice(0, 4) ?? []));
    });

    it('turns the front of the race it follows round for a reverse grid', () => {
      const { sessions } = simulateRound(racing([
        { id: 'feature', type: 'race', laps: 10 },
        {
          id: 'sprint', type: 'race', laps: 5, inherit: { from: 'feature', reverse: 4 },
        },
      ]));
      const feature = sessions[0].classification ?? [];

      expect(sessions[1].gridOrder.slice(0, 4)).toEqual(feature.slice(0, 4).reverse());
      expect(sessions[1].gridOrder.slice(4)).toEqual(feature.slice(4));
    });

    it('refuses a round whose event format the championship does not have', () => {
      const series = makeSeries({ defaultEventFormat: 'missing' });

      expect(() => simulateRound(request({ series }))).toThrow(expect.objectContaining({
        code: 'series.format.unknown',
      }));
    });
  });
});
