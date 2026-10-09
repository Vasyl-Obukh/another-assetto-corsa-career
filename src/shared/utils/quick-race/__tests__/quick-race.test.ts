import { describe, expect, it } from '@jest/globals';

import type { QuickClass, QuickRace } from '../../../types/index.ts';
import { SHIPPED_CATALOGUE } from '../../car-classes/index.ts';
import { CLASS_ID_PREFIX, DEFAULT_CLASS_CARS, QUICK_RACE_VERSION } from '../constants.ts';
import {
  addClass,
  carFits,
  classHolds,
  followingClassOf,
  moveClass,
  newQuickRace,
  playerClassOf,
  removeClass,
  withCar,
  withClass,
} from '../quick-race.ts';

/**
 * A class of the given cars.
 * @param id Its id
 * @param cars The cars it races
 * @param over Whatever the test wants said differently
 * @returns The class
 */
const makeClass = (id: string, cars: string[], over: Partial<QuickClass> = {}): QuickClass => ({
  id, name: id, eligibility: { kind: 'cars', cars }, cars: 8, ...over,
});

/**
 * A new race weekend, with whatever the test says differently.
 * @param over What differs
 * @returns The race
 */
const makeRace = (over: Partial<QuickRace> = {}): QuickRace => ({
  ...newQuickRace('race-1', '2026-09-11T18:00:00.000Z'),
  ...over,
});

