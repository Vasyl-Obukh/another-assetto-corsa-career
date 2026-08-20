// Registering the main side of the IPC contract. Handlers never throw across the
// boundary - Electron would flatten the Error into something unreadable, and a
// clear reason is the whole point of failing loudly here.

import { BrowserWindow, dialog } from 'electron';

import { handle } from './utils.ts';
import { probePaths } from '../../core/paths/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { PathsReport } from '../../shared/types/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { SettingsStore } from '../settings-store/index.ts';
import { resolvedTheme } from '../theme/index.ts';

export { send } from './utils.ts';

/**
 * Registers every handler in the IPC contract.
 *
 * The scanned Content stays in this process; a large mod library is megabytes of
 * skin arrays, so the renderer asks for one page at a time rather than a copy.
 * @param settings The store handlers read and write settings through
 * @param content The store handlers read installed content through
 */
export const registerHandlers = (settings: SettingsStore, content: ContentStore): void => {
  const probe = async (): Promise<PathsReport> => {
    const report = await probePaths(settings.get().paths);
    // The store follows whatever install the probe actually resolved, and drops
    // a cache that was built from a different one.
    content.use(report.derived?.content ?? null);

    return report;
  };

  handle('paths:probe', probe);

  handle('paths:override', async (overrides) => {
    settings.patch({ paths: overrides });
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

  handle('content:scan', async ({ force }) => content.summary(force));
  handle('content:cars', async (query) => content.cars(query));
  handle('content:tracks', async (query) => content.tracks(query));
  handle('content:carFacets', async ({ query }) => content.carFacets(query));
  handle('content:trackFacets', async ({ query }) => content.trackFacets(query));
  handle('content:issues', async () => content.issues());

  handle('settings:get', async () => settings.get());
  handle('settings:patch', async (patch) => settings.patch(patch));
  handle('theme:get', async () => resolvedTheme());
};
