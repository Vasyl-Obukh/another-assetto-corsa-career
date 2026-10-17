import type { SaveCommand } from './types.ts';

/**
 * Each save command's shortcut, as the menu shows it beside the command. The
 * keys are a game's, not a document's: F5 saves quickly and F9 loads it back.
 */
export const SAVE_SHORTCUT: Readonly<Record<SaveCommand, string>> = {
  quickSave: 'F5',
  saveAs: 'Ctrl+S',
  quickLoad: 'F9',
  load: 'Ctrl+L',
};
