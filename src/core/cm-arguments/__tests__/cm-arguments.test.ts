import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  mkdir, readFile, rm, writeFile,
} from 'node:fs/promises';

import { cmArgumentsFile, readCmArguments, setCmArgument } from '../cm-arguments.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const rmMock = jest.mocked(rm);
const mkdirMock = jest.mocked(mkdir);

const TEST_MODE = '--enable-race-ini-test-mode';
const SKIP_RESULTS = '--skip-all-results';
const THEIRS = '--something-of-theirs';

// One in-memory file behind all three calls, so that reading a result back -
// which is what setCmArgument actually returns - reports what was written
// rather than what a mock was told to say.
let file: string | null = null;

/**
 * The text handed to the first writeFile call.
 * @returns What was written
 */
const written = (): string => String(writeFileMock.mock.calls[0]?.[1]);

describe('core/cm-arguments/cm-arguments', () => {
  const localAppData = process.env.LOCALAPPDATA;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LOCALAPPDATA = 'C:\\Users\\Test\\AppData\\Local';
    file = null;

    // Cast because readFile is overloaded on its options: the module always
    // asks for utf8 and so always gets a string back, which the widest
    // overload's Buffer return type cannot express.
    readFileMock.mockImplementation((async () => {
      if (file === null) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });

      return file;
    }) as unknown as typeof readFile);
    writeFileMock.mockImplementation(async (unused, data) => { file = String(data); });
    rmMock.mockImplementation(async () => { file = null; });
    mkdirMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (localAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = localAppData;
  });

  describe('cmArgumentsFile', () => {
    it('puts the file in the Content Manager data folder', () => {
      expect(cmArgumentsFile()).toBe(
        'C:\\Users\\Test\\AppData\\Local\\AcTools Content Manager\\Arguments.txt',
      );
    });

    // Without the guard the join yields a relative path, and the file would be
    // read from - and written into - whatever the working directory happens to
    // be, which is the repo itself when the CLI runs.
    it('throws rather than resolving into the working directory', () => {
      delete process.env.LOCALAPPDATA;
      expect(() => cmArgumentsFile()).toThrow('LOCALAPPDATA is not set');
    });
  });

  describe('readCmArguments', () => {
    it('reads a missing file as an empty one rather than throwing', async () => {
      expect(await readCmArguments()).toMatchObject({ exists: false, enabled: [] });
    });

    it('reports which of our flags the file holds', async () => {
      file = `${SKIP_RESULTS}\r\n${TEST_MODE}\r\n`;

      expect(await readCmArguments()).toMatchObject({
        exists: true,
        enabled: [SKIP_RESULTS, TEST_MODE],
      });
    });

    it('ignores arguments the user put there themselves', async () => {
      file = `${THEIRS}\r\n${SKIP_RESULTS}\r\n`;

      expect((await readCmArguments()).enabled).toEqual([SKIP_RESULTS]);
    });

    it('reads a flag surrounded by whitespace', async () => {
      file = `  ${SKIP_RESULTS}  \n`;

      expect((await readCmArguments()).enabled).toEqual([SKIP_RESULTS]);
    });

    it('reports an existing but empty file as existing', async () => {
      file = '';

      expect(await readCmArguments()).toMatchObject({ exists: true, enabled: [] });
    });

    it('names the file either way, so a screen can point at it', async () => {
      expect((await readCmArguments()).file).toContain('Arguments.txt');
    });
  });

  describe('setCmArgument', () => {
    it('creates the file when there is none, which is the ordinary case', async () => {
      await setCmArgument(TEST_MODE, true);

      expect(mkdirMock).toHaveBeenCalled();
      expect(written()).toBe(`${TEST_MODE}\r\n`);
    });

    it('appends to what is already there, leaving other lines alone', async () => {
      file = `${THEIRS}\r\n`;

      await setCmArgument(TEST_MODE, true);

      expect(written()).toBe(`${THEIRS}\r\n${TEST_MODE}\r\n`);
    });

    it('removes only its own line', async () => {
      file = `${THEIRS}\r\n${TEST_MODE}\r\n--another\r\n`;

      await setCmArgument(TEST_MODE, false);

      expect(written()).toBe(`${THEIRS}\r\n--another\r\n`);
    });

    // A flag's presence is the whole state, so turning it off has to put the
    // folder back as it was found rather than leave an empty file behind.
    it('removes the file when nothing but our own flag was in it', async () => {
      file = `${TEST_MODE}\r\n`;

      await setCmArgument(TEST_MODE, false);

      expect(rmMock).toHaveBeenCalledWith(expect.stringContaining('Arguments.txt'), { force: true });
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('follows the line endings the file already uses', async () => {
      file = `${THEIRS}\n`;

      await setCmArgument(TEST_MODE, true);

      expect(written()).toBe(`${THEIRS}\n${TEST_MODE}\n`);
    });

    // Writing anyway would only move the flag to the end of a file we are a
    // guest in, for no gain.
    it('writes nothing when the flag is already how it was asked for', async () => {
      file = `${TEST_MODE}\r\n`;

      await setCmArgument(TEST_MODE, true);

      expect(writeFileMock).not.toHaveBeenCalled();
      expect(rmMock).not.toHaveBeenCalled();
    });

    it('writes nothing when asked to remove a flag that is not there', async () => {
      file = `${THEIRS}\r\n`;

      await setCmArgument(TEST_MODE, false);

      expect(writeFileMock).not.toHaveBeenCalled();
      expect(rmMock).not.toHaveBeenCalled();
    });

    it('does not leave a blank line where the trailing newline was', async () => {
      file = `${SKIP_RESULTS}\r\n\r\n\r\n`;

      await setCmArgument(TEST_MODE, true);

      expect(written()).toBe(`${SKIP_RESULTS}\r\n${TEST_MODE}\r\n`);
    });

    // main writes this file, so a renderer bug must not be able to append an
    // arbitrary line to another program's startup arguments.
    it('refuses a flag the app does not offer', async () => {
      await expect(setCmArgument('--rm-rf' as never, true))
        .rejects.toThrow('not a Content Manager flag');
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('answers with what the file holds afterwards, read back', async () => {
      expect(await setCmArgument(TEST_MODE, true)).toMatchObject({
        exists: true,
        enabled: [TEST_MODE],
      });

      expect(await setCmArgument(TEST_MODE, false)).toMatchObject({
        exists: false,
        enabled: [],
      });
    });

    // The whole reason there is no backup file: add then remove has to be a
    // complete undo, down to the bytes.
    it('leaves a file of the user\'s own byte-identical after add and remove', async () => {
      const before = `${THEIRS}\r\n--another\r\n`;
      file = before;

      await setCmArgument(TEST_MODE, true);
      await setCmArgument(TEST_MODE, false);

      expect(file).toBe(before);
    });
  });
});
