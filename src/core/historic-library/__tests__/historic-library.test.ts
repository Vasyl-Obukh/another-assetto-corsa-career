import { describe, expect, it } from '@jest/globals';

import { Discipline, SeasonLength, Weekday } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION, validateSeries } from '../../series/index.ts';
import { SHIPPED_SERIES } from '../../series-library/index.ts';
import { historicProblems, loadHistoricLibrary, SHIPPED_HISTORIC } from '../index.ts';

/**
 * A historic event that is one in every respect, for a test to break.
 * @param overrides What to change about it
 * @returns The event
 */
const historic = (overrides: Partial<Championship> = {}): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'british-gp-1967',
  name: 'British Grand Prix 1967',
  entries: [{
    id: 'f1',
    name: 'F1',
    ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
    seats: [{ id: 'f1-1' }, { id: 'f1-2' }],
    eligibility: { kind: 'cars', cars: ['lotus_49'] },
  }],
  rounds: [{ id: 'gp', name: 'British Grand Prix 1967', track: { id: 'ks_silverstone1967' } }],
  eventFormats: [{ id: 'gp', name: 'British Grand Prix 1967', sessions: [{ type: 'race', laps: 10, day: 0 }] }],
  defaultEventFormat: 'gp',
  pointsSystems: [{ id: 'none', name: 'No points', positions: [] }],
  defaultPointsSystem: 'none',
  ...overrides,
});

/**
 * The codes of a historic event's own problems.
 * @param event The event
 * @returns Every code, in order
 */
const codes = (event: Championship): string[] => historicProblems(event).map((problem) => problem.code);

describe('core/historic-library', () => {
  describe('SHIPPED_HISTORIC', () => {
    // The compiler checks the shipped events' spelling and nothing else, as it
    // does for the championships; this is what catches the rest.
    it.each(SHIPPED_HISTORIC.map(({ series }) => [series.id, series] as const))(
      'ships %s with nothing structurally wrong with it',
      (unused, series) => {
        expect(validateSeries(series)).toEqual([]);
      },
    );

    it.each(SHIPPED_HISTORIC.map(({ series }) => [series.id, series] as const))(
      'ships %s as a historic event: one round, no points, no calendar of its own',
      (unused, series) => {
        expect(historicProblems(series)).toEqual([]);
      },
    );

    it('gives every shipped historic event an id of its own', () => {
      const ids = SHIPPED_HISTORIC.map(({ series }) => series.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    // A career files results under the id, and a season holds championships
    // and historic events side by side.
    it('shares no id with a shipped championship', () => {
      const championships = new Set(SHIPPED_SERIES.map((series) => series.id));

      expect(SHIPPED_HISTORIC.map(({ series }) => series.id).filter((id) => championships.has(id))).toEqual([]);
    });
  });

  describe('loadHistoricLibrary', () => {
    it('reads the shipped historic events without a user directory to look in', async () => {
      const library = await loadHistoricLibrary();

      expect(library.problems).toEqual([]);
      expect(library.series.map((one) => one.series.id).sort())
        .toEqual(SHIPPED_HISTORIC.map(({ series }) => series.id).sort());
      expect(library.series.every((one) => one.origin === 'shipped')).toBe(true);
    });
  });

  describe('historicProblems', () => {
    it('finds nothing wrong with a historic event', () => {
      expect(historicProblems(historic())).toEqual([]);
    });

    it('refuses an event of more than one round', () => {
      const rounds = [...historic().rounds, { id: 'two', name: 'Two', track: { id: 'monza' } }];

      expect(codes(historic({ rounds }))).toEqual(['historic.rounds']);
    });

    it('refuses an event of no rounds at all', () => {
      expect(codes(historic({ rounds: [] }))).toEqual(['historic.rounds']);
    });

    it('refuses a points table that pays for a finish', () => {
      expect(codes(historic({ pointsSystems: [{ id: 'none', name: 'Points', positions: [9, 6] }] })))
        .toEqual(['historic.points']);
    });

    it('refuses a points table that pays for qualifying or the fastest lap', () => {
      expect(codes(historic({ pointsSystems: [{ id: 'none', name: 'Points', positions: [], qualifying: [1] }] })))
        .toEqual(['historic.points']);
      expect(codes(historic({ pointsSystems: [{ id: 'none', name: 'Points', positions: [], fastestLap: 1 }] })))
        .toEqual(['historic.points']);
    });

    it('lets a points table list places that pay nothing', () => {
      expect(historicProblems(historic({ pointsSystems: [{ id: 'none', name: 'Points', positions: [0, 0] }] })))
        .toEqual([]);
    });

    it('names every points table that pays, one problem each', () => {
      const pointsSystems = [
        { id: 'a', name: 'A', positions: [1] },
        { id: 'b', name: 'B', positions: [1] },
      ];

      expect(historicProblems(historic({ pointsSystems })).map((problem) => problem.params))
        .toEqual([
          { event: 'British Grand Prix 1967', system: 'A' },
          { event: 'British Grand Prix 1967', system: 'B' },
        ]);
    });

    it('refuses a season length or a race day, which belong to a calendar', () => {
      expect(codes(historic({ seasonLength: SeasonLength.YEAR }))).toEqual(['historic.calendar']);
      expect(codes(historic({ raceWeekday: Weekday.SUNDAY }))).toEqual(['historic.calendar']);
    });
  });
});
