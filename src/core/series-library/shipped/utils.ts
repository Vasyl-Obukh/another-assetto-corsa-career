// Constructors for the two things every shipped entry list is made of, and for
// a filler championship made of another.
//
// An entry list is a table, and these keep each row to a line: written out as
// object literals, twenty drivers are a hundred and forty lines nobody can scan
// for a missing nationality.

import {
  FILLER_AI_STEP, FILLER_MONEY_GROWTH, FILLER_MONEY_ROUNDING, FILLER_RACE_GROWTH,
} from './constants.ts';
import { TeamBudget } from '../../../shared/types/index.ts';
import type {
  Championship, PrizeMoney, Seat, SeriesSession, Team,
} from '../../../shared/types/index.ts';

/**
 * Builds one team of a shipped championship.
 * @param id Stable identifier, unique within the championship
 * @param name Display name
 * @param nationality Full nationality name
 * @param nationCode Three-letter nation code
 * @param budget How well funded the team is
 * @returns The team
 */
export const team = (
  id: string,
  name: string,
  nationality: string,
  nationCode: string,
  budget: TeamBudget = TeamBudget.INDEPENDENT,
): Team => ({
  id, name, nationality, nationCode, budget,
});

/**
 * Builds one seat of a shipped championship.
 *
 * No car and no livery, which is true of everything the app ships: a shipped
 * championship cannot know which liveries a user's copy of a mod installs, so
 * pinning one is left to the editor.
 * @param id Stable identifier, unique across the championship
 * @param teamId Which team fields it
 * @param name Driver name
 * @param nationality Full nationality name
 * @param nationCode Three-letter nation code
 * @param aiLevel AI skill, where the class's own spread gets this seat wrong
 * @returns The seat
 */
export const seat = (
  id: string,
  teamId: string,
  name: string,
  nationality: string,
  nationCode: string,
  aiLevel?: number,
): Seat => ({
  id,
  team: teamId,
  driver: { name, nationality, nationCode },
  aiLevel,
});

/**
 * Builds a filler championship: the rung below repeated in an empty rung of
 * the ladder, with longer races.
 *
 * Derived rather than written out, so a filler always races exactly what its
 * base does - same field, same calendar, same rules - and differs only in what
 * a step up the ladder should change: the tier, the races' length, the AI and
 * the money.
 * @param base The championship being repeated
 * @param step How many rungs above it this one stands, from 1
 * @param description What the filler says about itself
 * @returns The filler championship
 */
export const filler = (base: Championship, step: number, description: string): Championship => {
  const scale = 1 + FILLER_RACE_GROWTH * step;
  const longer = <L extends Pick<SeriesSession, 'laps' | 'minutes' | 'distance'>>(length: L): L => ({
    ...length,
    ...(length.minutes === undefined ? {} : { minutes: Math.round(length.minutes * scale) }),
    ...(length.laps === undefined ? {} : { laps: Math.round(length.laps * scale) }),
    ...(length.distance === undefined ? {} : { distance: Math.round(length.distance * scale) }),
  });
  const money = (amounts: readonly number[] | undefined): number[] | undefined => amounts?.map(
    (amount) => Math.round((amount * (1 + FILLER_MONEY_GROWTH * step)) / FILLER_MONEY_ROUNDING)
      * FILLER_MONEY_ROUNDING,
  );
  const purse = (prizes: PrizeMoney | undefined): PrizeMoney | undefined => prizes && {
    positions: money(prizes.positions), standings: money(prizes.standings),
  };
  const fee = (amount: number | undefined): number | undefined => money(
    amount === undefined ? undefined : [amount],
  )?.[0];
  // A round's own length replaces its format's outright, so it grows too.
  const races = new Set(base.weekendFormats.flatMap((format) => format.sessions
    .filter((session) => session.type === 'race')
    .map((session) => session.id)));
  const grid = base.grid ?? {};

  return {
    ...base,
    id: `${base.id}${'-plus'.repeat(step)}`,
    name: `${base.name} ${'+'.repeat(step)}`,
    description,
    entries: base.entries.map((entry) => ({
      ...entry,
      ladder: { ...entry.ladder, tier: entry.ladder.tier - step },
      ...(entry.prizes === undefined ? {} : { prizes: purse(entry.prizes) }),
    })),
    weekendFormats: base.weekendFormats.map((format) => ({
      ...format,
      sessions: format.sessions.map((session) => (session.type === 'race' ? longer(session) : session)),
    })),
    rounds: base.rounds.map((round) => ({
      ...round,
      ...(round.entryFee === undefined ? {} : { entryFee: fee(round.entryFee) }),
      ...(round.sessionLengths === undefined ? {} : {
        sessionLengths: round.sessionLengths.map((length) => (
          races.has(length.session) ? longer(length) : length
        )),
      }),
    })),
    grid: {
      ...grid,
      ...(grid.aiLevel === undefined ? {} : { aiLevel: grid.aiLevel + FILLER_AI_STEP * step }),
      ...(grid.aiLevelMin === undefined
        ? {}
        : { aiLevelMin: grid.aiLevelMin + FILLER_AI_STEP * step }),
    },
    ...(base.entryFee === undefined ? {} : { entryFee: fee(base.entryFee) }),
    ...(base.prizes === undefined ? {} : { prizes: purse(base.prizes) }),
  };
};
