// A slot's saves on disk: a file each in its saves folder, written whole and
// atomically. Knows nothing of what a save holds - the slot hands over a reader
// for its own state - so a standalone championship keeps its saves the same way
// a career does.

import {
  mkdir, readdir, readFile, rename, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { SAVE_ID_PATTERN } from './constants.ts';
import type { SaveFile } from './types.ts';
import { readSaveFile, summaryOf } from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { SaveSummary } from '../../shared/types/index.ts';
import { quarantine } from '../settings-store/index.ts';

export {
  AUTOSAVE_PREFIX, QUICK_SAVE_ID, SAVE_ID_PATTERN, SAVE_VERSION, SAVES_DIR,
} from './constants.ts';
export type { AutosaveSlot, SaveFile } from './types.ts';
export {
  autosaveSlot, checkedSaveName, saveKindOf, summaryOf,
} from './utils.ts';

/**
 * The file a save is kept in.
 * @param dir The slot's saves folder
 * @param id The save's id
 * @returns The file's path
 * @throws When the id is no save's, which keeps a crafted one from naming any
 * other file
 */
const fileOf = (dir: string, id: string): string => {
  if (!SAVE_ID_PATTERN.test(id)) throw new AppError('save.notFound');

  return path.join(dir, `${id}.json`);
};

/**
 * Reads one save, or answers null for one this build does not read.
 * @param dir The slot's saves folder
 * @param id The save's id
 * @param read Reads the state the save holds
 * @returns The save, or null
 * @throws The file system's error when the file cannot be read at all
 */
const parseSave = async <T>(
  dir: string,
  id: string,
  read: (state: unknown) => T | null,
): Promise<SaveFile<T> | null> => {
  const text = await readFile(fileOf(dir, id), 'utf8');
  try {
    return readSaveFile(JSON.parse(text), id, read);
  } catch {
    return null;
  }
};

/**
 * Every save in a slot's saves folder, newest first. One that cannot be read is
 * left out, and left where it is.
 * @param dir The slot's saves folder
 * @param read Reads the state a save holds
 * @returns The saves' summaries
 */
export const listSaves = async <T>(
  dir: string,
  read: (state: unknown) => T | null,
): Promise<SaveSummary[]> => {
  const ids = (await readdir(dir).catch(() => [] as string[]))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -'.json'.length))
    .filter((id) => SAVE_ID_PATTERN.test(id));
  const summaries = await Promise.all(ids.map(async (id): Promise<SaveSummary | null> => {
    try {
      const save = await parseSave(dir, id, read);
      if (save) return summaryOf(save);
      console.warn(`Save ${id} is not one this build reads; leaving it out.`);
    } catch (error) {
      console.warn(`Could not read save ${id}; leaving it out.`, error);
    }

    return null;
  }));

  return summaries
    .filter((one): one is SaveSummary => one !== null)
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));
};

/**
 * Reads one save.
 * @param dir The slot's saves folder
 * @param id The save's id
 * @param read Reads the state the save holds
 * @returns The save
 * @throws When there is no such save, or it is not one this build reads - in
 * which case it is set aside rather than half-understood
 */
export const readSave = async <T>(
  dir: string,
  id: string,
  read: (state: unknown) => T | null,
): Promise<SaveFile<T>> => {
  let save: SaveFile<T> | null;
  try {
    save = await parseSave(dir, id, read);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new AppError('save.notFound');
    throw error;
  }
  if (!save) {
    const moved = await quarantine(fileOf(dir, id));
    console.warn(`Save was not one this build reads; ${moved ? `moved to ${moved}` : 'ignoring it'}.`);
    throw new AppError('save.unreadable');
  }

  return save;
};

/**
 * Writes one save, replacing its file in one step.
 * @param dir The slot's saves folder
 * @param save The save
 * @returns Resolves once it is written
 */
export const writeSave = async <T>(dir: string, save: SaveFile<T>): Promise<void> => {
  const file = fileOf(dir, save.id);
  const tmp = `${file}.tmp`;
  await mkdir(dir, { recursive: true });
  await writeFile(tmp, JSON.stringify(save, null, 2), 'utf8');
  await rename(tmp, file);
};

/**
 * Deletes one save.
 * @param dir The slot's saves folder
 * @param id The save's id
 * @returns Resolves once it is gone
 * @throws When there is no such save
 */
export const removeSave = async (dir: string, id: string): Promise<void> => {
  try {
    await rm(fileOf(dir, id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new AppError('save.notFound');
    throw error;
  }
};
