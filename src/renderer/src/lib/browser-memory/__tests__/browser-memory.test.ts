import { describe, expect, it } from '@jest/globals';

import { readBrowserView } from '../browser-memory.ts';

describe('renderer/lib/browser-memory/browser-memory', () => {
  describe('readBrowserView', () => {
    it('reads a stored table as the table', () => {
      expect(readBrowserView('list')).toBe('list');
    });

    it('reads stored cards as cards', () => {
      expect(readBrowserView('cards')).toBe('cards');
    });

    it('falls back to cards for nothing stored or anything it does not know', () => {
      [undefined, null, '', 'table', 'LIST', 1, {}, ['list']].forEach((stored) => {
        expect(readBrowserView(stored)).toBe('cards');
      });
    });
  });
});
