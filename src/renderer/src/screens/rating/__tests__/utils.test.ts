import { describe, expect, it, jest } from '@jest/globals';
import type { TFunction } from 'i18next';

import { Discipline, SeasonLength } from '../../../../../shared/types';
import type { Career, RatingLine, RatingWorking } from '../../../../../shared/types';
import {
  describeRatingLine, lineRun, openThrough, sessionPath,
} from '../utils.ts';

// The barrel reaches React components and react-router, which Jest cannot load.
jest.mock('@/screens/championships', () => ({
  disciplineKey: (discipline: string) => `discipline.${discipline}`,
  tierMetalKey: (tier: number) => `metal.${tier}`,
}));

/**
 * Echoes the key it was handed and whatever it interpolates, which is what the
 * translator does and what a test spells its expectations with.
 * @param key The catalogue key
 * @param options What it interpolates
 * @returns The key, with the options beside it
 */
const echo = (key: string, options?: object): string => `${key} ${JSON.stringify(options ?? {})}`;

/**
 * The translator the helpers are handed.
 */
const t = echo as unknown as TFunction;

/**
 * Formats a figure as it stands, so a test can read it back.
 */
const FORMAT = { formatNumber: String };

/**
 * Builds a rating line.
 * @param kind What kind of line it is
 * @param over Whatever the test wants said differently
 * @returns The line
 */
const line = (kind: RatingLine['kind'], over: Partial<RatingLine> = {}): RatingLine => ({
  key: kind,
  kind,
  date: '2027-03-07',
  season: 0,
  change: 0,
  globalChange: 0,
  global: 2000,
  ...over,
});

/**
 * How a session moved a rating: second of ten where fourth was expected.
 * @param over Whatever the test wants said differently
 * @returns The working
 */
const working = (over: Partial<RatingWorking> = {}): RatingWorking => ({
  place: 2,
  of: 10,
  expected: 4,
  beaten: 0.89,
  expectedShare: 0.67,
  field: 2750,
  offsetLow: 0,
  offsetHigh: 2,
  rung: 4,
  weight: 1,
  speed: 1,
  ...over,
});

/**
 * Two seasons of a career: a year-long championship in each and a
 * quarter-length one in the first.
 */
const CAREER = {
  seasons: [
    {
      index: 0,
      entries: [
        { series: 'cup', edition: 0, championship: { seasonLength: SeasonLength.YEAR } },
        { series: 'sprint', edition: 1, championship: { seasonLength: SeasonLength.QUARTER } },
      ],
    },
    {
      index: 1,
      entries: [{ series: 'cup', edition: 0, championship: {} }],
    },
  ],
} as unknown as Pick<Career, 'seasons'>;

