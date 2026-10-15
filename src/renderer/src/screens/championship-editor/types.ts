import type { ReactNode } from 'react';

import type {
  BopEntry, Championship, Seat, SeatCar, SeriesSession,
} from '../../../../shared/types';

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
 * One session of an event format, as the session page hands it back.
 *
 * What it follows travels beside the session rather than on it, because the two
 * are written differently: `inherit.from` is the id of another session, and a
 * session only carries an id when something names it - so most of them have
 * none, and a select over them cannot offer what is not there. The page works
 * in positions and `withSession` turns the chosen one into a link, minting the
 * source's id if that is what it takes.
 */
export interface SessionEdit {
  /**
   * The session as edited, carrying everything except what it follows.
   */
  session: SeriesSession;
  /**
   * Which earlier session it takes its field and its order from, by position
   * in the format, or null when it follows nothing.
   */
  from: number | null;
  /**
   * How many of that qualifying's field carry over, or undefined for all of
   * them - which is what a race after a knockout segment wants.
   */
  top?: number;
  /**
   * How many of the inherited order's front runners a race starts in
   * reverse, or undefined for none.
   */
  reverse?: number;
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

/**
 * The unit a session's length is stated in. A distance is a race's alone.
 */
export type LengthUnit = 'laps' | 'minutes' | 'distance';

/**
 * One tab of the editor, each holding one subject of the championship.
 */
export type EditorTab = 'overview' | 'teams' | 'classes' | 'calendar' | 'formats' | 'scoring' | 'event' | 'prizes';

/**
 * A run of consecutive seats fielded by the same team, which the seat sheet
 * heads with that team.
 */
export interface SeatRun {
  /**
   * The team's id, or undefined for seats nobody fields.
   */
  team: string | undefined;
  /**
   * The seats of the run with where each sits in the class, counting from zero.
   */
  seats: readonly { seat: Seat; index: number }[];
}

/**
 * One part of a class entry, each on a tab of its own panel.
 */
export type ClassSection = 'cars' | 'seats' | 'performance' | 'prizes';

/**
 * The shape of the curve a purse is generated along.
 */
export type PurseShape = 'steep' | 'gentle' | 'linear' | 'winner';

/**
 * What a purse is generated from.
 */
export interface PurseRecipe {
  /**
   * What it pays in all.
   */
  pot: number;
  /**
   * How many places it pays.
   */
  places: number;
  /**
   * How the pot falls away down the places.
   */
  shape: PurseShape;
  /**
   * What each place is rounded to.
   */
  round: number;
}

/**
 * A real championship's table, which a points system may start from.
 */
export interface PointsTemplate {
  /**
   * Keys the template, and its name among the translations.
   */
  id: 'f1' | 'indycar' | 'imsa' | 'motogp' | 'dtm' | 'btcc' | 'sprint' | 'blank';
  /**
   * What each finishing place scores, the winner first.
   */
  positions: readonly number[];
  /**
   * What each qualifying place scores, pole first, where it pays any.
   */
  qualifying?: readonly number[];
  /**
   * What the fastest lap scores, where it pays anything.
   */
  fastestLap?: number;
}

/**
 * One group of a round's or a session's conditions, set or left as a whole.
 */
export type ConditionGroup = 'weather' | 'time' | 'temperature' | 'track' | 'wind';

/**
 * One tab of a round's dialog.
 */
export type RoundTab = 'basics' | 'conditions' | 'cars';

/**
 * Where a race with nothing to line it up starts the player, as the editor
 * offers it: a slot of the player's choosing is one choice, whatever its
 * number.
 */
export type StartKind = 'last' | 'pole' | 'position' | 'random';

/**
 * Something listed above an event's days and opened in place of a session,
 * which is how a race event of the player's own puts its event-wide
 * conditions at the head of its sessions.
 */
export interface SessionsHead {
  /**
   * What the item is called.
   */
  label: string;
  /**
   * A short line beside it.
   */
  detail: ReactNode;
  /**
   * What opens when it is picked.
   */
  page: ReactNode;
}

/**
 * The class a race of the player's own starts them in, which bounds the slot
 * they may pick: a grid lines up class by class, so a slot is a place among
 * classmates.
 */
export interface StartClass {
  /**
   * The class's name.
   */
  name: string;
  /**
   * How many cars race in it, the player's included.
   */
  count: number;
  /**
   * The chip colour the class wears.
   */
  chip: string;
}

/**
 * Whether a road temperature follows the air and the sun or is set outright.
 */
export type RoadKind = 'follows' | 'set';

/**
 * One layer of AI offset laid over the player's own difficulty, as a sum
 * writes it out.
 */
export interface AiLayer {
  /**
   * What it is called in the sum, already translated.
   */
  label: string;
  /**
   * Its offset, or undefined where it states none.
   */
  value: number | undefined;
}
