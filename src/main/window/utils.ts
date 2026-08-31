import { screen } from 'electron';
import type { BrowserWindow } from 'electron';

import { MIN_VISIBLE_HEIGHT, MIN_VISIBLE_WIDTH } from './constants.ts';
import type { RacePhase, WindowState } from '../../shared/types/index.ts';

/**
 * Checks whether a saved position would still land on an attached display.
 *
 * A position saved on a monitor that has since been unplugged would otherwise
 * reopen the window off-screen.
 * @param state The saved window geometry
 * @returns True when enough of the window would be reachable
 */
export const isOnSomeDisplay = (state: WindowState): boolean => {
  const { x, y } = state;
  if (x === undefined || y === undefined) return false;

  return screen.getAllDisplays().some(({ workArea }) => {
    const overlapX = Math.min(x + state.width, workArea.x + workArea.width) - Math.max(x, workArea.x);
    const overlapY = Math.min(y + state.height, workArea.y + workArea.height) - Math.max(y, workArea.y);

    return overlapX > MIN_VISIBLE_WIDTH && overlapY > MIN_VISIBLE_HEIGHT;
  });
};

/**
 * Gets the window out of the way while a race is live, and brings it back after.
 *
 * The app sits alongside a running game, so it should not be drawing frames
 * behind it. Minimised rather than hidden: Windows stops painting either way,
 * but hiding also removes the taskbar entry, and a window the user cannot find
 * while a race runs reads as a crash rather than as tact.
 * @param window The main window
 * @param phase What the app is doing about a race right now
 */
export const followRace = (window: BrowserWindow, phase: RacePhase): void => {
  if (window.isDestroyed()) return;

  if (phase === 'idle') {
    if (window.isMinimized()) window.restore();
    window.focus();

    return;
  }

  if (!window.isMinimized()) window.minimize();
};
