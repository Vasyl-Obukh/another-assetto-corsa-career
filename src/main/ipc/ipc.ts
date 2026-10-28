// Registering the main side of the IPC contract. Handlers never throw across the
// boundary - Electron would flatten the Error into something unreadable, and a
// clear reason is the whole point of failing loudly here.

import { app, dialog, shell } from 'electron';

import {
  exportFrom, focusedWindow, handle, importInto,
} from './utils.ts';
import { readCmArguments, setCmArgument } from '../../core/cm-arguments/index.ts';
import { probePaths } from '../../core/paths/index.ts';
import type { PathsReport } from '../../shared/types/index.ts';
import type { CareerStore } from '../career-store/index.ts';
import type { ClassStore } from '../class-store/index.ts';
import type { ContentStore } from '../content-store/index.ts';
import type { QuickRaceStore } from '../quick-race-store/index.ts';
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
 * @param historic The store handlers read and write the historic events through
 * @param classes The store handlers read and write the user's class layer through
 * @param career The store handlers read and command the career through
 * @param quick The store handlers keep and run race events of the player's own through
 */
export const registerHandlers = (
  settings: SettingsStore,
  content: ContentStore,
  race: RaceStore,
  series: SeriesStore,
  historic: SeriesStore,
  classes: ClassStore,
  career: CareerStore,
  quick: QuickRaceStore,
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
  handle('content:car', async ({ id, installed }) => content.car(id, installed));
  handle('content:appraisal', async ({ id }) => content.appraisal(id));
  handle('content:tracks', async (query) => content.tracks(query));
  handle('content:carFacets', async ({ query }) => content.carFacets(query));
  handle('content:trackFacets', async ({ query }) => content.trackFacets(query));
  handle('content:track', async ({ key }) => content.track(key));
  handle('content:circuit', async ({ id }) => content.circuit(id));
  handle('content:weather', async () => {
    const installed = await content.content();

    return { weather: installed.weather, controllers: installed.controllers };
  });
  handle('content:issues', async () => content.issues());

  handle('race:get', async () => race.get());
  handle('race:cancel', async () => race.cancel());
  handle('race:results', async () => race.results());
  handle('race:latest', async () => race.latest());
  handle('race:result', async ({ file }) => race.result(file));

  handle('quick:list', async () => quick.list());
  handle('quick:archives', async () => quick.archives());
  handle('quick:get', async ({ id }) => quick.get(id));
  handle('quick:create', async () => quick.create());
  handle('quick:save', async (next) => quick.save(next));
  handle('quick:duplicate', async ({ id }) => quick.duplicate(id));
  handle('quick:remove', async ({ id }) => quick.remove(id));
  handle('quick:launch', async ({ id }) => quick.launch(id));
  handle('quick:restart', async ({ id }) => quick.restart(id));
  handle('quick:strength', async ({ id, strength }) => quick.strength(id, strength));

  handle('series:list', async () => series.list());
  handle('series:get', async ({ id }) => series.get(id));
  handle('series:validate', async ({ series: draft }) => series.validate(draft));
  handle('series:save', async ({ id, series: draft }) => series.save(id, draft));
  handle('series:customise', async ({ id }) => series.customise(id));
  handle('series:duplicate', async ({ id, name }) => series.duplicate(id, name));
  handle('series:create', async ({ series: drafted }) => series.create(drafted));
  handle('series:revert', async ({ id }) => series.revert(id));
  handle('series:delete', async ({ id }) => series.remove(id));

  // The dialogs live here rather than in the series store, so that store stays
  // the same path-in, value-out shape it has always had and imports no Electron.
  handle('series:import', async () => importInto(series));
  handle('series:export', async ({ id }) => exportFrom(series, id));
  handle('historic:import', async () => importInto(historic));
  handle('historic:export', async ({ id }) => exportFrom(historic, id));

  handle('historic:list', async () => historic.list());
  handle('historic:get', async ({ id }) => historic.get(id));
  handle('historic:validate', async ({ series: draft }) => historic.validate(draft));
  handle('historic:save', async ({ id, series: draft }) => historic.save(id, draft));
  handle('historic:customise', async ({ id }) => historic.customise(id));
  handle('historic:duplicate', async ({ id, name }) => historic.duplicate(id, name));
  handle('historic:create', async ({ series: drafted }) => historic.create(drafted));
  handle('historic:revert', async ({ id }) => historic.revert(id));
  handle('historic:delete', async ({ id }) => historic.remove(id));

  handle('classes:get', async () => classes.layer());
  handle('classes:assignCar', async ({ car, specs }) => classes.assignCar(car, specs));
  handle('classes:revertCar', async ({ car }) => classes.revertCar(car));
  handle('classes:saveClass', async (draft) => classes.saveClass(draft));
  handle('classes:copyClass', async ({ id, name }) => classes.copyClass(id, name));
  handle('classes:saveSpec', async (draft) => classes.saveSpec(draft));
  handle('classes:saveSpecCars', async ({ spec, cars }) => classes.saveSpecCars(spec, cars));
  // Which championships race a spec is the series store's to know, so the class
  // store is told them rather than reaching into the library itself.
  // Historic events race specs too, and name them the same way.
  const usingSpec = (spec: string): string[] => [...series.usingSpec(spec), ...historic.usingSpec(spec)];
  handle('classes:deleteSpec', async ({ id }) => classes.deleteSpec(id, usingSpec(id)));
  handle('classes:deleteClass', async ({ id }) => classes.deleteClass(id, usingSpec));

  handle('career:get', async () => career.get());
  handle('career:list', async ({ kind }) => career.list(kind));
  handle('career:create', async (request) => career.create(request));
  handle('career:createChampionship', async (request) => career.createChampionship(request));
  handle('career:preview', async ({ series: id, year }) => career.preview(id, year));
  handle('career:open', async ({ id }) => career.open(id));
  handle('career:close', async () => {
    await career.close();

    return null;
  });
  handle('career:delete', async ({ id }) => career.remove(id));
  handle('career:folder', async ({ id }) => {
    // Answers with an error message rather than throwing when it fails.
    const failure = await shell.openPath(await career.folderOf(id));
    if (failure) throw new Error(failure);

    return null;
  });
  handle('career:backup', async ({ id }) => {
    // No title, as for a championship's export: Windows names its own dialog.
    const result = await dialog.showSaveDialog(focusedWindow(), {
      defaultPath: await career.backupName(id),
      filters: [{ name: 'Zip', extensions: ['zip'] }],
    });
    if (result.canceled || !result.filePath) return null;

    return career.backup(id, result.filePath);
  });
  handle('career:openBackup', async ({ kind }) => {
    const result = await dialog.showOpenDialog(focusedWindow(), {
      properties: ['openFile'],
      filters: [{ name: 'Zip', extensions: ['zip'] }],
    });
    const file = result.canceled ? null : result.filePaths[0] ?? null;

    return file === null ? null : career.readBackup(file, kind);
  });
  handle('career:restore', async ({ file, replace }) => career.restore(file, replace));
  handle('career:showBackup', async ({ file }) => {
    shell.showItemInFolder(file);

    return null;
  });
  handle('career:driver', async (driver) => career.setDriver(driver));
  handle('career:settings', async (patch) => career.setSettings(patch));
  handle('career:saves', async ({ id }) => career.saves(id));
  handle('career:save', async (request) => career.save(request));
  handle('career:quickSave', async () => career.quickSave());
  handle('career:load', async ({ id, save }) => career.load(id, save));
  handle('career:renameSave', async ({ id, save, name }) => career.renameSave(id, save, name));
  handle('career:deleteSave', async ({ id, save }) => career.deleteSave(id, save));
  handle('career:savesFolder', async ({ id }) => {
    const failure = await shell.openPath(await career.savesFolderOf(id));
    if (failure) throw new Error(failure);

    return null;
  });
  handle('career:calendar', async ({ season }) => career.calendar(season));
  handle('career:enrol', async (request) => career.enrol(request));
  handle('career:buyCar', async (request) => career.buyCar(request));
  handle('career:buySeat', async (request) => career.buySeat(request));
  handle('career:sellCar', async ({ model }) => career.sellCar(model));
  handle('career:repaintCar', async (request) => career.repaintCar(request));
  handle('career:withdraw', async (request) => career.withdraw(request));
  handle('career:answer', async (request) => career.answer(request));
  handle('career:markMail', async (request) => career.markMail(request));
  handle('career:markAllRead', async () => career.markAllRead());
  handle('career:strength', async (request) => career.strength(request));
  handle('career:advance', async ({ date, skip }) => career.advanceTo(date, skip));
  handle('career:skips', async ({ date }) => career.skips(date));
  handle('career:roundCosts', async () => career.roundCosts());
  handle('career:event', async (request) => career.event(request));
  handle('career:results', async (request) => career.results(request));
  handle('career:skipping', async (request) => career.skipping(request));
  handle('career:skip', async (request) => career.skip(request));
  handle('career:launch', async (request) => career.launch(request));

  handle('cm:arguments', readCmArguments);
  handle('cm:setArgument', async ({ flag, enabled }) => setCmArgument(flag, enabled));

  handle('settings:get', async () => settings.get());
  handle('settings:patch', async (patch) => settings.patch(patch));
  handle('theme:get', async () => resolvedTheme());
  // before-quit writes every store out first.
  handle('app:quit', async () => {
    app.quit();

    return null;
  });
};
