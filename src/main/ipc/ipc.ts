// Registering the main side of the IPC contract. Handlers never throw across the
// boundary - Electron would flatten the Error into something unreadable, and a
// clear reason is the whole point of failing loudly here.

import { BrowserWindow, dialog } from 'electron';

import { handle } from './utils.ts';
import { scanContent } from '../../core/content/index.ts';
import { probePaths } from '../../core/paths/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { Content, ContentSummary, PathsReport } from '../../shared/types/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';
import { resolvedTheme } from '../theme/index.ts';

export { send } from './utils.ts';

/**
 * Registers every handler in the IPC contract.
 *
 * The scanned Content stays in this process; a large mod library is megabytes of
 * skin arrays, and no screen yet needs more than the counts.
 * @param settings The store handlers read and write settings through
 */
export const registerHandlers = (settings: SettingsStore): void => {
  let content: Content | null = null;
  let summary: ContentSummary | null = null;
  let report: PathsReport | null = null;

  const probe = async (): Promise<PathsReport> => {
    report = await probePaths(settings.get().paths);
    return report;
  };

  handle('paths:probe', probe);

  handle('paths:override', async (overrides) => {
    settings.patch({ paths: overrides });
    // Content was scanned from the old root, so it is no longer trustworthy.
    content = null;
    summary = null;
    return probe();
  });

  handle('paths:pick', async ({ kind }) => {
    const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    if (!window) throw new AppError('ipc.noWindow');

    const result = await dialog.showOpenDialog(window, {
      properties: [kind === 'contentManager' ? 'openFile' : 'openDirectory'],
      ...(kind === 'contentManager'
        ? { filters: [{ name: 'Content Manager', extensions: ['exe'] }] }
        : {}),
    });

    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  handle('content:scan', async ({ force }) => {
    if (summary && !force) return summary;

    const paths = report?.derived ?? (await probe()).derived;
    if (!paths) {
      throw new AppError('ipc.pathsNotLocated');
    }

    const startedAt = Date.now();
    content = await scanContent(paths.content);
    summary = {
      cars: content.cars.length,
      tracks: content.tracks.length,
      weather: content.weather.length,
      controllers: content.controllers.length,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };

    return summary;
  });

  handle('settings:get', async () => settings.get());
  handle('settings:patch', async (patch) => settings.patch(patch));
  handle('theme:get', async () => resolvedTheme());
};
