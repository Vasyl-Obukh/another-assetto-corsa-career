import { describe, expect, it } from '@jest/globals';

import {
  makeCareer, makeChampionship, makeContract, makeEntry, makeEvent, makeRace, makeResult, makeSeason,
} from './fixtures.ts';
import { SESSION_TYPE } from '../../race-ini/index.ts';
import {
  classOf, driverOf, lapTimes, roundName, rowOf, seasonAt, teamOf,
} from '../utils.ts';

describe('core/paddock-news/utils', () => {
  describe('lapTimes', () => {
    const result = makeResult(0, SESSION_TYPE.qualify, [[90_500, -1, 90_100], [], [91_000]]);

    it('takes each car\'s best valid lap, an invalidated one left out', () => {
      expect(lapTimes(result, [0, 1, 2], 3, SESSION_TYPE.qualify)).toEqual([90_100, null, 91_000]);
    });

    it('maps a shorter launch back to the event\'s grid through its order', () => {
      expect(lapTimes(result, [2, 0, 3], 4, SESSION_TYPE.qualify)).toEqual([null, null, 90_100, 91_000]);
    });

    it('has nothing for a missing archive or another kind of session', () => {
      expect(lapTimes(undefined, [0, 1], 2, SESSION_TYPE.qualify)).toEqual([null, null]);
      expect(lapTimes(result, [0, 1, 2], 3, SESSION_TYPE.race)).toEqual([null, null, null]);
    });
  });

  describe('seasonAt', () => {
    const career = makeCareer({
      seasons: [
        makeSeason({ index: 0 }),
        makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' }),
      ],
    });

    it('finds the season a day falls in', () => {
      expect(seasonAt(career, '2026-12-31')).toBe(0);
      expect(seasonAt(career, '2027-01-01')).toBe(1);
    });

    it('takes the latest season for a day past every one', () => {
      expect(seasonAt(career, '2028-02-01')).toBe(1);
      expect(seasonAt(makeCareer(), '2026-01-01')).toBe(0);
    });
  });

  describe('classOf', () => {
    it('finds the class an entry raced in', () => {
      expect(classOf(makeEntry())?.name).toBe('GT');
      expect(classOf(makeEntry({ entry: 'gone' }))).toBeNull();
    });
  });

  describe('teamOf', () => {
    it('takes the team fielding the player\'s seat', () => {
      expect(teamOf(makeEntry({ playerSeat: 's3' }))?.id).toBe('bolt');
    });

    it('takes the contract\'s team over the seat\'s', () => {
      expect(teamOf(makeEntry({ playerSeat: 's3', contract: makeContract() }))?.id).toBe('aster');
    });

    it('has none for a seat with no team', () => {
      expect(teamOf(makeEntry({ playerSeat: 'gone' }))).toBeNull();
    });
  });

  describe('roundName', () => {
    it('names a round off the entry\'s copy, its id where the copy has none', () => {
      expect(roundName(makeEntry(), 'two')).toBe('Spa');
      expect(roundName(makeEntry(), 'gone')).toBe('gone');
    });
  });

  describe('driverOf', () => {
    it('names a seat\'s driver with their own nation', () => {
      expect(driverOf(makeEntry(), 's3')).toEqual({ name: 'Cal Third', nation: 'DEU' });
    });

    it('takes the team\'s nation where the driver says none', () => {
      expect(driverOf(makeEntry(), 's1')).toEqual({ name: 'Ann Mate', nation: 'GBR' });
    });

    it('has nobody for an empty seat', () => {
      const championship = makeChampionship();
      const [classEntry] = championship.entries;
      const empty = { ...championship, entries: [{ ...classEntry, seats: [{ id: 's1' }] }] };

      expect(driverOf(makeEntry({ championship: empty }), 's1')).toBeNull();
    });
  });

  describe('rowOf', () => {
    const scored = makeEntry({
      events: [makeEvent('one', '2026-03-01', {
        status: 'raced',
        score: { round: 'one', recordedAt: '', races: [makeRace(0, ['s2', 's1', 's3'], { s2: { substitute: true } })] },
      })],
    });

    it('finds a seat\'s own row', () => {
      expect(rowOf(scored.standings, 'gt', 's1')?.position).toBeGreaterThan(0);
    });

    it('leaves out a reserve driver\'s row and a seat that raced nothing', () => {
      expect(rowOf(scored.standings, 'gt', 's2')).toBeUndefined();
      expect(rowOf(scored.standings, 'gt', 's4')).toBeUndefined();
    });
  });
});
