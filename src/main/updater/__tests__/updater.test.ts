import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { app } from 'electron';
import electronUpdater from 'electron-updater';
import type { EventEmitter } from 'node:events';

import type { UpdateStatus } from '../../../shared/types/index.ts';
import { CHECK_EVERY_MS } from '../constants.ts';
import type { UpdaterOptions } from '../types.ts';
import { createUpdater } from '../updater.ts';

jest.mock('electron', () => ({ app: { getVersion: () => '0.1.0', isPackaged: true } }));

// The real autoUpdater is an event emitter whose check announces itself at
// once and whose failures arrive as the error event.
jest.mock('electron-updater', () => {
  const { EventEmitter } = jest.requireActual<typeof import('node:events')>('node:events');
  const autoUpdater = Object.assign(new EventEmitter(), {
    autoDownload: true,
    autoInstallOnAppQuit: false,
    checkForUpdates: jest.fn(),
    downloadUpdate: jest.fn(),
    quitAndInstall: jest.fn(),
  });

  return { __esModule: true, default: { autoUpdater } };
});

const { autoUpdater } = electronUpdater;
const fakeUpdater = jest.mocked(autoUpdater);
// Untyped, so an event can carry only the fields the updater reads.
const feed = autoUpdater as unknown as EventEmitter;
const electronApp = app as { isPackaged: boolean };

/**
 * Builds an updater with no race running, over a flush that does nothing.
 * @param options What to put in place of the defaults
 * @returns The updater
 */
const updater = (options: Partial<UpdaterOptions> = {}) => createUpdater({
  racing: () => false,
  flush: async () => {},
  ...options,
});

/**
 * Builds an updater with a newer version already on offer.
 * @param options What to put in place of the defaults
 * @returns The updater
 */
const offering = (options: Partial<UpdaterOptions> = {}) => {
  const made = updater(options);
  made.check();
  feed.emit('update-available', { version: '0.2.0' });

  return made;
};

/**
 * Builds an updater with a newer version fetched and waiting to install.
 * @param options What to put in place of the defaults
 * @returns The updater
 */
const fetched = (options: Partial<UpdaterOptions> = {}) => {
  const made = offering(options);
  made.download();
  feed.emit('update-downloaded', { version: '0.2.0' });

  return made;
};

