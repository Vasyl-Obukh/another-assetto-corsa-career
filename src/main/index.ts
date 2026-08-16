import { app, BrowserWindow } from 'electron';
import path from 'node:path';

import { registerHandlers, send } from './ipc/index.ts';
import { createSettingsStore } from './settings-store/index.ts';
import { applyThemeChoice, onThemeChange } from './theme/index.ts';
import { createWindow } from './window/index.ts';

// The app sits alongside a running game; a second copy racing it for the same
// settings file and the same AC folders helps nobody.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    const settings = await createSettingsStore(app.getPath('userData'));
    applyThemeChoice(settings.get().theme);
    registerHandlers(settings);

    const preload = path.join(import.meta.dirname, '../preload/index.cjs');
    const rendererUrl = process.env.ELECTRON_RENDERER_URL ?? null;
    mainWindow = createWindow(settings, preload, rendererUrl);

    onThemeChange((theme) => {
      if (mainWindow) send(mainWindow, 'theme:changed', theme);
    });

    settings.onChange((next) => {
      applyThemeChoice(next.theme);
      if (mainWindow) send(mainWindow, 'settings:changed', next);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow(settings, preload, rendererUrl);
      }
    });

    app.on('before-quit', () => { void settings.flush(); });
  }, (error: unknown) => {
    console.error('Failed to start.', error);
    app.quit();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
