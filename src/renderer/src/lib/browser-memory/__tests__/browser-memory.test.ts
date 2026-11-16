import { describe, expect, it } from '@jest/globals';

import { readBrowserMemory, readBrowserView, rememberBrowser } from '../browser-memory.ts';

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

  describe('readBrowserMemory', () => {
    it('is empty for a list never visited', () => {
      expect(readBrowserMemory('never-visited')).toEqual({ search: '', scroll: 0 });
    });

    it('is empty for a list that remembers nothing', () => {
      rememberBrowser(undefined, { search: 'ferrari' });

      expect(readBrowserMemory(undefined)).toEqual({ search: '', scroll: 0 });
    });

    it('answers with a snapshot that later writes leave alone', () => {
      rememberBrowser('snapshot', { search: 'gt3' });
      const held = readBrowserMemory('snapshot');
      rememberBrowser('snapshot', { search: 'gt4' });

      expect(held.search).toBe('gt3');
    });
  });

  describe('rememberBrowser', () => {
    it('merges a write into what the list already remembers', () => {
      rememberBrowser('merged', { search: 'porsche' });
      rememberBrowser('merged', { scroll: 480 });

      expect(readBrowserMemory('merged')).toEqual({ search: 'porsche', scroll: 480 });
    });

    it('keeps each list to itself', () => {
      rememberBrowser('store-test', { search: 'bmw' });

      expect(readBrowserMemory('garage-test').search).toBe('');
    });
  });
});
