// A standalone championship read off the career it is kept as: the one edition
// its one season entered, and where the player stands in it. Shared because
// main lists them and refuses what they cannot do, and the renderer heads the
// window and the championship's page with the same answer.

import type {
  Career, ChampionshipStanding, SeasonEntry,
} from '../../types/index.ts';
import { editionOver } from '../editions/index.ts';

/**
 * The edition a standalone championship races.
 * @param career The career
 * @returns Its one season entry, or null for a career, which may hold any
 * number
 */
export const standaloneEntry = (career: Pick<Career, 'kind' | 'seasons'>): SeasonEntry | null => (
  career.kind === 'championship' ? career.seasons[0]?.entries[0] ?? null : null
);

/**
 * Where a standalone championship stands: how far through its rounds it is,
 * the player's place and points in their class, and whether it is over.
 * @param career The career
 * @returns Where it stands, or null for a career
 */
export const standaloneStanding = (
  career: Pick<Career, 'kind' | 'seasons' | 'date'>,
): ChampionshipStanding | null => {
  const entry = standaloneEntry(career);
  if (!entry) return null;

  const table = entry.standings.classes.find((one) => one.entry === entry.entry);
  // The player's own row, never the stand-in who raced a round they missed.
  const row = table?.drivers.find((one) => one.seat === entry.playerSeat && !one.substitute);
  const scored = entry.events.some((event) => event.score !== undefined);

  return {
    rounds: entry.events.length,
    done: entry.events.filter((event) => event.status !== 'scheduled').length,
    position: row && scored ? row.position : null,
    points: row?.points ?? 0,
    over: editionOver(entry, career.date),
  };
};
