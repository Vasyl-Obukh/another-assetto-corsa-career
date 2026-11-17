import { app, BrowserWindow } from 'electron';
import path from 'node:path';

import { createCareerStore } from './career-store/index.ts';
import { createClassStore } from './class-store/index.ts';
import { registerContentScheme, serveContent } from './content-protocol/index.ts';
import { MIN_REVALIDATE_MS } from './content-store/constants.ts';
import { createContentStore } from './content-store/index.ts';
import { registerHandlers, send } from './ipc/index.ts';
import { createQuickRaceStore } from './quick-race-store/index.ts';
import { createRaceStore } from './race-store/index.ts';
import { createSeriesStore, HISTORIC_DIR } from './series-store/index.ts';
import { createSettingsStore } from './settings-store/index.ts';
import { applyThemeChoice, onThemeChange } from './theme/index.ts';
import { createUpdater } from './updater/index.ts';
import { createWindow, followRace } from './window/index.ts';
import { historicProblems, SHIPPED_HISTORIC } from '../core/historic-library/index.ts';
import { homeRegion } from '../core/home-region/index.ts';
import { regionOfLocale, unitsOfRegion } from '../shared/utils/units/index.ts';

// The app sits alongside a running game; a second copy racing it for the same
// settings file and the same AC folders helps nobody.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // Has to happen before whenReady resolves, and is ignored without a word if it
  // does not. See registerContentScheme.
  registerContentScheme();

  let mainWindow: BrowserWindow | null = null;

  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    // The country Windows is set to decides the units a fresh install reads
    // in, its regional format standing in where the country cannot be read.
    const settings = await createSettingsStore(
      app.getPath('userData'),
      async () => unitsOfRegion((await homeRegion()) ?? regionOfLocale(app.getSystemLocale())),
    );
    const content = await createContentStore(app.getPath('userData'));
    content.include(settings.get().addedContent);
    content.priceWith(settings.get().carPrices);
    const classes = await createClassStore(app.getPath('userData'));
    content.classify(classes.catalogue());
    const race = await createRaceStore(app.getPath('userData'), content, settings);
    const series = await createSeriesStore(
      app.getPath('userData'),
      content,
      race,
      classes,
      settings,
    );
    // The historic events are one-round championships, so they are kept by a
    // second store of the same kind over a library of their own.
    const historic = await createSeriesStore(
      app.getPath('userData'),
      content,
      race,
      classes,
      settings,
      { dir: HISTORIC_DIR, shipped: SHIPPED_HISTORIC, rules: historicProblems },
    );
    // After the series store, because a career is entered into championships it
    // resolves. It subscribes to the race store itself rather than being wired
    // here: deciding that an event has finished means reading the plan, the
    // progress and the phase together, which is a career rule and not wiring.
    const career = await createCareerStore(app.getPath('userData'), series, historic, race, content, settings);
    const quick = await createQuickRaceStore(app.getPath('userData'), content, classes, series, settings, race);
    applyThemeChoice(settings.get().theme);

    /**
     * Writes out whatever every store still holds.
     * @returns Resolves once each has finished, whether or not it managed to
     */
    const flushAll = async (): Promise<void> => {
      await Promise.allSettled([settings.flush(), content.flush(), race.flush(), career.flush(), quick.flush()]);
    };
    const updater = createUpdater({
      racing: () => race.progress()?.inFlight ?? false,
      flush: flushAll,
    });

    registerHandlers(settings, content, race, series, historic, classes, career, quick, updater);
    serveContent(() => content.contentDir());

    const preload = path.join(import.meta.dirname, '../preload/preload.cjs');
    // Packaged, the icon ships beside app.asar (see electron-builder.yml).
    const icon = app.isPackaged
      ? path.join(process.resourcesPath, 'icon.ico')
      : path.join(import.meta.dirname, '../../resources/icon.ico');
    const rendererUrl = process.env.ELECTRON_RENDERER_URL ?? null;
    mainWindow = createWindow(settings, preload, icon, rendererUrl);

    // Coming back from Content Manager is the likeliest moment for content to
    // have changed, and the cheapest one to notice it in.
    mainWindow.on('focus', () => {
      void content.revalidate({ throttleMs: MIN_REVALIDATE_MS });
    });

    /**
     * Lists both libraries afresh and pushes them, for a change that moves what
     * a championship can race.
     */
    const refreshLibraries = (): void => {
      series.refresh().catch((error: unknown) => {
        console.error('Could not refresh the championship library.', error);
      });
      historic.refresh().catch((error: unknown) => {
        console.error('Could not refresh the historic events.', error);
      });
    };

    onThemeChange((theme) => {
      if (mainWindow) send(mainWindow, 'theme:changed', theme);
    });

    // Every patch reads the whole file afresh, so the choices are compared as
    // written rather than by identity.
    let trackChoices = JSON.stringify(settings.get().trackChoices);
    let { checkForUpdates } = settings.get();
    settings.onChange((next) => {
      applyThemeChoice(next.theme);
      content.include(next.addedContent);
      content.priceWith(next.carPrices);
      if (mainWindow) send(mainWindow, 'settings:changed', next);
      // A track chosen for a recommended layout moves every round racing it.
      const choices = JSON.stringify(next.trackChoices);
      if (choices !== trackChoices) {
        trackChoices = choices;
        refreshLibraries();
      }
      if (next.checkForUpdates !== checkForUpdates) {
        checkForUpdates = next.checkForUpdates;
        updater.schedule(checkForUpdates);
      }
    });

    updater.onChange((next) => {
      if (mainWindow) send(mainWindow, 'update:changed', next);
    });
    // After the window, so the first look's answer has somewhere to go.
    updater.schedule(checkForUpdates);

    content.onChange((change) => {
      if (mainWindow) send(mainWindow, 'content:changed', change);
    });

    series.onChange((library) => {
      if (mainWindow) send(mainWindow, 'series:changed', library);
    });

    historic.onChange((library) => {
      if (mainWindow) send(mainWindow, 'historic:changed', library);
    });

    classes.onChange((layer) => {
      content.classify(classes.catalogue());
      if (mainWindow) send(mainWindow, 'classes:changed', layer);
      // What a spec holds decides whether a championship can be raced.
      refreshLibraries();
    });

    quick.onChange((next) => {
      if (mainWindow) send(mainWindow, 'quick:changed', next);
    });

    career.onSaves((saves) => {
      if (mainWindow) send(mainWindow, 'career:savesChanged', saves);
    });
    career.onChange((next) => {
      if (mainWindow) send(mainWindow, 'career:changed', next);
    });

    race.onChange((setup) => {
      if (!mainWindow) return;
      send(mainWindow, 'race:changed', setup);
      // The app sits alongside a running game, so it gets out of the way for
      // the length of a launch and comes back when the result lands.
      followRace(mainWindow, setup.status.phase);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow(settings, preload, icon, rendererUrl);
      }
    });

    // Quitting waits for every store's pending write, which the process
    // would otherwise outrun.
    let flushed = false;
    app.on('before-quit', (event) => {
      if (flushed) return;
      event.preventDefault();
      content.dispose();
      void flushAll().then(() => {
        flushed = true;
        app.quit();
      });
    });
  }, (error: unknown) => {
    console.error('Failed to start.', error);
    app.quit();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
