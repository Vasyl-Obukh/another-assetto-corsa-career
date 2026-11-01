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

/**
 * A season of a career's cars: one bought, raced rented and repainted, and
 * another sold.
 */
const GARAGE: readonly LedgerLine[] = [
  line('purchase', -40_000, { key: 'purchase:mx5:0' }),
  line('fee', -1500, { series: 'cup', seriesName: 'Cup' }),
  line('rent', -800, { series: 'cup', seriesName: 'Cup' }),
  line('repaint', -600, { key: 'repaint:mx5:3' }),
  line('sale', 30_000, { key: 'sale:gt86:4' }),
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

    it("counts a round's rent among what racing it cost", () => {
      expect(GARAGE.filter((one) => shownBy(one, 'fees')).map((one) => one.kind)).toEqual(['fee', 'rent']);
    });

    it('shows what the garage bought, sold and repainted to cars, and nothing else', () => {
      expect(GARAGE.filter((one) => shownBy(one, 'cars')).map((one) => one.kind))
        .toEqual(['purchase', 'repaint', 'sale']);
      expect(LEDGER.filter((one) => shownBy(one, 'cars'))).toEqual([]);
    });

    it('shows every line a contract moved to contracts, and keeps them out of prizes and fees', () => {
      const contract: LedgerLine[] = [
        line('seat', -9000),
        line('salary', 2500),
        line('fine', -1500),
        line('bonus', 4000),
        line('release', -800),
        line('refund', 3000),
      ];
      const ledger = [...LEDGER, ...contract];

      expect(ledger.filter((one) => shownBy(one, 'contracts'))).toEqual(contract);
      expect(contract.filter((one) => shownBy(one, 'prizes') || shownBy(one, 'fees') || shownBy(one, 'cars')))
        .toEqual([]);
    });

    it('shows what sponsors paid and took back to sponsors, and keeps it out of every other filter', () => {
      const sponsor: LedgerLine[] = [line('sponsor', 5000), line('sponsorBonus', 1200), line('sponsor', -2000)];
      const ledger = [...LEDGER, ...sponsor];

      expect(ledger.filter((one) => shownBy(one, 'sponsors'))).toEqual(sponsor);
      expect(sponsor.filter((one) => (
        shownBy(one, 'prizes') || shownBy(one, 'fees') || shownBy(one, 'cars') || shownBy(one, 'contracts')
      ))).toEqual([]);
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

    it("weighs a contract's pay among what paid and its charges among what was paid", () => {
      expect(kindTotals([
        line('fine', -1500),
        line('seat', -9000),
        line('salary', 2500),
        line('salary', 2500),
        line('race', 1000),
        line('release', -800),
        line('bonus', 4000),
        line('refund', 3000),
        line('fee', -500),
      ])).toEqual([
        { kind: 'race', amount: 1000 },
        { kind: 'salary', amount: 5000 },
        { kind: 'bonus', amount: 4000 },
        { kind: 'refund', amount: 3000 },
        { kind: 'fee', amount: -500 },
        { kind: 'seat', amount: -9000 },
        { kind: 'fine', amount: -1500 },
        { kind: 'release', amount: -800 },
      ]);
    });

    it('lists a sale among what paid, and the garage after the fees and rent it paid', () => {
      expect(kindTotals(GARAGE)).toEqual([
        { kind: 'sale', amount: 30_000 },
        { kind: 'fee', amount: -1500 },
        { kind: 'rent', amount: -800 },
        { kind: 'purchase', amount: -40_000 },
        { kind: 'repaint', amount: -600 },
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

    it("charges a round's rent to its championship, and the garage to none", () => {
      expect(seriesTotals(GARAGE)).toEqual([{
        series: 'cup', name: 'Cup', season: 0, edition: 0, historic: false, amount: -2300,
      }]);
    });

    it('leaves out the lines that came from no championship', () => {
      expect(seriesTotals([line('opening', 10_000), line('speed', 0)])).toEqual([]);
    });
  });
});
