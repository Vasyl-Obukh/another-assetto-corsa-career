import type { SaveCommand } from './types.ts';

/**
 * Whether a key press lands in somewhere text is typed, where the keys are the
 * field's own.
 * @param target What the key press was aimed at
 * @returns True for a text field, a text area or anything editable
 */
export const isTyping = (target: EventTarget | null): boolean => {
  const element = target as Partial<HTMLElement> | null;

  return element?.isContentEditable === true || element?.tagName === 'INPUT' || element?.tagName === 'TEXTAREA';
};

/**
 * Which save command a key press asks for.
 * @param event The key press
 * @param event.key The key, as the browser names it
 * @param event.ctrlKey Whether Ctrl was held
 * @param event.altKey Whether Alt was held
 * @param event.shiftKey Whether Shift was held
 * @param event.metaKey Whether the system key was held
 * @returns The command, or null for a key press that asks for none
 */
export const saveCommandOf = (event: {
  key: string; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean;
}): SaveCommand | null => {
  if (event.altKey || event.shiftKey || event.metaKey) return null;
  if (event.ctrlKey) {
    const key = event.key.toLowerCase();
    if (key === 's') return 'saveAs';

    return key === 'l' ? 'load' : null;
  }
  if (event.key === 'F5') return 'quickSave';

  return event.key === 'F9' ? 'quickLoad' : null;
};