describe('shared/utils/quick-race', () => {
  describe('newQuickRace', () => {
    it('starts with nothing picked and one short race', () => {
      const race = newQuickRace('race-1', '2026-09-11T18:00:00.000Z');

      expect(race).toMatchObject({
        version: QUICK_RACE_VERSION,
        id: 'race-1',
        createdAt: '2026-09-11T18:00:00.000Z',
        updatedAt: '2026-09-11T18:00:00.000Z',
        track: null,
        car: null,
        classes: [],
        playerClass: null,
      });
      expect(race.sessions).toHaveLength(1);
      expect(race.sessions[0].type).toBe('race');
    });

    // Two races sharing the defaults' own objects would edit each other.
    it('hands every race defaults of its own', () => {
      const one = newQuickRace('one', '2026-09-11T18:00:00.000Z');
      const two = newQuickRace('two', '2026-09-11T18:00:00.000Z');

      expect(one.sessions).not.toBe(two.sessions);
      expect(one.sessions[0]).not.toBe(two.sessions[0]);
      expect(one.conditions).not.toBe(two.conditions);
    });
  });

  describe('playerClassOf', () => {
    it('finds the class the player races in', () => {
      const race = makeRace({ classes: [makeClass('a', []), makeClass('b', [])], playerClass: 'b' });

      expect(playerClassOf(race)?.id).toBe('b');
    });

    it('finds nothing while the player has no class', () => {
      expect(playerClassOf(makeRace({ classes: [makeClass('a', [])] }))).toBeUndefined();
    });
  });

  describe('classHolds', () => {
    it('says whether the class\'s rule names a car', () => {
      const entry = makeClass('a', ['abarth500']);

      expect(classHolds(entry, 'abarth500', SHIPPED_CATALOGUE)).toBe(true);
      expect(classHolds(entry, 'bmw_m3_e30', SHIPPED_CATALOGUE)).toBe(false);
    });
  });

  describe('carFits', () => {
    it('fits a car its class races', () => {
      const race = makeRace({
        car: { model: 'abarth500' }, classes: [makeClass('a', ['abarth500'])], playerClass: 'a',
      });

      expect(carFits(race, SHIPPED_CATALOGUE)).toBe(true);
    });

    it('refuses a car its class does not race', () => {
      const race = makeRace({
        car: { model: 'bmw_m3_e30' }, classes: [makeClass('a', ['abarth500'])], playerClass: 'a',
      });

      expect(carFits(race, SHIPPED_CATALOGUE)).toBe(false);
    });

    // A missing car or class is a problem of its own, said elsewhere.
    it('has nothing to say while the car or the class is missing', () => {
      expect(carFits(makeRace({ classes: [makeClass('a', [])], playerClass: 'a' }), SHIPPED_CATALOGUE)).toBe(true);
      expect(carFits(makeRace({ car: { model: 'abarth500' } }), SHIPPED_CATALOGUE)).toBe(true);
    });
  });

  describe('followingClassOf', () => {
    it('finds the race\'s only class while it races a list of one car', () => {
      const only = makeClass('a', ['abarth500']);

      expect(followingClassOf(makeRace({ classes: [only] }))).toBe(only);
    });

    it('finds nothing while there is no class, or more than one', () => {
      expect(followingClassOf(makeRace())).toBeUndefined();
      expect(followingClassOf(makeRace({
        classes: [makeClass('a', ['abarth500']), makeClass('b', ['bmw_m3_e30'])],
      }))).toBeUndefined();
    });

    it('finds nothing in a class the player has to pick a car from', () => {
      const spec = makeClass('a', [], { eligibility: { kind: 'spec', spec: 'user-spec' } });

      expect(followingClassOf(makeRace({ classes: [makeClass('a', [])] }))).toBeUndefined();
      expect(followingClassOf(makeRace({ classes: [makeClass('a', ['abarth500', 'bmw_m3_e30'])] }))).toBeUndefined();
      expect(followingClassOf(makeRace({ classes: [spec] }))).toBeUndefined();
    });
  });

  describe('withCar', () => {
    it('makes a class of the first car picked, the player\'s own', () => {
      const race = withCar(makeRace(), { model: 'abarth500', skin: 'red' }, 'Abarth 500');

      expect(race.car).toEqual({ model: 'abarth500', skin: 'red' });
      expect(race.classes).toEqual([{
        id: `${CLASS_ID_PREFIX}1`,
        name: 'Abarth 500',
        eligibility: { kind: 'cars', cars: ['abarth500'] },
        cars: DEFAULT_CLASS_CARS,
        fromCar: true,
      }]);
      expect(race.playerClass).toBe(`${CLASS_ID_PREFIX}1`);
    });

    it('swaps the class made from a car for the next car picked, keeping its size and strength', () => {
      const first = withCar(makeRace(), { model: 'abarth500' }, 'Abarth 500');
      const sized = { ...first, classes: [{ ...first.classes[0], cars: 4, grid: { strength: 3 } }] };
      const race = withCar(sized, { model: 'bmw_m3_e30' }, 'BMW M3 E30');

      expect(race.classes).toEqual([{
        id: first.classes[0].id,
        name: 'BMW M3 E30',
        eligibility: { kind: 'cars', cars: ['bmw_m3_e30'] },
        cars: 4,
        grid: { strength: 3 },
        fromCar: true,
      }]);
    });

    // The bug this guards: editing the class's size, or anything else, used to
    // pin it to its car, so the picker narrowed to that car alone.
    it('keeps a lone class of one car following the car whatever else is edited', () => {
      const first = withCar(makeRace(), { model: 'abarth500' }, 'Abarth 500');
      const sized = withClass(first, first.classes[0].id, { cars: 4 });
      const race = withCar(sized, { model: 'bmw_m3_e30' }, 'BMW M3 E30');

      expect(race.classes).toEqual([{
        id: first.classes[0].id,
        name: 'BMW M3 E30',
        eligibility: { kind: 'cars', cars: ['bmw_m3_e30'] },
        cars: 4,
        fromCar: true,
      }]);
    });

    it('follows a lone class of one car the player named, keeping their name', () => {
      const own = makeClass('a', ['abarth500'], { name: 'Sunday Cup' });
      const race = withCar(makeRace({ classes: [own] }), { model: 'bmw_m3_e30' }, 'BMW M3 E30');

      expect(race.classes).toEqual([makeClass('a', ['bmw_m3_e30'], { name: 'Sunday Cup' })]);
      expect(race.playerClass).toBe('a');
    });

    it('leaves a class of several cars alone', () => {
      const own = makeClass('a', ['abarth500', 'bmw_m3_e30']);
      const race = withCar(makeRace({ classes: [own], playerClass: 'a' }), { model: 'bmw_m3_e30' }, 'BMW M3 E30');

      expect(race.car).toEqual({ model: 'bmw_m3_e30' });
      expect(race.classes).toEqual([own]);
    });

    it('leaves the classes alone once there are several', () => {
      const classes = [makeClass('a', ['abarth500'], { fromCar: true }), makeClass('b', ['bmw_m3_e30'])];
      const race = withCar(makeRace({ classes, playerClass: 'a' }), { model: 'bmw_m3_e30' }, 'BMW M3 E30');

      expect(race.classes).toBe(classes);
    });
  });

  describe('withClass', () => {
    it('changes the one class it names', () => {
      const race = withClass(makeRace({ classes: [makeClass('a', []), makeClass('b', [])] }), 'b', { cars: 3 });

      expect(race.classes.map((one) => one.cars)).toEqual([8, 3]);
    });

    it('makes the name of a class named after the player\'s car their own', () => {
      const race = withClass(makeRace({ classes: [makeClass('a', [], { fromCar: true })] }), 'a', { name: 'Mine' });

      expect(race.classes[0]).toEqual(makeClass('a', [], { name: 'Mine' }));
    });

    it('leaves a class named after the player\'s car named after it through any other edit', () => {
      const race = withClass(makeRace({ classes: [makeClass('a', [], { fromCar: true })] }), 'a', { grid: { strength: 2 } });

      expect(race.classes[0]).toEqual(makeClass('a', [], { fromCar: true, grid: { strength: 2 } }));
    });
  });

  describe('addClass', () => {
    it('adds an empty class after the others, under an id none of them spends', () => {
      const { race, id } = addClass(makeRace({
        classes: [makeClass(`${CLASS_ID_PREFIX}1`, []), makeClass(`${CLASS_ID_PREFIX}3`, [])],
        playerClass: `${CLASS_ID_PREFIX}1`,
      }), 'GT4');

      expect(id).toBe(`${CLASS_ID_PREFIX}2`);
      expect(race.classes.at(-1)).toEqual({
        id, name: 'GT4', eligibility: { kind: 'cars', cars: [] }, cars: DEFAULT_CLASS_CARS,
      });
      expect(race.playerClass).toBe(`${CLASS_ID_PREFIX}1`);
    });

    it('puts the player in the first class there is', () => {
      const { race, id } = addClass(makeRace(), 'GT3');

      expect(race.playerClass).toBe(id);
    });

    it('leaves a class named after the player\'s car named after it', () => {
      const { race } = addClass(makeRace({ classes: [makeClass('a', [], { fromCar: true })], playerClass: 'a' }), 'GT4');

      expect(race.classes[0].fromCar).toBe(true);
    });
  });

  describe('removeClass', () => {
    it('takes the class out and leaves the player where they were', () => {
      const race = removeClass(makeRace({ classes: [makeClass('a', []), makeClass('b', [])], playerClass: 'a' }), 'b');

      expect(race.classes.map((one) => one.id)).toEqual(['a']);
      expect(race.playerClass).toBe('a');
    });

    it('moves a player whose class goes to the first one left', () => {
      const race = removeClass(makeRace({ classes: [makeClass('a', []), makeClass('b', [])], playerClass: 'a' }), 'a');

      expect(race.playerClass).toBe('b');
    });

    it('leaves the player in no class once none is left', () => {
      expect(removeClass(makeRace({ classes: [makeClass('a', [])], playerClass: 'a' }), 'a').playerClass).toBeNull();
    });
  });

  describe('moveClass', () => {
    const race = makeRace({ classes: [makeClass('a', []), makeClass('b', []), makeClass('c', [])] });

    it('moves a class later or earlier in the order', () => {
      expect(moveClass(race, 'a', 1).classes.map((one) => one.id)).toEqual(['b', 'a', 'c']);
      expect(moveClass(race, 'c', -2).classes.map((one) => one.id)).toEqual(['c', 'a', 'b']);
    });

    it('stops at either end', () => {
      expect(moveClass(race, 'b', 5).classes.map((one) => one.id)).toEqual(['a', 'c', 'b']);
      expect(moveClass(race, 'a', -1)).toBe(race);
    });

    it('leaves the race as it was for a class it does not hold', () => {
      expect(moveClass(race, 'ghost', 1)).toBe(race);
    });
  });
});
