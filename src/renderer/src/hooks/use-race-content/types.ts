import type {
  Car, Track, Weather, WeatherController,
} from '../../../../shared/types';

/**
 * What the race setup screen needs in order to name what the definition points
 * at, and to offer the weather it could point at instead.
 */
export interface RaceContent {
  /**
   * The layout the race names, or null when it names none or names one that is
   * not installed. A missing one is already reported as a problem on the setup.
   */
  track: Track | null;
  /**
   * The player's car, or null on the same terms.
   */
  car: Car | null;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
}

/**
 * The player's car as fetched, stamped with what it was fetched for.
 *
 * The stamp is what lets the hook derive its answer during render: an answer
 * whose stamp no longer matches the definition is simply not shown, so a car
 * the user has just replaced never lingers under the new one.
 */
export interface ResolvedContent {
  /**
   * The folder ID `car` was fetched for.
   */
  carId: string;
  /**
   * What came back for it.
   */
  car: Car | null;
}
