import { describe, expect, it } from '@jest/globals';

import { lastPlayedMode } from '../utils.ts';

describe('renderer/screens/start/utils', () => {
  describe('lastPlayedMode', () => {
    it('picks the mode played most recently', () => {
      expect(lastPlayedMode({
        career: '2026-10-01T10:00:00.000Z',
        championship: '2026-10-03T10:00:00.000Z',
        quick: '2026-10-02T10:00:00.000Z',
      })).toBe('championship');
    });

    it('passes over a mode never played', () => {
      expect(lastPlayedMode({
        career: undefined,
        championship: undefined,
        quick: '2026-10-02T10:00:00.000Z',
      })).toBe('quick');
    });

    it('is null on a first run, with nothing played', () => {
      expect(lastPlayedMode({ career: undefined, championship: undefined, quick: undefined })).toBeNull();
    });
  });
});
