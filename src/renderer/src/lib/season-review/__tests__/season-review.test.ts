import { describe, expect, it } from '@jest/globals';

import { SeasonLength } from '../../../../../shared/types';
import type {
  CareerSeason, RacePlace, SeasonEntry, SeasonEvent,
} from '../../../../../shared/types';
import {
  makeResults, makeSeries, place, race, roundScore,
} from '../../season-results/__tests__/fixtures.ts';
import {
  championshipReview, editionOver, editionSummary, nextRun, yearReview,
} from '../season-review.ts';

/**
 * The player's edition of the test championship, its rounds as the results
 * fixture reports them: round one won by the player in Ada's seat, round two
 * both won by Cy - so Cy is champion, Bo second and the player third.
 * @param overrides What to change about it
 * @returns The entry
 */
const entry = (overrides: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'test-cup',
  edition: 0,
  championship: makeSeries(),
  entry: 'main',
  playerSeat: 'main-1',
  car: { model: 'test_car' },
  field: [],
  events: makeResults().rounds.map((one): SeasonEvent => ({
    round: one.round,
    raceId: `test-cup/${one.round}@0.0`,
    date: one.date,
    status: one.status,
    sessions: [],
    ...(one.score ? { score: one.score } : {}),
  })),
  standings: { classes: [], updatedAt: '' },
  ...overrides,
});

/**
 * One round of the test championship, scored by the races given.
 * @param round The round, by its id
 * @param date The ISO date it ran
 * @param places Each race's places, in finishing order
 * @returns The event
 */
const scored = (round: string, date: string, ...places: (readonly RacePlace[])[]): SeasonEvent => ({
  round,
  raceId: `test-cup/${round}@0.0`,
  date,
  status: 'raced',
  sessions: [],
  score: roundScore(round, places.map((one, launch) => race(launch, one))),
});

/**
 * A season holding the entries given.
 * @param entries Its entries
 * @returns The season
 */
const season = (...entries: SeasonEntry[]): CareerSeason => ({
  index: 0, startDate: '2026-01-01', endDate: '2026-12-31', entries,
});

