import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../types/index.ts';
import type { ClassEntry, Seat, Team } from '../../../types/index.ts';
import { DRIVER_NAMES } from '../constants.ts';
import { fillDrivers } from '../driver-names.ts';

/**
 * A class entry over the seats given.
 * @param seats Its seats
 * @returns The class entry
 */
const makeEntry = (seats: Seat[]): ClassEntry => ({
  id: 'main',
  name: 'Main',
  ladder: { discipline: Discipline.ROAD, tier: 4 },
  seats,
  eligibility: { kind: 'cars', cars: [] },
});

/**
 * A source of numbers that always answers the same.
 * @param value The number
 * @returns The source
 */
const always = (value: number) => (): number => value;

/**
 * The first name the books hold for a nation, which a source always answering
 * zero draws.
 * @param code The nation's code
 * @returns The name
 */
const firstOf = (code: string): string => `${DRIVER_NAMES[code].first[0]} ${DRIVER_NAMES[code].last[0]}`;

const [FIRST_BOOK] = Object.keys(DRIVER_NAMES);

describe('shared/utils/driver-names', () => {
  describe('fillDrivers', () => {
    it('names every empty seat and leaves the named ones alone', () => {
      const named: Seat = { id: 'one', driver: { name: 'Kept Driver', nationCode: 'ITA' } };
      const filled = fillDrivers(makeEntry([named, { id: 'two' }, { id: 'three' }]), [], new Set(), Math.random);

      expect(filled.seats[0]).toBe(named);
      expect(filled.seats.every((seat) => seat.driver?.name)).toBe(true);
      expect(new Set(filled.seats.map((seat) => seat.driver?.name)).size).toBe(3);
    });

    // One from the team's own nation races under it, rather than restating it.
    it('draws a driver from their team\'s nation and leaves the nation to the team', () => {
      const teams: Team[] = [{ id: 'team', name: 'Équipe', nationCode: 'FRA' }];
      const [seat] = fillDrivers(makeEntry([{ id: 'one', team: 'team' }]), teams, new Set(), always(0)).seats;

      expect(seat.driver).toEqual({ name: firstOf('FRA') });
    });

    it('draws half the field from the class\'s most common nation', () => {
      const entry = makeEntry([
        { id: 'one', driver: { name: 'Taken One', nationCode: 'JPN' } },
        { id: 'two', driver: { name: 'Taken Two', nationCode: 'JPN' } },
        { id: 'three' },
      ]);

      expect(fillDrivers(entry, [], new Set(), always(0)).seats[2].driver)
        .toEqual({ name: firstOf('JPN'), nationCode: 'JPN' });
    });

    it('draws the rest from any nation, and says which', () => {
      const entry = makeEntry([{ id: 'one', driver: { name: 'Taken One', nationCode: 'JPN' } }, { id: 'two' }]);
      const books = Object.keys(DRIVER_NAMES);
      const last = books[books.length - 1];

      expect(fillDrivers(entry, [], new Set(), always(0.999)).seats[1].driver?.nationCode).toBe(last);
    });

    it('draws from elsewhere for a team whose nation the books do not cover', () => {
      const teams: Team[] = [{ id: 'team', name: 'Monaco Racing', nationCode: 'MCO' }];
      const [seat] = fillDrivers(makeEntry([{ id: 'one', team: 'team' }]), teams, new Set(), always(0)).seats;

      expect(seat.driver).toEqual({ name: firstOf(FIRST_BOOK), nationCode: FIRST_BOOK });
    });

    // A book this small runs out, so a name already spent gets an initial.
    it('never hands out a name the championship has already spent', () => {
      const taken = new Set([firstOf(FIRST_BOOK)]);
      const [seat] = fillDrivers(makeEntry([{ id: 'one' }]), [], taken, always(0)).seats;
      const { first, last } = DRIVER_NAMES[FIRST_BOOK];

      expect(seat.driver?.name).toBe(`${first[0]} A. ${last[0]}`);
    });

    it('never hands two seats of the class the same name', () => {
      const filled = fillDrivers(makeEntry([{ id: 'one' }, { id: 'two' }]), [], new Set(), always(0));

      expect(filled.seats[0].driver?.name).not.toBe(filled.seats[1].driver?.name);
    });
  });
});
