import {
  describe, expect, it, jest,
} from '@jest/globals';
import { screen } from 'electron';
import type { BrowserWindow } from 'electron';

import type { WindowState } from '../../../shared/types/index.ts';
import { followRace, isOnSomeDisplay } from '../utils.ts';

// Outside a running Electron process the real module is just a path string, so
// only the one call this file makes is faked.
jest.mock('electron', () => ({ screen: { getAllDisplays: jest.fn() } }));

const getAllDisplays = jest.mocked(screen.getAllDisplays);

/**
 * Declares the attached displays for one test.
 * @param areas Work areas, in the order Electron would report them
 */
const withDisplays = (...areas: { x: number; y: number; width: number; height: number }[]): void => {
  getAllDisplays.mockReturnValue(areas.map((workArea) => ({ workArea })) as never);
};

/**
 * Builds saved window geometry.
 * @param state Overrides for the default 1180x800 window
 * @returns The geometry
 */
const geometry = (state: Partial<WindowState>): WindowState => ({
  width: 1180, height: 800, maximized: false, ...state,
});

const PRIMARY = {
  x: 0, y: 0, width: 1920, height: 1040,
};

/**
 * A window stand-in recording the calls followRace makes on it.
 * @param state What the window reports about itself
 * @returns The fake window, typed as the real one
 */
const fakeWindow = (state: { destroyed?: boolean; minimized?: boolean } = {}) => {
  const calls: string[] = [];
  const window = {
    isDestroyed: () => state.destroyed ?? false,
    isMinimized: () => state.minimized ?? false,
    restore: () => { calls.push('restore'); },
    focus: () => { calls.push('focus'); },
    minimize: () => { calls.push('minimize'); },
  };

  return { window: window as unknown as BrowserWindow, calls };
};

describe('main/window/utils', () => {
  describe('isOnSomeDisplay', () => {
    it('accepts a window fully inside the primary display', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({ x: 100, y: 100 }))).toBe(true);
    });

    it('rejects geometry that was never placed', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({}))).toBe(false);
    });

    it('rejects a window on a monitor that is no longer attached', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({ x: 2600, y: 300 }))).toBe(false);
    });

    it('accepts it again once that monitor is back', () => {
      withDisplays(PRIMARY, {
        x: 1920, y: 0, width: 1920, height: 1040,
      });
      expect(isOnSomeDisplay(geometry({ x: 2600, y: 300 }))).toBe(true);
    });

    it('accepts a window hanging off the edge but still draggable', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({ x: 1700, y: 100 }))).toBe(true);
    });

    it('rejects a window with only a sliver on screen', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({ x: 1860, y: 100 }))).toBe(false);
    });

    it('rejects a window whose title bar is above the work area', () => {
      withDisplays(PRIMARY);
      expect(isOnSomeDisplay(geometry({ x: 100, y: -790 }))).toBe(false);
    });

    it('rejects everything when no display is attached at all', () => {
      withDisplays();
      expect(isOnSomeDisplay(geometry({ x: 100, y: 100 }))).toBe(false);
    });
  });

  describe('followRace', () => {
    // Minimised rather than hidden: hiding also removes the taskbar entry, and
    // a window the user cannot find while a race runs reads as a crash.
    it('minimises the window while a launch is in flight', () => {
      const { window, calls } = fakeWindow();

      followRace(window, 'launching');
      expect(calls).toEqual(['minimize']);
    });

    it('stays out of the way for the whole wait', () => {
      const { window, calls } = fakeWindow();

      followRace(window, 'waiting');
      expect(calls).toEqual(['minimize']);
    });

    it('brings the window back when the race is over', () => {
      const { window, calls } = fakeWindow({ minimized: true });

      followRace(window, 'idle');
      expect(calls).toEqual(['restore', 'focus']);
    });

    // The user may have restored it themselves, and a second minimise would
    // take away a window they had just gone looking for.
    it('does not minimise a window that already is', () => {
      const { window, calls } = fakeWindow({ minimized: true });

      followRace(window, 'waiting');
      expect(calls).toEqual([]);
    });

    it('does not restore a window the user left open', () => {
      const { window, calls } = fakeWindow();

      followRace(window, 'idle');
      expect(calls).toEqual(['focus']);
    });

    // A result can land after the window has gone, since the wait outlives it.
    it('does nothing to a window that has been destroyed', () => {
      const { window, calls } = fakeWindow({ destroyed: true });

      followRace(window, 'idle');
      expect(calls).toEqual([]);
    });
  });
});
