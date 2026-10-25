// What a class place pays: which purse it is paid from, and at what speed a
// career is paid it. Shared because main pays the money and the renderer shows
// the same amounts.

import type { Career, Championship, PrizeMoney } from '../../types/index.ts';

/**
 * One of a class's prize tables: its own where it states that table, the
 * championship's otherwise - each table stands alone.
 * @param championship The championship or historic event
 * @param entry The class entry's id
 * @param table Which table - per race or per final standing
 * @returns The table, the winner first, empty where nothing pays
 */
export const prizeTable = (
  championship: Championship,
  entry: string | null | undefined,
  table: keyof PrizeMoney,
): readonly number[] => (
  championship.entries.find((one) => one.id === entry)?.prizes?.[table] ?? championship.prizes?.[table] ?? []
);

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
