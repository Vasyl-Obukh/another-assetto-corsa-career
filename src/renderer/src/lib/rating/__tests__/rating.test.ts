import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../../shared/types';
import type { RatingLine } from '../../../../../shared/types';
import {
  hasRaced, ratingPoints, ratingSeasons, ratingSeriesTotals, ratingShownBy, ratingSnapshots, roundRatingLines,
  seasonOpening,
} from '../rating.ts';
import type { RatingSnapshot } from '../types.ts';

/**
 * Builds a rating line.
 * @param kind What kind of line it is
 * @param over Whatever the test wants said differently
 * @returns The line
 */
const line = (kind: RatingLine['kind'], over: Partial<RatingLine> = {}): RatingLine => ({
  key: `${kind}:${over.season ?? 0}:${over.series ?? ''}:${over.round ?? ''}`,
  kind,
  date: '2027-03-07',
  season: 0,
  change: 0,
  globalChange: 0,
  global: 0,
  ...over,
});

/**
 * Every rating at one moment, the disciplines not named on 2,000.
 * @param global The global rating
 * @param disciplines The disciplines that moved off 2,000
 * @returns The snapshot
 */
const snapshot = (global: number, disciplines: Partial<Record<Discipline, number>> = {}): RatingSnapshot => ({
  disciplines: {
    [Discipline.SINGLE_SEATER]: 2000,
    [Discipline.SPORTSCAR]: 2000,
    [Discipline.TOURING]: 2000,
    [Discipline.ROAD]: 2000,
    ...disciplines,
  },
  global,
});

/**
 * Two seasons of a career opened on the fourth rung: a round of a sportscar
 * championship qualified and raced and a historic event in the first, which
 * closes on a drop; a change of speed, a lift and a touring race in the second.
 */
const LOG: readonly RatingLine[] = [
  line('opening', { key: 'opening', tier: 4, global: 2000 }),
  line('qualifying', {
    key: 'session:cup/r1@0.0:0',
    discipline: Discipline.SPORTSCAR,
    series: 'cup',
    seriesName: 'Cup',
    edition: 0,
    round: 'r1',
    change: 10,
    globalChange: 8,
    rating: 2010,
    global: 2008,
  }),
  line('race', {
    key: 'session:cup/r1@0.0:1',
    discipline: Discipline.SPORTSCAR,
    series: 'cup',
    seriesName: 'Cup',
    edition: 0,
    round: 'r1',
    change: 60,
    globalChange: 50,
    rating: 2070,
    global: 2058,
  }),
  line('race', {
    key: 'session:spa-1966/spa@0.0:0',
    discipline: Discipline.TOURING,
    series: 'spa-1966',
    seriesName: 'Spa 1966',
    historic: true,
    round: 'spa',
    change: -30,
    globalChange: -25,
    rating: 1970,
    global: 2033,
  }),
  line('drop', {
    key: 'drop:0:touring', discipline: Discipline.TOURING, tier: 5, rating: 1970, global: 2033,
  }),
  line('speed', { season: 1, speed: { from: 1, to: 2 }, global: 2033 }),
  line('lift', {
    season: 1, discipline: Discipline.ROAD, tier: 3, rating: 3500, series: 'gt', seriesName: 'GT Cup', global: 2033,
  }),
  line('race', {
    key: 'session:btcc/r3@1.1:2',
    season: 1,
    discipline: Discipline.TOURING,
    series: 'btcc',
    seriesName: 'BTCC',
    edition: 1,
    round: 'r3',
    change: 40,
    globalChange: 40,
    rating: 2010,
    global: 2073,
  }),
];

/**
 * The ratings after each line of the log, in its order.
 */
const SNAPSHOTS: readonly RatingSnapshot[] = [
  snapshot(2000),
  snapshot(2008, { [Discipline.SPORTSCAR]: 2010 }),
  snapshot(2058, { [Discipline.SPORTSCAR]: 2070 }),
  snapshot(2033, { [Discipline.SPORTSCAR]: 2070, [Discipline.TOURING]: 1970 }),
  snapshot(2033, { [Discipline.SPORTSCAR]: 2070, [Discipline.TOURING]: 1970 }),
  snapshot(2033, { [Discipline.SPORTSCAR]: 2070, [Discipline.TOURING]: 1970 }),
  snapshot(2033, { [Discipline.SPORTSCAR]: 2070, [Discipline.TOURING]: 1970, [Discipline.ROAD]: 3500 }),
  snapshot(2073, { [Discipline.SPORTSCAR]: 2070, [Discipline.TOURING]: 2010, [Discipline.ROAD]: 3500 }),
];

