import type { ReactNode } from 'react';

import type {
  BopEntry, Championship, SeatCar, SeriesSession,
} from '../../../../shared/types';
import type { RowDrag } from '@/hooks';

/**
 * One extra thing a row's menu offers, beyond editing and removing it.
 *
 * A list of these rather than menu items passed as children, so the menu stays
 * in one component and a caller never has to reach for the dropdown primitives
 * to add a line to it.
 */
export interface RowMenuItem {
  /**
   * What the item is called, already translated.
   */
  label: string;
  /**
   * Its icon.
   */
  icon: ReactNode;
  /**
   * An already-translated count shown beside the label, for an item that leads
   * somewhere already carrying overrides.
   */
  badge?: string;
  /**
   * Called when the item is chosen.
   */
  onSelect: () => void;
}

/**
 * One session of a weekend format, as its form hands it back.
 *
 * What it follows travels beside the session rather than on it, because the two
 * are written differently: `inherit.from` is the id of another session, and a
 * session only carries an id when something names it - so most of them have
 * none, and a select over them cannot offer what is not there. The form works
 * in positions and `withSession` turns the chosen one into a link, minting the
 * source's id if that is what it takes.
 */
export interface SessionEdit {
  /**
   * The session as edited, carrying everything except what it follows.
   */
  session: SeriesSession;
  /**
   * Which earlier qualifying it takes its field and its order from, by
   * position in the format, or null when it follows nothing.
   */
  from: number | null;
  /**
   * How many of that qualifying's field carry over, or undefined for all of
   * them - which is what a race after a knockout segment wants.
   */
  top?: number;
}

/**
 * What every read-only row of a reorderable list is handed by RowList.
 *
 * Named the way each row component names its own props, so a list spreads it
 * straight in and adds only what is particular to that row.
 */
export interface RowControls {
  /**
   * Where the row sits in its list, counting from zero.
   */
  index: number;
  /**
   * How many rows the list holds.
   */
  count: number;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be acted on, which it may not while any row in the
   * editor has its form open.
   */
  editable: boolean;
  /**
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the row's form.
   */
  onEdit: () => void;
  /**
   * Called to move the row along its list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
}

/**
 * What an eligibility change took off one class entry, kept so a change back
 * puts it back.
 */
export interface EntrySetAside {
  /**
   * Pinned cars taken off seats, by seat id.
   */
  cars: Readonly<Record<string, SeatCar>>;
  /**
   * Balance-of-performance rows taken off the entry.
   */
  bop: readonly BopEntry[];
}

/**
 * Everything eligibility changes have set aside, by class entry id.
 *
 * Held by whatever edits eligibility, for as long as it is open. Narrowing a
 * rule has to take the pins and rows it orphans off the document, but trying
 * another spec and switching back is exploring rather than deciding - so what
 * came off comes back once the rule allows it again.
 */
export type SetAside = Readonly<Record<string, EntrySetAside>>;

/**
 * A championship after an eligibility change, with what it set aside.
 */
export interface Narrowed {
  /**
   * The championship, with nothing left naming a car a class cannot field.
   */
  series: Championship;
  /**
   * What is set aside now, to hand to the next change.
   */
  aside: SetAside;
}
