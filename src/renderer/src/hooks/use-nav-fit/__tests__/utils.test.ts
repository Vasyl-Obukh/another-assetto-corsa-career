import { describe, expect, it } from '@jest/globals';

import {
  inGivingOrder, labelsToHide, navFitItem, pixels,
} from '../utils.ts';

describe('renderer/hooks/use-nav-fit/utils', () => {
  describe('navFitItem', () => {
    it('names the item and leaves the rest off while it shows its label', () => {
      expect(navFitItem('home', false)).toEqual({
        'data-nav-item': 'home', 'data-compact': undefined, 'data-nav-last': undefined,
      });
    });

    it('marks an item showing its icon alone', () => {
      expect(navFitItem('home', true)['data-compact']).toBe('');
    });

    it('marks an item held back until last', () => {
      expect(navFitItem('save', false, true)['data-nav-last']).toBe('');
    });
  });

  describe('pixels', () => {
    it('reads a computed length', () => {
      expect(pixels('24px')).toBe(24);
      expect(pixels('6.5px')).toBe(6.5);
    });

    // Guards a fix: a gap left at "normal" read as NaN and stopped every label
    // from ever giving way.
    it('reads a value that is not a length as nothing', () => {
      expect(pixels('normal')).toBe(0);
      expect(pixels('')).toBe(0);
    });
  });

  describe('inGivingOrder', () => {
    it('gives way from the right', () => {
      expect(inGivingOrder(['home', 'inbox', 'settings'], () => false)).toEqual(['settings', 'inbox', 'home']);
    });

    it('holds the last ones back until every other has given way', () => {
      const items = ['home', 'inbox', 'save', 'settings'];

      expect(inGivingOrder(items, (item) => item === 'save')).toEqual(['settings', 'inbox', 'home', 'save']);
    });

    it('keeps the last ones in their own order among themselves', () => {
      expect(inGivingOrder(['a', 'b', 'c'], (item) => item !== 'b')).toEqual(['b', 'a', 'c']);
    });

    it('leaves the items it was given alone', () => {
      const items = ['home', 'inbox'];
      inGivingOrder(items, () => false);

      expect(items).toEqual(['home', 'inbox']);
    });
  });

  describe('labelsToHide', () => {
    it('hides none when the row fits', () => {
      expect(labelsToHide([40, 50], 0)).toBe(0);
      expect(labelsToHide([40, 50], -120)).toBe(0);
    });

    it('hides just enough labels, in order, to win the room back', () => {
      expect(labelsToHide([40, 50, 60], 30)).toBe(1);
      expect(labelsToHide([40, 50, 60], 41)).toBe(2);
      expect(labelsToHide([40, 50, 60], 90)).toBe(2);
    });

    it('hides them all when even that does not make the row fit', () => {
      expect(labelsToHide([40, 50], 500)).toBe(2);
    });

    it('lets half a pixel of rounding pass', () => {
      expect(labelsToHide([40, 50], 0.4)).toBe(0);
      expect(labelsToHide([40, 50], 40.4)).toBe(1);
    });

    it('hides nothing when there is nothing to hide', () => {
      expect(labelsToHide([], 100)).toBe(0);
    });
  });
});
