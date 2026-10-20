import { describe, expect, it } from '@jest/globals';

import type { LedgerLine } from '../../../../../shared/types';
import {
  kindTotals, ledgerRows, ledgerSeasons, moneyFigures, seriesTotals, shownBy,
} from '../finances.ts';

/**
 * Builds a ledger line.
 * @param kind What kind of line it is
 * @param amount What it moved
 * @param over Whatever the test wants said differently
 * @returns The line
 */
const line = (kind: LedgerLine['kind'], amount: number, over: Partial<LedgerLine> = {}): LedgerLine => ({
  key: `${kind}:${amount}:${over.season ?? 0}:${over.series ?? ''}`,
  kind,
  date: '2027-03-07',
  season: 0,
  amount,
  ...over,
});

/**
 * Two seasons of a career: opened on 10,000, a fee and two prizes in the
 * first, a change of speed and a fee and a final standing in the second.
 */
const LEDGER: readonly LedgerLine[] = [
  line('opening', 10_000),
  line('fee', -1500, { series: 'cup', seriesName: 'Cup' }),
  line('race', 4000, { series: 'cup', seriesName: 'Cup' }),
  line('historic', 6000, { series: 'spa-1966', seriesName: 'Spa 1966' }),
  line('speed', 0, { season: 1, speed: { from: 1, to: 2 } }),
  line('fee', -2000, { season: 1, series: 'cup', seriesName: 'Cup', edition: 0 }),
  line('standings', 30_000, { season: 1, series: 'cup', seriesName: 'Cup', edition: 0 }),
];

describe('renderer/lib/finances/finances', () => {
  describe('ledgerRows', () => {
    it('carries the money held once each line landed', () => {
      expect(ledgerRows(LEDGER).map((row) => row.balance))
        .toEqual([10_000, 8500, 12_500, 18_500, 18_500, 16_500, 46_500]);
    });
  });

  describe('ledgerSeasons', () => {
    it('lists every season a line falls in, newest first, once each', () => {
      expect(ledgerSeasons(LEDGER)).toEqual([1, 0]);
    });

    it('lists none for an empty ledger', () => {
      expect(ledgerSeasons([])).toEqual([]);
    });
  });

  describe('shownBy', () => {
    it('shows every line to no filter, the prizes to prizes and the fees to fees', () => {
      expect(LEDGER.filter((one) => shownBy(one, 'all'))).toHaveLength(LEDGER.length);
      expect(LEDGER.filter((one) => shownBy(one, 'prizes')).map((one) => one.kind))
        .toEqual(['race', 'historic', 'standings']);
      expect(LEDGER.filter((one) => shownBy(one, 'fees')).map((one) => one.kind)).toEqual(['fee', 'fee']);
    });
  });

  describe('moneyFigures', () => {
    const rows = ledgerRows(LEDGER);

    it('counts what came in apart from the opening balance, and what went out', () => {
      expect(moneyFigures(rows, 0)).toEqual({
        earned: 10_000, spent: -1500, opened: 10_000, prizes: 2, fees: 1,
      });
    });

    it('opens a later season on what the one before it left', () => {
      expect(moneyFigures(rows, 1)).toEqual({
        earned: 30_000, spent: -2000, opened: 18_500, prizes: 0, fees: 1,
      });
    });

    it('weighs every season at once where none is picked', () => {
      expect(moneyFigures(rows, null)).toMatchObject({ earned: 40_000, spent: -3500, opened: 10_000 });
    });

    // Fixed: a season just opened, with nothing posted yet, said it opened on
    // nothing while the balance beside it said otherwise.
    it('opens a season with no lines yet on what the seasons before it left', () => {
      expect(moneyFigures(rows, 2)).toEqual({
        earned: 0, spent: 0, opened: 46_500, prizes: 0, fees: 0,
      });
    });
  });

  describe('kindTotals', () => {
    it('totals each kind that moved money, what paid first and what was paid last', () => {
      expect(kindTotals(LEDGER)).toEqual([
        { kind: 'race', amount: 4000 },
        { kind: 'standings', amount: 30_000 },
        { kind: 'historic', amount: 6000 },
        { kind: 'fee', amount: -3500 },
      ]);
    });

    it('leaves out a kind that came to nothing', () => {
      expect(kindTotals([line('fee', -100), line('race', 100)]).map((one) => one.kind)).toEqual(['race', 'fee']);
      expect(kindTotals([line('opening', 10_000), line('speed', 0)])).toEqual([]);
    });
  });

  describe('seriesTotals', () => {
    it('totals each championship net of its fees, most first, as it was last raced', () => {
      expect(seriesTotals(LEDGER)).toEqual([
        {
          series: 'cup', name: 'Cup', season: 1, edition: 0, historic: false, amount: 30_500,
        },
        {
          series: 'spa-1966', name: 'Spa 1966', season: 0, edition: 0, historic: true, amount: 6000,
        },
      ]);
    });

    it('leaves out the lines that came from no championship', () => {
      expect(seriesTotals([line('opening', 10_000), line('speed', 0)])).toEqual([]);
    });
  });
});
