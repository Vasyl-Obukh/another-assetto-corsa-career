import {
  describe, expect, it, jest,
} from '@jest/globals';

import { fileNameFor, toIpcError } from '../utils.ts';

// utils.ts imports ipcMain at the top; only toIpcError is under test here.
jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() } }));

describe('main/ipc/utils', () => {
  describe('toIpcError', () => {
    it('keeps the message, which is what the UI shows', () => {
      expect(toIpcError(new Error('Track not installed: spa')).message)
        .toBe('Track not installed: spa');
    });

    it('keeps the stack as detail, for the console', () => {
      const error = toIpcError(new Error('boom'));
      expect(error.detail).toContain('boom');
    });

    it('flattens a thrown string', () => {
      expect(toIpcError('just a string')).toEqual({ message: 'just a string' });
    });

    it('flattens a thrown non-error object', () => {
      expect(toIpcError({ code: 42 }).message).toBe('[object Object]');
    });

    it('flattens null and undefined rather than throwing', () => {
      expect(toIpcError(null).message).toBe('null');
      expect(toIpcError(undefined).message).toBe('undefined');
    });

    it('omits detail when there is no stack', () => {
      const stackless = new Error('no stack');
      delete stackless.stack;

      expect(toIpcError(stackless)).not.toHaveProperty('detail');
    });
  });

  describe('fileNameFor', () => {
    it('names the file after the championship rather than its id', () => {
      expect(fileNameFor('Lotus Cup', 'lotus-cup')).toBe('lotus-cup');
    });

    // The point of it: every id the app mints is a UUID, so suggesting the id
    // would offer 550e8400-....json for anything but a shipped championship.
    it('suggests something readable for a championship with a minted id', () => {
      expect(fileNameFor('My Lotus Cup', 'cc9b6fa6-7954-4711-85c6-de1255149b71'))
        .toBe('my-lotus-cup');
    });

    it('holds the name to the characters a file name may carry', () => {
      expect(fileNameFor('Formula 1 2023: Sprint!', 'x')).toBe('formula-1-2023-sprint');
      expect(fileNameFor('  spaced  out  ', 'x')).toBe('spaced-out');
    });

    it('falls back to the id when the name yields nothing usable', () => {
      expect(fileNameFor('...', 'lotus-cup')).toBe('lotus-cup');
      expect(fileNameFor('', 'lotus-cup')).toBe('lotus-cup');
    });

    // Folding to the right characters is not enough on its own: `nul.json` is
    // a Windows device name that cannot be created at all, and a name long
    // enough makes a path nothing can open. isSafeSeriesId knows both.
    it('falls back rather than suggesting a name Windows reserves', () => {
      expect(fileNameFor('NUL', 'lotus-cup')).toBe('lotus-cup');
      expect(fileNameFor('Com1', 'lotus-cup')).toBe('lotus-cup');
    });

    it('falls back rather than suggesting a name too long to open', () => {
      expect(fileNameFor('a'.repeat(300), 'lotus-cup')).toBe('lotus-cup');
    });
  });
});
