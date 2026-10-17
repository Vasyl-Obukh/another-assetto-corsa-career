import { describe, expect, it } from '@jest/globals';

import { isTyping, saveCommandOf } from '../utils.ts';

/**
 * A key press.
 * @param key The key, as the browser names it
 * @param held The modifiers held
 * @returns The key press
 */
const press = (key: string, held: Partial<Record<'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey', boolean>> = {}) => ({
  key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...held,
});

describe('renderer/components/slot-menu/utils', () => {
  describe('isTyping', () => {
    it('knows a text field, a text area and anything editable', () => {
      expect(isTyping({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true);
      expect(isTyping({ tagName: 'TEXTAREA' } as unknown as EventTarget)).toBe(true);
      expect(isTyping({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget)).toBe(true);
    });

    it('lets everything else through, the page itself included', () => {
      expect(isTyping({ tagName: 'BUTTON', isContentEditable: false } as unknown as EventTarget)).toBe(false);
      expect(isTyping(null)).toBe(false);
    });
  });

  describe('saveCommandOf', () => {
    it("reads a game's keys: F5 to save quickly and F9 to load it back", () => {
      expect(saveCommandOf(press('F5'))).toBe('quickSave');
      expect(saveCommandOf(press('F9'))).toBe('quickLoad');
    });

    it('reads Ctrl+S and Ctrl+L, Caps Lock or not', () => {
      expect(saveCommandOf(press('s', { ctrlKey: true }))).toBe('saveAs');
      expect(saveCommandOf(press('L', { ctrlKey: true }))).toBe('load');
    });

    it('asks for nothing with another modifier held, or another key', () => {
      expect(saveCommandOf(press('F5', { shiftKey: true }))).toBeNull();
      expect(saveCommandOf(press('s', { ctrlKey: true, altKey: true }))).toBeNull();
      expect(saveCommandOf(press('s', { metaKey: true }))).toBeNull();
      expect(saveCommandOf(press('s'))).toBeNull();
      expect(saveCommandOf(press('F9', { ctrlKey: true }))).toBeNull();
    });
  });
});
