import type { ParseKeys, TFunction } from 'i18next';
import type { ComponentType, ReactNode } from 'react';

import type {
  Career, CareerSeason, ClassEntry, MissingCar, MissingTrack, PrizeMoney, Round, SeasonEntry, Seat, SeriesListing, Team,
} from '../../../../shared/types';
import type { DisciplineLevels } from '../../../../shared/utils/career-eligibility';
import type { StandingsView } from '@/components';
import type { ChampionshipDimension } from '@/hooks';

/**
 * A dimension a championship list narrows by, with what its filter says.
 */
export interface ChampionshipFilter extends ChampionshipDimension {
  /**
   * The catalogue key for the filter's name.
   */
  label: ParseKeys;
  /**
   * Turns one of its values into something readable.
   * @param value The value as the dimension reads it off a championship
   * @param t The translator
   * @returns What the filter list shows
   */
  format(value: string, t: TFunction): string;
}

/**
 * Where a career stands on the ladder, for the board to show it.
 */
export interface CareerLadder {
  /**
   * The career.
   */
  career: Career;
  /**
   * The rung each discipline may be entered at.
   */
  open: DisciplineLevels;
  /**
   * Whether only what is open is shown, so a locked rung says what opens it
   * in place of its championships.
   */
  openOnly: boolean;
}

/**
 * One championship on one rung of the ladder: the way in a class entry offers.
 *
 * A multi-class championship is one of these per class, so it stands on every
 * rung it lets a driver in at.
 */
export interface Rung {
  /**
   * The championship.
   */
  listing: SeriesListing;
  /**
   * The class entry that puts it on this rung.
   */
  entry: ClassEntry;
}

/**
 * What a championship menu's items are drawn with.
 *
 * The same items are offered twice on a settings card - from its menu button
 * and from a right-click - and the two menus are different Radix primitives, so
 * the items are written once over whichever parts they are handed.
 */
export interface MenuParts {
  /**
   * One command.
   */
  Item: ComponentType<MenuItemProps>;
  /**
   * The rule between groups of commands.
   */
  Separator: ComponentType;
}

/**
 * What a championship menu asks of one of its items, which both Radix menus'
 * items accept.
 */
export interface MenuItemProps {
  /**
   * Everything the item shows: an icon and a label.
   */
  children: ReactNode;
  /**
   * Called when the item is chosen.
   */
  onSelect?: () => void;
  /**
   * Whether the item can be chosen.
   */
  disabled?: boolean;
  /**
   * Why the item cannot be chosen, where it cannot.
   */
  title?: string;
  /**
   * Whether the item destroys something.
   */
  variant?: 'default' | 'destructive';
}

/**
 * One team of a class's entry list, and the seats it fields there.
 */
export interface TeamGroup {
  /**
   * The team, or null for the seats that name none.
   */
  team: Team | null;
  /**
   * Its seats in the class, in entry-list order.
   */
  seats: Seat[];
}

/**
 * One way a championship pays out, and the classes paid that way.
 */
export interface Purse {
  /**
   * The prize tables, or undefined where the championship pays nothing.
   */
  prizes: PrizeMoney | undefined;
  /**
   * The names of the classes it pays, in class order.
   */
  classes: string[];
}

/**
 * One of the source tree's lists, as a championship's requirements name it.
 */
export type ContentList = 'sources' | 'packs' | 'makers' | 'distributors';

/**
 * The round a championship's page points at next: the career's next one in it,
 * or for a championship not yet entered, the next still to come.
 */
export interface NextRound {
  /**
   * The round.
   */
  round: Round;
  /**
   * Which round of the season it is, counting from one.
   */
  number: number;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * Whether the career is part-way through its event.
   */
  underway: boolean;
}

/**
 * How the standings section is laid out, as it is remembered.
 */
export interface StandingsLayout {
  /**
   * Drivers or teams.
   */
  who: 'drivers' | 'teams';
  /**
   * A table, or the season grid of every race.
   */
  shape: 'table' | 'grid';
  /**
   * What a driver's cell of the grid says.
   */
  view: StandingsView;
}

/**
 * Which part of a championship's page is open.
 */
export type DetailTab = 'rounds' | 'standings' | 'classes' | 'rules';

/**
 * The content a championship needs and the install lacks, each named once.
 */
export interface MissingContentList {
  /**
   * Every car an entry or a round's own grid names that is not installed.
   */
  cars: readonly MissingCar[];
  /**
   * Every round's track that is not installed.
   */
  tracks: readonly MissingTrack[];
}

/**
 * Which of three things a championship's availability is saying.
 *
 * Misconfigured is its own state because `validateSeries` problems force
 * `available` to false, and "Unavailable" would point at content that is not
 * missing.
 */
export type AvailabilityState = 'available' | 'misconfigured' | 'unavailable';

/**
 * What a link into a championship's page hands its Enter panel: the class and
 * the car an earlier edition was raced in, picked already. Router state rather
 * than a command, so entering stays the page's own to decide.
 */
export interface EnterHint {
  /**
   * The class entry to pick, by its id.
   */
  entry: string;
  /**
   * The car and livery to pick.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked.
     */
    skin?: string;
  };
}

/**
 * Which season and edition of a championship its page is showing, and the
 * career's entry in it.
 */
export interface ShownRun {
  /**
   * The season shown, or null before the career is read.
   */
  season: CareerSeason | null;
  /**
   * Whether that season is behind the current one, and so only read back.
   */
  closed: boolean;
  /**
   * The edition shown, or undefined while nothing says which yet.
   */
  edition: number | undefined;
  /**
   * The career's entry in that edition, or null when it is not in it.
   */
  entered: SeasonEntry | null;
}
