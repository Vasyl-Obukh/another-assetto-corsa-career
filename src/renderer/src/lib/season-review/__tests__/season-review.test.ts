import { describe, expect, it } from '@jest/globals';

import { Discipline, SeasonLength } from '../../../../../shared/types';
import type {
  CareerSeason, HistoricDraw, RacePlace, SeasonEntry, SeasonEvent,
} from '../../../../../shared/types';
import {
  makeResults, makeSeries, place, race, roundScore,
} from '../../season-results/__tests__/fixtures.ts';
import {
  championshipReview, editionSummary, historicReview, nextRun, prizeFor, yearReview,
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

/**
 * A historic event the season drew: the test championship's one round, paying
 * a purse per race, the player in Ada's seat.
 * @param id Its id
 * @param event Its one event
 * @param overrides What else to change about it
 * @returns The entry
 */
const historic = (id: string, event: SeasonEvent, overrides: Partial<SeasonEntry> = {}): SeasonEntry => entry({
  series: id,
  championship: makeSeries({ id, name: id, prizes: { positions: [1000, 500, 250] } }),
  events: [event],
  historic: true,
  ...overrides,
});

/**
 * An event of a historic event nobody has scored.
 * @param date The ISO date it runs
 * @param status Where it stands
 * @returns The event
 */
const unscored = (date: string, status: SeasonEvent['status']): SeasonEvent => ({
  round: 'r1', raceId: `h/r1@0.0`, date, status, sessions: [],
});

/**
 * A historic event as the season drew it: the test championship under another
 * id, its invitations going out on its own day.
 * @param id Its id
 * @param date The ISO date it runs
 * @returns The draw
 */
const drawOf = (id: string, date: string): HistoricDraw => ({
  series: id,
  championship: makeSeries({ id, name: id }),
  round: 'r1',
  raceId: `${id}/r1@0.0`,
  date,
  invitations: date,
});

/**
 * A season holding the entries given, having drawn the historic events given.
 * @param draws What it drew
 * @param entries Its entries
 * @returns The season
 */
const drew = (draws: HistoricDraw[], ...entries: SeasonEntry[]): CareerSeason => ({
  ...season(...entries), historicDrawn: true, historicEvents: draws,
});

describe('renderer/lib/season-review/season-review', () => {
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

    // A historic event is a single event rather than an edition, and the year
    // review gives it a section of its own.
    it('leaves historic events out of the editions and their totals', () => {
      const drawn = historic('british-gp', scored('r1', '2026-02-02', [place('main-1', 1), place('main-2', 2)]));
      const review = yearReview(season(entry(), drawn), '2026-12-31');

      expect(review.editions.map((one) => one.series)).toEqual(['test-cup']);
      expect(review.totals).toMatchObject({ championships: 1, starts: 3, wins: 1 });
    });

    it('counts an edition still running as no title, and lists it as running', () => {
      const review = yearReview(season(entry(), won), '2026-04-01');

      expect(review.running.map((one) => one.series)).toEqual(['test-cup']);
      expect(review.totals).toMatchObject({ finished: 1, titles: 1 });
    });
  });

  describe('prizeFor', () => {
    const series = makeSeries({
      prizes: { positions: [100, 50] },
      entries: [
        { ...makeSeries().entries[0], prizes: { positions: [500, 300, 0] } },
        { ...makeSeries().entries[0], id: 'am', name: 'Am' },
      ],
    });

    it("pays a place out of its own class's purse where the class has one", () => {
      expect(prizeFor(series, 'main', 1)).toBe(500);
      expect(prizeFor(series, 'main', 2)).toBe(300);
    });

    it("pays a class with no purse of its own out of the event's", () => {
      expect(prizeFor(series, 'am', 1)).toBe(100);
      expect(prizeFor(series, 'nobody', 2)).toBe(50);
    });

    it('pays nothing for a place past the purse or one it pays nothing', () => {
      expect(prizeFor(series, 'main', 3)).toBeNull();
      expect(prizeFor(series, 'main', 9)).toBeNull();
      expect(prizeFor(makeSeries(), 'main', 1)).toBeNull();
    });

    it('pays at the progression speed it is handed', () => {
      expect(prizeFor(series, 'main', 1, 1.5)).toBe(750);
    });

    // Fixed: a class stating only its final-standings table read as paying
    // nothing per race, though the event's race purse covers it.
    it("pays a class out of the event's race purse where it states only a final-standings table", () => {
      const standingsOnly = makeSeries({
        prizes: { positions: [100] },
        entries: [{ ...makeSeries().entries[0], prizes: { standings: [5000] } }],
      });

      expect(prizeFor(standingsOnly, 'main', 1)).toBe(100);
    });
  });

  describe('historicReview', () => {
    const won = historic('won', scored('r1', '2026-06-03', [place('main-1', 1, { qualifyingPosition: 2 }), place('main-2', 2)]));
    const third = historic('third', scored('r1', '2026-03-04', [place('main-2', 1), place('main-3', 2), place('main-1', 3)]));
    const missed = historic('missed', unscored('2026-05-06', 'missed'));
    const ahead = historic('ahead', unscored('2026-09-09', 'scheduled'));

    it("lists the season's historic events earliest first, and nothing else of it", () => {
      expect(historicReview(season(entry(), ahead, won, third, missed)).rows.map((row) => row.series))
        .toEqual(['third', 'missed', 'won', 'ahead']);
    });

    it('says what became of each one', () => {
      const outcomes = historicReview(season(won, missed, ahead)).rows
        .map((row) => [row.series, row.outcome]);

      expect(outcomes).toEqual([
        ['missed', 'missed'], ['won', 'raced'], ['ahead', 'scheduled'],
      ]);
    });

    // Fixed: Home offered Decline on an event part-way through, which threw the
    // driven sessions away; it now asks whether one has started.
    it('says whether a session of one still to finish has run', () => {
      const launched = { ...unscored('2026-10-07', 'scheduled'), sessions: [{} as SeasonEvent['sessions'][number]] };
      const { rows } = historicReview(season(ahead, historic('begun', launched)));

      expect(rows.map((row) => [row.series, row.started])).toEqual([['ahead', false], ['begun', true]]);
    });

    it("reads the player's seat, start, finish and prize off a raced one", () => {
      expect(historicReview(season(won)).rows[0]).toMatchObject({
        name: 'won',
        date: '2026-06-03',
        track: { id: 'magione' },
        car: 'test_car',
        team: 'Alpha Racing',
        qualified: 2,
        finished: 1,
        multiClass: false,
        prize: 1000,
      });
    });

    it('pays its prize at the progression speed it is handed', () => {
      expect(historicReview(season(won), 2).rows[0].prize).toBe(2000);
    });

    it('pays every race of an event and finishes it where its last race did', () => {
      const double = historic('double', {
        ...scored('r2', '2026-07-01', [place('main-1', 2), place('main-2', 1)], [place('main-1', 1), place('main-2', 2)]),
      });

      expect(historicReview(season(double)).rows[0]).toMatchObject({ finished: 1, prize: 1500 });
    });

    // A stand-in raced the seat of an event the player missed; that result is
    // the stand-in's and pays the player nothing.
    it("gives the player nothing for a stand-in's drive", () => {
      const covered = historic('covered', {
        ...scored('r1', '2026-05-06', [place('main-1', 1, { substitute: true }), place('main-2', 2)]),
        status: 'missed',
      });

      expect(historicReview(season(covered)).rows[0]).toMatchObject({ outcome: 'missed', finished: null, prize: null });
    });

    it('adds up the starts, wins, podiums, prize money and events not raced', () => {
      const review = historicReview(season(won, third, missed, ahead));

      expect(review).toMatchObject({
        raced: 2, wins: 1, podiums: 2, prize: 1250, notRaced: 1,
      });
    });

    it('reads one the player was invited to as invited, and one they pay for as not', () => {
      const bought = historic('bought', unscored('2026-09-09', 'scheduled'), { car: { model: 'test_car', source: 'owned' } });
      const { rows } = historicReview(season(ahead, bought));

      expect(rows.map((row) => [row.series, row.invited])).toEqual([['ahead', true], ['bought', false]]);
    });

    it('lists the events it drew that the player is not in beside the rest, earliest first, each once', () => {
      const draws = [drawOf('won', '2026-06-03'), drawOf('later', '2026-11-04'), drawOf('earlier', '2026-02-04')];

      expect(historicReview(drew(draws, won)).rows.map((row) => row.series)).toEqual(['earlier', 'won', 'later']);
    });

    it('reads one the player is not in as open from the clock on, and as raced without them before it', () => {
      const draws = [drawOf('past', '2026-03-04'), drawOf('today', '2026-07-01'), drawOf('future', '2026-08-05')];

      expect(historicReview(drew(draws), 1, '2026-07-01').rows.map((row) => [row.series, row.outcome])).toEqual([
        ['past', 'notEntered'], ['today', 'open'], ['future', 'open'],
      ]);
    });

    it('reads every one the player is not in as raced without them when handed no clock', () => {
      expect(historicReview(drew([drawOf('future', '2026-08-05')])).rows[0].outcome).toBe('notEntered');
    });

    it('reads one the player is not in off the draw, with no car, seat or result of theirs', () => {
      expect(historicReview(drew([drawOf('drawn', '2026-08-05')]), 1, '2026-07-01').rows[0]).toEqual({
        series: 'drawn',
        round: 'r1',
        name: 'drawn',
        date: '2026-08-05',
        track: { id: 'magione' },
        ladder: { discipline: Discipline.ROAD, tier: 6 },
        car: null,
        invited: false,
        team: null,
        outcome: 'open',
        started: false,
        qualified: null,
        finished: null,
        multiClass: false,
        prize: null,
      });
    });

    it('counts none the player is not in as raced or as not raced', () => {
      const draws = [drawOf('past', '2026-03-04'), drawOf('future', '2026-08-05')];

      expect(historicReview(drew(draws, won, missed), 1, '2026-07-01')).toMatchObject({
        raced: 1, wins: 1, podiums: 1, prize: 1000, notRaced: 1,
      });
    });

    it('reads a season without historic events as nothing to review', () => {
      expect(historicReview(season(entry()))).toEqual({
        rows: [], raced: 0, wins: 0, podiums: 0, prize: 0, notRaced: 0,
      });
    });
  });
});
