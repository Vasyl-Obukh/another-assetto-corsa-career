// The ui_*.json shapes mod authors actually ship. Every field is optional
// because any of them may be missing, misspelled or the wrong type.

/**
 * The parts of ui_car.json we read.
 */
export interface UiCar {
  /**
   * Display name.
   */
  name?: string;
  /**
   * Manufacturer.
   */
  brand?: string;
  /**
   * Free-text tags.
   */
  tags?: string[];
}

/**
 * The parts of ui_track.json we read.
 */
export interface UiTrack {
  /**
   * Display name.
   */
  name?: string;
  /**
   * Country the circuit is in.
   */
  country?: string;
  /**
   * Pit box count, written as either a number or a string.
   */
  pitboxes?: string | number;
  /**
   * Latitude then longitude, as degrees-minutes-seconds or decimal strings.
   */
  geotags?: string[];
}
