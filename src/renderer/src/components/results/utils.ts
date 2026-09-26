import { COMPACT_TOP } from './constants.ts';
import type { DriverRow } from '@/lib/season-results';

/**
 * The rows a compact table keeps: the top of the table, and the player with
 * whoever is either side of them.
 * @param rows Every row, best placed first
 * @returns The rows kept, each saying whether rows were skipped before it
 */
export const compactRows = (rows: readonly DriverRow[]): { row: DriverRow; gap: boolean }[] => {
  const player = rows.findIndex((row) => row.player);
  const kept = rows.flatMap((unused, at) => (
    at < COMPACT_TOP || (player >= 0 && Math.abs(at - player) <= 1) ? [at] : []
  ));

  return kept.map((at, index) => ({ row: rows[at], gap: index > 0 && at - kept[index - 1] > 1 }));
};
