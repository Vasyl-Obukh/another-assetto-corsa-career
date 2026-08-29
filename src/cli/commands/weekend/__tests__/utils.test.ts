import {
  describe, expect, it, jest,
} from '@jest/globals';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  GridEntry, WeekendLaunch, WeekendPlan, WeekendState,
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
 * Builds one launch of the plan below.
 * @param index Position in the launch list
 * @param launch What this launch does differently
 * @returns A complete WeekendLaunch
 */
const makeLaunch = (
  index: number,
  launch: Partial<WeekendLaunch> & Pick<WeekendLaunch, 'race'>,
): WeekendLaunch => ({
  index,
  day: 0,
  hasQualifying: false,
  hasRace: true,
  ...launch,
});

/**
 * A two-launch plan: practice, qualifying and a sprint, then a feature.
 * @returns A fresh WeekendPlan
 */
const makePlan = (): WeekendPlan => ({
  raceId: 'test-weekend',
  raceName: 'Test Weekend',
  grid,
  launches: [
    makeLaunch(0, {
      hasQualifying: true,
      race: {
        id: 'test-weekend',
        name: 'Test Weekend',
        track: { id: 'test_track' },
        playerCar: { model: 'test_car' },
        sessions: [
          { type: 'practice', name: 'Practice' },
          { type: 'qualify', name: 'Qualifying' },
          { type: 'race', name: 'Sprint' },
        ],
        conditions: { trackState: 'green' },
      },
    }),
    makeLaunch(1, {
      day: 1,
      race: {
        id: 'test-weekend',
        name: 'Test Weekend',
        track: { id: 'test_track' },
        playerCar: { model: 'test_car' },
        sessions: [{ type: 'race', name: 'Feature' }],
        conditions: { trackState: 'green', startGrip: 88 },
      },
    }),
  ],
});

/**
 * Progress with nothing run.
 * @returns A fresh WeekendState
 */
const fresh = (): WeekendState => ({
  raceId: 'test-weekend', launchCount: 2, completed: [],
});

/**
 * Progress with the first launch run and a qualifying order recorded.
 * @param qualifyingOrder What its qualifying classified
 * @returns A WeekendState with one launch done
 */
const afterFirst = (qualifyingOrder: number[] | null): WeekendState => ({
  ...fresh(),
  completed: [{
    index: 0,
    completedAt: '2026-01-01T00:00:00.000Z',
    archive: 'data/results/one.json',
    gridOrder: [0, 1, 2, 3, 4, 5],
    qualifyingOrder,
  }],
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
        expect.stringContaining('"launchCount": 2'),
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
    it('says AC owns the grid of a launch that qualifies for itself', () => {
      expect(describeGrid(makePlan(), fresh(), 0)).toContain('built by AC');
    });

    it('says a launch is still waiting on qualifying that has not run', () => {
      expect(describeGrid(makePlan(), fresh(), 1)).toBe(
        'inherits launch 0 qualifying, which has not run yet',
      );
    });

    it('names the launch a grid came from, and where the player starts', () => {
      expect(describeGrid(makePlan(), afterFirst([3, 1, 5, 0, 2, 4]), 1)).toBe(
        'from launch 0 qualifying - player starts P4',
      );
    });

    it('says the player starts last when nothing qualified them', () => {
      const plan = makePlan();
      plan.launches[0].hasQualifying = false;

      expect(describeGrid(plan, afterFirst(null), 1)).toBe(
        'no qualifying this weekend - AI on skill, player starts P6',
      );
    });

    it('says so when a launch runs no race at all', () => {
      const plan = makePlan();
      plan.launches[1].hasRace = false;

      expect(describeGrid(plan, fresh(), 1)).toBe('no race in this launch');
    });
  });

  describe('describePlan', () => {
    it('heads the plan with the weekend and the size of it', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('Test Weekend  (test-weekend)');
      expect(lines).toContain('6 cars, 4 sessions, 2 launches');
    });

    it('says one launch rather than 1 launches', () => {
      const plan = makePlan();
      plan.launches = [plan.launches[0]];

      expect(describePlan(plan, fresh()).join('\n')).toContain('3 sessions, 1 launch');
    });

    it('marks which launch has run, which is next and which is waiting', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('[0] day 0  next');
      expect(lines).toContain('[1] day 1  pending');
    });

    it('shows a completed launch and where its result went', () => {
      const lines = describePlan(makePlan(), afterFirst([3, 1, 5, 0, 2, 4])).join('\n');
      expect(lines).toContain('[0] day 0  done');
      expect(lines).toContain('result  data/results/one.json');
    });

    it('shows carried grip against what a fresh launch would have started on', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('starts at 88%, against 80% for a fresh launch');
    });

    it('says nothing about grip for a launch running on the preset', () => {
      const lines = describePlan(makePlan(), fresh());
      expect(lines.filter((line) => line.includes('grip'))).toHaveLength(1);
    });

    it('lists each launch sessions by name', () => {
      const lines = describePlan(makePlan(), fresh()).join('\n');
      expect(lines).toContain('Practice, Qualifying, Sprint');
      expect(lines).toContain('Feature');
    });
  });
});
