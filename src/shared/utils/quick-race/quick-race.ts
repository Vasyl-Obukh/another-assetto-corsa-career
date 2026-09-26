// Editing a quick race. Pure, and shared, because the Race tab edits one as the
// player types and main makes a new one and reads whether the player's car fits
// its class - and the renderer may not import core.

import {
  CLASS_ID_PREFIX, DEFAULT_CLASS_CARS, DEFAULT_CONDITIONS, DEFAULT_SESSIONS, QUICK_RACE_VERSION,
} from './constants.ts';
import type {
  ClassCatalogue, QuickClass, QuickRace,
} from '../../types/index.ts';
import { carsOf } from '../eligibility/index.ts';

/**
 * A new race weekend: no track, no car and no classes, one short race.
 * @param id Its identifier
 * @param now When it is made, as an ISO timestamp
 * @returns The race
 */
export const newQuickRace = (id: string, now: string): QuickRace => ({
  version: QUICK_RACE_VERSION,
  id,
  createdAt: now,
  updatedAt: now,
  track: null,
  car: null,
  classes: [],
  playerClass: null,
  sessions: structuredClone(DEFAULT_SESSIONS),
  conditions: { ...DEFAULT_CONDITIONS },
});

/**
 * The class the player races in.
 * @param race The race
 * @returns The class, or undefined while there is none
 */
export const playerClassOf = (race: QuickRace): QuickClass | undefined => (
  race.classes.find((one) => one.id === race.playerClass)
);

/**
 * Whether a car may race in a class.
 * @param entry The class
 * @param car The car's folder name
 * @param catalogue The class catalogue a spec resolves against
 * @returns True when the class's rule names the car
 */
export const classHolds = (entry: QuickClass, car: string, catalogue: ClassCatalogue): boolean => (
  carsOf(entry.eligibility, catalogue).includes(car)
);

/**
 * Whether the player's car is one their class races. Nothing to say while
 * either is missing, which reads as fitting: those are other problems.
 * @param race The race
 * @param catalogue The class catalogue a spec resolves against
 * @returns False only when the car is picked and its class does not hold it
 */
export const carFits = (race: QuickRace, catalogue: ClassCatalogue): boolean => {
  const entry = playerClassOf(race);
  if (!race.car || !entry) return true;

  return classHolds(entry, race.car.model, catalogue);
};

/**
 * An id no class of the race spends yet.
 * @param classes The race's classes
 * @returns The id
 */
const nextClassId = (classes: readonly QuickClass[]): string => {
  const taken = new Set(classes.map((one) => one.id));
  let number = 1;
  while (taken.has(`${CLASS_ID_PREFIX}${number}`)) number += 1;

  return `${CLASS_ID_PREFIX}${number}`;
};

/**
 * Puts the player in a car.
 *
 * With no classes yet, the car becomes the first: a field of that car alone,
 * the player's own. While that class is still the only one and untouched, it
 * follows the car - so trying a few cars before settling never leaves a field
 * of the first one behind. Any other class is the player's to change, and is
 * left alone.
 * @param race The race
 * @param car The car and livery picked
 * @param name What the car is called, which names a class made from it
 * @returns The race in that car
 */
export const withCar = (
  race: QuickRace,
  car: NonNullable<QuickRace['car']>,
  name: string,
): QuickRace => {
  const only = race.classes.length === 1 ? race.classes[0] : undefined;
  const made: QuickClass = {
    id: only?.id ?? nextClassId([]),
    name,
    eligibility: { kind: 'cars', cars: [car.model] },
    cars: only?.cars ?? DEFAULT_CLASS_CARS,
    ...(only?.grid ? { grid: only.grid } : {}),
    fromCar: true,
  };

  if (race.classes.length === 0 || only?.fromCar) {
    return {
      ...race, car, classes: [made], playerClass: made.id,
    };
  }

  return { ...race, car };
};

/**
 * Edits one class. An edited class is the player's own from then on, so one
 * made from their car stops following it.
 * @param race The race
 * @param id The class's id
 * @param patch What changes
 * @returns The race with the class changed
 */
export const withClass = (race: QuickRace, id: string, patch: Partial<Omit<QuickClass, 'id'>>): QuickRace => ({
  ...race,
  classes: race.classes.map((one) => {
    if (one.id !== id) return one;
    const { fromCar: unused, ...rest } = { ...one, ...patch };

    return rest;
  }),
});

/**
 * Adds a class, with no cars yet, after the others. The first class is the
 * player's; adding a second makes a class taken from their car their own.
 * @param race The race
 * @param name What to call it
 * @returns The race and the new class's id
 */
export const addClass = (race: QuickRace, name: string): { race: QuickRace; id: string } => {
  const id = nextClassId(race.classes);
  const added: QuickClass = {
    id, name, eligibility: { kind: 'cars', cars: [] }, cars: DEFAULT_CLASS_CARS,
  };
  const classes = race.classes.map(({ fromCar: unused, ...rest }) => rest);

  return {
    id,
    race: {
      ...race,
      classes: [...classes, added],
      playerClass: race.playerClass ?? id,
    },
  };
};

/**
 * Takes a class out. A player whose class goes moves to the first one left.
 * @param race The race
 * @param id The class's id
 * @returns The race without it
 */
export const removeClass = (race: QuickRace, id: string): QuickRace => {
  const classes = race.classes.filter((one) => one.id !== id);

  return {
    ...race,
    classes,
    playerClass: race.playerClass === id ? (classes[0]?.id ?? null) : race.playerClass,
  };
};

/**
 * Moves a class to another place in the order the field lines up in.
 * @param race The race
 * @param id The class's id
 * @param by How far to move it, positive being later
 * @returns The race with the class moved
 */
export const moveClass = (race: QuickRace, id: string, by: number): QuickRace => {
  const at = race.classes.findIndex((one) => one.id === id);
  const to = Math.min(Math.max(at + by, 0), race.classes.length - 1);
  if (at < 0 || to === at) return race;

  const classes = [...race.classes];
  const [moved] = classes.splice(at, 1);
  classes.splice(to, 0, moved);

  return { ...race, classes };
};