/**
 * The career the log ends on, holding the ratings its last line left.
 */
const CAREER = {
  ratingLog: LOG,
  rating: SNAPSHOTS[SNAPSHOTS.length - 1].disciplines,
  globalRating: 2073,
};

describe('renderer/lib/rating/rating', () => {
  describe('ratingShownBy', () => {
    it('shows every line to no filter', () => {
      expect(LOG.filter((one) => ratingShownBy(one, 'all'))).toHaveLength(LOG.length);
    });

    it('shows the races and qualifyings to sessions, and nothing else', () => {
      expect(LOG.filter((one) => ratingShownBy(one, 'sessions')).map((one) => one.kind))
        .toEqual(['qualifying', 'race', 'race', 'race']);
    });

    it('shows the opening and every level gained, lost or lifted to levels', () => {
      const promotion = line('promotion', { tier: 3 });

      expect([...LOG, promotion].filter((one) => ratingShownBy(one, 'levels')).map((one) => one.kind))
        .toEqual(['opening', 'drop', 'lift', 'promotion']);
    });

    it('shows a change of speed to neither sessions nor levels', () => {
      const speed = line('speed', { speed: { from: 1, to: 2 } });

      expect(ratingShownBy(speed, 'sessions')).toBe(false);
      expect(ratingShownBy(speed, 'levels')).toBe(false);
    });
  });

  describe('ratingSeasons', () => {
    it('lists every season a line falls in, newest first, once each', () => {
      expect(ratingSeasons(LOG)).toEqual([1, 0]);
    });

    it('lists none for an empty log', () => {
      expect(ratingSeasons([])).toEqual([]);
    });
  });

  describe('ratingSnapshots', () => {
    it('carries every rating along, moving only the discipline each line names', () => {
      expect(ratingSnapshots(LOG)).toEqual(SNAPSHOTS);
    });

    it('starts every discipline on the global rating the opening put it on', () => {
      const opened = ratingSnapshots([line('opening', { tier: 2, global: 5500 })]);

      expect(opened).toEqual([{
        disciplines: {
          [Discipline.SINGLE_SEATER]: 5500,
          [Discipline.SPORTSCAR]: 5500,
          [Discipline.TOURING]: 5500,
          [Discipline.ROAD]: 5500,
        },
        global: 5500,
      }]);
    });

    it('hands each snapshot its own copy, so a later line never rewrites an earlier one', () => {
      const [first, second] = ratingSnapshots(LOG);

      expect(first.disciplines).not.toBe(second.disciplines);
      expect(first.disciplines[Discipline.SPORTSCAR]).toBe(2000);
    });
  });

  describe('ratingPoints', () => {
    it('plots the opening and every session, each with the ratings once it landed', () => {
      expect(ratingPoints(LOG)).toEqual([0, 1, 2, 3, 7].map((at) => ({ line: LOG[at], ratings: SNAPSHOTS[at] })));
    });

    it('plots nothing for an empty log', () => {
      expect(ratingPoints([])).toEqual([]);
    });
  });

  describe('seasonOpening', () => {
    it('opens the first season where the opening line put the career', () => {
      expect(seasonOpening(CAREER, 0)).toEqual(SNAPSHOTS[0]);
    });

    it('opens a later season on what the one before it closed on, its drops included', () => {
      expect(seasonOpening(CAREER, 1)).toEqual(SNAPSHOTS[4]);
    });

    it('opens a season with no lines yet on what the seasons before it left', () => {
      expect(seasonOpening(CAREER, 2)).toEqual(SNAPSHOTS[7]);
    });

    it('falls back to the ratings the career holds where the log says nothing of how it opened', () => {
      const career = { ...CAREER, ratingLog: [LOG[1]] };

      expect(seasonOpening(career, 0)).toEqual({ disciplines: CAREER.rating, global: 2073 });
      expect(seasonOpening({ ...CAREER, ratingLog: [] }, 0)).toEqual({ disciplines: CAREER.rating, global: 2073 });
    });
  });

  describe('hasRaced', () => {
    it('reads a discipline a session moved as raced, a historic event included', () => {
      expect(hasRaced(LOG, Discipline.SPORTSCAR)).toBe(true);
      expect(hasRaced(LOG, Discipline.TOURING)).toBe(true);
    });

    it('reads a discipline only a lift moved as not raced yet', () => {
      expect(hasRaced(LOG, Discipline.ROAD)).toBe(false);
    });

    it('reads a discipline nothing moved as not raced', () => {
      expect(hasRaced(LOG, Discipline.SINGLE_SEATER)).toBe(false);
    });
  });

  describe('ratingSeriesTotals', () => {
    it('totals each run of a championship and each historic event, most first', () => {
      expect(ratingSeriesTotals(LOG)).toEqual([
        {
          series: 'cup',
          name: 'Cup',
          season: 0,
          edition: 0,
          discipline: Discipline.SPORTSCAR,
          historic: false,
          sessions: 2,
          change: 70,
        },
        {
          series: 'btcc',
          name: 'BTCC',
          season: 1,
          edition: 1,
          discipline: Discipline.TOURING,
          historic: false,
          sessions: 1,
          change: 40,
        },
        {
          series: 'spa-1966',
          name: 'Spa 1966',
          season: 0,
          edition: 0,
          discipline: Discipline.TOURING,
          historic: true,
          sessions: 1,
          change: -30,
        },
      ]);
    });

    it('totals one championship apart in each season and each edition it ran', () => {
      const lines = [
        line('race', {
          series: 'cup', discipline: Discipline.ROAD, edition: 0, change: 5,
        }),
        line('race', {
          series: 'cup', discipline: Discipline.ROAD, edition: 1, change: 6,
        }),
        line('race', {
          series: 'cup', discipline: Discipline.ROAD, season: 1, edition: 0, change: 7,
        }),
      ];

      expect(ratingSeriesTotals(lines).map((total) => [total.season, total.edition, total.change]))
        .toEqual([[1, 0, 7], [0, 1, 6], [0, 0, 5]]);
    });

    it('names a championship by its id where its line carries no name', () => {
      const [total] = ratingSeriesTotals([line('race', { series: 'cup', discipline: Discipline.ROAD, change: 5 })]);

      expect(total.name).toBe('cup');
    });

    it('leaves out the lines no session moved, and any naming no championship', () => {
      const lines = [
        line('promotion', { series: 'cup', discipline: Discipline.ROAD, tier: 3 }),
        line('lift', { series: 'cup', discipline: Discipline.ROAD, tier: 3 }),
        line('race', { discipline: Discipline.ROAD, change: 9 }),
      ];

      expect(ratingSeriesTotals(lines)).toEqual([]);
    });
  });

  describe('roundRatingLines', () => {
    const promotion = line('promotion', {
      key: 'promotion:session:cup/r1@0.0:1',
      discipline: Discipline.SPORTSCAR,
      series: 'cup',
      edition: 0,
      round: 'r1',
      tier: 3,
    });
    const elsewhere = [
      line('race', {
        series: 'cup', edition: 1, round: 'r1', discipline: Discipline.SPORTSCAR,
      }),
      line('race', {
        series: 'cup', season: 1, edition: 0, round: 'r1', discipline: Discipline.SPORTSCAR,
      }),
      line('race', {
        series: 'cup', edition: 0, round: 'r2', discipline: Discipline.SPORTSCAR,
      }),
    ];

    it('lists the sessions one round moved and the rungs they opened, oldest first', () => {
      expect(roundRatingLines([...LOG, promotion, ...elsewhere], {
        series: 'cup', season: 0, edition: 0, round: 'r1',
      })).toEqual([LOG[1], LOG[2], promotion]);
    });

    it('leaves out the same round of another edition or season, and the round beside it', () => {
      expect(roundRatingLines(elsewhere, {
        series: 'cup', season: 0, edition: 0, round: 'r1',
      })).toEqual([]);
    });

    it('leaves out a lift, though it names the championship', () => {
      const lift = line('lift', {
        series: 'cup', edition: 0, round: 'r1', discipline: Discipline.SPORTSCAR, tier: 3,
      });

      expect(roundRatingLines([lift], {
        series: 'cup', season: 0, edition: 0, round: 'r1',
      })).toEqual([]);
    });
  });
});
