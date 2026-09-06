import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type { Championship, SeriesSession, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../constants.ts';
import { validateFormat } from '../utils.ts';

/**
 * A championship with one format, which the tests below replace.
 * @param sessions The sessions the format runs
 * @returns The championship and the format to check, which is its only one
 */
const withSessions = (
  sessions: SeriesSession[],
): { series: Championship; format: WeekendFormat } => {
  const format: WeekendFormat = { id: 'standard', name: 'Race weekend', sessions };
  const series: Championship = {
    version: SERIES_FORMAT_VERSION,
    id: 'test-cup',
    name: 'Test Cup',
    entries: [{
      id: 'main',
      name: 'Main',
      ladder: { discipline: Discipline.ROAD, tier: 6 },
      entrants: 8,
      eligibility: { kind: 'cars', cars: ['test_car'] },
    }],
    rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
    weekendFormats: [format],
    defaultWeekendFormat: 'standard',
    pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
    defaultPointsSystem: 'race',
  };

  return { series, format };
};

/**
 * The codes checking a format produced.
 * @param sessions The sessions the format runs
 * @returns One code per problem
 */
const codesFor = (sessions: SeriesSession[]): string[] => {
  const { series, format } = withSessions(sessions);

  return validateFormat(series, format).map((problem) => problem.code);
};

describe('core/series/utils', () => {
  describe('validateFormat', () => {
    it('passes a knockout whose segments each follow the one before', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 15, inherit: { from: 'q1', top: 15 },
        },
        {
          id: 'q3', type: 'qualify', name: 'Q3', minutes: 12, inherit: { from: 'q2', top: 10 },
        },
        {
          type: 'race', name: 'Race', laps: 25, day: 1, inherit: { from: 'q3' },
        },
      ])).toEqual([]);
    });

    it('passes a format that links nothing at all, as every older one does', () => {
      expect(codesFor([
        { type: 'qualify', name: 'Qualifying', minutes: 15 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual([]);
    });

    it('reports two sessions claiming one id, which a link could not tell apart', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        { id: 'q1', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.id.duplicate']);
    });

    it('reports a link to a session the format does not have', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'sq3' },
        },
      ])).toEqual(['series.inherit.unknown']);
    });

    it('reports a link to a session that does not run first', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q2' },
        },
        { id: 'q2', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a session that follows itself', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q1' },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a link to something that classifies nobody', () => {
      // Only a qualifying leaves a classification behind for the next session
      // to follow; advanceWeekend records one for nothing else.
      expect(codesFor([
        { id: 'fp1', type: 'practice', name: 'Practice', minutes: 30 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'fp1' },
        },
      ])).toEqual(['series.inherit.notQualifying']);
    });

    it('reports a link that lets nobody through', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'q1', top: 0 },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.topInvalid']);
    });

    it('names every broken link rather than the first', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'nope', top: -1 },
        },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'also-nope' },
        },
      ])).toEqual([
        'series.inherit.unknown', 'series.inherit.topInvalid', 'series.inherit.unknown',
      ]);
    });
  });
});
