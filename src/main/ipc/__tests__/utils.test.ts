import {
  describe, expect, it, jest,
} from '@jest/globals';

import { toIpcError } from '../utils.ts';

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
});
