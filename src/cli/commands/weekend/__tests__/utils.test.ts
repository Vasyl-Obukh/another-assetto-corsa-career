import {
  describe, expect, it, jest,
} from '@jest/globals';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  GridEntry, SessionDefinition, WeekendLaunch, WeekendPlan, WeekendState,
} from '../../../../shared/types/index.ts';
import {
  clearState, describeGrid, describePlan, loadState, saveState, stateFile,
} from '../utils.ts';

jest.mock('node:fs/promises');

// src/cli/constants.ts derives PROJECT_ROOT from import.meta.dirname, which
// Jest's CommonJS cannot express at all, so importing it fails to parse. Faking
// it is also what keeps these tests off the real progress folder.
jest.mock('../../../constants.ts', () => ({ WEEKENDS_DIR: 'weekends-dir' }));

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const mkdirMock = jest.mocked(mkdir);
const rmMock = jest.mocked(rm);

/**
 * A six-car entry list, the player first.
 */
const grid: GridEntry[] = Array.from({ length: 6 }, (unused, index) => ({
  model: 'test_car',
  skin: `skin_${index}`,
  driver: index === 0 ? 'Player' : `AI ${index}`,
  nationality: '',
  nationCode: '',
  setup: '',
  ballast: 0,
  restrictor: 0,
  ...(index === 0 ? {} : { aiLevel: 95 - index, aiAggression: 30 }),
}));

/**
 * Builds one launch of the plan below, which runs the one session it names.
 * @param index Position in the launch list
 * @param session The session this launch runs
 * @param launch What this launch does differently
 * @returns A complete WeekendLaunch
 */
const makeLaunch = (
  index: number,
  session: SessionDefinition,
  launch: Partial<WeekendLaunch> = {},
): WeekendLaunch => ({
  index,
  day: 0,
  session,
  race: {
    id: 'test-weekend',
    name: 'Test Weekend',
    track: { id: 'test_track' },
    playerCar: { model: 'test_car' },
    sessions: [session],
    conditions: { trackState: 'green' },
  },
  ...launch,
});

/**
 * A three-launch plan - practice, qualifying, then a race the day after - which
 * is one launch per session.
 * @returns A fresh WeekendPlan
 */
const makePlan = (): WeekendPlan => ({
  raceId: 'test-weekend',
  raceName: 'Test Weekend',
  grid,
  launches: [
    makeLaunch(0, { type: 'practice', name: 'Practice' }),
    makeLaunch(1, { type: 'qualify', name: 'Qualifying' }, {
      race: {
        id: 'test-weekend',
        name: 'Test Weekend',
        track: { id: 'test_track' },
        playerCar: { model: 'test_car' },
        sessions: [{ type: 'qualify', name: 'Qualifying' }],
        conditions: { trackState: 'green', startGrip: 83 },
      },
    }),
    makeLaunch(2, { type: 'race', name: 'Race' }, {
      day: 1,
      race: {
        id: 'test-weekend',
        name: 'Test Weekend',
        track: { id: 'test_track' },
        playerCar: { model: 'test_car' },
        sessions: [{ type: 'race', name: 'Race' }],
        conditions: { trackState: 'green', startGrip: 86 },
      },
    }),
  ],
});

/**
 * Progress with nothing run.
 * @returns A fresh WeekendState
 */
const fresh = (): WeekendState => ({
  raceId: 'test-weekend', launchCount: 3, completed: [],
});

/**
 * Progress with practice and qualifying run, and an order recorded for the
 * qualifying, which is what the race inherits its grid from.
 * @param classification What the qualifying session classified
 * @returns A WeekendState with two launches done
 */
const afterQualifying = (classification: number[] | null): WeekendState => ({
  ...fresh(),
  completed: [0, 1].map((index) => ({
    index,
    completedAt: '2026-01-01T00:00:00.000Z',
    archive: 'data/results/one.json',
    gridOrder: [0, 1, 2, 3, 4, 5],
    classification: index === 1 ? classification : null,
  })),
});

/**
 * A knockout plan: two qualifying segments linked together, then the race.
 * @returns A fresh WeekendPlan
 */
const makeKnockoutPlan = (): WeekendPlan => ({
  raceId: 'test-weekend',
  raceName: 'Test Weekend',
  grid,
  launches: [
    makeLaunch(0, { id: 'q1', type: 'qualify', name: 'Q1' }),
    makeLaunch(1, {
      id: 'q2', type: 'qualify', name: 'Q2', inherit: { from: 'q1', top: 3 },
    }),
    makeLaunch(2, { type: 'race', name: 'Race', inherit: { from: 'q2' } }),
  ],
});

