import { describe, expect, it } from '@jest/globals';

import {
  careerWith, cupAt, FIELD, makeCareer, makeEntry, makeEvent, makeRecord, makeSeason, racedOnce,
} from './fixtures.ts';
import {
  MIN_RATING, QUALIFYING_WEIGHT, RATING_K, RATING_MAX_LOSS, RATING_PER_POINT, RATING_SPREAD,
} from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type { Career, RatingLine } from '../../../shared/types/index.ts';
import { fieldRating, ratingFloor } from '../../../shared/utils/career-eligibility/index.ts';
import {
  closeLevels,
  expectedToBeat,
  liftOnEntering,
  noteRatingSpeed,
  openingRatingLine,
  rateAgainst,
  rateCareer,
} from '../career-rating.ts';

/**
 * Every line a career's log holds of one kind.
 * @param career The career
 * @param kind The kind of line
 * @returns Its lines of that kind, in the order they were posted
 */
const linesOf = (career: Career, kind: RatingLine['kind']): RatingLine[] => (
  career.ratingLog.filter((line) => line.kind === kind)
);

/**
 * The one session line a rated career posted.
 * @param career The career, rated
 * @returns Its only race or qualifying line
 */
const onlyLine = (career: Career): RatingLine => {
  const lines = career.ratingLog.filter((line) => line.kind === 'race' || line.kind === 'qualifying');
  expect(lines).toHaveLength(1);

  return lines[0];
};

/**
 * Five classmates all rated as the fourth rung's field.
 */
const RUNG_FOUR_FIELD: readonly number[] = Array.from({ length: 5 }, () => fieldRating(4));

