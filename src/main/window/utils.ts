import { screen } from 'electron';

import { MIN_VISIBLE_HEIGHT, MIN_VISIBLE_WIDTH } from './constants.ts';
import type { WindowState } from '../../shared/types/index.ts';

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
