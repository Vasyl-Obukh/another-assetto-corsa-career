import { describe, expect, it } from '@jest/globals';

import type { Championship, ClassEntry, Seat } from '../../../shared/types/index.ts';
import { roundRace, validateSeries } from '../series.ts';
import { makeContent, makeSeries } from './fixtures.ts';

/**
 * The codes validating a championship produced.
 * @param overrides What to change about a clean championship
 * @returns One code per problem
 */
const codesFor = (overrides: Partial<Championship> = {}): string[] => (
  validateSeries(makeSeries(overrides)).map((problem) => problem.code)
);

/**
 * A championship whose only class fields the given seats.
 * @param seats The seats to field
 * @param entry What else to change about the class entry
 * @returns The championship
 */
const withSeats = (seats: Seat[], entry: Partial<ClassEntry> = {}): Championship => {
  const base = makeSeries();

  return { ...base, entries: [{ ...base.entries[0], seats, ...entry }] };
};

describe('core/series', () => {
  describe('validateSeries', () => {
    it('passes a championship with nothing wrong with it', () => {
      expect(codesFor()).toEqual([]);
    });

    it('refuses a class entry that fields nobody', () => {
      expect(validateSeries(withSeats([])).map((one) => one.code))
        .toEqual(['series.seats.empty']);
    });

    // Across the whole championship rather than within a class: a seat is what
    // a contract binds to and what standings will file a result under, and
    // neither is scoped to one class entry.
    it('refuses two seats sharing an id, even in different classes', () => {
      const base = makeSeries();
      const entry = base.entries[0];
      const twoClasses = {
        ...base,
        entries: [
          { ...entry, seats: [{ id: 'shared' }] },
          { ...entry, id: 'second', seats: [{ id: 'shared' }] },
        ],
      };

      expect(validateSeries(twoClasses).map((one) => one.code))
        .toEqual(['series.id.duplicate']);
    });

    it('refuses a seat fielded by a team the championship does not have', () => {
      expect(validateSeries(withSeats([{ id: 'one', team: 'ghost' }])).map((one) => one.code))
        .toEqual(['series.seat.teamUnknown']);
    });

    it('refuses two teams sharing an id', () => {
      const teams = [{ id: 'same', name: 'One' }, { id: 'same', name: 'Two' }];

      expect(codesFor({ teams })).toEqual(['series.id.duplicate']);
    });

    it('accepts a seat pinned to a car its class can field', () => {
      const seats = [{ id: 'one', car: { model: 'test_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code)).toEqual([]);
    });

    it('refuses a seat pinned to a car its class cannot field', () => {
      const seats = [{ id: 'one', car: { model: 'ghost_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code))
        .toEqual(['series.seat.carNotEligible']);
    });

    // A seat and a balanced car are both named for the season, and some fields
    // change car with the track - so a round that swaps the cars is what both
    // are allowed to reach for, not just the entry's own rule.
    it('lets a seat and a balance rule name a car only one round runs', () => {
      const base = withSeats(
        [{ id: 'one', car: { model: 'oval_car' } }],
        { bop: [{ car: 'oval_car', ballast: 20 }] },
      );
      const swapped: Championship = {
        ...base,
        rounds: [
          base.rounds[0],
          {
            id: 'oval',
            name: 'Oval',
            track: { id: 'magione' },
            eligibility: [{ entry: 'main', eligibility: { kind: 'cars', cars: ['oval_car'] } }],
          },
        ],
      };

      expect(validateSeries(swapped).map((one) => one.code)).toEqual([]);
    });

    it('names every rule broken rather than the first', () => {
      const seats = [{ id: 'one', team: 'ghost', car: { model: 'ghost_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code))
        .toEqual(['series.seat.teamUnknown', 'series.seat.carNotEligible']);
    });

    it('carries the money rules, so a bad prize is a problem with the series', () => {
      expect(codesFor({ prizes: { positions: [-1] } })).toEqual(['series.prizes.invalid']);
    });
  });

  describe('roundRace', () => {
    /**
     * Lowers the only round of a championship, with the player in its only class.
     * @param series The championship to lower
     * @returns The race definition
     */
    const lower = (series: Championship) => roundRace(
      { series, entry: 'main', round: 'magione', car: { model: 'test_car' } },
      makeContent(),
    );

    it('fields one car per seat, the player taking one of them', () => {
      const race = lower(makeSeries());

      expect(race.grid?.size).toBe(3);
      expect(race.grid?.opponents).toHaveLength(2);
    });

    // The last seat rather than the first, so a championship that named its
    // front-runners keeps them and gives up its tail-ender.
    it('gives the player the last seat of the class they enter', () => {
      const seats = [
        { id: 'one', driver: { name: 'Ahead' } },
        { id: 'two', driver: { name: 'Alongside' } },
        { id: 'three', driver: { name: 'Displaced' } },
      ];
      const drivers = lower(withSeats(seats)).grid?.opponents?.map((one) => one.driver);

      expect(drivers).toEqual(['Ahead', 'Alongside']);
    });

    it('carries a seat driver name and nationality onto the grid', () => {
      const seats = [
        { id: 'one', driver: { name: 'Ada Marchetti', nationality: 'Italy', nationCode: 'ITA' } },
        { id: 'two' },
      ];

      expect(lower(withSeats(seats)).grid?.opponents?.[0]).toMatchObject({
        driver: 'Ada Marchetti', nationality: 'Italy', nationCode: 'ITA',
      });
    });

    // Left undefined rather than filled in here, so buildGrid's own naming is
    // what a championship with nothing to say about its field still gets.
    it('leaves a seat with no driver for buildGrid to name', () => {
      const opponent = lower(withSeats([{ id: 'one' }, { id: 'two' }])).grid?.opponents?.[0];

      expect(opponent?.driver).toBeUndefined();
    });

    it('takes a seat own AI level over the class spread', () => {
      const seats = [{ id: 'one', aiLevel: 42 }, { id: 'two' }];

      expect(lower(withSeats(seats)).grid?.opponents?.[0].aiLevel).toBe(42);
    });

    it('gives a seat the livery it pins when that livery is installed', () => {
      const seats = [{ id: 'one', car: { model: 'test_car', skin: 'green' } }, { id: 'two' }];

      expect(lower(withSeats(seats)).grid?.opponents?.[0].skin).toBe('green');
    });

    // A user pins a livery against their own copy of a mod; the next release
    // may have renamed the folder, and automatic assignment beats a SKIN key
    // Assetto Corsa cannot resolve.
    it('drops a pinned livery the installed car does not have', () => {
      const seats = [{ id: 'one', car: { model: 'test_car', skin: 'chartreuse' } }, { id: 'two' }];

      expect(lower(withSeats(seats)).grid?.opponents?.[0].skin).toBeUndefined();
    });

    it('composes the same field every time, since the draw is seeded', () => {
      const series = makeSeries();

      expect(lower(series).grid?.opponents).toEqual(lower(series).grid?.opponents);
    });
  });
});