describe('core/career-rating', () => {
  describe('expectedToBeat', () => {
    it('gives an even chance against an equal rating', () => {
      expect(expectedToBeat(2000, 2000)).toBe(0.5);
    });

    it('gives a field ahead by the spread ten wins in eleven', () => {
      expect(expectedToBeat(2000, 2000 + RATING_SPREAD)).toBeCloseTo(1 / 11);
      expect(expectedToBeat(2000 + RATING_SPREAD, 2000)).toBeCloseTo(10 / 11);
    });

    it('makes the two chances of a pair add up to one', () => {
      expect(expectedToBeat(2400, 3100) + expectedToBeat(3100, 2400)).toBeCloseTo(1);
    });
  });

  describe('rateAgainst', () => {
    it('gains half of K for a win over a field expected to beat the player half the time', () => {
      const move = rateAgainst(2000, [2000, 2000, 2000], 1, 1, 1);

      expect(move).toEqual({
        change: RATING_K / 2, beaten: 1, expectedShare: 0.5, expected: 3,
      });
    });

    it('holds the rating where it is for the place its field expected', () => {
      expect(rateAgainst(2000, [2000, 2000], 2, 1, 1).change).toBe(0);
    });

    it('scales the move by the session weight and the rating speed', () => {
      const field = Array.from({ length: 10 }, () => 2000);
      const full = rateAgainst(2000, field, 2, 1, 1).change;

      expect(full).toBe(120);
      expect(rateAgainst(2000, field, 2, QUALIFYING_WEIGHT, 1).change).toBe(full * QUALIFYING_WEIGHT);
      expect(rateAgainst(2000, field, 2, 1, 2).change).toBe(full * 2);
    });

    it('takes no more than the most a session can take, saying what it would have', () => {
      const move = rateAgainst(5000, [1500, 1500], 3, 1, 1);

      expect(move.change).toBe(-RATING_MAX_LOSS);
      expect(move.uncapped).toBeLessThan(-RATING_MAX_LOSS);
      expect(move.uncapped).toBe(Math.round(-RATING_K * expectedToBeat(5000, 1500)));
    });

    it('caps a loss at the most a session can take times its weight and the speed', () => {
      const move = rateAgainst(5000, [1500, 1500], 3, QUALIFYING_WEIGHT, 2);

      expect(move.change).toBe(-RATING_MAX_LOSS * QUALIFYING_WEIGHT * 2);
      expect(move.uncapped).toBe(Math.round(-RATING_K * QUALIFYING_WEIGHT * 2 * expectedToBeat(5000, 1500)));
    });

    it('says nothing of an uncapped figure for a loss the cap did not hold', () => {
      const move = rateAgainst(2000, [2000, 2000, 2000], 3, 1, 1);

      expect(move.change).toBe(-RATING_K / 6);
      expect(move).not.toHaveProperty('uncapped');
    });

    it('says nothing of an uncapped figure for a gain', () => {
      expect(rateAgainst(2000, [2000, 2000, 2000], 1, 1, 1)).not.toHaveProperty('uncapped');
    });

    it('never takes a rating below the lowest it can fall to', () => {
      const move = rateAgainst(50, [MIN_RATING, MIN_RATING], 3, 1, 1);

      expect(move.change).toBe(MIN_RATING - 50);
      expect(50 + move.change).toBe(MIN_RATING);
    });

    it('expects the place the field ratings point to', () => {
      expect(rateAgainst(2000, [5000, 5000, 5000, 5000], 1, 1, 1).expected).toBe(5);
      expect(rateAgainst(5000, [2000, 2000, 2000, 2000], 5, 1, 1).expected).toBe(1);
    });
  });

  describe('rateCareer', () => {
    it("rates a race against the class's rung, moving the discipline and the global rating", () => {
      const career = racedOnce([0, 1, 2, 3, 4, 5], {}, { globalRating: 3000 });
      const rated = rateCareer(career);
      const own = rateAgainst(2000, RUNG_FOUR_FIELD, 1, 1, 1);
      const all = rateAgainst(3000, RUNG_FOUR_FIELD, 1, 1, 1);

      expect(rated.rating[Discipline.ROAD]).toBe(2000 + own.change);
      expect(rated.globalRating).toBe(3000 + all.change);
      expect(rated.rating[Discipline.SPORTSCAR]).toBe(2000);
      expect(onlyLine(rated)).toMatchObject({
        key: 'session:test-cup/one@0.0:0',
        kind: 'race',
        date: '2027-03-07',
        season: 0,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        round: 'one',
        roundName: 'Round one',
        number: 1,
        discipline: Discipline.ROAD,
        change: own.change,
        globalChange: all.change,
        rating: 2000 + own.change,
        global: 3000 + all.change,
        sessionName: 'Race',
        working: {
          place: 1, of: 6, rung: 4, weight: 1, speed: 1, field: fieldRating(4), offsetLow: 0, offsetHigh: 0,
        },
      });
    });

    it('loses rating for a race finished behind the field', () => {
      const rated = rateCareer(racedOnce([1, 2, 3, 4, 5, 0]));

      expect(rated.rating[Discipline.ROAD]).toBeLessThan(2000);
      expect(onlyLine(rated).working?.place).toBe(6);
    });

    it("rates a class on its own rung's field", () => {
      const career = careerWith([makeEntry({
        championship: cupAt(3),
        events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)])],
      })], { level: { ...makeCareer().level, [Discipline.ROAD]: 3 } });

      expect(onlyLine(rateCareer(career)).working).toMatchObject({ rung: 3, field: fieldRating(3) });
    });

    it('moves the rating at the career\'s own rating speed', () => {
      const career = racedOnce(FIELD, {}, { settings: { ...makeCareer().settings, ratingSpeed: 2 } });
      const line = onlyLine(rateCareer(career));

      expect(line.change).toBe(rateAgainst(2000, RUNG_FOUR_FIELD, 1, 1, 2).change);
      expect(line.working?.speed).toBe(2);
    });

    it('records how far a race was shortened', () => {
      expect(onlyLine(rateCareer(racedOnce(FIELD, { scale: 4 }))).working?.scale).toBe(4);
    });

    it('records the figure the cap held a loss from, for the discipline and the global rating', () => {
      const career = racedOnce([1, 2, 3, 4, 5, 0], {}, {
        rating: { ...makeCareer().rating, [Discipline.ROAD]: 9000 },
        globalRating: 9000,
      });
      const line = onlyLine(rateCareer(career));

      expect(line.change).toBe(-RATING_MAX_LOSS);
      expect(line.working?.uncapped).toBeLessThan(-RATING_MAX_LOSS);
      expect(line.working?.globalUncapped).toBe(line.working?.uncapped);
    });

    it('weighs a qualifying at a quarter of a race', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('two', '2027-03-07', [makeRecord(1, FIELD)])],
      })]);
      const line = onlyLine(rateCareer(career));

      expect(line).toMatchObject({
        key: 'session:test-cup/two@0.0:1', kind: 'qualifying', sessionName: 'Qualifying', number: 2,
      });
      expect(line.working?.weight).toBe(QUALIFYING_WEIGHT);
      expect(line.change).toBe(rateAgainst(2000, RUNG_FOUR_FIELD, 1, QUALIFYING_WEIGHT, 1).change);
    });

    it('rates only the classmates of the player, who is car 0', () => {
      // Pro is cars 0, 2 and 4; the Am cars ahead of the player do not count.
      const career = racedOnce([1, 3, 5, 0, 2, 4], { carClasses: ['pro', 'am', 'pro', 'am', 'pro', 'am'] });
      const line = onlyLine(rateCareer(career));

      expect(line.working).toMatchObject({ place: 1, of: 3 });
      expect(line.change).toBe(rateAgainst(2000, [fieldRating(4), fieldRating(4)], 1, 1, 1).change);
    });

    it('rates a classmate raced over the setting as a stronger field, by a step a point', () => {
      const career = racedOnce(FIELD, { strengthOver: [0, 2, 2, 2, 2, 2] });
      const line = onlyLine(rateCareer(career));
      const field = fieldRating(4) + 2 * RATING_PER_POINT;

      expect(line.working).toMatchObject({ field, offsetLow: 2, offsetHigh: 2 });
      expect(line.change).toBe(rateAgainst(2000, Array.from({ length: 5 }, () => field), 1, 1, 1).change);
      expect(line.change).toBeGreaterThan(onlyLine(rateCareer(racedOnce(FIELD))).change);
    });

    it('rates a classmate raced under the setting as a weaker field', () => {
      const line = onlyLine(rateCareer(racedOnce(FIELD, { strengthOver: [0, -3, 0, 1, 0, 0] })));

      expect(line.working).toMatchObject({
        field: Math.round(fieldRating(4) - (2 * RATING_PER_POINT) / 5), offsetLow: -3, offsetHigh: 1,
      });
    });

    it('opens the rung whose floor a race passes, with a line of its own', () => {
      const career = racedOnce(FIELD, {}, {
        rating: { ...makeCareer().rating, [Discipline.ROAD]: ratingFloor(4) - 10 },
        level: { ...makeCareer().level, [Discipline.ROAD]: 5 },
      });
      const rated = rateCareer(career);

      expect(rated.level[Discipline.ROAD]).toBe(4);
      expect(linesOf(rated, 'promotion')).toEqual([expect.objectContaining({
        key: 'promotion:session:test-cup/one@0.0:0',
        discipline: Discipline.ROAD,
        tier: 4,
        change: 0,
        globalChange: 0,
        rating: rated.rating[Discipline.ROAD],
      })]);
      expect(rated.ratingLog.map((line) => line.kind)).toEqual(['race', 'promotion']);
    });

    it('opens nothing for a race that passes no floor', () => {
      const rated = rateCareer(racedOnce(FIELD));

      expect(rated.level[Discipline.ROAD]).toBe(4);
      expect(linesOf(rated, 'promotion')).toEqual([]);
    });

    it('rates nothing twice', () => {
      const once = rateCareer(racedOnce(FIELD));

      expect(rateCareer(once)).toBe(once);
    });

    it('rates a session added since, from where the last left the rating', () => {
      const once = rateCareer(racedOnce(FIELD));
      const [season] = once.seasons;
      const [entry] = season.entries;
      const later = {
        ...once,
        seasons: [{
          ...season,
          entries: [{
            ...entry,
            events: [...entry.events, makeEvent('two', '2027-04-04', [makeRecord(2, [1, 2, 3, 4, 5, 0])])],
          }],
        }],
      };
      const twice = rateCareer(later);

      expect(twice.ratingLog.map((line) => line.key))
        .toEqual(['session:test-cup/one@0.0:0', 'session:test-cup/two@0.0:2']);
      const from = once.rating[Discipline.ROAD];

      expect(twice.rating[Discipline.ROAD]).toBe(from + rateAgainst(from, RUNG_FOUR_FIELD, 6, 1, 1).change);
    });

    it('rates sessions in the order they landed, whatever order the season lists them in', () => {
      const career = careerWith([makeEntry({
        events: [
          makeEvent('two', '2027-05-02', [makeRecord(2, [1, 2, 3, 4, 5, 0])]),
          makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)]),
        ],
      })]);
      const rated = rateCareer(career);
      const first = rateAgainst(2000, RUNG_FOUR_FIELD, 1, 1, 1).change;

      expect(rated.ratingLog.map((line) => line.round)).toEqual(['one', 'two']);
      expect(rated.ratingLog[1].change).toBe(rateAgainst(2000 + first, RUNG_FOUR_FIELD, 6, 1, 1).change);
    });

    it('hands back the same career when nothing is owed', () => {
      const career = careerWith([makeEntry()]);

      expect(rateCareer(career)).toBe(career);
    });

    it('never rates a standalone championship, which has no ladder', () => {
      const career = racedOnce(FIELD, {}, { kind: 'championship' });

      expect(rateCareer(career)).toBe(career);
    });

    it('does not rate a race a stand-in raced in the player\'s seat', () => {
      const career = racedOnce(FIELD, { skipped: true, archive: '' });

      expect(rateCareer(career)).toBe(career);
    });

    it('does not rate a race that was simulated rather than driven', () => {
      const career = racedOnce(FIELD, { archive: '' });

      expect(rateCareer(career)).toBe(career);
    });

    it('does not rate a race whose result could not be read', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('one', '2027-03-07', [makeRecord(0, null)])],
      })]);

      expect(rateCareer(career)).toBe(career);
    });

    // Guards a fixed bug: a guest seat in a historic event was rated on the
    // rung the career's best opened, rather than the one its discipline earned.
    it('rates a historic event on the rung its discipline earned, however high the seat', () => {
      const career = careerWith([makeEntry({
        historic: true,
        championship: cupAt(2),
        events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)])],
      })], { level: { ...makeCareer().level, [Discipline.SPORTSCAR]: 2 } });
      const line = onlyLine(rateCareer(career));

      expect(line.historic).toBe(true);
      expect(line.working).toMatchObject({ rung: 4, field: fieldRating(4) });
    });

    it('rates a knockout once, on the order it ends in', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5]),
          makeRecord(1, [0, 1, 2, 3], { gridOrder: [1, 0, 2, 3] }),
          makeRecord(2, [1, 0], { gridOrder: [1, 0] }),
        ])],
      })]);
      const line = onlyLine(rateCareer(career));

      expect(line).toMatchObject({ key: 'session:test-cup/three@0.0:2', kind: 'qualifying', sessionName: 'Q3' });
      expect(line.working).toMatchObject({ place: 2, of: 6, weight: QUALIFYING_WEIGHT });
    });

    it('rates a knockout the player was eliminated from, on where they went out', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 2, 3, 0, 4, 5]),
          makeRecord(1, [1, 2, 3, 0], { gridOrder: [1, 2, 3, 0] }),
          makeRecord(2, [2, 1], { gridOrder: [1, 2], skipped: true, archive: '' }),
        ])],
      })]);
      const line = onlyLine(rateCareer(career));

      expect(line.key).toBe('session:test-cup/three@0.0:2');
      expect(line.working?.place).toBe(4);
    });

    // Guards a fixed bug: a segment a stand-in raced in the player's seat was
    // read as the player's, so the stand-in's pole was rated as theirs.
    it('does not rate a knockout a stand-in finished in the player\'s seat', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5]),
          makeRecord(1, [1, 0, 2, 3], { gridOrder: [1, 0, 2, 3] }),
          makeRecord(2, [0, 1], { gridOrder: [0, 1], skipped: true, archive: '' }),
        ])],
      })]);

      expect(rateCareer(career)).toBe(career);
    });
  });

  describe('closeLevels', () => {
    /**
     * A career on the road rung given, its road rating where the test puts it.
     * @param level The road rung it holds
     * @param rating Its road rating
     * @param over Whatever else the test wants said differently
     * @returns The career
     */
    const onRoad = (level: number, rating: number, over: Partial<Career> = {}): Career => makeCareer({
      level: { ...makeCareer().level, [Discipline.ROAD]: level },
      rating: { ...makeCareer().rating, [Discipline.ROAD]: rating },
      ...over,
    });

    it('keeps a level whose rating ended the season at the middle of the rung beneath or over it', () => {
      const career = onRoad(3, fieldRating(4));

      expect(closeLevels(career, makeSeason())).toBe(career);
    });

    it('drops a level whose rating ended the season under the middle of the rung beneath', () => {
      const closed = closeLevels(onRoad(3, fieldRating(4) - 1), makeSeason());

      expect(closed.level[Discipline.ROAD]).toBe(4);
      expect(closed.level[Discipline.SPORTSCAR]).toBe(4);
      expect(closed.ratingLog).toEqual([{
        key: 'drop:0:road',
        kind: 'drop',
        date: '2027-12-31',
        season: 0,
        discipline: Discipline.ROAD,
        change: 0,
        globalChange: 0,
        rating: fieldRating(4) - 1,
        global: 2000,
        tier: 4,
      }]);
    });

    it('drops rung by rung to the first the rating holds', () => {
      const closed = closeLevels(onRoad(2, 1200), makeSeason());

      expect(closed.level[Discipline.ROAD]).toBe(5);
      expect(closed.ratingLog).toHaveLength(1);
      expect(closed.ratingLog[0].tier).toBe(5);
    });

    it('never drops the lowest rung', () => {
      const career = onRoad(5, MIN_RATING);

      expect(closeLevels(career, makeSeason())).toBe(career);
    });

    it('keys each drop on its season and discipline', () => {
      const career = makeCareer({
        level: { ...makeCareer().level, [Discipline.ROAD]: 3, [Discipline.TOURING]: 3 },
      });

      expect(closeLevels(career, makeSeason([], 2)).ratingLog.map((line) => line.key))
        .toEqual(['drop:2:touring', 'drop:2:road']);
    });

    it('drops a season once, however often it is closed', () => {
      const closed = closeLevels(onRoad(3, 2000), makeSeason());
      const raised = { ...closed, level: { ...closed.level, [Discipline.ROAD]: 3 } };

      expect(closeLevels(raised, makeSeason())).toBe(raised);
    });

    it('never closes a standalone championship\'s levels', () => {
      const career = onRoad(3, 2000, { kind: 'championship' });

      expect(closeLevels(career, makeSeason())).toBe(career);
    });
  });

  describe('liftOnEntering', () => {
    it('lifts a discipline to the floor of a rung entered above its own level', () => {
      const career = makeCareer({ date: '2027-02-01' });
      const entry = makeEntry({ championship: cupAt(3) });
      const lifted = liftOnEntering(career, makeSeason(), entry);

      expect(lifted.rating[Discipline.ROAD]).toBe(ratingFloor(3));
      expect(lifted.level[Discipline.ROAD]).toBe(3);
      expect(lifted.globalRating).toBe(2000);
      expect(lifted.ratingLog).toEqual([{
        key: 'lift:0:test-cup:0',
        kind: 'lift',
        date: '2027-02-01',
        season: 0,
        discipline: Discipline.ROAD,
        change: ratingFloor(3) - 2000,
        globalChange: 0,
        rating: ratingFloor(3),
        global: 2000,
        tier: 3,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
      }]);
    });

    it('lifts nothing for a rung at the discipline\'s own level', () => {
      const career = makeCareer();

      expect(liftOnEntering(career, makeSeason(), makeEntry())).toBe(career);
    });

    it('lifts nothing for a rung below the discipline\'s own level', () => {
      const career = makeCareer();

      expect(liftOnEntering(career, makeSeason(), makeEntry({ championship: cupAt(5) }))).toBe(career);
    });

    it('lifts nothing for a historic event, whose seat is a guest\'s', () => {
      const career = makeCareer();
      const entry = makeEntry({ championship: cupAt(3), historic: true });

      expect(liftOnEntering(career, makeSeason(), entry)).toBe(career);
    });

    it('lifts nothing in a standalone championship', () => {
      const career = makeCareer({ kind: 'championship' });

      expect(liftOnEntering(career, makeSeason(), makeEntry({ championship: cupAt(3) }))).toBe(career);
    });

    it('lifts nothing for an entry whose class is not on the ladder', () => {
      const career = makeCareer();
      const entry = makeEntry({ championship: cupAt(3), entry: 'gone' });

      expect(liftOnEntering(career, makeSeason(), entry)).toBe(career);
    });

    it('lifts only the discipline entered', () => {
      const lifted = liftOnEntering(makeCareer(), makeSeason(), makeEntry({
        championship: cupAt(3, Discipline.TOURING),
      }));

      expect(lifted.rating[Discipline.TOURING]).toBe(ratingFloor(3));
      expect(lifted.rating[Discipline.ROAD]).toBe(2000);
      expect(lifted.level[Discipline.ROAD]).toBe(4);
    });
  });

  describe('openingRatingLine', () => {
    it('opens on the floor of the rung the career starts on', () => {
      expect(openingRatingLine('2027-01-01', 3)).toEqual({
        key: 'opening',
        kind: 'opening',
        date: '2027-01-01',
        season: 0,
        change: 0,
        globalChange: 0,
        global: ratingFloor(3),
        tier: 3,
      });
    });
  });

  describe('noteRatingSpeed', () => {
    it('notes the speed it ran at and the one it runs at from now on', () => {
      const career = makeCareer({ date: '2027-05-01', globalRating: 2400 });
      const noted = noteRatingSpeed(career, 2);

      expect(noted.ratingLog).toEqual([{
        key: 'speed:0',
        kind: 'speed',
        date: '2027-05-01',
        season: 0,
        change: 0,
        globalChange: 0,
        global: 2400,
        speed: { from: 1, to: 2 },
      }]);
    });

    it('moves no rating and no level', () => {
      const career = makeCareer();
      const noted = noteRatingSpeed(career, 2);

      expect(noted.rating).toEqual(career.rating);
      expect(noted.globalRating).toBe(career.globalRating);
      expect(noted.level).toEqual(career.level);
    });

    it('notes each change under a key of its own', () => {
      const twice = noteRatingSpeed(noteRatingSpeed(makeCareer(), 2), 1);

      expect(twice.ratingLog.map((line) => line.key)).toEqual(['speed:0', 'speed:1']);
    });

    it('dates a change in the season the career is in', () => {
      const career = makeCareer({ seasons: [makeSeason(), makeSeason([], 1)] });

      expect(noteRatingSpeed(career, 2).ratingLog[0].season).toBe(1);
    });
  });
});
