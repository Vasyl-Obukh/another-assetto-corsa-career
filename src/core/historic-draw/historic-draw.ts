// Drawing a season's historic events, pure and seeded: one per stretch of the
// season, each stretch seeded on its own place rather than on the draws before
// it, which only take what they drew out of its pool.

import { INVITATION_CERTAIN, SLOT_DAYS, SLOT_MONTHS } from './constants.ts';
import type {
  HistoricDrawRequest, HistoricPick, HistoricRung, HistoricSeat, HistoricSlot,
} from './types.ts';
import {
  daysFrom, isHistoricDay, monthStart, pickOne,
} from './utils.ts';
import type {
  CareerSeason, Championship, ClassEntry, Discipline, HistoricFrequency,
} from '../../shared/types/index.ts';
import { addDays } from '../../shared/utils/calendar-days/index.ts';
import { randomFrom, seedFrom, shuffle } from '../seeded-random/index.ts';

export type {
  HistoricDrawRequest, HistoricPick, HistoricRung, HistoricSeat, HistoricSlot,
} from './types.ts';

/**
 * The stretches of a season that each draw one historic event.
 *
 * Quarters and months follow the calendar; fortnights and weeks count from 1
 * January, the last running to the season's end however short that leaves it.
 * @param season The season
 * @param frequency How often it draws one
 * @returns The stretches, in order - none when historic events are off
 */
export const historicSlots = (
  season: Pick<CareerSeason, 'startDate' | 'endDate'>,
  frequency: HistoricFrequency,
): HistoricSlot[] => {
  const days = SLOT_DAYS[frequency];
  const months = SLOT_MONTHS[frequency];
  const slots: HistoricSlot[] = [];

  for (let from = season.startDate; from <= season.endDate;) {
    let next: string | null = null;
    if (days !== undefined) next = addDays(from, days);
    else if (months !== undefined) next = monthStart(from, months);
    if (next === null) break;

    const to = addDays(next, -1);
    slots.push({ index: slots.length, from, to: to < season.endDate ? to : season.endDate });
    from = next;
  }

  return slots;
};

/**
 * Draws a season's historic events.
 *
 * Each stretch takes one event the season has not drawn yet and puts it on a
 * weekday inside the stretch, preferring a day the career races nothing else.
 * A stretch already behind `from` draws nothing, and the draw stops once the
 * pool has nothing left to give, rather than racing one event twice a year.
 * @param request What the draw is made over
 * @returns The events drawn, in the order of their stretches
 */
export const planHistoric = (request: HistoricDrawRequest): HistoricPick[] => {
  const taken = new Set<string>();
  const busy = new Set(request.busy);
  const picks: HistoricPick[] = [];

  for (const slot of request.slots) {
    const days = daysFrom(slot.from > request.from ? slot.from : request.from, slot.to).filter(isHistoricDay);
    const left = request.pool.filter((id) => !taken.has(id));
    if (days.length === 0) continue;
    if (left.length === 0) break;

    // Nothing that varies ends the seed, since seedFrom is a running hash and
    // seeds that differ only at their end land within a hair of each other -
    // with the salt last, every season drew the same events.
    const random = randomFrom(seedFrom(`${slot.index}\u0000${request.salt}\u0000historic`));
    const id = shuffle(left, random)[0];
    const free = days.filter((day) => !busy.has(day));
    const date = pickOne(free.length > 0 ? free : days, random);

    taken.add(id);
    busy.add(date);
    picks.push({ id, date });
  }

  return picks;
};

/**
 * The classes of a historic event an invitation may be to: those that can
 * field a car at all, narrowed - given the player's rungs - to the discipline
 * they hold the highest rung in, and among those to the classes whose own
 * tier is nearest it.
 * @param event The historic event
 * @param eligible The installed cars each class may race, by class entry id
 * @param levels The rung the player holds in each discipline, 1 being the top
 * @returns The classes, and the discipline and rung that chose them - null for
 * both without the player's rungs
 */
