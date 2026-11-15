import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS } from '../../../../../shared/constants';
import { DLCPack } from '../../../../../shared/types';
import { isOptional, optionalState } from '../utils.ts';

describe('renderer/screens/setup/utils', () => {
  describe('isOptional', () => {
    it('holds for the steps that only offer something', () => {
      expect(isOptional('sources')).toBe(true);
      expect(isOptional('tracks')).toBe(true);
    });

    it('does not hold for the steps the app cannot go on without, or the last', () => {
      expect(isOptional('paths')).toBe(false);
      expect(isOptional('scan')).toBe(false);
      expect(isOptional('yours')).toBe(false);
    });
  });

  describe('optionalState', () => {
    const sources = { ...DEFAULT_SETTINGS.offeredContentSources, packs: [DLCPack.RED_PACK] };

    it('moves when what its step changes moves', () => {
      expect(optionalState({ ...DEFAULT_SETTINGS, offeredContentSources: sources }, 'sources'))
        .not.toBe(optionalState(DEFAULT_SETTINGS, 'sources'));
      expect(optionalState({ ...DEFAULT_SETTINGS, trackChoices: { 'spa/gp': { track: 'spa' } } }, 'tracks'))
        .not.toBe(optionalState(DEFAULT_SETTINGS, 'tracks'));
    });

    it('stands still when anything else moves', () => {
      expect(optionalState({ ...DEFAULT_SETTINGS, offeredContentSources: sources }, 'tracks'))
        .toBe(optionalState(DEFAULT_SETTINGS, 'tracks'));
      expect(optionalState({ ...DEFAULT_SETTINGS, theme: 'dark' }, 'sources'))
        .toBe(optionalState(DEFAULT_SETTINGS, 'sources'));
    });
  });
});
