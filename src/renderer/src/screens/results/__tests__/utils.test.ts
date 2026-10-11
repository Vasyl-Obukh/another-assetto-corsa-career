import { describe, expect, it } from '@jest/globals';

import type { SeasonEntry, SessionType } from '../../../../../shared/types';
import { ALL_CHAMPIONSHIPS, NO_CHAMPIONSHIP } from '../constants.ts';
import type { ResultsCriteria } from '../types.ts';
import { filterEvents } from '../utils.ts';
import type { ResultEvent, ResultSession } from '@/lib/result-events';

/**
 * One archived session of an event, at a track.
 * @param type Which kind of session it was
 * @param track The track AC recorded, and the layout's name
 * @returns The session
 */
const session = (type: SessionType, track = 'magione'): ResultSession => ({
  record: {
    file: `${track}-${type}.json`,
    recordedAt: '2026-03-08T14:00:00Z',
    summary: { track, sessions: [] },
    layout: { id: track, layout: '', name: `Autodromo ${track}` },
  },
  session: { type: 3, name: type, standings: [], order: 'raceResult' } as unknown as ResultSession['session'],
  type,
  name: null,
  player: null,
  place: null,
  position: null,
});

/**
 * An event no championship ran, or a round of one when given its origin.
 * @param overrides What to change about it
 * @returns The event
 */
const event = (overrides: Partial<ResultEvent> = {}): ResultEvent => ({
  key: 'quick',
  origin: null,
  quick: null,
  title: 'Sunday blast',
  sessions: [session('practice'), session('qualify'), session('race')],
  from: '2026-03-08T12:00:00Z',
  to: '2026-03-08T14:00:00Z',
  ...overrides,
});

/**
 * A round of a championship the career entered, as an archive's origin.
 * @param series The championship's id
 * @param name Its name
 * @param round The round's id and name
 * @returns The origin
 */
const origin = (series: string, name: string, round: string): ResultEvent['origin'] => ({
  season: 0,
  entry: {
    series,
    entry: 'main',
    championship: { id: series, name, rounds: [{ id: round, name: round }] },
  } as unknown as SeasonEntry,
  round,
  launch: 0,
});

/**
 * The page's filters, with nothing narrowed unless a test says so.
 * @param overrides What to narrow
 * @returns The criteria
 */
const criteria = (overrides: Partial<ResultsCriteria> = {}): ResultsCriteria => ({
  search: '',
  kind: 'all',
  championship: ALL_CHAMPIONSHIPS,
  ...overrides,
});

describe('renderer/screens/results/utils', () => {
  describe('filterEvents', () => {
    const quick = event();
    const round = event({ key: 'gt3-spa', origin: origin('gt3', 'GT3 Cup', 'Spa'), title: 'GT3 Cup' });

    it('keeps every event whole when nothing is narrowed', () => {
      expect(filterEvents([quick, round], criteria())).toEqual([quick, round]);
    });

    it('keeps only the sessions of the kind asked for', () => {
      const [shown] = filterEvents([quick], criteria({ kind: 'qualify' }));

      expect(shown.sessions.map((one) => one.type)).toEqual(['qualify']);
    });

    it('drops an event left with no session of the kind asked for', () => {
      const practiceOnly = event({ sessions: [session('practice')] });

      expect(filterEvents([practiceOnly], criteria({ kind: 'race' }))).toEqual([]);
    });

    it('keeps the rounds of the championship asked for', () => {
      expect(filterEvents([quick, round], criteria({ championship: 'gt3' }))).toEqual([round]);
    });

    it('keeps the events no championship ran when asked for those', () => {
      expect(filterEvents([quick, round], criteria({ championship: NO_CHAMPIONSHIP }))).toEqual([quick]);
    });

    it('matches the search against the championship, the round and the track', () => {
      expect(filterEvents([quick, round], criteria({ search: 'cup' }))).toEqual([round]);
      expect(filterEvents([quick, round], criteria({ search: 'spa' }))).toEqual([round]);
      expect(filterEvents([quick, round], criteria({ search: 'autodromo' }))).toEqual([quick, round]);
    });

    it('matches the search against an event\'s own title', () => {
      expect(filterEvents([quick, round], criteria({ search: 'blast' }))).toEqual([quick]);
    });

    it('keeps the order it was handed', () => {
      expect(filterEvents([round, quick], criteria())).toEqual([round, quick]);
    });
  });
});
