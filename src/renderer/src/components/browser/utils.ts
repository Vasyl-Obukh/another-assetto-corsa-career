import type { TFunction } from 'i18next';

import { PROVENANCE_LISTS, RAIL_LETTERS } from './constants.ts';
import type {
  ActiveFilter, ProvenancePicks, RailItem, RangeValue,
} from './types.ts';
import type { Spread } from '../../../../shared/types';
import {
  distributorKey, makerKey, packKey, sourceKey,
} from '@/components/provenance-badges';
import type { ProvenanceLabelKey } from '@/components/provenance-badges';

/**
 * Names a catalogue value, falling back to the value itself for one the
 * catalogue has no name for yet.
 * @param t The translation function
 * @param key The value's label key, or null when there is none
 * @param value The value
 * @returns What to show
 */
const named = (t: TFunction, key: ProvenanceLabelKey | null, value: string): string => (
  key === null ? value : t(key)
);

/**
 * What one provenance value reads as in a filter list.
 * @param t The translation function
 * @param list Which of the query's lists it belongs to
 * @param value The value
 * @returns Its name, a redistributor's as "via" it
 */
export const provenanceLabel = (t: TFunction, list: keyof ProvenancePicks, value: string): string => {
  switch (list) {
    case 'sources': return named(t, sourceKey(value), value);
    case 'packs': return named(t, packKey(value), value);
    case 'makers': return named(t, makerKey(value), value);
    default: return t('browse.via', { name: named(t, distributorKey(value), value) });
  }
};

/**
 * Names every provenance pick, in the order the tree lists them.
 * @param picks The four lists
 * @param t The translation function
 * @returns Each pick with its list, its value and what it reads as
 */
export const provenanceNames = (
  picks: ProvenancePicks,
  t: TFunction,
): { list: keyof ProvenancePicks; value: string; label: string }[] => PROVENANCE_LISTS.flatMap((list) => (
  ((picks[list] ?? []) as readonly string[]).map((value) => ({ list, value, label: provenanceLabel(t, list, value) }))
));

/**
 * The pills for every provenance pick, each lifting just itself.
 * @param picks The four lists
 * @param t The translation function
 * @param onChange Replaces the four lists
 * @returns One pill per pick
 */
export const provenancePills = (
  picks: ProvenancePicks,
  t: TFunction,
  onChange: (next: ProvenancePicks) => void,
): ActiveFilter[] => (
  provenanceNames(picks, t).map(({ list, value, label }) => ({
    key: `${list}-${value}`,
    name: t('browse.source'),
    value: label,
    onRemove: () => onChange({
      ...picks,
      [list]: (picks[list] as string[] | undefined)?.filter((one) => one !== value),
    }),
  }))
);

/**
 * Writes a range filter's value out, open ends at the library's own edges.
 * @param value The range picked
 * @param spread How the library is spread, for the open ends
 * @param format Writes one figure out
 * @returns The range as text, or null when nothing is picked
 */
export const rangeName = (
  value: RangeValue,
  spread: Spread | null,
  format: (figure: number) => string,
): string | null => {
  if (value.from === undefined && value.to === undefined) return null;

  const from = value.from ?? spread?.min;
  const to = value.to ?? spread?.max;

  return `${from === undefined ? '' : format(from)}-${to === undefined ? '' : format(to)}`;
};

/**
 * A long list's values under the letter each starts with, for the flyout's A
 * to Z columns. Anything that does not start with a Latin letter shares one
 * group, ahead of the rest, which the index does not offer.
 * @param items The values, in the order to list them
 * @returns The groups, keyed by letter, in the order their first value came
 */
export const letterGroups = (items: readonly RailItem[]): Map<string, RailItem[]> => {
  const groups = new Map<string, RailItem[]>();
  items.forEach((item) => {
    const first = item.label.charAt(0).toUpperCase();
    const letter = RAIL_LETTERS.includes(first) ? first : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  });

  return groups;
};

/**
 * Ticks a value in a filter list, or unticks it.
 * @param list The values ticked so far
 * @param value The value clicked
 * @returns The list with the value added at the end when it was absent,
 * removed otherwise
 */
export const toggledIn = <T>(list: readonly T[], value: T): T[] => (
  list.includes(value) ? list.filter((one) => one !== value) : [...list, value]
);
