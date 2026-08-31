import { describe, expect, it } from '@jest/globals';

import {
  parseIni, patchIni, replaceIniSection, writeIni,
} from '../ini.ts';

describe('core/ini', () => {
  describe('parseIni', () => {
    it('parses sections and keys', () => {
      expect(parseIni('[RACE]\nTRACK=spa\nCARS=8')).toEqual({
        RACE: { TRACK: 'spa', CARS: '8' },
      });
    });

    it('strips a BOM and tolerates CRLF', () => {
      expect(parseIni('﻿[A]\r\nB=1\r\n')).toEqual({ A: { B: '1' } });
    });

    it('skips comment lines', () => {
      expect(parseIni('[A]\n; c\n// c\n# c\nB=1')).toEqual({ A: { B: '1' } });
    });

    it('keeps the last of a duplicated key', () => {
      expect(parseIni('[A]\nB=1\nB=2')).toEqual({ A: { B: '2' } });
    });

    it('only strips an inline comment preceded by whitespace', () => {
      expect(parseIni('[A]\nB=x ; note\nC=a;b')).toEqual({ A: { B: 'x', C: 'a;b' } });
    });
  });

  describe('writeIni', () => {
    it('writes CRLF and blank-line separated sections', () => {
      expect(writeIni({ A: { B: 1 }, C: { D: 2 } })).toBe('[A]\r\nB=1\r\n\r\n[C]\r\nD=2\r\n');
    });

    it('writes booleans as 1 and 0', () => {
      expect(writeIni({ A: { T: true, F: false } })).toBe('[A]\r\nT=1\r\nF=0\r\n');
    });

    it('skips null sections and null or undefined values', () => {
      expect(writeIni({ A: { B: 1, C: null, D: undefined }, E: null })).toBe('[A]\r\nB=1\r\n');
    });
  });

  describe('patchIni', () => {
    // The head of the real extension/weather-controllers/pureCtrl/settings.ini,
    // whose inline comments document every weather value. Losing them is the
    // failure this function exists to prevent.
    const settings = [
      '[SETTINGS]',
      'LIVE=0 ; Use live data ; 1 or 0',
      'LAST_USED=1 ; Load last used plan. Uncheck this to be able to load a plan set in the "Plan" field! ; 1 or 0 ;',
      'PLAN = Timed/random ; Relative to /extension/config-ext/PurePlanner/Plans/ folder. Use slash - not backslash;',
      'AUTOSTART=1 ; Start plan with the race ; 1 or 0',
    ].join('\n');

    it('replaces a value and keeps the comment after it', () => {
      const out = patchIni(settings, 'SETTINGS', { LAST_USED: 0 });

      expect(out).toContain('LAST_USED=0 ; Load last used plan.');
      expect(out).toContain('1 or 0 ;');
    });

    it('keeps the spacing the author used around the equals', () => {
      const out = patchIni(settings, 'SETTINGS', { PLAN: 'Timed/career' });

      expect(out).toContain('PLAN = Timed/career ; Relative to');
    });

    it('changes only the lines it was asked to', () => {
      const before = settings.split('\n');
      const after = patchIni(settings, 'SETTINGS', { LAST_USED: 0, PLAN: 'Timed/career' }).split('\n');

      expect(after).toHaveLength(before.length);
      const changed = after.filter((line, index) => line !== before[index]);
      expect(changed).toHaveLength(2);
    });

    it('leaves every other section alone', () => {
      const text = '[A]\nB=1 ; keep me\n\n[C]\nB=2';

      expect(patchIni(text, 'C', { B: 9 })).toBe('[A]\nB=1 ; keep me\n\n[C]\nB=9');
    });

    it('appends a key the section does not have, inside that section', () => {
      const text = '[A]\nB=1\n\n[C]\nD=2';

      expect(patchIni(text, 'A', { E: 3 })).toBe('[A]\nB=1\nE=3\n\n[C]\nD=2');
    });

    it('appends the whole section when the file has no such header', () => {
      expect(patchIni('[A]\nB=1', 'general', { loadWithStart: 4 }))
        .toBe('[A]\nB=1\n[general]\nloadWithStart=4\n');
    });

    it('keeps the line endings the file already used', () => {
      expect(patchIni('[A]\r\nB=1', 'A', { B: 2 })).toBe('[A]\r\nB=2');
    });

    it('does not touch a key of the same name in another section', () => {
      const text = '[A]\nB=1\n[C]\nB=1';

      expect(patchIni(text, 'C', { B: 9 })).toBe('[A]\nB=1\n[C]\nB=9');
    });

    it('writes booleans the way the rest of the module does', () => {
      expect(patchIni('[A]\nB=0', 'A', { B: true })).toBe('[A]\nB=1');
    });
  });

  describe('replaceIniSection', () => {
    const presets = '[general]\nloadwithstart = 0\n\n[0]\n0-weather = 17\n\n[4]\n0-weather = 15\n';

    it('replaces every key of the section it owns', () => {
      const out = replaceIniSection(presets, '4', { '0-weather': 8, '0-rain': '0.80' });

      expect(out).toContain('[4]\n0-weather=8\n0-rain=0.80');
    });

    // patchIni would leave a key from a previous plan standing, and it would
    // then be read back as if we meant it.
    it('drops a key the new section does not have', () => {
      const out = replaceIniSection(presets, '4', { '0-rain': '0.80' });

      expect(out).not.toContain('0-weather = 15');
    });

    it('leaves the sections it does not own exactly as they were', () => {
      const out = replaceIniSection(presets, '4', { 'a': 1 });

      expect(out).toContain('[general]\nloadwithstart = 0');
      expect(out).toContain('[0]\n0-weather = 17');
    });

    // The trailing newline becomes the blank line between sections, which is
    // how writeIni spaces them and how the real files look.
    it('appends the section when the file has none', () => {
      expect(replaceIniSection('[A]\nB=1\n', 'C', { D: 2 })).toBe('[A]\nB=1\n\n[C]\nD=2\n');
    });

    it('removes the section outright when given null', () => {
      const out = replaceIniSection(presets, '4', null);

      expect(out).not.toContain('[4]');
      expect(out).toContain('[0]\n0-weather = 17');
    });

    it('leaves a file alone when asked to remove a section it does not have', () => {
      expect(replaceIniSection(presets, '9', null)).toBe(presets);
    });

    it('keeps the blank line the author left before the next section', () => {
      const out = replaceIniSection('[A]\nB=1\n\n[C]\nD=2', 'A', { B: 9 });

      expect(out).toBe('[A]\nB=9\n\n[C]\nD=2');
    });

    it('keeps the line endings the file already used', () => {
      expect(replaceIniSection('[A]\r\nB=1', 'A', { B: 2 })).toBe('[A]\r\nB=2');
    });
  });
});
