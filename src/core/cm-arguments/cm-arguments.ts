// Reading and writing Content Manager's Arguments.txt, one flag per line.
//
// Deliberately unlike src/core/weather-plan/, which keeps a backup: there, an
// install overwrites values - LAST_USED, a whole preset slot - that cannot be
// reconstructed afterwards, so what was there has to be recorded first. Here a
// flag's presence *is* the state, turning it back off is a complete undo, and
// every other line is passed through untouched, so there is nothing to lose and
// no file of ours to leave behind in someone else's folder.

import {
  mkdir, readFile, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { ARGUMENTS_FILE, CM_DATA_DIR, DEFAULT_EOL } from './constants.ts';
import { CM_FLAGS } from '../../shared/constants/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { CmArguments, CmFlag } from '../../shared/types/index.ts';

/**
 * Where Content Manager keeps its extra startup arguments.
 *
 * Derived from %LOCALAPPDATA% rather than from the exe, which is why it is not
 * one of the probed paths: it is Content Manager's data folder, and the install
 * probe answers a different question.
 * @returns The absolute path to Arguments.txt
 * @throws When LOCALAPPDATA is not set, rather than resolving somewhere else
 */
export const cmArgumentsFile = (): string => {
  const localAppData = process.env.LOCALAPPDATA;
  // Without this the join yields a relative path, and the file would be read
  // from - and written into - whatever the working directory happens to be.
  if (!localAppData) throw new AppError('cm.arguments.noDataDir', {});

  return path.join(localAppData, CM_DATA_DIR, ARGUMENTS_FILE);
};

/**
 * Reads the file, treating anything unreadable as absent.
 *
 * Not having it is the ordinary case, since Content Manager only creates it
 * when someone puts a flag in it.
 * @param file Absolute path to Arguments.txt
 * @returns Its contents, or null when there are none to read
 */
const readText = async (file: string): Promise<string | null> => {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
};

/**
 * Reads Arguments.txt, treating a missing one as an empty one.
 *
 * Never throws, other than when there is no data folder to look in at all.
 * @returns The file's path, whether it exists, and which of our flags are set
 */
export const readCmArguments = async (): Promise<CmArguments> => {
  const file = cmArgumentsFile();
  const text = await readText(file);

  if (text === null) return { file, exists: false, enabled: [] };

  const lines = text.split(/\r?\n/).map((line) => line.trim());

  return { file, exists: true, enabled: CM_FLAGS.filter((flag) => lines.includes(flag)) };
};

/**
 * Adds or removes one flag, leaving every other line exactly as it was.
 *
 * Line level rather than a rewrite, for the same reason `patchIni` is: the user
 * may have put their own arguments in here and they are none of our business.
 * @param flag The flag to set
 * @param enabled Whether it should be in the file
 * @returns What the file holds afterwards, read back rather than assumed
 * @throws When the flag is not one the app offers
 */
export const setCmArgument = async (flag: CmFlag, enabled: boolean): Promise<CmArguments> => {
  if (!CM_FLAGS.includes(flag)) throw new AppError('cm.arguments.unknownFlag', { flag });

  const file = cmArgumentsFile();
  const text = await readText(file) ?? '';
  const lines = text.split(/\r?\n/);
  // Already how they want it: writing anyway would only move the flag to the
  // end of a file we are a guest in, for no gain.
  const set = lines.some((line) => line.trim() === flag);

  if (set !== enabled) {
    const eol = text.includes('\r\n') || text === '' ? DEFAULT_EOL : '\n';
    const kept = lines.filter((line) => line.trim() !== flag);
    // A trailing blank line is what makes the next append land on its own line,
    // so the flag is inserted before it rather than after.
    while (kept.length > 0 && kept[kept.length - 1]?.trim() === '') kept.pop();
    if (enabled) kept.push(flag);

    if (kept.length === 0) {
      // Nothing left means nothing was ever there but our own flags and blank
      // lines, so the file goes rather than being left behind empty: turning a
      // flag off should put Content Manager's folder back as it was found.
      await rm(file, { force: true });
    } else {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, `${kept.join(eol)}${eol}`);
    }
  }

  // Read back rather than assumed, so the answer is what is on disk even if
  // something else wrote the file while we were in here.
  return readCmArguments();
};