const invitedClasses = (
  event: Championship,
  eligible: ReadonlyMap<string, readonly string[]>,
  levels?: Readonly<Record<Discipline, number>>,
): { classes: ClassEntry[]; rung: HistoricRung | null } => {
  const fielded = event.entries.filter((entry) => entry.seats.length > 0 && (eligible.get(entry.id) ?? []).length > 0);
  if (!levels || fielded.length === 0) return { classes: fielded, rung: null };

  const rungOf = (entry: ClassEntry): number => levels[entry.ladder.discipline];
  const best = Math.min(...fielded.map(rungOf));
  const onBest = fielded.filter((entry) => rungOf(entry) === best);
  const nearest = Math.min(...onBest.map((entry) => Math.abs(entry.ladder.tier - best)));
  const classes = onBest.filter((entry) => Math.abs(entry.ladder.tier - best) === nearest);

  return { classes, rung: { discipline: classes[0].ladder.discipline, rung: best } };
};

/**
 * The rung that decides a historic event's invitation: the highest the player
 * holds among the disciplines of the classes it can field.
 * @param event The historic event
 * @param eligible The installed cars each class may race, by class entry id
 * @param levels The rung the player holds in each discipline, 1 being the top
 * @returns The discipline and the rung, or null when no class has a car to race
 */
export const historicRung = (
  event: Championship,
  eligible: ReadonlyMap<string, readonly string[]>,
  levels: Readonly<Record<Discipline, number>>,
): HistoricRung | null => invitedClasses(event, eligible, levels).rung;

/**
 * Whether a historic event's invitation comes, on a seeded draw at a chance.
 * @param event The historic event
 * @param chance The chance of one, as a percentage
 * @param salt What makes this season's invitation its own
 * @returns True when one comes
 */
export const invitationDrawn = (event: Championship, chance: number, salt: string): boolean => (
  // Nothing that varies ends the seed, as in planHistoric.
  randomFrom(seedFrom(`${event.id}\u0000${salt}\u0000invite`))() * INVITATION_CERTAIN < chance
);

/**
 * The seat a historic event invites the player to.
 *
 * A seeded pick of a class that can field a car at all - given the player's
 * rungs, one of those `invitedClasses` narrows to - a seat of it, and the car
 * that seat races: the one it names where that is installed and eligible, and
 * otherwise one of the class's eligible cars.
 * @param event The historic event
 * @param eligible The installed cars each class may race, by class entry id
 * @param salt What makes this season's invitation its own
 * @param levels The rung the player holds in each discipline, when the
 * invitation follows them
 * @returns The seat, or null when no class has a car to race
 */
export const historicSeat = (
  event: Championship,
  eligible: ReadonlyMap<string, readonly string[]>,
  salt: string,
  levels?: Readonly<Record<Discipline, number>>,
): HistoricSeat | null => {
  const { classes } = invitedClasses(event, eligible, levels);
  if (classes.length === 0) return null;

  const random = randomFrom(seedFrom(`${event.id}\u0000${salt}\u0000seat`));
  const entry = pickOne(classes, random);
  const seat = pickOne(entry.seats, random);
  const cars = eligible.get(entry.id) ?? [];
  const named = seat.car?.model !== undefined && cars.includes(seat.car.model) ? seat.car.model : null;

  return {
    entry: entry.id,
    seat: seat.id,
    car: named === null
      ? { model: pickOne(cars, random) }
      : { model: named, ...(seat.car?.skin === undefined ? {} : { skin: seat.car.skin }) },
  };
};

/**
 * A historic event with one seat moved to the end of its class.
 *
 * The end of a class is where every lowering, every field draw and every
 * simulation takes the player's seat from, so moving the seat the player was
 * invited to there is all it takes to put them in it.
 * @param event The historic event
 * @param entry The class, by its class entry id
 * @param seat The seat, by its id
 * @returns The event, with that class's seats reordered
 */
export const withPlayerSeat = (event: Championship, entry: string, seat: string): Championship => ({
  ...event,
  entries: event.entries.map((one) => {
    const held = one.seats.find((candidate) => candidate.id === seat);
    if (one.id !== entry || !held) return one;

    return { ...one, seats: [...one.seats.filter((candidate) => candidate !== held), held] };
  }),
});
