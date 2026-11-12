// Names for the seats a championship leaves empty, drawn from per-nation books
// of common first names and surnames. Shared because the championship editor
// names a class's empty seats when asked, and a quick race names every seat of
// the field it builds.

import {
  COMMON_NATION_SHARE, DRIVER_NAMES, INITIALS, NAME_TRIES,
} from './constants.ts';
import type { ClassEntry, Seat, Team } from '../../types/index.ts';

/**
 * Picks one of a list at random.
 * @param list The list, which may not be empty
 * @param random A source of numbers in [0, 1)
 * @returns One of its items
 */
const pick = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)];

/**
 * Draws one person's name off the books: from the nation asked for where the
 * books cover it, and any nation they cover otherwise.
 * @param nation The nation they should come from, as Assetto Corsa's code
 * @param random A source of numbers in [0, 1)
 * @returns Their name and the nation it came from
 */
export const drawName = (nation: string | undefined, random: () => number): { name: string; nation: string } => {
  const code = nation !== undefined && nation in DRIVER_NAMES ? nation : pick(Object.keys(DRIVER_NAMES), random);
  const book = DRIVER_NAMES[code];

  return { name: `${pick(book.first, random)} ${pick(book.last, random)}`, nation: code };
};

/**
 * Names every seat of a class that has no driver, leaving the named ones alone.
 *
 * A driver comes from their team's nation where the team has one the name
 * books cover, and otherwise from the class's most common nation half the time
 * and any nation the rest, so a grid reads as a mix with a centre of gravity.
 * Nobody is given a name already in the championship.
 * @param entry The class entry
 * @param teams Every team the championship fields
 * @param taken Every driver name already spent
 * @param random A source of numbers in [0, 1), Math.random unless a test says
 * otherwise
 * @returns The class entry, its empty seats named
 */
export const fillDrivers = (
  entry: ClassEntry,
  teams: readonly Team[],
  taken: ReadonlySet<string>,
  random: () => number = Math.random,
): ClassEntry => {
  const spent = new Set(taken);
  const books = Object.keys(DRIVER_NAMES);

  /**
   * The nation a seat's team races under.
   * @param seat The seat
   * @returns Its code, or undefined when the seat has no team or the team no nation
   */
  const teamNation = (seat: Seat): string | undefined => teams.find((team) => team.id === seat.team)?.nationCode;

  const counts = new Map<string, number>();
  entry.seats.forEach((seat) => {
    const code = seat.driver?.nationCode ?? teamNation(seat);
    if (code !== undefined && code in DRIVER_NAMES) counts.set(code, (counts.get(code) ?? 0) + 1);
  });
  const common = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];

  /**
   * The nation one seat's driver comes from.
   * @param seat The seat
   * @returns A code the name books cover
   */
  const nationOf = (seat: Seat): string => {
    const own = teamNation(seat);
    if (own !== undefined && own in DRIVER_NAMES) return own;

    return common !== undefined && random() < COMMON_NATION_SHARE ? common : pick(books, random);
  };

  return {
    ...entry,
    seats: entry.seats.map((seat) => {
      if (seat.driver?.name) return seat;
      const code = nationOf(seat);
      const book = DRIVER_NAMES[code];
      let name = `${pick(book.first, random)} ${pick(book.last, random)}`;
      for (let tries = 0; spent.has(name) && tries < NAME_TRIES; tries += 1) {
        name = `${pick(book.first, random)} ${pick(book.last, random)}`;
      }
      // A book this small can run out; an initial tells two drivers apart.
      if (spent.has(name)) name = name.replace(' ', ` ${pick(INITIALS, random)}. `);
      spent.add(name);

      // One from the team's own nation inherits it rather than restating it.
      return { ...seat, driver: code === teamNation(seat) ? { name } : { name, nationCode: code } };
    }),
  };
};
