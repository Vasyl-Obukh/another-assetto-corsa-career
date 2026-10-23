// A career's ledger read for its Finances page: each line with the money held
// once it landed, a season's figures, and what each kind of line and each
// championship came to. Derived on every read - the ledger itself is the only
// thing stored.

import {
  BREAKDOWN, CAR_KINDS, PRIZE_KINDS, ROUND_COST_KINDS,
} from './constants.ts';
import type {
  KindTotal, LedgerFilter, LedgerRow, MoneyFigures, SeriesTotal,
} from './types.ts';
import type { LedgerLine } from '../../../../shared/types';

/**
 * What a set of lines came to.
 * @param lines The lines
 * @returns Their amounts, summed
 */
const sumOf = (lines: readonly LedgerLine[]): number => lines.reduce((sum, line) => sum + line.amount, 0);

/**
 * A ledger's lines with the money held once each landed, oldest first.
 * @param ledger The career's ledger
 * @returns The rows
 */
export const ledgerRows = (ledger: readonly LedgerLine[]): LedgerRow[] => {
  let balance = 0;

  return ledger.map((line) => {
    balance += line.amount;

    return { line, balance };
  });
};

/**
 * Every season a ledger has a line in, newest first.
 * @param ledger The career's ledger
 * @returns The seasons' indices
 */
export const ledgerSeasons = (ledger: readonly LedgerLine[]): number[] => (
  [...new Set(ledger.map((line) => line.season))].sort((left, right) => right - left)
);

/**
 * Whether a line is one a filter shows.
 * @param line The line
 * @param filter The filter
 * @returns True when it is shown
 */
export const shownBy = (line: LedgerLine, filter: LedgerFilter): boolean => {
  if (filter === 'prizes') return PRIZE_KINDS.includes(line.kind);
  if (filter === 'fees') return ROUND_COST_KINDS.includes(line.kind);
  if (filter === 'cars') return CAR_KINDS.includes(line.kind);

  return true;
};

/**
 * A stretch of a ledger in figures.
 * @param rows The ledger's rows, oldest first
 * @param season Which season, or null for every one
 * @returns The figures
 */
export const moneyFigures = (rows: readonly LedgerRow[], season: number | null): MoneyFigures => {
  const inside = rows.filter((row) => season === null || row.line.season === season).map((row) => row.line);
  // The last line of an earlier season, which a season with none yet opens on too.
  const before = season === null ? undefined : rows.findLast((row) => row.line.season < season);

  return {
    earned: sumOf(inside.filter((line) => line.amount > 0 && line.kind !== 'opening')),
    spent: sumOf(inside.filter((line) => line.amount < 0)),
    // The opening balance is a line of the first season, and what it opens on.
    opened: (before?.balance ?? 0) + sumOf(inside.filter((line) => line.kind === 'opening')),
    prizes: inside.filter((line) => line.kind === 'race' || line.kind === 'historic').length,
    fees: inside.filter((line) => line.kind === 'fee').length,
  };
};

/**
 * What each kind of line that moves money came to, leaving out the kinds that
 * came to nothing.
 * @param lines The lines
 * @returns One total per kind, in the breakdown's order
 */
export const kindTotals = (lines: readonly LedgerLine[]): KindTotal[] => BREAKDOWN
  .map((kind) => ({
    kind,
    amount: sumOf(lines.filter((line) => line.kind === kind)),
  }))
  .filter((total) => total.amount !== 0);

/**
 * What each championship and historic event came to, most first.
 * @param lines The lines
 * @returns One total per championship
 */
export const seriesTotals = (lines: readonly LedgerLine[]): SeriesTotal[] => {
  const totals = new Map<string, SeriesTotal>();
  for (const line of lines) {
    if (line.series === undefined) continue;
    const held = totals.get(line.series);
    totals.set(line.series, {
      series: line.series,
      name: line.seriesName ?? line.series,
      season: line.season,
      edition: line.edition ?? 0,
      historic: line.kind === 'historic' || held?.historic === true,
      amount: (held?.amount ?? 0) + line.amount,
    });
  }

  return [...totals.values()].sort((left, right) => right.amount - left.amount);
};
