// The pieces every query is built from: text matching, ordering and counting.
// Pure throughout - no fs, no Electron, nothing that needs a running app.

import {
  COLLATOR, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_SHARED_NAME, NAME_SEPARATORS,
} from './constants.ts';
import type {
  Facet, Page, SortDirection, Track, TrackGroup,
} from '../../shared/types/index.ts';

/**
 * A value a list can be ordered by.
 */
export type SortValue = string | number | null;

/**
 * Folds a string down to what a search should match on.
 *
 * Diacritics are stripped, so someone typing "citroen" finds "Citroën" - which
 * is what they meant, and the only spelling most keyboards make easy.
 * @param text The string to fold
 * @returns The folded string
 */
export const normalise = (text: string): string => (
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
);

/**
 * Splits a search box's contents into the terms that must all match.
 * @param search What the user typed, if anything
 * @returns The folded terms, empty when there is nothing to match
 */
export const searchTerms = (search: string | undefined): string[] => (
  normalise(search ?? '').split(/\s+/).filter((term) => term !== '')
);

/**
 * Checks that every term appears somewhere in an entry.
 *
 * All terms rather than any, because "ferrari gt3" means both words - matching
 * either would bury the answer under every Ferrari ever made.
 * @param terms The folded terms to look for
 * @param haystacks The entry's searchable strings, nulls allowed
 * @returns True when every term is found
 */
export const matchesTerms = (
  terms: readonly string[],
  haystacks: readonly (string | null)[],
): boolean => {
  if (terms.length === 0) return true;

  const folded = haystacks
    .filter((value): value is string => value !== null)
    .map(normalise);

  return terms.every((term) => folded.some((value) => value.includes(term)));
};

/**
 * Checks a number against an optional inclusive range.
 *
 * An entry with no value is excluded once either bound is set: a car whose power
 * nobody wrote down is not evidence that it is over 500bhp.
 * @param value The entry's value, or null when it has none
 * @param from Lowest acceptable value, or undefined for no lower bound
 * @param to Highest acceptable value, or undefined for no upper bound
 * @returns True when the entry passes
 */
export const inBounds = (
  value: number | null,
  from: number | undefined,
  to: number | undefined,
): boolean => {
  if (from === undefined && to === undefined) return true;
  if (value === null) return false;

  return (from === undefined || value >= from) && (to === undefined || value <= to);
};

/**
 * Checks a value against an optional list of accepted ones.
 * @param value The entry's value, or null when it has none
 * @param accepted The values the query asked for, or undefined for all of them
 * @returns True when the entry passes
 */
export const isOneOf = (value: string | null, accepted: string[] | undefined): boolean => {
  if (accepted === undefined || accepted.length === 0) return true;

  return value !== null && accepted.includes(value);
};

/**
 * Compares two sort values, with anything unknown ordered last.
 * @param a The first value
 * @param b The second value
 * @returns A negative number, zero or a positive number
 */
const compareValues = (a: SortValue, b: SortValue): number => {
  if (typeof a === 'string' && typeof b === 'string') return COLLATOR.compare(a, b);

  return Number(a) - Number(b);
};

/**
 * Sorts a list by one key, then by name to keep the order deterministic.
 *
 * Entries with no value for the key sort last whichever way the direction runs -
 * reversing the sort should not promote everything nobody filled in.
 * @param items What to sort; not mutated
 * @param key Reads the sort value out of an entry
 * @param name Reads the entry's display name, for the tie-break
 * @param direction Which way the sort runs
 * @returns A new, sorted array
 */
export const sortBy = <T>(
  items: readonly T[],
  key: (item: T) => SortValue,
  name: (item: T) => string,
  direction: SortDirection | undefined,
): T[] => {
  const sign = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const left = key(a);
    const right = key(b);

    if (left === null || right === null) {
      if (left !== right) return left === null ? 1 : -1;
    } else {
      const primary = compareValues(left, right) * sign;
      if (primary !== 0) return primary;
    }

    return COLLATOR.compare(name(a), name(b));
  });
};

/**
 * Cuts one page out of a sorted list.
 * @param items Everything that matched, in order
 * @param offset Where the page starts; negative is treated as the beginning
 * @param limit How many to return; clamped to MAX_PAGE_SIZE
 * @returns The page, and how many matched in total
 */
