// The main window, and remembering where it was.

import { BrowserWindow, shell } from 'electron';
import path from 'node:path';

import {
  MIN_HEIGHT, MIN_WIDTH, SAVE_DEBOUNCE_MS,
} from './constants.ts';
import { isOnSomeDisplay } from './utils.ts';
import type { SettingsStore } from '../settings-store/index.ts';
import { resolvedTheme, WINDOW_BACKGROUND } from '../theme/index.ts';

/**
 * Creates the main window and wires up geometry persistence.
 * @param settings The store to read geometry from and save it back to
 * @param preloadPath Absolute path to the built preload script
 * @param iconPath Absolute path to the window and taskbar icon
 * @param rendererUrl Dev server URL, or null to load the built renderer from disk
 * @returns The created window
 */
export const createWindow = (
  settings: SettingsStore,
  preloadPath: string,
  iconPath: string,
  rendererUrl: string | null,
): BrowserWindow => {
  const saved = settings.get().window;
  const placed = isOnSomeDisplay(saved);

  const window = new BrowserWindow({
    width: saved.width,
    height: saved.height,
    ...(placed ? { x: saved.x, y: saved.y } : {}),
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    backgroundColor: WINDOW_BACKGROUND[resolvedTheme()],
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (saved.maximized) window.maximize();
  window.once('ready-to-show', () => window.show());

  // Anything aiming at a browser goes to the real browser, never a new frame.
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  const capture = (): void => {
    if (window.isDestroyed()) return;

    // getNormalBounds is the un-maximized geometry, which is what we restore to.
    const bounds = window.getNormalBounds();
    settings.patch({
      window: {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        maximized: window.isMaximized(),
      },
    });
  };

  let timer: NodeJS.Timeout | null = null;
  const remember = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      capture();
    }, SAVE_DEBOUNCE_MS);
  };

  window.on('resize', remember);
  window.on('move', remember);
  window.on('maximize', remember);
  window.on('unmaximize', remember);

  // On close there is no time to debounce - capture now or lose the geometry.
  window.on('close', () => {
    if (timer) clearTimeout(timer);
    timer = null;
    capture();
  });

  if (rendererUrl) {
    void window.loadURL(rendererUrl);
  } else {
    void window.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
  }

  return window;
};
