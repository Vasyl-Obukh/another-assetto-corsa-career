import { describe, expect, it } from '@jest/globals';

import type { QuickClass, QuickRace, RaceDefinition } from '../../../shared/types/index.ts';
import { SHIPPED_CATALOGUE } from '../../../shared/utils/car-classes/index.ts';
import { newQuickRace } from '../../../shared/utils/quick-race/index.ts';
import { makeContent } from '../../series/__tests__/fixtures.ts';
import { roundRaceId } from '../../series/index.ts';
import { defaultWeatherOffer } from '../../weather-forecast/index.ts';
import { QUICK_ROUND } from '../constants.ts';
import {
  lowerQuickRace, quickChampionship, quickProblems, quickRaceId,
} from '../quick-race.ts';

/**
 * A class of the quick race below.
 * @param id Its id
 * @param cars How many AI cars it fields
 * @param car The one car it races
 * @returns The class
 */
const quickClass = (id: string, cars: number, car = 'test_car'): QuickClass => ({
  id, name: id.toUpperCase(), eligibility: { kind: 'cars', cars: [car] }, cars,
});

/**
 * A quick race that can be lowered: a track, a car, and one class of four
 * holding the player.
 * @param overrides What to change about it
 * @returns The race
 */
const makeRace = (overrides: Partial<QuickRace> = {}): QuickRace => ({
  ...newQuickRace('quick-1', '2026-05-01T12:00:00.000Z'),
  track: { id: 'magione' },
  car: { model: 'test_car' },
  classes: [quickClass('main', 4)],
  playerClass: 'main',
  ...overrides,
});

/**
 * The problem codes a race has.
 * @param race The race
 * @returns One code per problem
 */
const codesOf = (race: QuickRace): string[] => (
  quickProblems(race, makeContent(), SHIPPED_CATALOGUE).map((problem) => problem.code)
);

describe('core/quick-race', () => {
  describe('quickRaceId', () => {
    it('is the id of the one round the race lowers into', () => {
      expect(quickRaceId(makeRace())).toBe(roundRaceId('quick-1', QUICK_ROUND));
    });
  });

  describe('quickChampionship', () => {
    it('writes each class as a class entry of as many seats as it fields', () => {
      const series = quickChampionship(makeRace({
        classes: [quickClass('main', 4), quickClass('other', 2, 'oval_car')],
      }), 'Sunday');

      expect(series.entries.map((entry) => [entry.id, entry.seats.length])).toEqual([['main', 4], ['other', 2]]);
    });

    it('gives the player a seat in their class however few it fields', () => {
      const series = quickChampionship(makeRace({ classes: [quickClass('main', 0)] }), 'Sunday');

      expect(series.entries[0].seats).toHaveLength(1);
    });

    it('leaves out a class that fields nobody, the player\'s apart', () => {
      const series = quickChampionship(makeRace({
        classes: [quickClass('main', 4), quickClass('empty', 0)],
      }), 'Sunday');

      expect(series.entries.map((entry) => entry.id)).toEqual(['main']);
    });

    it('names every seat, nobody twice', () => {
      const series = quickChampionship(makeRace({
        classes: [quickClass('main', 12), quickClass('other', 12, 'oval_car')],
      }), 'Sunday');
      const names = series.entries.flatMap((entry) => entry.seats.map((seat) => seat.driver?.name));

      expect(names.every((name) => typeof name === 'string' && name !== '')).toBe(true);
      expect(new Set(names).size).toBe(names.length);
    });

    // Drawn off the race's own id, so the field reads the same from one look
    // at the race to the next.
    it('names the same drivers every time it is asked', () => {
      expect(quickChampionship(makeRace(), 'Sunday')).toEqual(quickChampionship(makeRace(), 'Sunday'));
    });

    it('runs one round at the race\'s track, of its sessions, paying no points', () => {
      const race = makeRace();
      const series = quickChampionship(race, 'Sunday');

      expect(series.rounds).toEqual([{
        id: QUICK_ROUND, name: 'Sunday', track: { id: 'magione' }, conditions: race.conditions,
      }]);
      expect(series.eventFormats[0].sessions).toEqual(race.sessions);
      expect(series.pointsSystems[0].positions).toEqual([]);
    });

    it('carries the race\'s regulations and grid only when it states them', () => {
      expect(quickChampionship(makeRace(), 'Sunday')).not.toHaveProperty('regulations');

      const series = quickChampionship(makeRace({ regulations: { penalties: false }, grid: { strength: 2 } }), 'Sunday');

      expect(series).toMatchObject({ regulations: { penalties: false }, grid: { strength: 2 } });
    });
  });

  describe('quickProblems', () => {
    it('has nothing against a race that can be lowered', () => {
      expect(codesOf(makeRace())).toEqual([]);
    });

    it('asks for a track and a car first', () => {
      expect(codesOf(makeRace({ track: null, car: null }))).toEqual(['quick.track.none', 'quick.car.none']);
    });

    it('names a class the install cannot field', () => {
      const problems = quickProblems(
        makeRace({ classes: [quickClass('main', 4), quickClass('ghost', 2, 'not_installed')] }),
        makeContent(),
        SHIPPED_CATALOGUE,
      );

      expect(problems).toEqual([expect.objectContaining({ code: 'quick.class.noCars', params: { class: 'GHOST' } })]);
    });

    // A fixed bug: a class set to no cars never races, so nothing it names
    // being missing can stop the race.
    it('says nothing of a class that fields nobody', () => {
      expect(codesOf(makeRace({
        classes: [quickClass('main', 4), quickClass('ghost', 0, 'not_installed')],
      }))).toEqual([]);
    });

    it('says when the player\'s car is not one their class races', () => {
      const problems = quickProblems(makeRace({ car: { model: 'oval_car' } }), makeContent(), SHIPPED_CATALOGUE);

      expect(problems).toEqual([expect.objectContaining({ code: 'quick.car.notInClass' })]);
    });
  });

  describe('lowerQuickRace', () => {
    /**
     * Lowers a race against the fixture content, as an ordinary difficulty.
     * @param race The race
     * @returns What it launches as
     */
    const lower = (race: QuickRace): RaceDefinition => lowerQuickRace(
      race, 'Sunday', makeContent(), SHIPPED_CATALOGUE, defaultWeatherOffer(makeContent()), { strength: 90, aggression: 30 },
    );

    it('launches under the quick race\'s own id and title', () => {
      expect(lower(makeRace())).toMatchObject({ id: quickRaceId(makeRace()), name: 'Sunday' });
    });

    it('fields every class, the player in the last seat of their own', () => {
      const race = lower(makeRace({ classes: [quickClass('main', 4), quickClass('other', 3, 'oval_car')] }));

      expect(race.grid?.size).toBe(7);
      expect(race.grid?.opponents?.map((car) => car.entry)).toEqual(['main', 'main', 'main', 'other', 'other', 'other']);
      expect(race.playerCar).toMatchObject({ model: 'test_car', entry: 'main', seat: 'main-4' });
    });

    it('races the race\'s own sessions at its track', () => {
      const race = lower(makeRace());

      expect(race.track).toEqual({ id: 'magione' });
      expect(race.sessions).toEqual(makeRace().sessions);
    });
  });
});