export const paginate = <T>(
  items: readonly T[],
  offset: number | undefined,
  limit: number | undefined,
): Page<T> => {
  const start = Math.max(0, Math.trunc(offset ?? 0));
  const size = Math.min(MAX_PAGE_SIZE, Math.max(0, Math.trunc(limit ?? DEFAULT_PAGE_SIZE)));

  return {
    items: items.slice(start, start + size),
    total: items.length,
    offset: start,
    limit: size,
  };
};

/**
 * Counts how often each value occurs, for a filter list.
 * @param items The entries to count over
 * @param values Reads the values one entry contributes; nulls are dropped
 * @param order How to break a tie between two equally common values
 * @returns Values by descending count, then by the given order
 */
export const countValues = <T>(
  items: readonly T[],
  values: (item: T) => readonly (string | null)[],
  order: (a: string, b: string) => number = COLLATOR.compare,
): Facet[] => {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const value of values(item)) {
      if (value !== null && value !== '') counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || order(a.value, b.value));
};

/**
 * The longest run of characters every name begins with, cut back to a boundary.
 * @param names The names to compare
 * @returns The shared prefix, without whatever separator it stopped inside
 */
const sharedPrefix = (names: readonly string[]): string => {
  let shared = names[0] ?? '';

  for (const name of names.slice(1)) {
    let index = 0;
    while (index < shared.length && index < name.length && shared[index] === name[index]) {
      index += 1;
    }
    shared = shared.slice(0, index);
  }

  return shared.replace(NAME_SEPARATORS, '').trim();
};

/**
 * Names a track from the layouts installed under it.
 *
 * AC has no track-level name once a track has layouts - ks_red_bull_ring is only
 * "Red Bull Ring GP", "Red Bull Ring GP - LFM" and "Red Bull Ring National" - so
 * the name is the part they share, which is what Content Manager shows too. When
 * they share nothing, the root ui_track.json names the circuit if there is one,
 * and the shortest layout name is the closest thing to it if there is not.
 * @param id Track folder name, the last resort
 * @param layouts Every layout installed under it, matching or not
 * @returns The display name for the circuit
 */
const trackName = (id: string, layouts: readonly Track[]): string => {
  // Empty names are dropped rather than shared: a mod that leaves ui_track.json's
  // name blank should not name the circuit after it.
  const names = layouts.map((layout) => layout.name).filter((name) => name !== '');
  const shared = sharedPrefix(names);
  if (shared.length >= MIN_SHARED_NAME) return shared;

  const root = layouts.find((layout) => layout.layout === '');
  if (root !== undefined && root.name !== '') return root.name;

  return [...names].sort((a, b) => a.length - b.length)[0] ?? id;
};

/**
 * Gathers layouts into the tracks they belong to.
 *
 * The group's identity - name, country, provenance - is read from every layout
 * installed under the track, not from the matching ones, so a card does not
 * rename itself when a filter narrows it. Only `layouts` narrows.
 * @param matched The layouts that survived the filters
 * @param installed Every installed layout, for identity
 * @returns One group per track present in matched, layouts name-sorted
 */
export const groupTracks = (
  matched: readonly Track[],
  installed: readonly Track[],
): TrackGroup[] => {
  const all = new Map<string, Track[]>();
  for (const track of installed) {
    all.set(track.id, [...(all.get(track.id) ?? []), track]);
  }

  const groups = new Map<string, TrackGroup>();
  for (const track of matched) {
    const group = groups.get(track.id);
    if (group !== undefined) {
      group.layouts.push(track);
      continue;
    }

    const siblings = all.get(track.id) ?? [track];
    groups.set(track.id, {
      id: track.id,
      name: trackName(track.id, siblings),
      country: siblings.find((layout) => layout.country !== null)?.country ?? null,
      provenance: {
        ...track.provenance,
        distributor: siblings.find((layout) => layout.provenance.distributor !== null)
          ?.provenance.distributor ?? null,
      },
      layouts: [track],
    });
  }

  for (const group of groups.values()) {
    group.layouts.sort((a, b) => COLLATOR.compare(a.name, b.name));
  }

  return [...groups.values()];
};

/**
 * The largest grid any of a track's layouts can hold.
 * @param group The track to measure
 * @returns The highest pit box count, or null when no layout states one
 */
export const groupPitboxes = (group: TrackGroup): number | null => {
  const known = group.layouts
    .map((layout) => layout.pitboxes)
    .filter((pitboxes): pitboxes is number => pitboxes !== null);

  return known.length === 0 ? null : Math.max(...known);
};
