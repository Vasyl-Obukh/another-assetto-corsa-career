import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { execFile } from 'node:child_process';
import { EventEmitter } from 'node:events';


import { launchUri } from '../launch.ts';

jest.mock('node:child_process');

const execFileMock = jest.mocked(execFile);

/**
 * A stand-in for the spawned Content Manager process.
 * @returns An emitter with the events launchUri listens for
 */
const fakeChild = () => new EventEmitter();

describe('core/launch/launch-uri', () => {
  describe('launchUri', () => {
    let child: EventEmitter;

    beforeEach(() => {
      child = fakeChild();
      execFileMock.mockImplementation(((...args: unknown[]) => {
        // The callback is the last argument; hold it for the tests that need it.
        const done = args[args.length - 1];
        if (typeof done === 'function') Object.assign(child, { done });
        return child;
      }) as never);
    });

    it('passes the URI as a single argv entry, so & cannot split the query', async () => {
      const pending = launchUri('C:\\cm.exe', 'acmanager://race/config?a=1&b=2');
      child.emit('spawn');
      await pending;

      expect(execFileMock).toHaveBeenCalledWith(
        'C:\\cm.exe',
        ['acmanager://race/config?a=1&b=2'],
        expect.anything(),
        expect.any(Function),
      );
    });

    it('places extra arguments before the URI', async () => {
      const pending = launchUri('C:\\cm.exe', 'acmanager://x', { extraArgs: ['--flag'] });
      child.emit('spawn');
      await pending;

      expect(execFileMock.mock.calls[0][1]).toEqual(['--flag', 'acmanager://x']);
    });

    it('resolves once the process has spawned', async () => {
      const pending = launchUri('C:\\cm.exe', 'acmanager://x');
      child.emit('spawn');

      await expect(pending).resolves.toBe(child);
    });

    it('rejects when the process cannot be started at all', async () => {
      const pending = launchUri('C:\\missing.exe', 'acmanager://x');
      child.emit('error', new Error('ENOENT'));

      await expect(pending).rejects.toThrow('ENOENT');
    });

    it('does not keep the window hidden, since CM shows its own UI', async () => {
      const pending = launchUri('C:\\cm.exe', 'acmanager://x');
      child.emit('spawn');
      await pending;

      expect(execFileMock.mock.calls[0][2]).toMatchObject({ windowsHide: false });
    });
  });
});
