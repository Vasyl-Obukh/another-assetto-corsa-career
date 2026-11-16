// What a class place pays: which purse it is paid from, how much of it a class
// pays, and at what speed a career is paid it. Shared because main pays the
// money and the renderer shows the same amounts.

import { FULL_FIELD } from './constants.ts';
import type {
  Career, Championship, ClassEntry, Discipline, InvitationDraw, PrizeMoney, SeasonEntry,
} from '../../types/index.ts';
import { rungFee } from '../career-eligibility/index.ts';

/**
 * One of a class's prize tables: its own where it states that table, the
 * championship's otherwise - each table stands alone.
 * @param championship The championship or historic event
 * @param entry The class entry's id
 * @param table Which table - per race or per final standing
 * @returns The table, the winner first, empty where nothing pays
 */
export const prizeTable = (
  championship: Pick<Championship, 'entries' | 'prizes'>,
  entry: string | null | undefined,
  table: keyof PrizeMoney,
): readonly number[] => (
  championship.entries.find((one) => one.id === entry)?.prizes?.[table] ?? championship.prizes?.[table] ?? []
);

/**
 * How much of what its tables say a class pays: all of it on a full grid and
 * in proportion to its field on a smaller one, so a place among three cars is
 * not paid as one among twenty - and a historic event raced from a rung below
 * its class's, what that rung's fees are to the class's, as a sponsor's
 * figures scale.
 * @param entry The class
 * @param rung The rung a historic event is raced from, 1 being the top -
 * absent for a championship
 * @returns The share, from 0 to 1
 */
export const classShare = (entry: Pick<ClassEntry, 'seats' | 'ladder'>, rung?: number): number => {
  const field = Math.min(1, entry.seats.length / FULL_FIELD);
  const { tier } = entry.ladder;

  return rung !== undefined && rung > tier ? field * (rungFee(rung) / rungFee(tier)) : field;
};

/**
 * How much of what its tables say one of a championship's classes pays -
 * `classShare`'s answer, all of it for a class it does not hold. Not to be
 * confused with a contract's `prizeShare`, the player's cut of what this pays.
 * @param championship The championship or historic event
 * @param entry The class entry's id
 * @param rung The rung a historic event is raced from - absent for a
 * championship
 * @returns The share, from 0 to 1
 */
export const purseShare = (
  championship: Pick<Championship, 'entries'>,
  entry: string | null | undefined,
  rung?: number,
): number => {
  const held = championship.entries.find((one) => one.id === entry);

  return held ? classShare(held, rung) : 1;
};

/**
 * One of a class's prize tables as it is paid, before the career's speed: the
 * table times the class's share.
 * @param championship The championship or historic event
 * @param entry The class entry's id
 * @param table Which table - per race or per final standing
 * @param rung The rung a historic event is raced from - absent for a
 * championship
 * @returns The amounts, the winner first, empty where nothing pays
 */
export const paidTable = (
  championship: Pick<Championship, 'entries' | 'prizes'>,
  entry: string | null | undefined,
  table: keyof PrizeMoney,
  rung?: number,
): number[] => {
  const share = purseShare(championship, entry, rung);

  return prizeTable(championship, entry, table).map((amount) => amount * share);
};

/**
 * The highest rung a career holds among the disciplines of a historic event's
 * classes, every class counted - the rung its purse is paid at where no
 * invitation has decided one.
 * @param event The historic event
 * @param level The rung the career holds in each discipline, 1 being the top
 * @returns The rung, or undefined for an event with no classes
 */
export const eventRung = (
  event: Pick<Championship, 'entries'>,
  level: Readonly<Record<Discipline, number>>,
): number | undefined => {
  const rungs = event.entries.map((entry) => level[entry.ladder.discipline]);

  return rungs.length > 0 ? Math.min(...rungs) : undefined;
};

/**
 * The rung a historic event's purse is paid at for a career: the one its entry
 * keeps once it is in - none for an entry made before purses were scaled,
 * which pays in full - and until then the rung its invitation was decided on,
 * or else the career's own.
 * @param event The historic event
 * @param career The career
 * @param held The career's entry in it, once it has one
 * @param invitation What its invitations came to, once they have gone out
 * @returns The rung, 1 being the top - undefined to pay in full
 */
export const purseRung = (
  event: Pick<Championship, 'entries'>,
  career: Pick<Career, 'level'>,
  held?: Pick<SeasonEntry, 'rung'> | null,
  invitation?: Pick<InvitationDraw, 'rung'> | null,
): number | undefined => (held ? held.rung : invitation?.rung ?? eventRung(event, career.level));

/**
 * A prize as the career is paid it, at its progression speed.
 * @param amount What the purse says
 * @param speed The career's progression speed
 * @returns The amount, in whole units
 */
export const scaledPrize = (amount: number, speed: number): number => Math.round(amount * speed);

/**
 * The speed a career is paid its prizes at: its own progression speed, or the
 * purse as it stands in a standalone championship, which has no money.
 * @param career The career, or null outside one
 * @returns The speed
 */
export const prizeSpeed = (career: Pick<Career, 'kind' | 'settings'> | null): number => (
  career?.kind === 'career' ? career.settings.prizeSpeed : 1
);