describe('cli/commands/weekend/utils', () => {
  describe('stateFile', () => {
    it('names the file after the weekend', () => {
      expect(stateFile('test-weekend')).toBe(path.join('weekends-dir', 'test-weekend.json'));
    });

    it('folds anything that cannot go in a filename', () => {
      expect(stateFile('spikes/weekend one')).toBe(path.join('weekends-dir', 'spikes-weekend-one.json'));
    });
  });

  describe('loadState', () => {
    it('reads back what was saved', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(fresh()));
      await expect(loadState('test-weekend')).resolves.toEqual(fresh());
    });

    it('treats a weekend that has never been started as no progress', async () => {
      readFileMock.mockRejectedValue(new Error('ENOENT'));
      await expect(loadState('test-weekend')).resolves.toBeNull();
    });

    it('treats an unreadable file as no progress rather than throwing', async () => {
      readFileMock.mockResolvedValue('{ not json');
      await expect(loadState('test-weekend')).resolves.toBeNull();
    });
  });

  describe('saveState', () => {
    it('creates the folder before writing into it', async () => {
      await saveState(fresh());

      expect(mkdirMock).toHaveBeenCalledWith('weekends-dir', { recursive: true });
      expect(writeFileMock).toHaveBeenCalledWith(
        path.join('weekends-dir', 'test-weekend.json'),
        expect.stringContaining('"launchCount": 3'),
      );
    });

    it('returns where it wrote', async () => {
      await expect(saveState(fresh())).resolves.toBe(path.join('weekends-dir', 'test-weekend.json'));
    });
  });

  describe('clearState', () => {
    it('removes the file without complaining that it was never there', async () => {
      await clearState('test-weekend');
      expect(rmMock).toHaveBeenCalledWith(
        path.join('weekends-dir', 'test-weekend.json'),
        { force: true },
      );
    });
  });

  describe('describeGrid', () => {
    it('says a race is still waiting on the qualifying that has not run', () => {
      expect(describeGrid(makePlan(), fresh(), 2)).toBe(
        'inherits Qualifying, which has not run yet',
      );
    });

    it('names the session a grid came from, and where the player starts', () => {
      // Names it rather than numbering it: a knockout composes a grid out of
      // several segments, and "session 1" says nothing about which chain.
      expect(describeGrid(makePlan(), afterQualifying([3, 1, 5, 0, 2, 4]), 2)).toBe(
        'from Qualifying - player starts P4',
      );
    });

    it('names every segment of the chain a knockout grid was composed from', () => {
      const state: WeekendState = {
        raceId: 'test-weekend',
        launchCount: 3,
        completed: [
          {
            index: 0,
            completedAt: 'now',
            archive: 'q1.json',
            gridOrder: [0, 1, 2, 3, 4, 5],
            classification: [3, 0, 1, 5, 2, 4],
          },
          {
            index: 1,
            completedAt: 'now',
            archive: 'q2.json',
            gridOrder: [0, 3, 1],
            classification: [0, 3, 1],
          },
        ],
      };

      expect(describeGrid(makeKnockoutPlan(), state, 2))
        .toBe('from Q2 <- Q1 - player starts P1');
    });

    it('says the player starts last when nothing qualified them', () => {
      const plan = makePlan();
      plan.launches[1].session = { type: 'practice', name: 'Practice 2' };

      expect(describeGrid(plan, afterQualifying(null), 2)).toBe(
        'no qualifying this weekend - AI on skill, player starts P6',
      );
    });

    it('says so for a session that runs no race', () => {
      expect(describeGrid(makePlan(), fresh(), 0)).toBe('no race in this session');
    });
  });

  describe('describePlan', () => {
    it('heads the plan with the weekend and the size of it', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('Test Weekend  (test-weekend)');
      expect(lines).toContain('6 cars, 3 sessions, one launch each');
    });

    it('says one session rather than 1 sessions', () => {
      const plan = makePlan();
      plan.launches = [plan.launches[0]];

      expect(describePlan(plan, fresh()).join('\n')).toContain('6 cars, 1 session, one launch each');
    });

    it('marks which launch has run, which is next and which is waiting', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('[0] day 0  next');
      expect(lines).toContain('[2] day 1  pending');
    });

    it('badges a simulated segment as simulated rather than as run', () => {
      // The one thing it must not say: the player was never in that session.
      const state: WeekendState = {
        raceId: 'test-weekend',
        launchCount: 3,
        completed: [
          {
            index: 0,
            completedAt: 'now',
            archive: 'q1.json',
            gridOrder: [0, 1, 2, 3, 4, 5],
            classification: [3, 1, 5, 0, 2, 4],
          },
          {
            index: 1,
            completedAt: 'now',
            archive: '',
            gridOrder: [3, 1, 5],
            classification: [1, 3, 5],
            skipped: true,
          },
        ],
      };
      const lines = describePlan(makeKnockoutPlan(), state).join('\n');

      expect(lines).toContain('[0] day 0  done');
      expect(lines).toContain('[1] day 0  simulated');
      // It has no archive to name, so it says what it invented instead - the
      // only place that order is visible at all.
      expect(lines).toContain('order   simulated: 1, 3, 5');
    });

    it('shows a completed launch and where its result went', () => {
      const lines = describePlan(makePlan(), afterQualifying([3, 1, 5, 0, 2, 4])).join('\n');
      expect(lines).toContain('[0] day 0  done');
      expect(lines).toContain('result  data/results/one.json');
    });

    it('shows carried grip against what a fresh track would have started on', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('starts at 83%, against 80% for a fresh track');
    });

    it('says nothing about grip for the session running on the preset', () => {
      const lines = describePlan(makePlan(), fresh());
      expect(lines.filter((line) => line.includes('grip'))).toHaveLength(2);
    });

    it('names each launch after the session it runs', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('next     Practice');
      expect(lines).toContain('pending  Qualifying');
      expect(lines).toContain('pending  Race');
    });
  });
});