describe('renderer/lib/season-review/season-review', () => {
  describe('editionOver', () => {
    it('is over once every round has run and the last is behind the clock', () => {
      expect(editionOver(entry(), '2026-05-17')).toBe(true);
    });

    it('is not over while a round is still to run', () => {
      const running = entry({ events: [...entry().events.slice(0, 1), { ...entry().events[1], status: 'scheduled' }] });

      expect(editionOver(running, '2026-06-01')).toBe(false);
    });

    // A round given up by withdrawing is missed at once, and simulated only on
    // its own day - so the edition is over only once that day has come.
    it('is not over before the day of a round given up', () => {
      const left = entry({ events: [entry().events[0], { ...entry().events[1], status: 'missed' }] });

      expect(editionOver(left, '2026-05-10')).toBe(false);
      expect(editionOver(left, '2026-05-17')).toBe(true);
    });
  });

  describe('nextRun', () => {
    it('runs a year-long championship again in the next season', () => {
      expect(nextRun(entry(), 3)).toEqual({ season: 4, edition: 0 });
    });

    it('runs the next edition of a shorter championship in the same season', () => {
      const quarterly = entry({ edition: 1, championship: makeSeries({ seasonLength: SeasonLength.QUARTER }) });

      expect(nextRun(quarterly, 3)).toEqual({ season: 3, edition: 2 });
    });

    it('runs the first edition of the next season after the last of this one', () => {
      const quarterly = entry({ edition: 3, championship: makeSeries({ seasonLength: SeasonLength.QUARTER }) });

      expect(nextRun(quarterly, 3)).toEqual({ season: 4, edition: 0 });
    });
  });

  describe('championshipReview', () => {
    it('reads the player, the champions and the field off the final tables', () => {
      const review = championshipReview(entry(), 2);

      expect(review.results).toMatchObject({ season: 2, edition: 0 });
      expect(review.me).toMatchObject({ seat: 'main-1', position: 3, points: 22 });
      expect(review.field).toBe(3);
      expect(review.champions).toEqual([expect.objectContaining({
        entry: 'main',
        driver: expect.objectContaining({ seat: 'main-3', points: 26 }),
        team: expect.objectContaining({ team: 'alpha', points: 46 }),
      })]);
    });

    it('sums what the player made of the edition', () => {
      const withPole = entry({
        events: [
          scored('r1', '2026-05-03', [
            place('main-1', 1, { qualifyingPosition: 1, fastestLap: true }), place('main-2', 2), place('main-3', 3),
          ]),
          entry().events[1],
        ],
      });

      expect(championshipReview(withPole, 0).figures).toEqual({
        points: 22,
        gap: 4,
        lead: 0,
        wins: 1,
        podiums: 3,
        poles: 1,
        fastestLaps: 1,
        best: 1,
        average: 7 / 3,
        starts: 3,
        races: 3,
        nonStarts: 0,
      });
    });

    it('says how far a champion finished clear of second', () => {
      const won = entry({
        events: [
          scored('r1', '2026-05-03', [place('main-1', 1), place('main-2', 2), place('main-3', 3)]),
          scored('r2', '2026-05-17', [place('main-1', 1), place('main-3', 2), place('main-2', 3)]),
        ],
      });

      expect(championshipReview(won, 0).figures).toMatchObject({ gap: 0, lead: 6 });
    });

    it('tracks where the player stood after each round and what each paid', () => {
      expect(championshipReview(entry(), 0).path.map((one) => [one.round, one.position, one.points]))
        .toEqual([['r1', 1, 10], ['r2', 3, 12]]);
    });

    it('leaves a round not yet scored without a position', () => {
      const running = entry({ events: [entry().events[0], { ...entry().events[1], status: 'scheduled', score: undefined }] });

      expect(championshipReview(running, 0).path.map((one) => one.position)).toEqual([1, null]);
    });

    // The player's seat raced by the driver it names is not the player's race.
    it('never counts a stand-in\'s race as one the player drove', () => {
      const stoodIn = entry({
        events: [
          entry().events[0],
          {
            ...entry().events[1],
            status: 'missed',
            score: roundScore('r2', [race(0, [
              place('main-1', 1, { substitute: true }), place('main-2', 2), place('main-3', 3),
            ])]),
          },
        ],
      });
      const review = championshipReview(stoodIn, 0);

      expect(review.figures).toMatchObject({ starts: 1, wins: 1, nonStarts: 1 });
      expect(review.path[1].places).toEqual([]);
    });

    // Guards a bug: the stand-in's row ranks among the rest, so leaving it out
    // of the field put a player last in it below the bottom of the chart.
    it('counts a stand-in\'s row in the field a position is out of', () => {
      const stoodIn = entry({
        events: [{
          ...entry().events[0],
          score: roundScore('r1', [race(0, [
            place('main-2', 1), place('main-1', 2, { substitute: true }), place('main-3', 3),
          ])]),
        }],
      });

      expect(championshipReview(stoodIn, 0).field).toBe(4);
    });

    it('records the player against the other seat of their team', () => {
      expect(championshipReview(entry(), 0).teammate).toEqual({
        row: expect.objectContaining({ seat: 'main-2' }),
        qualifying: { ahead: 0, behind: 0 },
        finish: { ahead: 1, behind: 2 },
      });
    });

    it('records no teammate for a seat that has none', () => {
      expect(championshipReview(entry({ playerSeat: 'main-3' }), 0).teammate).toBeNull();
    });
  });

  describe('editionSummary', () => {
    it('reads an edition as a list row', () => {
      expect(editionSummary(entry(), 1, '2026-06-01')).toEqual({
        series: 'test-cup',
        name: 'Test Cup',
        season: 1,
        edition: 0,
        editions: 1,
        entry: 'main',
        ladder: makeSeries().entries[0].ladder,
        position: 3,
        field: 3,
        points: 22,
        wins: 1,
        champion: 'Cy',
        title: false,
        run: 2,
        missed: 0,
        rounds: 2,
        over: true,
        withdrawn: false,
        path: [1, 3],
      });
    });

    it('says when the player won it', () => {
      const won = entry({
        events: [scored('r1', '2026-05-03', [place('main-1', 1), place('main-2', 2), place('main-3', 3)])],
      });

      expect(editionSummary(won, 0, '2026-06-01')).toMatchObject({ title: true, champion: 'Ada' });
    });

    it('gives no place and no champion before anything is scored', () => {
      const fresh = entry({ events: entry().events.map((one) => ({ ...one, status: 'scheduled', score: undefined })) });

      expect(editionSummary(fresh, 0, '2026-01-01')).toMatchObject({
        position: null, champion: null, title: false, over: false, path: [],
      });
    });
  });

  describe('yearReview', () => {
    const won = entry({
      series: 'won-cup',
      championship: makeSeries({ id: 'won-cup' }),
      events: [scored('r1', '2026-02-01', [
        place('main-1', 1, { qualifyingPosition: 1 }), place('main-2', 2), place('main-3', 3),
      ])],
    });

    it('lists the season\'s editions in the order they opened', () => {
      expect(yearReview(season(entry(), won), '2026-12-31').editions.map((one) => one.series))
        .toEqual(['won-cup', 'test-cup']);
    });

    it('adds the season up across every edition', () => {
      expect(yearReview(season(entry(), won), '2026-12-31').totals).toEqual({
        championships: 2,
        finished: 2,
        titles: 1,
        starts: 4,
        nonStarts: 0,
        wins: 2,
        podiums: 4,
        poles: 1,
        fastestLaps: 0,
      });
    });

    it('counts an edition still running as no title, and lists it as running', () => {
      const review = yearReview(season(entry(), won), '2026-04-01');

      expect(review.running.map((one) => one.series)).toEqual(['test-cup']);
      expect(review.totals).toMatchObject({ finished: 1, titles: 1 });
    });
  });
});
