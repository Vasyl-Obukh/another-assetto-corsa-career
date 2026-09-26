// The pieces every query is built from: text matching, ordering and counting.
// Pure throughout - no fs, no Electron, nothing that needs a running app.

import {
  COLLATOR, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_SHARED_NAME, NAME_SEPARATORS, SPREAD_BINS,
} from './constants.ts';
import type {
  ContentProvenance, ContentSource, DLCPack, Facet, ModDistributor, ModMaker, Page, SortDirection, Spread,
  Track, TrackGroup,
} from '../../shared/types/index.ts';

// Text matching lives in shared/, because the renderer filters a car's liveries
// with the same rules and may not reach into core. Re-exported so every caller
// keeps reaching for this module rather than following the move.
export { matchesTerms, normalise, searchTerms } from '../../shared/utils/search/index.ts';

/**
 * A value a list can be ordered by.
 */
export type SortValue = string | number | null;

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
 * Tests a value that may be several things at once against a filter.
 *
 * The array sibling of isOneOf, for the dimensions where one car carries more
 * than one value - the specs it races in, and so the classes it belongs to. An
 * entry matches when any of its values was picked, which is the same OR the
 * single-valued filters use.
 * @param values Everything the entry is, null where it is nothing
 * @param accepted What the caller picked, or undefined for no filter
 * @returns Whether the entry passes
 */
export const hasAnyOf = (
  values: readonly (string | null)[],
  accepted: readonly string[] | undefined,
): boolean => {
  if (accepted === undefined || accepted.length === 0) return true;

  return values.some((value) => value !== null && accepted.includes(value));
};

/**
 * Tests an entry against several lists that are one filter, OR'd together.
 *
 * The browser shows such lists as one tree, so ticking a branch beside a leaf
 * of another means either, not both. A list nothing was picked from takes no
 * part.
 * @param lists Each list as what the entry is in its terms, then what was picked
 * @returns True when nothing was picked from any of them, or the entry is in one
 */
export const anyOfLists = (
  lists: readonly (readonly [values: readonly (string | null)[], picked: readonly string[] | undefined])[],
): boolean => {
  const asked = lists.filter(([, picked]) => picked !== undefined && picked.length > 0);

  return asked.length === 0 || asked.some(([values, picked]) => hasAnyOf(values, picked));
};

/**
 * Tests where an entry came from against every provenance list at once - one
 * tree in the browser, since a pack is a kind of DLC and a maker a kind of mod.
 * @param provenance Where the entry came from
 * @param picked The source, pack, maker and distributor lists the query set
 * @returns True when nothing was picked or any of it matches
 */
export const fromAnyOf = (
  provenance: ContentProvenance,
  picked: {
    sources?: ContentSource[];
    packs?: DLCPack[];
    makers?: ModMaker[];
    distributors?: ModDistributor[];
  },
): boolean => anyOfLists([
  [[provenance.source], picked.sources],
  [[provenance.pack], picked.packs],
  [[provenance.maker], picked.makers],
  [[provenance.distributor], picked.distributors],
]);

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

/**
 * The longest lap any of a track's layouts runs.
 * @param group The track to measure
 * @returns The greatest stated length in metres, or null when no layout states one
 */
export const groupLength = (group: TrackGroup): number | null => {
  const known = group.layouts
    .map((layout) => layout.lengthM)
    .filter((length): length is number => length !== null);

  return known.length === 0 ? null : Math.max(...known);
};

/**
 * How a number is spread, for the bars under a range filter.
 *
 * The bounds come from everything installed and only the counts from what the
 * other filters leave, so the slider keeps its scale while the bars move.
 * @param installed Every entry, for the bounds
 * @param matched The entries the other filters leave, for the counts
 * @param read Reads an entry's value, or null when it has none
 * @returns The bounds and SPREAD_BINS counts, or null when nothing has a value
 */
export const spreadOf = <T>(
  installed: readonly T[],
  matched: readonly T[],
  read: (item: T) => number | null,
): Spread | null => {
  const values = installed.map(read).filter((value): value is number => value !== null);
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / SPREAD_BINS || 1;
  const counts = new Array<number>(SPREAD_BINS).fill(0);

  for (const item of matched) {
    const value = read(item);
    if (value !== null) counts[Math.min(SPREAD_BINS - 1, Math.floor((value - min) / width))] += 1;
  }

  return { min, max, counts };
};
