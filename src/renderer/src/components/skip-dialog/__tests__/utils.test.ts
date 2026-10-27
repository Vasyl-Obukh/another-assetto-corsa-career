import { describe, expect, it } from '@jest/globals';

import type {
  SeasonEntry, SeasonEvent, SkippedRound, SkipReason,
} from '../../../../../shared/types';
import { finishesSeason, skipGroups } from '../utils.ts';

/**
 * One round a move would cost.
 * @param series Its championship
 * @param round The round
 * @param reason Why it is listed
 * @returns The round
 */
const skipped = (series: string, round: string, reason: SkipReason = 'skipped'): SkippedRound => ({
  series,
  edition: 0,
  seriesName: series.toUpperCase(),
  round,
  roundName: round,
  number: 1,
  ladder: null,
  date: '2026-05-03',
  reason,
  historic: false,
  fine: null,
});

/**
 * The edition a standalone championship races, holding only what the season's
 * end is read from.
 * @param statuses Each round's status, by its id
 * @returns The edition
 */
const edition = (statuses: Record<string, SeasonEvent['status']>): SeasonEntry => ({
  series: 'f2',
  edition: 0,
  events: Object.entries(statuses).map(([round, status]) => ({ round, status })),
}) as unknown as SeasonEntry;

describe('renderer/components/skip-dialog/utils', () => {
  describe('skipGroups', () => {
    it('groups rounds under their championships in the order each first appears', () => {
      const groups = skipGroups([skipped('f2', 'r1'), skipped('gt3', 'r1'), skipped('f2', 'r2', 'partway')]);

      expect(groups.map((group) => [group.key, group.seriesName, group.rounds.map((one) => one.round)])).toEqual([
        ['f2', 'F2', ['r1', 'r2']],
        ['gt3', 'GT3', ['r1']],
      ]);
    });

    it('gathers the events on the same day last, under a heading of their own', () => {
      const groups = skipGroups([skipped('f2', 'r3', 'clash'), skipped('gt3', 'r1'), skipped('tcr', 'r2', 'clash')]);

      expect(groups.map((group) => [group.key, group.seriesName, group.rounds.length])).toEqual([
        ['gt3', 'GT3', 1],
        ['clash', null, 2],
      ]);
    });

    it('lists nothing for a move that costs nothing', () => {
      expect(skipGroups([])).toEqual([]);
    });
  });

  describe('finishesSeason', () => {
    it('finishes the season when every round still to run is skipped', () => {
      const entry = edition({ r1: 'raced', r2: 'scheduled', r3: 'scheduled' });

      expect(finishesSeason(entry, [skipped('f2', 'r2'), skipped('f2', 'r3', 'unraceable')])).toBe(true);
    });

    it('leaves the season open while a round is left to race', () => {
      const entry = edition({ r1: 'scheduled', r2: 'scheduled' });

      expect(finishesSeason(entry, [skipped('f2', 'r1', 'unraceable')])).toBe(false);
    });

    it("counts only the edition's own rounds, not another championship's of the same id", () => {
      const entry = edition({ r1: 'scheduled' });

      expect(finishesSeason(entry, [skipped('gt3', 'r1', 'unraceable')])).toBe(false);
    });

    it('finishes nothing outside a standalone championship', () => {
      expect(finishesSeason(null, [skipped('f2', 'r1', 'unraceable')])).toBe(false);
    });
  });
});
