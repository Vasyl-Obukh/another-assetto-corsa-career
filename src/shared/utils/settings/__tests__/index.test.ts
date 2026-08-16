import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS } from '../../../constants/index.ts';
import { applyPatch, migrateSettings } from '../index.ts';

describe('shared/utils/settings', () => {
  describe('migrateSettings', () => {
    it('returns the defaults for anything that is not an object', () => {
      expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings('corrupt')).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings([])).toEqual(DEFAULT_SETTINGS);
    });

    it('does not hand back the shared defaults object', () => {
      const migrated = migrateSettings(null);
      expect(migrated).not.toBe(DEFAULT_SETTINGS);
      expect(migrated.paths).not.toBe(DEFAULT_SETTINGS.paths);
    });

    it('reads a complete file through unchanged', () => {
      const stored = {
        version: 1,
        theme: 'dark',
        language: 'uk',
        paths: { acRoot: 'D:\\ac' },
        window: {
          width: 1200, height: 900, x: 1, y: 2, maximized: true,
        },
      };
      expect(migrateSettings(stored)).toEqual(stored);
    });

    it('keeps the good fields when one is nonsense', () => {
      const migrated = migrateSettings({ theme: 'chartreuse', language: 'uk' });
      expect(migrated.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(migrated.language).toBe('uk');
    });

    it('rejects a language it does not have a catalogue for', () => {
      expect(migrateSettings({ language: 'fr' }).language).toBe('en');
    });

    it('always reports version 1', () => {
      expect(migrateSettings({ version: 99 }).version).toBe(1);
    });

    it('never throws, whatever it is given', () => {
      const nasty = [0, false, () => {}, Symbol('x'), { window: 'no' }, { paths: 7 }];
      nasty.forEach((value) => expect(() => migrateSettings(value)).not.toThrow());
    });
  });

  describe('applyPatch', () => {
    it('replaces only the patched fields', () => {
      const current = migrateSettings({ theme: 'dark', language: 'uk' });
      const next = applyPatch(current, { theme: 'light' });

      expect(next.theme).toBe('light');
      expect(next.language).toBe('uk');
    });

    it('re-validates the patch rather than trusting it', () => {
      const current = migrateSettings(null);
      const next = applyPatch(current, { theme: 'neon' } as never);

      expect(next.theme).toBe(DEFAULT_SETTINGS.theme);
    });

    it('does not mutate the settings it was given', () => {
      const current = migrateSettings({ theme: 'dark' });
      applyPatch(current, { theme: 'light' });

      expect(current.theme).toBe('dark');
    });
  });
});
