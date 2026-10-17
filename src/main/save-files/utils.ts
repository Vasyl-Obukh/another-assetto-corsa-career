import {
  AUTOSAVE_PREFIX, MAX_SAVE_NAME, QUICK_SAVE_ID, SAVE_VERSION,
} from './constants.ts';
import type { AutosaveSlot, SaveFile } from './types.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  SaveKind, SaveMoment, SaveSummary, SessionType,
} from '../../shared/types/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';

/**
 * What kind of save an id names, which the id alone decides - so a file
 * edited to call itself named cannot be written over as one.
 * @param id The save's id
 * @returns Its kind
 */
export const saveKindOf = (id: string): SaveKind => {
  if (id === QUICK_SAVE_ID) return 'quick';

  return id.startsWith(AUTOSAVE_PREFIX) ? 'auto' : 'named';
};

/**
 * Reads what an autosave was taken after, leniently: it only names the save,
 * so one that does not read leaves the save without a name rather than
 * unreadable.
 * @param raw The value off disk
 * @returns The moment, or null
 */
const readMoment = (raw: unknown): SaveMoment | null => {
  if (!isRecord(raw)) return null;
  if (raw.kind === 'season') return typeof raw.year === 'number' ? { kind: 'season', year: raw.year } : null;

  const { session } = raw;
  if (
    raw.kind !== 'session'
    || typeof raw.seriesName !== 'string'
    || typeof raw.roundName !== 'string'
    || !isRecord(session)
    || typeof session.type !== 'string'
  ) return null;

  return {
    kind: 'session',
    seriesName: raw.seriesName,
    roundName: raw.roundName,
    session: { name: typeof session.name === 'string' ? session.name : null, type: session.type as SessionType },
  };
};

/**
 * Reads one save's file.
 * @param raw The parsed file
 * @param id The save's id, which its file is named after
 * @param read Reads the state the save holds, or answers null for one this
 * build does not read
 * @returns The save, or null when it is not one this build reads
 */
export const readSaveFile = <T>(
  raw: unknown,
  id: string,
  read: (state: unknown) => T | null,
): SaveFile<T> | null => {
  if (!isRecord(raw) || raw.version !== SAVE_VERSION) return null;
  if (typeof raw.savedAt !== 'string' || typeof raw.date !== 'string') return null;

  const kind = saveKindOf(id);
  const name = typeof raw.name === 'string' && raw.name.trim() !== '' ? raw.name : null;
  if (kind === 'named' && name === null) return null;

  const state = read(raw.state);
  if (state === null) return null;

  return {
    version: SAVE_VERSION,
    id,
    kind,
    name: kind === 'named' ? name : null,
    savedAt: raw.savedAt,
    date: raw.date,
    moment: readMoment(raw.moment),
    state,
  };
};

/**
 * A save's summary, without the state it holds.
 * @param file The save
 * @returns What lists show of it
 */
export const summaryOf = <T>(file: SaveFile<T>): SaveSummary => ({
  id: file.id,
  kind: file.kind,
  name: file.name,
  savedAt: file.savedAt,
  date: file.date,
  moment: file.moment,
});

/**
 * Where the next autosave goes: the newest are kept up to one short of the
 * number asked for, the rest make room, and the new one takes a number none of
 * those kept holds.
 * @param saves Every save the slot has
 * @param keep How many autosaves to keep, the new one included
 * @returns The new autosave's id, and the autosaves to delete
 */
export const autosaveSlot = (saves: readonly SaveSummary[], keep: number): AutosaveSlot => {
  const autosaves = saves
    .filter((one) => one.kind === 'auto')
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));
  const kept = new Set(autosaves.slice(0, Math.max(0, keep - 1)).map((one) => one.id));
  let number = 1;
  while (kept.has(`${AUTOSAVE_PREFIX}${number}`)) number += 1;

  const id = `${AUTOSAVE_PREFIX}${number}`;

  // The one whose number the new autosave takes is written over, not deleted.
  return { id, drop: autosaves.filter((one) => !kept.has(one.id) && one.id !== id).map((one) => one.id) };
};

/**
 * A save's name, tidied.
 * @param name The name asked for
 * @returns It, trimmed and held to the longest a name may be
 * @throws When nothing is left of it
 */
export const checkedSaveName = (name: unknown): string => {
  const trimmed = typeof name === 'string' ? name.trim().slice(0, MAX_SAVE_NAME).trim() : '';
  if (trimmed === '') throw new AppError('save.unnamed');

  return trimmed;
};
