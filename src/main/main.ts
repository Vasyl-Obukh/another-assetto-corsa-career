import { app, BrowserWindow } from 'electron';
import path from 'node:path';

import { createCareerStore } from './career-store/index.ts';
import { createClassStore } from './class-store/index.ts';
import { registerContentScheme, serveContent } from './content-protocol/index.ts';
import { MIN_REVALIDATE_MS } from './content-store/constants.ts';
import { createContentStore } from './content-store/index.ts';
import { registerHandlers, send } from './ipc/index.ts';
import { createRaceStore } from './race-store/index.ts';
import { createSeriesStore } from './series-store/index.ts';
import { createSettingsStore } from './settings-store/index.ts';
import { applyThemeChoice, onThemeChange } from './theme/index.ts';
import { createWindow, followRace } from './window/index.ts';

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
    const settings = await createSettingsStore(app.getPath('userData'));
    const content = await createContentStore(app.getPath('userData'));
    content.include(settings.get().addedContent);
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
    // After the series store, because a career is entered into championships it
    // resolves. It subscribes to the race store itself rather than being wired
    // here: deciding that a weekend has finished means reading the plan, the
    // progress and the phase together, which is a career rule and not wiring.
    const career = await createCareerStore(app.getPath('userData'), series, race, content);
    applyThemeChoice(settings.get().theme);
    registerHandlers(settings, content, race, series, classes, career);
    serveContent(() => content.contentDir());

    const preload = path.join(import.meta.dirname, '../preload/preload.cjs');
    const rendererUrl = process.env.ELECTRON_RENDERER_URL ?? null;
    mainWindow = createWindow(settings, preload, rendererUrl);

    // Coming back from Content Manager is the likeliest moment for content to
    // have changed, and the cheapest one to notice it in.
    mainWindow.on('focus', () => {
      void content.revalidate({ throttleMs: MIN_REVALIDATE_MS });
    });

    onThemeChange((theme) => {
      if (mainWindow) send(mainWindow, 'theme:changed', theme);
    });

    settings.onChange((next) => {
      applyThemeChoice(next.theme);
      content.include(next.addedContent);
      if (mainWindow) send(mainWindow, 'settings:changed', next);
    });

    content.onChange((change) => {
      if (mainWindow) send(mainWindow, 'content:changed', change);
    });

    series.onChange((library) => {
      if (mainWindow) send(mainWindow, 'series:changed', library);
    });

    classes.onChange((layer) => {
      content.classify(classes.catalogue());
      if (mainWindow) send(mainWindow, 'classes:changed', layer);
      // What a spec holds decides whether a championship can be raced.
      series.refresh().catch((error: unknown) => {
        console.error('Could not refresh the championship library.', error);
      });
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
        mainWindow = createWindow(settings, preload, rendererUrl);
      }
    });

    app.on('before-quit', () => {
      void settings.flush();
      void content.flush();
      void race.flush();
      void career.flush();
      content.dispose();
    });
  }, (error: unknown) => {
    console.error('Failed to start.', error);
    app.quit();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
