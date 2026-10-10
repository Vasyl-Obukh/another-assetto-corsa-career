import { describe, expect, it } from '@jest/globals';

import {
  makeResults, makeSeries, place, race,
} from './fixtures.ts';
import {
  placeIn, raceSessionsOf, roundColumns, seasonResults, seatNation, standingKey, teamName, teamNation,
  teamPointsIn,
} from '../season-results.ts';

describe('renderer/lib/season-results/season-results', () => {
  describe('standingKey', () => {
    it('keys a row on its seat', () => {
      expect(standingKey({ seat: 'main-1' })).toBe('main-1');
    });

    it('keys the driver who raced the player\'s seat apart from the player', () => {
      expect(standingKey({ seat: 'main-1', substitute: true })).not.toBe(standingKey({ seat: 'main-1' }));
    });
  });

  describe('raceSessionsOf', () => {
    it('lists only the races of an event, by where each runs in it', () => {
      const series = makeSeries();

      expect(raceSessionsOf(series, series.rounds[0])).toEqual([{ launch: 1, name: null }]);
    });

    it('reads the format the round names over the championship\'s default', () => {
      const series = makeSeries();

      expect(raceSessionsOf(series, series.rounds[1])).toEqual([
        { launch: 0, name: 'Race 1' },
        { launch: 1, name: 'Race 2' },
      ]);
    });

    it('lists nothing for a format that does not resolve', () => {
      const series = makeSeries();

      expect(raceSessionsOf(series, { ...series.rounds[0], eventFormat: 'gone' })).toEqual([]);
    });
  });

  describe('roundColumns', () => {
    it('numbers every round and joins each race to what it paid', () => {
      const [first, second] = roundColumns(makeResults());

      expect(first).toMatchObject({ number: 1, date: '2026-05-03', status: 'raced', scored: true });
      expect(first.races).toHaveLength(1);
      expect(first.races[0].score?.places[0].seat).toBe('main-1');
      expect(second.number).toBe(2);
      expect(second.races.map((one) => one.score?.launch)).toEqual([0, 1]);
    });

    it('shows a round the career holds nothing for as scheduled and unscored', () => {
      const results = makeResults();
      const [, second] = roundColumns({ ...results, rounds: results.rounds.slice(0, 1) });

      expect(second).toMatchObject({ date: '', status: 'scheduled', scored: false });
      expect(second.races.every((one) => one.score === null)).toBe(true);
    });
  });

  describe('placeIn', () => {
    const score = race(0, [place('main-1', 1), place('main-1', 2, { substitute: true })]);

    it('finds the place a row took', () => {
      expect(placeIn(score, 'main', 'main-1')?.position).toBe(1);
    });

    it('tells the substitute\'s place from the player\'s in the same seat', () => {
      expect(placeIn(score, 'main', standingKey({ seat: 'main-1', substitute: true }))?.position).toBe(2);
    });

    it('finds nothing in a race still to come', () => {
      expect(placeIn(null, 'main', 'main-1')).toBeUndefined();
    });

    it('finds nothing for a row of another class', () => {
      expect(placeIn(score, 'other', 'main-1')).toBeUndefined();
    });
  });

  describe('teamPointsIn', () => {
    it('adds up every car a team fielded in the class', () => {
      const score = race(0, [place('main-1', 1), place('main-2', 2), place('main-3', 3)]);

      expect(teamPointsIn(score, 'main', 'alpha')).toBe(18);
    });

    it('is null for a race still to come, rather than nothing scored', () => {
      expect(teamPointsIn(null, 'main', 'alpha')).toBeNull();
    });
  });

  describe('seasonResults', () => {
    it('counts every scored round when told no round to stop at', () => {
      const season = seasonResults(makeResults());
      const [table] = season.classes;

      expect(season.counted).toBe(2);
      expect(table.drivers.map((row) => [row.seat, row.points])).toEqual([
        ['main-3', 26],
        ['main-2', 24],
        ['main-1', 22],
      ]);
    });

    it('builds the tables as they stood after an earlier round', () => {
      const season = seasonResults(makeResults(), 'r1');

      expect(season.counted).toBe(1);
      expect(season.classes[0].drivers.map((row) => row.seat)).toEqual(['main-1', 'main-2', 'main-3']);
      expect(season.rounds).toHaveLength(2);
    });

    it('says how far each row moved since the round before', () => {
      const { drivers } = seasonResults(makeResults()).classes[0];

      expect(drivers.map((row) => [row.seat, row.move])).toEqual([
        ['main-3', 2],
        ['main-2', 0],
        ['main-1', -2],
      ]);
    });

    it('has no movement before a second round has been scored', () => {
      const { drivers, teams } = seasonResults(makeResults(), 'r1').classes[0];

      expect(drivers.every((row) => row.move === null)).toBe(true);
      expect(teams.every((row) => row.move === null)).toBe(true);
    });

    it('marks the player\'s own row and the team they drive for', () => {
      const { drivers, teams } = seasonResults(makeResults()).classes[0];

      expect(drivers.filter((row) => row.player).map((row) => row.seat)).toEqual(['main-1']);
      expect(teams.filter((row) => row.player).map((row) => row.team)).toEqual(['alpha']);
    });

    it('marks no row the player\'s outside a career', () => {
      const { drivers } = seasonResults(makeResults({ playerSeat: null, playerEntry: null })).classes[0];

      expect(drivers.some((row) => row.player)).toBe(false);
    });

    it('does not mark the substitute in the player\'s seat as the player', () => {
      const results = makeResults();
      const stood = race(0, [place('main-1', 1, { substitute: true }), place('main-2', 2), place('main-3', 3)]);
      const season = seasonResults({
        ...results,
        rounds: [{ ...results.rounds[0], score: { ...results.rounds[0].score!, races: [stood] } }],
      });
      const rows = season.classes[0].drivers.filter((row) => row.seat === 'main-1');

      expect(rows.map((row) => [row.substitute ?? false, row.player])).toEqual([[true, false], [false, true]]);
    });

    it('adds up what qualifying and fastest laps paid on top of the finishes', () => {
      const results = makeResults();
      const bonus = race(1, [
        place('main-1', 1, { qualifyingPoints: 3, fastestLapPoints: 1 }),
        place('main-2', 2),
        place('main-3', 3, { fastestLapPoints: 1 }),
      ]);
      const season = seasonResults({
        ...results,
        rounds: [{ ...results.rounds[0], score: { ...results.rounds[0].score!, races: [bonus] } }],
      });
      const ada = season.classes[0].drivers.find((row) => row.seat === 'main-1');

      expect(ada).toMatchObject({ qualifyingPoints: 3, fastestLapPoints: 1 });
      expect(ada?.places).toHaveLength(1);
    });

    it('skips a round with no score without counting it', () => {
      const results = makeResults();
      const season = seasonResults({
        ...results,
        rounds: [{ ...results.rounds[0], score: null, status: 'missed' }, results.rounds[1]],
      });

      expect(season.counted).toBe(1);
    });
  });

  describe('seatNation', () => {
    it('reads the driver\'s own nation', () => {
      expect(seatNation(makeSeries(), 'main-1')).toBe('ITA');
    });

    it('falls back to the team\'s where the driver names none', () => {
      expect(seatNation(makeSeries(), 'main-2')).toBe('GBR');
    });

    it('is undefined where neither names one', () => {
      expect(seatNation(makeSeries(), 'main-3')).toBeUndefined();
    });

    it('is undefined for a seat the championship does not have', () => {
      expect(seatNation(makeSeries(), 'gone')).toBeUndefined();
    });
  });

  describe('teamNation', () => {
    it('reads the team\'s nation', () => {
      expect(teamNation(makeSeries(), 'alpha')).toBe('GBR');
    });

    it('is undefined for no team, or one that names no nation', () => {
      expect(teamNation(makeSeries(), null)).toBeUndefined();
      expect(teamNation(makeSeries(), 'beta')).toBeUndefined();
    });
  });

  describe('teamName', () => {
    it('reads the team\'s display name', () => {
      expect(teamName(makeSeries(), 'alpha')).toBe('Alpha Racing');
    });

    it('falls back to the id for a team the championship does not list', () => {
      expect(teamName(makeSeries(), 'gamma')).toBe('gamma');
    });

    it('is null for a seat with no team', () => {
      expect(teamName(makeSeries(), null)).toBeNull();
      expect(teamName(makeSeries(), undefined)).toBeNull();
    });
  });
});
