// Installed content, as scanned from the Assetto Corsa folder. IDs are folder
// names throughout, which is what makes mods first-class here.

/**
 * A car installed in content/cars.
 */
export interface Car {
  /**
   * Folder name under content/cars, and the ID race.ini refers to.
   */
  id: string;
  /**
   * Display name from ui_car.json, falling back to the folder name.
   */
  name: string;
  /**
   * Manufacturer from ui_car.json, or null when the mod omits it.
   */
  brand: string | null;
  /**
   * Free-text tags from ui_car.json; mod authors fill these in inconsistently.
   */
  tags: string[];
  /**
   * Folder names under skins/, in scan order.
   */
  skins: string[];
}

/**
 * A track's real-world position, used by CSP for sun and weather placement.
 */
export interface Geotags {
  /**
   * Latitude in decimal degrees, negative for south. Null when unknown.
   */
  lat: number | null;
  /**
   * Longitude in decimal degrees, negative for west. Null when unknown.
   */
  lon: number | null;
}

/**
 * One track layout. A track with several layouts produces one entry per layout.
 */
export interface Track {
  /**
   * Folder name under content/tracks.
   */
  id: string;
  /**
   * Layout folder name, or an empty string for single-layout tracks.
   */
  layout: string;
  /**
   * `id` for single-layout tracks, `id/layout` otherwise.
   */
  key: string;
  /**
   * Display name from ui_track.json, falling back to the folder name.
   */
  name: string;
  /**
   * Country from ui_track.json, or null when the mod omits it.
   */
  country: string | null;
  /**
   * Grid size ceiling; exceeding it makes AC drop cars or fail to load.
   */
  pitboxes: number | null;
  /**
   * Real-world position, for CSP.
   */
  geotags: Geotags;
}

/**
 * A weather preset installed in content/weather.
 */
export interface Weather {
  /**
   * Folder name under content/weather.
   */
  id: string;
  /**
   * Display name from the LAUNCHER section of weather.ini.
   */
  name: string;
  /**
   * CSP weather type, or null when CM has to infer it.
   */
  type: number | null;
  /**
   * Multiplier applied to ambient temperature when deriving road temperature.
   */
  temperatureCoeff: number;
  /**
   * Preset author, or null when unattributed.
   */
  author: string | null;
}

/**
 * A CSP weather controller installed in extension/weather-controllers.
 */
export interface WeatherController {
  /**
   * Folder name, which may contain spaces (for example "pureCtrl static").
   */
  id: string;
  /**
   * Display name from the manifest.
   */
  name: string;
  /**
   * Controller author, or null when unattributed.
   */
  author: string | null;
  /**
   * Manifest description, or null when absent.
   */
  description: string | null;
}

/**
 * Everything a content scan found.
 */
export interface Content {
  /**
   * Installed cars, sorted by display name.
   */
  cars: Car[];
  /**
   * Installed track layouts, one entry per layout.
   */
  tracks: Track[];
  /**
   * Installed weather presets, sorted by ID.
   */
  weather: Weather[];
  /**
   * Installed CSP weather controllers.
   */
  controllers: WeatherController[];
}

/**
 * Counts from a content scan, without the content itself. Sent over IPC in place
 * of the full Content, which is megabytes of skin arrays on a large mod library.
 */
export interface ContentSummary {
  /**
   * Number of installed cars.
   */
  cars: number;
  /**
   * Number of installed track layouts.
   */
  tracks: number;
  /**
   * Number of installed weather presets.
   */
  weather: number;
  /**
   * Number of installed CSP weather controllers.
   */
  controllers: number;
  /**
   * ISO timestamp of when the scan finished.
   */
  scannedAt: string;
  /**
   * How long the scan took, in milliseconds.
   */
  durationMs: number;
}
