import type { ParseKeys } from 'i18next';
import type { ReactNode } from 'react';

import type {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../shared/types';
import type { NavId } from '@/lib/routes';

/**
 * One option in a sort menu.
 */
export interface SortItem<K extends string> {
  /**
   * The sort key sent in the query.
   */
  key: K;
  /**
   * The catalogue key for its label.
   */
  label: ParseKeys;
}

/**
 * A switch on every card, for a browser that decides something about each entry.
 */
export interface BrowserToggle {
  /**
   * The section the browser lives in, when the rest of a card opens the entry's
   * page - navigation keeps that section lit there - and only the switch flips.
   * Unset, the whole card flips, as a picker in a dialog wants, since opening a
   * page would close it.
   */
  section?: NavId;
  /**
   * Whether an entry's switch is on.
   * @param id The entry's folder ID
   * @returns True when it is on
   */
  isOn(id: string): boolean;
  /**
   * Flips an entry's switch.
   * @param id The entry's folder ID
   * @param on Whether it should now be on
   */
  onToggle(id: string, on: boolean): void;
}

/**
 * A numeric range filter's current value. Either end may be unset.
 */
export interface RangeValue {
  /**
   * Lowest acceptable value, or undefined for no lower bound.
   */
  from?: number;
  /**
   * Highest acceptable value, or undefined for no upper bound.
   */
  to?: number;
}

/**
 * One value a rail's list can be narrowed to.
 */
export interface RailItem {
  /**
   * What is sent, as the facet named it.
   */
  value: string;
  /**
   * What is shown, already translated.
   */
  label: string;
  /**
   * How many entries carry it under the other filters.
   */
  count: number;
  /**
   * Drawn before the label - a flag, a coloured dot.
   */
  lead?: ReactNode;
}

/**
 * One filter in force, as the pill above the results names it.
 */
export interface ActiveFilter {
  /**
   * Unique among the pills, for React.
   */
  key: string;
  /**
   * Which filter, already translated, or undefined for a switch that names
   * itself.
   */
  name?: string;
  /**
   * What it is set to, already translated.
   */
  value: string;
  /**
   * Lifts this one filter.
   */
  onRemove(): void;
}

/**
 * The four provenance lists a query carries, which the tree edits as one.
 */
export interface ProvenancePicks {
  /**
   * Base game, DLC or mod, picked whole.
   */
  sources?: ContentSource[];
  /**
   * DLC packs, picked one at a time under DLC.
   */
  packs?: DLCPack[];
  /**
   * Mod makers, picked one at a time under Mod.
   */
  makers?: ModMaker[];
  /**
   * Redistributors, picked one at a time under Mod.
   */
  distributors?: ModDistributor[];
}

/**
 * One value under a branch of the source tree.
 */
export interface ProvenanceLeaf {
  /**
   * Which of the query's lists it belongs to.
   */
  list: 'packs' | 'makers' | 'distributors';
  /**
   * The value sent.
   */
  value: string;
  /**
   * What it reads as, already translated.
   */
  label: string;
  /**
   * How many entries carry it under the other filters.
   */
  count: number;
}
