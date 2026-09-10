// Registering the main side of the IPC contract. Handlers never throw across the
// boundary - Electron would flatten the Error into something unreadable, and a
// clear reason is the whole point of failing loudly here.

import { dialog } from 'electron';

import { focusedWindow, handle } from './utils.ts';
import { readCmArguments, setCmArgument } from '../../core/cm-arguments/index.ts';
import { probePaths } from '../../core/paths/index.ts';
import { SERIES_FILE_EXTENSION } from '../../core/series-file/index.ts';
import type { PathsReport } from '../../shared/types/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { RaceStore } from '../race-store/index.ts';
import type { SeriesStore } from '../series-store/index.ts';
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
 * @param series The store handlers read and write the championship library through
 */
export const registerHandlers = (
  settings: SettingsStore,
  content: ContentStore,
  race: RaceStore,
  series: SeriesStore,
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
    const result = await dialog.showOpenDialog(focusedWindow(), {
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

  handle('series:list', async () => series.list());
  handle('series:get', async ({ id }) => series.get(id));
  handle('series:setupRound', async (request) => series.setupRound(request));
  handle('series:customise', async ({ id }) => series.customise(id));
  handle('series:duplicate', async ({ id, name }) => series.duplicate(id, name));
  handle('series:revert', async ({ id }) => series.revert(id));
  handle('series:delete', async ({ id }) => series.remove(id));

  // The dialogs live here rather than in the series store, so that store stays
  // the same path-in, value-out shape it has always had and imports no Electron.
  handle('series:import', async () => {
    const result = await dialog.showOpenDialog(focusedWindow(), {
      properties: ['openFile'],
      filters: [{ name: 'Championship', extensions: ['json'] }],
    });
    const file = result.canceled ? null : result.filePaths[0] ?? null;

    return file === null ? null : series.importFrom(file);
  });

  handle('series:export', async ({ id }) => {
    // No title: omitted so Windows supplies its own localised "Save As" rather
    // than us pushing a translated string across IPC purely to label a dialog.
    const result = await dialog.showSaveDialog(focusedWindow(), {
      defaultPath: `${id}${SERIES_FILE_EXTENSION}`,
      filters: [{ name: 'Championship', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePath) return null;

    await series.exportTo(id, result.filePath);

    return result.filePath;
  });

  handle('cm:arguments', readCmArguments);
  handle('cm:setArgument', async ({ flag, enabled }) => setCmArgument(flag, enabled));

  handle('settings:get', async () => settings.get());
  handle('settings:patch', async (patch) => settings.patch(patch));
  handle('theme:get', async () => resolvedTheme());
};