describe('renderer/screens/rating/utils', () => {
  describe('describeRatingLine', () => {
    it('names the rung a career opened on, with its metal and floor', () => {
      expect(describeRatingLine(line('opening', { tier: 4 }), t, FORMAT)).toEqual({
        title: echo('rating.line.opening', { tier: 4 }),
        detail: echo('rating.line.openingDetail', { metal: echo('metal.4'), floor: '2000' }),
      });
    });

    it('names a promotion by its rung and discipline, with the rating that reached its floor', () => {
      const promotion = line('promotion', { tier: 3, discipline: Discipline.SPORTSCAR, rating: 3510 });

      expect(describeRatingLine(promotion, t, FORMAT)).toEqual({
        title: echo('rating.line.promotion', { tier: 3, discipline: echo('discipline.sportscar') }),
        detail: echo('rating.line.promotionDetail', { rating: '3510', metal: echo('metal.3'), floor: '3500' }),
      });
    });

    it('names a drop with the rating it fell under, the middle of the rung it reached', () => {
      const drop = line('drop', { tier: 5, discipline: Discipline.TOURING, rating: 1400 });

      expect(describeRatingLine(drop, t, FORMAT)).toEqual({
        title: echo('rating.line.drop', { tier: 5, discipline: echo('discipline.touring') }),
        detail: echo('rating.line.dropDetail', { rating: '1400', under: '1500', metal: echo('metal.5') }),
      });
    });

    it('names a lift by the championship entered and the floor it lifted to', () => {
      const lift = line('lift', {
        tier: 3, discipline: Discipline.ROAD, seriesName: 'GT Cup', rating: 3500,
      });

      expect(describeRatingLine(lift, t, FORMAT)).toEqual({
        title: echo('rating.line.lift', { tier: 3, discipline: echo('discipline.road') }),
        detail: echo('rating.line.liftDetail', { series: 'GT Cup', metal: echo('metal.3'), floor: '3500' }),
      });
    });

    it('names a change of speed by the speeds either side of it', () => {
      const speed = line('speed', { speed: { from: 1, to: 2 } });

      expect(describeRatingLine(speed, t, FORMAT)).toEqual({
        title: echo('rating.line.speed', {
          from: echo('finances.speed', { speed: '1' }), to: echo('finances.speed', { speed: '2' }),
        }),
        detail: echo('rating.line.speedDetail'),
      });
    });

    it('names a race by its round and session, and details the place, the field and the championship', () => {
      const race = line('race', {
        discipline: Discipline.SPORTSCAR, seriesName: 'Cup', number: 3, roundName: 'Spa', working: working(),
      });

      expect(describeRatingLine(race, t, FORMAT)).toEqual({
        title: echo('rating.line.session', {
          round: echo('finances.line.round', { number: 3, round: 'Spa' }), session: echo('race.sessionType.race'),
        }),
        detail: [
          'Cup',
          echo('rating.line.racePlace', { place: 2, of: 10, expected: 4 }),
          echo('rating.line.field', { field: '2750' }),
        ].join(' · '),
      });
    });

    it('says what else weighed on a qualifying: its quarter, a shortening, the speed and the cap', () => {
      const qualifying = line('qualifying', {
        discipline: Discipline.SPORTSCAR,
        seriesName: 'Cup',
        number: 1,
        roundName: 'Monza',
        sessionName: 'Q1',
        working: working({ scale: 2, speed: 2, uncapped: -80 }),
      });

      expect(describeRatingLine(qualifying, t, FORMAT)).toEqual({
        title: echo('rating.line.session', {
          round: echo('finances.line.round', { number: 1, round: 'Monza' }), session: 'Q1',
        }),
        detail: [
          'Cup',
          echo('rating.line.qualifyingPlace', { place: 2, of: 10, expected: 4 }),
          echo('rating.line.quarter'),
          echo('rating.line.shortened', { scale: 2 }),
          echo('finances.speed', { speed: '2' }),
          echo('rating.line.field', { field: '2750' }),
          echo('rating.line.held', { from: '-80' }),
        ].join(' · '),
      });
    });

    it('names a historic event by itself and the rung it was rated on, rather than a round', () => {
      const historic = line('race', {
        discipline: Discipline.TOURING, seriesName: 'Spa 1966', historic: true, working: working({ rung: 3 }),
      });
      const { title, detail } = describeRatingLine(historic, t, FORMAT);

      expect(title).toBe(echo('rating.line.session', { round: 'Spa 1966', session: echo('race.sessionType.race') }));
      expect(detail.startsWith(`${echo('rating.line.historicRung', { tier: 3 })} · `)).toBe(true);
    });

    it('details a session with no working by its championship alone', () => {
      const race = line('race', { discipline: Discipline.ROAD, seriesName: 'Cup' });

      expect(describeRatingLine(race, t, FORMAT).detail).toBe('Cup');
    });
  });

  describe('openThrough', () => {
    const career = {
      level: {
        [Discipline.SINGLE_SEATER]: 5,
        [Discipline.SPORTSCAR]: 2,
        [Discipline.TOURING]: 3,
        [Discipline.ROAD]: 4,
      },
    };

    it('reads a discipline the rung below the best opens higher as open through it', () => {
      expect(openThrough(career, Discipline.SINGLE_SEATER)).toBe(true);
      expect(openThrough(career, Discipline.ROAD)).toBe(true);
    });

    it('reads the best itself, and one already on the rung below it, as open on their own', () => {
      expect(openThrough(career, Discipline.SPORTSCAR)).toBe(false);
      expect(openThrough(career, Discipline.TOURING)).toBe(false);
    });
  });

  describe('lineRun', () => {
    it('names no season for the last one, and no edition for a championship run once a year', () => {
      expect(lineRun({ series: 'cup', season: 1, edition: 0 }, CAREER)).toEqual({});
    });

    it('names a season gone by', () => {
      expect(lineRun({ series: 'cup', season: 0, edition: 0 }, CAREER)).toEqual({ season: 0 });
    });

    it('names the edition of a championship the season ran more than once', () => {
      expect(lineRun({ series: 'sprint', season: 0, edition: 1 }, CAREER)).toEqual({ season: 0, edition: 1 });
    });

    it('names the whole run outright where the career no longer holds the entry', () => {
      expect(lineRun({ series: 'gone', season: 1, edition: 2 }, CAREER)).toEqual({ season: 1, edition: 2 });
    });

    it('reads a line naming no edition as the first', () => {
      expect(lineRun({ series: 'cup', season: 0 }, CAREER)).toEqual({ season: 0 });
      expect(lineRun({ series: 'gone', season: 0 }, CAREER)).toEqual({ season: 0, edition: 0 });
    });
  });

  describe('sessionPath', () => {
    /**
     * A session's line for one round of a run, rated under its launch.
     * @param kind A race or a qualifying
     * @param over Whatever the test wants said differently
     * @returns The line
     */
    const session = (kind: 'race' | 'qualifying', over: Partial<RatingLine> = {}): RatingLine => line(kind, {
      key: 'session:cup/r1@1.0:2', series: 'cup', season: 1, edition: 0, round: 'r1', ...over,
    });

    it('opens a race of the season under way on its launch, naming no run', () => {
      expect(sessionPath(session('race'), CAREER)).toBe('/calendar/cup/r1?session=2');
    });

    it('opens a qualifying the same way', () => {
      expect(sessionPath(session('qualifying', { key: 'session:cup/r1@1.0:0' }), CAREER))
        .toBe('/calendar/cup/r1?session=0');
    });

    it('names a season gone by, and the edition of a championship run more than once a year', () => {
      expect(sessionPath(session('race', { key: 'session:cup/r1@0.0:1', season: 0 }), CAREER))
        .toBe('/calendar/cup/r1?season=0&session=1');
      expect(sessionPath(session('race', {
        key: 'session:sprint/r2@0.1:3', series: 'sprint', season: 0, edition: 1, round: 'r2',
      }), CAREER)).toBe('/calendar/sprint/r2?season=0&edition=1&session=3');
    });

    it('opens nothing for a line that is not about a session', () => {
      expect(sessionPath(line('promotion', {
        key: 'promotion:session:cup/r1@1.0:2', series: 'cup', season: 1, round: 'r1', tier: 3,
      }), CAREER)).toBeNull();
      expect(sessionPath(line('opening', { tier: 4 }), CAREER)).toBeNull();
      expect(sessionPath(line('speed', { speed: { from: 1, to: 2 } }), CAREER)).toBeNull();
    });

    it('opens nothing for a session naming no championship or round', () => {
      expect(sessionPath(session('race', { series: undefined }), CAREER)).toBeNull();
      expect(sessionPath(session('race', { round: undefined }), CAREER)).toBeNull();
    });

    it('opens nothing for a key whose last part is not a launch', () => {
      expect(sessionPath(session('race', { key: 'session:cup/r1@1.0:final' }), CAREER)).toBeNull();
      expect(sessionPath(session('race', { key: 'session:cup/r1@1.0:1.5' }), CAREER)).toBeNull();
    });
  });
});
