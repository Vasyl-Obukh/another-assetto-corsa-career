import { describe, expect, it } from '@jest/globals';

import {
  careerWith, CUP, cupAt, FIELD, makeCareer, makeEntry, makeEvent, makeRecord, makeSeason, racedOnce,
} from './fixtures.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type { RatingLine } from '../../../shared/types/index.ts';
import { pendingSessions } from '../utils.ts';

/**
 * A line already posted under the key given.
 * @param key The key
 * @returns The line
 */
const postedAs = (key: string): RatingLine => ({
  key, kind: 'race', date: '2027-03-07', season: 0, change: 0, globalChange: 0, global: 2000,
});

describe('core/career-rating/utils', () => {
  describe('pendingSessions', () => {
    it('gathers a driven race with where it stands and what it was raced against', () => {
      const career = racedOnce([1, 0, 2, 3, 4, 5], { strengthOver: [0, 1, -1, 2, 0, 0], scale: 2 });
      const [one] = pendingSessions(career);

      expect(one).toMatchObject({
        key: 'session:test-cup/one@0.0:0',
        type: 'race',
        name: 'Race',
        completedAt: '2027-03-07T10:00:00.000Z',
        discipline: Discipline.ROAD,
        tier: 4,
        place: 2,
        offsets: [1, -1, 2, 0, 0],
      });
      expect(one.event.round).toBe('one');
      expect(one.record.scale).toBe(2);
    });

    it('reads a classmate raced at the setting where the launch recorded no strengths', () => {
      expect(pendingSessions(racedOnce(FIELD))[0].offsets).toEqual([0, 0, 0, 0, 0]);
    });

    it('places the player among their classmates alone', () => {
      const career = racedOnce([1, 0, 3, 2, 5, 4], {
        carClasses: ['pro', 'am', 'pro', 'am', 'pro', 'am'],
        strengthOver: [0, 9, 1, 9, 2, 9],
      });

      expect(pendingSessions(career)[0]).toMatchObject({ place: 1, offsets: [1, 2] });
    });

    it('places a classmate the order never classified behind the player', () => {
      expect(pendingSessions(racedOnce([3, 0]))[0].place).toBe(2);
    });

    it('places the player last where the order never classified them', () => {
      expect(pendingSessions(racedOnce([1, 2, 3]))[0].place).toBe(6);
    });

    it('rates nobody where the player had no classmate to be rated against', () => {
      const career = racedOnce(FIELD, { carClasses: ['solo', 'am', 'am', 'am', 'am', 'am'] });

      expect(pendingSessions(career)).toEqual([]);
    });

    it('rates a historic event on the player\'s own rung rather than its class\'s', () => {
      const career = careerWith([makeEntry({
        historic: true,
        championship: cupAt(2),
        events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)])],
      })]);

      expect(pendingSessions(career)[0].tier).toBeNull();
    });

    it('leaves out a session already rated', () => {
      const career = racedOnce(FIELD, {}, { ratingLog: [postedAs('session:test-cup/one@0.0:0')] });

      expect(pendingSessions(career)).toEqual([]);
    });

    it('leaves out practice, which rates nothing', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('two', '2027-03-07', [makeRecord(0, FIELD)])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });

    it('gathers a qualifying and the race behind it as sessions of their own', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('two', '2027-03-07', [
          makeRecord(0, FIELD),
          makeRecord(1, FIELD),
          makeRecord(2, FIELD),
        ])],
      })]);

      expect(pendingSessions(career).map((one) => [one.key, one.type])).toEqual([
        ['session:test-cup/two@0.0:1', 'qualify'],
        ['session:test-cup/two@0.0:2', 'race'],
      ]);
    });

    it('leaves out a class that is not on the ladder', () => {
      const career = careerWith([makeEntry({
        entry: 'gone',
        events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });

    it('leaves out a round the championship no longer holds', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('gone', '2027-03-07', [makeRecord(0, FIELD)])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });

    it('leaves out a race skipped, simulated or never read back', () => {
      expect(pendingSessions(racedOnce(FIELD, { skipped: true }))).toEqual([]);
      expect(pendingSessions(racedOnce(FIELD, { archive: '' }))).toEqual([]);
      expect(pendingSessions(racedOnce(FIELD, { classification: null }))).toEqual([]);
    });

    it('orders sessions by race day, then by when they landed', () => {
      const championship = { ...CUP, rounds: [...CUP.rounds, { ...CUP.rounds[0], id: 'four', name: 'Round four' }] };
      const career = careerWith([
        makeEntry({
          championship,
          events: [
            makeEvent('one', '2027-05-02', [makeRecord(0, FIELD)]),
            makeEvent('four', '2027-03-07', [makeRecord(0, FIELD, { completedAt: '2027-03-07T15:00:00.000Z' })]),
          ],
        }),
        makeEntry({
          series: 'other',
          championship: { ...championship, id: 'other' },
          events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD, { completedAt: '2027-03-07T12:00:00.000Z' })], {
            raceId: 'other/one@0.0',
          })],
        }),
      ]);

      expect(pendingSessions(career).map((one) => one.key)).toEqual([
        'session:other/one@0.0:0',
        'session:test-cup/four@0.0:0',
        'session:test-cup/one@0.0:0',
      ]);
    });

    it('gathers every season of the career', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2027-03-07', [makeRecord(0, FIELD)])] });
      const next = makeEntry({
        events: [makeEvent('one', '2028-03-05', [makeRecord(0, FIELD)], { raceId: 'test-cup/one@1.0' })],
      });
      const career = makeCareer({ seasons: [makeSeason([entry]), makeSeason([next], 1)] });

      expect(pendingSessions(career).map((one) => one.season.index)).toEqual([0, 1]);
    });

    it('gathers a knockout once, at its last segment, on the order the chain composes', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5], { strengthOver: [0, 1, 1, 1, 1, 1] }),
          makeRecord(1, [0, 1, 2, 3], { gridOrder: [1, 0, 2, 3] }),
          makeRecord(2, [1, 0], { gridOrder: [1, 0] }),
        ])],
      })]);
      const pending = pendingSessions(career);

      expect(pending).toHaveLength(1);
      expect(pending[0]).toMatchObject({
        key: 'session:test-cup/three@0.0:2',
        type: 'qualify',
        name: 'Q3',
        completedAt: '2027-03-07T12:00:00.000Z',
        place: 2,
        offsets: [1, 1, 1, 1, 1],
      });
      // The whole field's strengths and classes are read off the opening segment.
      expect(pending[0].record.index).toBe(0);
    });

    it('gathers a knockout the player went out of, the segments they missed invented', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 2, 3, 4, 5, 0]),
          makeRecord(1, [2, 1, 3, 4], { gridOrder: [1, 2, 3, 4], skipped: true, archive: '' }),
          makeRecord(2, [2, 1], { gridOrder: [1, 2], skipped: true, archive: '' }),
        ])],
      })]);

      expect(pendingSessions(career).map((one) => [one.key, one.place]))
        .toEqual([['session:test-cup/three@0.0:2', 6]]);
    });

    it('leaves out a knockout not yet at its last segment', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5]),
          makeRecord(1, [0, 1, 2, 3], { gridOrder: [1, 0, 2, 3] }),
        ])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });

    it('leaves out a knockout whose opening segment was not driven', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5], { skipped: true, archive: '' }),
          makeRecord(1, [0, 1, 2, 3], { gridOrder: [1, 0, 2, 3] }),
          makeRecord(2, [1, 0], { gridOrder: [1, 0] }),
        ])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });

    it('leaves out a knockout a stand-in raced any segment of in the player\'s seat', () => {
      const career = careerWith([makeEntry({
        events: [makeEvent('three', '2027-03-07', [
          makeRecord(0, [1, 0, 2, 3, 4, 5]),
          makeRecord(1, [0, 1, 2, 3], { gridOrder: [1, 0, 2, 3], skipped: true, archive: '' }),
          makeRecord(2, [1, 0], { gridOrder: [1, 0] }),
        ])],
      })]);

      expect(pendingSessions(career)).toEqual([]);
    });
  });
});
