// A screen's own preferences - its filters, sort and layout - kept in the
// renderer's localStorage so they outlive the window. What was typed into a
// search box and how far a list was scrolled are browser-memory's instead,
// which a restart is meant to forget. Nothing a career or a championship
// depends on lives here, so losing it costs a click and nothing more.
//
// Every access is guarded, since storage can be unavailable or hold something
// that is not JSON, and neither may stop a screen opening.

import type { FieldKind, FieldShape } from './types.ts';
import { isRecord, memberOf } from '../../../../shared/utils/coerce';

/**
 * Reads what a preference was last saved as.
 *
 * Unknown rather than typed: whatever is stored may predate the screen's
 * current shape, so the caller narrows it before trusting it.
 * @param key Which preference
 * @returns The stored value, or undefined when there is none or it cannot be read
 */
export const readPreference = (key: string): unknown => {
  try {
    const held = window.localStorage.getItem(key);

    return held === null ? undefined : JSON.parse(held) as unknown;
  } catch {
    return undefined;
  }
};

/**
 * Saves a preference, quietly giving up where storage is unavailable.
 * @param key Which preference
 * @param value What to save, which must survive JSON
 */
export const writePreference = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A preference that cannot be saved is simply not remembered.
  }
};

/**
 * Reads a stored list of picks out of a closed set, dropping what the set no
 * longer holds and anything picked twice.
 * @param stored Whatever the field held
 * @param allowed Every value a pick can be
 * @returns The picks that read back, none when it was not a list
 */
export const readMembers = <T extends string>(stored: unknown, allowed: readonly T[]): T[] => (
  Array.isArray(stored) ? [...new Set(stored.flatMap((one) => memberOf(one, allowed) ?? []))] : []
);

/**
 * Reads one stored field as its kind.
 * @param value What was stored
 * @param kind What the field has to be
 * @returns The field as it reads back, or undefined when it does not
 */
const readField = (value: unknown, kind: FieldKind): unknown => {
  if (kind === 'string') return typeof value === 'string' ? value : undefined;
  if (kind === 'strings') return Array.isArray(value) && value.every((one) => typeof one === 'string') ? value : undefined;
  if (kind === 'number') return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  if (kind === 'boolean') return typeof value === 'boolean' ? value : undefined;
  if ('members' in kind) return Array.isArray(value) ? readMembers(value, kind.members) : undefined;

  return memberOf(value, kind);
};

/**
 * Reads a stored object field by field, keeping each field of the right kind
 * and dropping everything else, since what is stored may predate the screen.
 * @param stored Whatever the preference held
 * @param shape The kind of every field it may carry
 * @returns The fields that read back
 */
export const readFields = <T extends object>(stored: unknown, shape: FieldShape<T>): Partial<T> => {
  if (!isRecord(stored)) return {};

  return Object.fromEntries(Object.entries(shape as Record<string, FieldKind>)
    .map(([key, kind]) => [key, readField(stored[key], kind)])
    .filter(([, value]) => value !== undefined)) as Partial<T>;
};

/**
 * What a picker saves of a browser's criteria: only the layout, since its
 * filters answer one question about a restricted list.
 * @param criteria The criteria as they stand
 * @param criteria.view The layout
 * @returns The layout alone
 */
export const viewOnly = ({ view }: { view?: unknown }): { view?: unknown } => ({ view });

/**
 * A reader for a preference that is one of a closed set, as most filters are.
 * @param allowed Every value it can be
 * @param fallback What it opens on when nothing stored is one of them
 * @returns The reader
 */
export const readOneOf = <T extends string>(
  allowed: readonly T[],
  fallback: T,
): (stored: unknown) => T => (stored) => memberOf(stored, allowed) ?? fallback;
