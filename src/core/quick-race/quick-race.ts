// Lowering a quick race. It is written as a one-round championship and lowered
// by roundRace, so its field is drawn, offset and liveried exactly as a
// championship round's is, its classes line up and score as a multi-class
// round's do, and nothing about running it knows it was ever anything else.

import {
  QUICK_FORMAT, QUICK_POINTS, QUICK_ROUND, QUICK_TIER,
} from './constants.ts';
import { SERIES_FORMAT_VERSION } from '../../shared/constants/index.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import { Discipline } from '../../shared/types/index.ts';
import type {
  AiBase,
  Championship,
  ClassCatalogue,
  ClassEntry,
  Content,
  QuickClass,
  QuickRace,
  RaceDefinition,
  WeatherOffer,
} from '../../shared/types/index.ts';
import { fillDrivers } from '../../shared/utils/driver-names/index.ts';
import { carFits, playerClassOf } from '../../shared/utils/quick-race/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';
import { eligibleCars, roundRace, roundRaceId } from '../series/index.ts';

/**
 * The race id a quick race launches under, which its archives and its event
 * progress carry.
 * @param race The quick race
 * @returns The id
 */
export const quickRaceId = (race: QuickRace): string => roundRaceId(race.id, QUICK_ROUND);

/**
 * Whether a race id is a quick race's, which is one event however many days
 * its sessions ran over.
 * @param raceId The id an archive or a plan carries
 * @returns True for an id quickRaceId wrote
 */
export const isQuickRaceId = (raceId: string): boolean => raceId.endsWith(`/${QUICK_ROUND}`);

/**
 * Which classes a quick race puts on the grid: every one with cars in it, and
 * the player's, which holds them however many it lists.
 * @param race The quick race
 * @returns A test for one class
 */
const fields = (race: QuickRace): ((one: QuickClass) => boolean) => (
  (one) => one.cars > 0 || one.id === race.playerClass
);

/**
 * A quick race as the championship it lowers through: one class entry per
 * class, one round at its track, one event format of its sessions, and a
 * points table that pays nothing.
 *
 * Every seat is named, from the nation books the editor fills empty seats
 * from, and the names are drawn off the race's own id - so they stay put
 * between one look at the race and the next. The player's class holds them as
 * one of its seats; the lowering leaves its last seat out for them.
 * @param race The quick race
 * @param title What it goes by, which names the round
 * @returns The championship
 */
export const quickChampionship = (race: QuickRace, title: string): Championship => {
  const taken = new Set<string>();
  const entries = race.classes
    .filter(fields(race))
    .map((one): ClassEntry => {
      const seats = Math.max(one.cars, one.id === race.playerClass ? 1 : 0);
      const named = fillDrivers(
        {
          id: one.id,
          name: one.name,
          ladder: { discipline: Discipline.ROAD, tier: QUICK_TIER },
          seats: Array.from({ length: seats }, (unused, at) => ({ id: `${one.id}-${at + 1}` })),
          eligibility: one.eligibility,
          ...(one.grid ? { grid: one.grid } : {}),
        },
        [],
        taken,
        randomFrom(seedFrom(`${one.id}\u0000${race.id}\u0000drivers`)),
      );
      named.seats.forEach((seat) => { if (seat.driver?.name) taken.add(seat.driver.name); });

      return named;
    });

  return {
    version: SERIES_FORMAT_VERSION,
    id: race.id,
    name: title,
    entries,
    rounds: [{
      id: QUICK_ROUND,
      name: title,
      track: race.track ?? { id: '' },
      conditions: race.conditions,
    }],
    eventFormats: [{ id: QUICK_FORMAT, name: title, sessions: race.sessions }],
    defaultEventFormat: QUICK_FORMAT,
    pointsSystems: [{ id: QUICK_POINTS, name: title, positions: [] }],
    defaultPointsSystem: QUICK_POINTS,
    ...(race.regulations ? { regulations: race.regulations } : {}),
    ...(race.grid ? { grid: race.grid } : {}),
  };
};

/**
 * What stops a quick race being lowered at all, in the order it is worth
 * fixing: a track, a car, classes the install can field, and the car in its
 * class. Anything past that - a track not installed, too few pit boxes - is
 * validateRace's and the planner's to say, once it lowers.
 * @param race The quick race
 * @param content Installed content to resolve the classes against
 * @param catalogue The class catalogue a spec resolves against
 * @returns The problems, empty when it can be lowered
 */
export const quickProblems = (
  race: QuickRace,
  content: Content,
  catalogue: ClassCatalogue,
): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];
  if (!race.track?.id) problems.push(appErrorInfo('quick.track.none', {}));
  if (!race.car) problems.push(appErrorInfo('quick.car.none', {}));

  race.classes
    .filter(fields(race))
    .filter((one) => eligibleCars(one.eligibility, content, catalogue).length === 0)
    .forEach((one) => problems.push(appErrorInfo('quick.class.noCars', { class: one.name })));

  const entry = playerClassOf(race);
  if (race.car && entry && !carFits(race, catalogue)) {
    const name = content.cars.find((car) => car.id === race.car?.model)?.name ?? race.car.model;
    problems.push(appErrorInfo('quick.car.notInClass', { car: name, class: entry.name }));
  }

  return problems;
};

/**
 * Lowers a quick race into the race it launches as.
 * @param race The quick race, which quickProblems has nothing against
 * @param title What it goes by
 * @param content Installed content to resolve cars and liveries against
 * @param catalogue The class catalogue a spec resolves against
 * @param offer What the install and settings can race in
 * @param base The player's AI difficulty, which every offset is laid over
 * @returns The race definition, ready for validateRace and planEvent
 * @throws When it cannot be lowered - quickProblems says why beforehand
 */
export const lowerQuickRace = (
  race: QuickRace,
  title: string,
  content: Content,
  catalogue: ClassCatalogue,
  offer: WeatherOffer,
  base: AiBase,
): RaceDefinition => {
  const lowered = roundRace(
    {
      series: quickChampionship(race, title),
      entry: race.playerClass ?? '',
      round: QUICK_ROUND,
      car: race.car ?? { model: '' },
    },
    content,
    catalogue,
    offer,
    base,
  );

  return { ...lowered, id: quickRaceId(race), name: title };
};
