import {
  afterEach, beforeEach, describe, expect, it,
} from '@jest/globals';

import {
  currentIndex, forgetVisits, hasNextVisit, nameVisit, previousVisit, recordVisit,
} from '../nav-history.ts';

describe('renderer/lib/nav-history/nav-history', () => {
  beforeEach(forgetVisits);

  describe('recordVisit', () => {
    it('remembers each page by where it sits in the window\'s history', () => {
      recordVisit(0, 'a', '/home', 'POP');
      recordVisit(1, 'b', '/cars', 'PUSH');

      expect(previousVisit(1)).toEqual({ key: 'a', pathname: '/home', name: null });
    });

    it('drops whatever lay ahead on a push, as the browser does', () => {
      recordVisit(0, 'a', '/home', 'POP');
      recordVisit(1, 'b', '/cars', 'PUSH');
      recordVisit(2, 'c', '/cars/x', 'PUSH');
      recordVisit(1, 'd', '/tracks', 'PUSH');

      expect(hasNextVisit(1)).toBe(false);
    });

    it('keeps what lay ahead when the window steps back', () => {
      recordVisit(0, 'a', '/home', 'POP');
      recordVisit(1, 'b', '/cars', 'PUSH');
      recordVisit(0, 'a', '/home', 'POP');

      expect(hasNextVisit(0)).toBe(true);
    });

    it('swaps the page in place on a replace', () => {
      recordVisit(0, 'a', '/home', 'POP');
      recordVisit(1, 'b', '/cars', 'PUSH');
      recordVisit(0, 'z', '/race', 'REPLACE');

      expect(previousVisit(1)?.pathname).toBe('/race');
      expect(hasNextVisit(0)).toBe(true);
    });
  });

  describe('nameVisit', () => {
    it('gives Back on the page after it the name the page called itself', () => {
      recordVisit(0, 'a', '/cars/x', 'POP');
      nameVisit('a', 'Ferrari 488 GT3');
      recordVisit(1, 'b', '/tracks', 'PUSH');

      expect(previousVisit(1)?.name).toBe('Ferrari 488 GT3');
    });
  });

  describe('previousVisit', () => {
    it('has nothing before the first entry', () => {
      recordVisit(0, 'a', '/home', 'POP');

      expect(previousVisit(0)).toBeNull();
    });

    // After a reload the router still counts entries the module never saw.
    it('has nothing for an entry this window never recorded', () => {
      recordVisit(3, 'a', '/home', 'POP');

      expect(previousVisit(3)).toBeNull();
    });
  });

  describe('hasNextVisit', () => {
    it('is false at the newest entry', () => {
      recordVisit(0, 'a', '/home', 'POP');

      expect(hasNextVisit(0)).toBe(false);
    });
  });

  describe('forgetVisits', () => {
    it('forgets every page and every name', () => {
      recordVisit(0, 'a', '/home', 'POP');
      nameVisit('a', 'Home');
      recordVisit(1, 'b', '/cars', 'PUSH');
      forgetVisits();

      expect(previousVisit(1)).toBeNull();
      recordVisit(0, 'a', '/home', 'POP');
      recordVisit(1, 'b', '/cars', 'PUSH');
      expect(previousVisit(1)?.name).toBeNull();
    });
  });

  describe('currentIndex', () => {
    const global = globalThis as { window?: unknown };

    afterEach(() => {
      delete global.window;
    });

    it('reads the position the router stamps on the history state', () => {
      global.window = { history: { state: { idx: 4 } } };

      expect(currentIndex()).toBe(4);
    });

    it('reads 0 where the router has stamped nothing', () => {
      global.window = { history: { state: null } };

      expect(currentIndex()).toBe(0);
    });
  });
});
