// App settings, as persisted to settings.json in the user data folder.

import type { PathOverrides } from './paths.ts';
import type { Assists } from './race.ts';
import type { WeatherSystem } from './weather-plan.ts';
import type { WeatherType } from '../constants/weather-types.ts';

/**
 * What the user picked in the theme menu. "system" follows the OS.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

/**
 * The theme actually in force, once "system" has been resolved against the OS.
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * A supported UI language.
 */
export type Language = 'en' | 'uk';

/**
 * Where the window was last time, so it can be put back.
 */
export interface WindowState {
  /**
   * Un-maximized width in pixels.
   */
  width: number;
  /**
   * Un-maximized height in pixels.
   */
  height: number;
  /**
   * Un-maximized left edge, absent before the window has ever been placed.
   */
  x?: number;
  /**
   * Un-maximized top edge, absent before the window has ever been placed.
   */
  y?: number;
  /**
   * Whether the window was maximized when it was last closed.
   */
  maximized: boolean;
}

/**
 * The half of the assists that belongs to the person playing rather than to a
 * race.
 *
 * A `Pick` off `Assists` rather than a list of its own, so the two can never
 * drift apart. The rest - damage, fuel rate, tyre wear, slipstream and tyre
 * blankets - are regulations, and a series sets those. Tyre blankets in
 * particular are a rule a championship writes down, not a preference: real
 * series allow or ban them, and the same driver races under both.
 */
export type DrivingAids = Pick<
  Assists,
  | 'idealLine'
  | 'autoBlip'
  | 'autoBrake'
  | 'autoShifter'
  | 'autoClutch'
  | 'abs'
  | 'tractionControl'
  | 'stabilityControl'
  | 'visualDamage'
>;

/**
 * A driving aid that is simply on or off.
 *
 * Split from the numeric ones because reading them back off disk and rendering
 * them are both per-type jobs, and because `Extract` makes a renamed field fail
 * the typecheck rather than quietly dropping out of the migration.
 */
export type DrivingAidFlag = Extract<
  keyof DrivingAids,
  'idealLine' | 'autoBlip' | 'autoBrake' | 'autoShifter' | 'autoClutch' | 'visualDamage'
>;

/**
 * A driving aid Assetto Corsa measures rather than switches.
 */
export type DrivingAidNumber = Exclude<keyof DrivingAids, DrivingAidFlag>;

/**
 * Content the user put into the library themselves, by folder ID.
 *
 * Only ever consulted for what the provenance catalogue does not name, so a row
 * the catalogue later gains is harmless rather than a conflict. Resolved over the
 * catalogue at runtime rather than baked into the content cache, so adding one
 * never means a rescan.
 */
export interface AddedContent {
  /**
   * Folder names under content/cars.
   */
  cars: string[];
  /**
   * Folder names under content/tracks. A circuit rather than a layout, so adding
   * one brings every layout of it along.
   */
  tracks: string[];
}

/**
 * Everything persisted between runs.
 */
export interface Settings {
  /**
   * Schema version, so a future shape can be migrated rather than discarded.
   *
   * Nothing reads it until the app is released.
   */
  version: 1;
  /**
   * The user's theme choice, before resolution.
   */
  theme: ThemeChoice;
  /**
   * The user's UI language.
   */
  language: Language;
  /**
   * Which mod renders the weather, and so whether it can change during a
   * session at all.
   *
   * A property of the install rather than of a race, which is why it lives
   * here and not on a race definition. See src/shared/utils/weather-system/.
   */
  weatherSystem: WeatherSystem;
  /**
   * The weather types the user lets into the sim, in menu order.
   *
   * Governs what a championship may generate and what the race screen offers.
   * A type left out is swapped for the nearest one allowed rather than refused,
   * and a hand-written race file may still name anything it likes.
   */
  allowedWeather: WeatherType[];
  /**
   * The name shown on Assetto Corsa's timing screen.
   *
   * A property of the person playing rather than of a race, so it is set once
   * here and written into every launch. Absent means Assetto Corsa's own
   * default. A race file may still name its own driver, which wins.
   */
  driverName?: string;
  /**
   * The driving aids every launch is run with.
   *
   * A property of the person playing rather than of a race, for the same reason
   * `driverName` is: nobody wants to re-pick ABS for every race. A race that
   * names one of these keeps it, which is what lets a spike pin them all.
   */
  drivingAids: DrivingAids;
  /**
   * Anonymous mods the user has let into the library.
   *
   * The browsers and pickers show what the provenance catalogue names; this is
   * the way back in for everything else. See src/shared/utils/library/.
   */
  addedContent: AddedContent;
  /**
   * Paths the user has corrected by hand.
   */
  paths: PathOverrides;
  /**
   * Window geometry to restore on next launch.
   */
  window: WindowState;
  /**
   * ISO timestamp of when the user finished first-run setup. Absent means they
   * have not, which is the only reliable signal - an auto-detected install
   * writes no overrides, so empty `paths` says nothing either way.
   */
  setupCompletedAt?: string;
}
