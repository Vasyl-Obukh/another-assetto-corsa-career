// Registering the main side of the IPC contract. Handlers never throw across the
// boundary - Electron would flatten the Error into something unreadable, and a
// clear reason is the whole point of failing loudly here.

import { BrowserWindow, dialog } from 'electron';

import { handle } from './utils.ts';
import { probePaths } from '../../core/paths/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { PathsReport } from '../../shared/types/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
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
 * @param race The store handlers set up, launch and archive races through
 */
export const registerHandlers = (
  settings: SettingsStore,
  content: ContentStore,
  race: RaceStore,
): void => {
  const probe = async (): Promise<PathsReport> => {
    const report = await probePaths(settings.get().paths);
    // Both stores follow whatever install the probe actually resolved. The
    // content store drops a cache built from a different one; the race store
    // simply has nowhere to launch until all three paths are there.
    content.use(report.derived?.content ?? null);
    race.use(report.derived);

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
  handle('content:car', async ({ id }) => content.car(id));
  handle('content:tracks', async (query) => content.tracks(query));
  handle('content:carFacets', async ({ query }) => content.carFacets(query));
  handle('content:trackFacets', async ({ query }) => content.trackFacets(query));
  handle('content:track', async ({ key }) => content.track(key));
  handle('content:weather', async () => {
    const installed = await content.content();

    return { weather: installed.weather, controllers: installed.controllers };
  });
  handle('content:issues', async () => content.issues());

  handle('race:get', async () => race.get());
  handle('race:set', async (definition) => race.set(definition));
  handle('race:launch', async () => race.launch());
  handle('race:cancel', async () => race.cancel());
  handle('race:reset', async () => race.reset());
  handle('race:results', async () => race.results());
  handle('race:result', async ({ file }) => race.result(file));

  handle('settings:get', async () => settings.get());
  handle('settings:patch', async (patch) => settings.patch(patch));
  handle('theme:get', async () => resolvedTheme());
};
