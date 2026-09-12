import type { ParseKeys } from 'i18next';

import type { WeatherType } from '../../../../shared/constants';
import type { TrackStateName } from '../../../../shared/types';

/**
 * What one entry in the weather menu stands for.
 *
 * Three questions share one menu because the user has one thing in mind, and
 * Content Manager presents them the same way. Which one was answered decides
 * what goes into the race definition.
 */
export type WeatherChoice =
  | {
    /**
     * Weather the controller decides for itself.
     */
    kind: 'dynamic';
    /**
     * The controller's folder ID.
     */
    controller: string;
  }
  | {
    /**
     * A CSP weather type, which is what a controller actually renders.
     */
    kind: 'type';
    /**
     * The type to ask for.
     */
    type: WeatherType;
  }
  | {
    /**
     * One named installed preset.
     */
    kind: 'preset';
    /**
     * The preset's folder ID.
     */
    preset: string;
  }
  | {
    /**
     * Nothing chosen, so Assetto Corsa's own default applies.
     */
    kind: 'none';
  };

/**
 * A one-line description of a set of conditions, before it is translated.
 *
 * Every field is null when it has nothing to say, so the caller can drop it
 * rather than render an empty part.
 */
export interface ConditionsSummary {
  /**
   * How many slots the weather moves through, or null when it simply holds.
   */
  slots: number | null;
  /**
   * The weather type it holds at, or null when a plan or a preset says instead.
   */
  weather: WeatherType | null;
  /**
   * The preset it names, for a hand-written race file, or null.
   */
  preset: string | null;
  /**
   * The start time, or null when nothing sets one.
   */
  timeOfDay: string | null;
  /**
   * Air temperature, or null.
   */
  ambient: number | null;
  /**
   * How much rubber is down, or null.
   */
  trackState: TrackStateName | null;
}

/**
 * How long a session runs, ready to be put into words.
 */
export interface SessionLength {
  /**
   * The translation key for its unit, which pluralises on `count`.
   */
  key: ParseKeys;
  /**
   * How many laps or minutes.
   */
  count: number;
}
