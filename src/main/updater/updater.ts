import { app } from 'electron';
import electronUpdater from 'electron-updater';

import { CHECK_EVERY_MS } from './constants.ts';
import type { Updater, UpdaterOptions } from './types.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { UpdateState, UpdateStatus } from '../../shared/types/index.ts';

export type { Updater, UpdaterOptions } from './types.ts';

/**
 * The phases a check may start from. Anything else is a check under way, or
 * a version being fetched or waiting to install, which a fresh look would
 * throw back to `available`.
 */
const CHECKABLE: ReadonlySet<UpdateState['phase']> = new Set(['idle', 'latest', 'available', 'failed']);

/**
 * Creates the updater over electron-updater, reading the GitHub release feed
 * electron-builder wrote into the install (`resources/app-update.yml`).
 *
 * Outside an installed build it does nothing and says `unsupported`.
 * @param options What it needs from the rest of main
 * @returns The updater
 */
export const createUpdater = ({ racing, flush }: UpdaterOptions): Updater => {
  const current = app.getVersion();
  // Reached only when installed: the getter builds the updater, which looks
  // for app-update.yml beside the archive.
  const autoUpdater = app.isPackaged ? electronUpdater.autoUpdater : null;
  const listeners = new Set<(status: UpdateStatus) => void>();
  let state: UpdateState = autoUpdater ? { phase: 'idle' } : { phase: 'unsupported' };
  let timer: ReturnType<typeof setInterval> | null = null;
  // What a look started from an offer leaves standing if it fails.
  let offer: UpdateState | null = null;

  /**
   * The status as it stands.
   * @returns The version running and the state
   */
  const status = (): UpdateStatus => ({ current, state });

  /**
   * Moves to a new state and tells every listener.
   * @param next The state now
   */
  const move = (next: UpdateState): void => {
    state = next;
    for (const listener of listeners) listener(status());
  };

  if (autoUpdater) {
    // Nothing is fetched unasked; once it has been asked for, quitting the
    // app any way at all installs it.
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      offer = state.phase === 'available' ? state : null;
      move({ phase: 'checking' });
    });
    autoUpdater.on('update-available', (info) => move({ phase: 'available', version: info.version }));
    autoUpdater.on('update-not-available', () => move({ phase: 'latest', checkedAt: new Date().toISOString() }));
    autoUpdater.on('download-progress', (progress) => {
      const percent = Math.floor(progress.percent);
      // Pushed once a whole percent, not on every chunk.
      if (state.phase === 'downloading' && percent !== state.percent) move({ ...state, percent });
    });
    autoUpdater.on('update-downloaded', (info) => move({ phase: 'ready', version: info.version }));
    autoUpdater.on('error', (error) => {
      console.error('Updating failed.', error);
      // A version fetched still installs on quit, whatever went wrong after.
      if (state.phase === 'ready') return;
      if (state.phase === 'downloading') move({ phase: 'failed', version: state.version });
      else move(offer ?? { phase: 'failed', version: null });
    });
  }

  /**
   * Looks for a newer version, when one may be looked for.
   * @returns The status once the look has started
   */
  const check = (): UpdateStatus => {
    if (!autoUpdater || !CHECKABLE.has(state.phase)) return status();
    // A failure arrives as the error event too, which is what moves the state.
    autoUpdater.checkForUpdates().catch(() => {});

    return status();
  };

  return {
    get: status,

    check,

    download: () => {
      if (!autoUpdater || state.phase !== 'available') return status();
      move({ phase: 'downloading', version: state.version, percent: 0 });
      autoUpdater.downloadUpdate().catch(() => {});

      return status();
    },

    install: async () => {
      if (!autoUpdater || state.phase !== 'ready') throw new AppError('update.notReady');
      if (racing()) throw new AppError('update.raceInFlight');
      // The installer closes the app once it starts, so nothing is left to
      // the before-quit flush.
      await flush();
      autoUpdater.quitAndInstall(true, true);
    },

    schedule: (enabled) => {
      if (!autoUpdater) return;
      if (timer) clearInterval(timer);
      timer = null;
      if (!enabled) return;
      check();
      timer = setInterval(check, CHECK_EVERY_MS);
    },

    onChange: (listener) => {
      listeners.add(listener);

      return () => { listeners.delete(listener); };
    },
  };
};