describe('main/updater', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-11-17T12:00:00.000Z') });
    electronApp.isPackaged = true;
    feed.removeAllListeners();
    fakeUpdater.checkForUpdates.mockImplementation(async () => {
      feed.emit('checking-for-update');

      return null;
    });
    fakeUpdater.downloadUpdate.mockImplementation(async () => []);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createUpdater', () => {
    it('reports the running version, not yet checked', () => {
      expect(updater().get()).toEqual({ current: '0.1.0', state: { phase: 'idle' } });
    });

    it('fetches nothing unasked, and installs what was fetched on any quit', () => {
      updater();

      expect(autoUpdater.autoDownload).toBe(false);
      expect(autoUpdater.autoInstallOnAppQuit).toBe(true);
    });

    it('says a build that is not installed cannot update, and never looks', () => {
      electronApp.isPackaged = false;
      const made = updater();
      made.schedule(true);

      expect(made.check().state).toEqual({ phase: 'unsupported' });
      expect(made.download().state).toEqual({ phase: 'unsupported' });
      jest.advanceTimersByTime(CHECK_EVERY_MS);
      expect(made.get().state).toEqual({ phase: 'unsupported' });
    });
  });

  describe('check', () => {
    it('answers that the look has started', () => {
      expect(updater().check().state).toEqual({ phase: 'checking' });
    });

    it('records when it found nothing newer', () => {
      const made = updater();
      made.check();
      feed.emit('update-not-available', { version: '0.1.0' });

      expect(made.get().state).toEqual({ phase: 'latest', checkedAt: '2026-11-17T12:00:00.000Z' });
    });

    it('offers a newer version without fetching it', () => {
      expect(offering().get().state).toEqual({ phase: 'available', version: '0.2.0' });
    });

    it('fails with no version when the look itself went wrong', () => {
      const made = updater();
      made.check();
      feed.emit('error', new Error('404'));

      expect(made.get().state).toEqual({ phase: 'failed', version: null });
    });

    // Fixed bug: a failed re-check dropped the version on offer, and called it a failed check.
    it('keeps the version on offer when a later look fails', () => {
      const made = offering();
      made.check();
      feed.emit('error', new Error('offline'));

      expect(made.get().state).toEqual({ phase: 'available', version: '0.2.0' });
    });

    it('looks again after a failure', () => {
      const made = updater();
      made.check();
      feed.emit('error', new Error('404'));

      expect(made.check().state).toEqual({ phase: 'checking' });
    });

    it('leaves a version being fetched alone', () => {
      const made = offering();
      made.download();

      expect(made.check().state).toEqual({ phase: 'downloading', version: '0.2.0', percent: 0 });
    });

    it('leaves a version waiting to install alone', () => {
      expect(fetched().check().state).toEqual({ phase: 'ready', version: '0.2.0' });
    });
  });

  describe('download', () => {
    it('does nothing while nothing is on offer', () => {
      expect(updater().download().state).toEqual({ phase: 'idle' });
    });

    it('starts fetching the version on offer from nothing', () => {
      expect(offering().download().state).toEqual({ phase: 'downloading', version: '0.2.0', percent: 0 });
    });

    it('pushes progress once a whole percent', () => {
      const made = offering();
      made.download();
      const pushed: UpdateStatus[] = [];
      made.onChange((next) => pushed.push(next));
      feed.emit('download-progress', { percent: 12.2 });
      feed.emit('download-progress', { percent: 12.9 });
      feed.emit('download-progress', { percent: 13.1 });

      expect(pushed.map(({ state }) => state)).toEqual([
        { phase: 'downloading', version: '0.2.0', percent: 12 },
        { phase: 'downloading', version: '0.2.0', percent: 13 },
      ]);
    });

    it('waits to install once fetched', () => {
      expect(fetched().get().state).toEqual({ phase: 'ready', version: '0.2.0' });
    });

    it('fails naming the version whose download went wrong', () => {
      const made = offering();
      made.download();
      feed.emit('error', new Error('reset'));

      expect(made.get().state).toEqual({ phase: 'failed', version: '0.2.0' });
    });
  });

  describe('install', () => {
    // Fixed bug: an installer that would not start read as a failed check.
    it('keeps a fetched version waiting when installing it goes wrong', () => {
      const made = fetched();
      feed.emit('error', new Error('spawn EPERM'));

      expect(made.get().state).toEqual({ phase: 'ready', version: '0.2.0' });
    });


    it('refuses while nothing is fetched', async () => {
      await expect(offering().install()).rejects.toMatchObject({ code: 'update.notReady' });
    });

    it('refuses while a race is running, writing nothing out', async () => {
      const flush = jest.fn(async () => {});

      await expect(fetched({ racing: () => true, flush }).install())
        .rejects.toMatchObject({ code: 'update.raceInFlight' });
      expect(flush).not.toHaveBeenCalled();
      expect(fakeUpdater.quitAndInstall).not.toHaveBeenCalled();
    });

    it('writes every store out before quitting to install', async () => {
      const order: string[] = [];
      fakeUpdater.quitAndInstall.mockImplementation(() => { order.push('quit'); });

      await fetched({ flush: async () => { order.push('flush'); } }).install();

      expect(order).toEqual(['flush', 'quit']);
    });
  });

  describe('schedule', () => {
    it('looks at once, and again every few hours', () => {
      const made = updater();
      made.schedule(true);
      expect(made.get().state).toEqual({ phase: 'checking' });

      feed.emit('update-not-available', { version: '0.1.0' });
      jest.advanceTimersByTime(CHECK_EVERY_MS);

      expect(made.get().state).toEqual({ phase: 'checking' });
    });

    it('stops looking once switched off', () => {
      const made = updater();
      made.schedule(true);
      feed.emit('update-not-available', { version: '0.1.0' });
      made.schedule(false);
      jest.advanceTimersByTime(CHECK_EVERY_MS);

      expect(made.get().state.phase).toBe('latest');
    });

    it('keeps a single timer when switched on twice', () => {
      const made = updater();
      made.schedule(true);
      made.schedule(true);

      expect(jest.getTimerCount()).toBe(1);
    });
  });

  describe('onChange', () => {
    it('stops pushing once unsubscribed', () => {
      const made = updater();
      const pushed: UpdateStatus[] = [];
      const stop = made.onChange((next) => pushed.push(next));
      made.check();
      stop();
      feed.emit('update-not-available', { version: '0.1.0' });

      expect(pushed).toEqual([{ current: '0.1.0', state: { phase: 'checking' } }]);
    });
  });
});
