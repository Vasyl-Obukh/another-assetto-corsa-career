// Installed content, as scanned from the Assetto Corsa folder. IDs are folder
// names throughout, which is what makes mods first-class here.

/**
 * What the mod author wrote in ui_car.json's specs block, verbatim.
 *
 * Kept alongside the parsed numbers because these are free text - "300+ km/h",
 * "N/A", "1,200 kg" - and showing the author's own words beats showing nothing
 * when no number could be read out of them.
 */
export interface CarSpecsRaw {
  /**
   * The stated power, as written.
   */
  bhp: string | null;
  /**
   * The stated torque, as written.
   */
  torque: string | null;
  /**
   * The stated weight, as written.
   */
  weight: string | null;
  /**
   * The stated top speed, as written.
   */
  topspeed: string | null;
  /**
   * The stated 0-100 time, as written.
   */
  acceleration: string | null;
  /**
   * The stated power-to-weight ratio, as written.
   */
  pwratio: string | null;
}

/**
 * A car's performance figures, parsed out of the free text mod authors write.
 *
 * Every number is null unless it parsed into something plausible: a figure we
 * are not sure of is worse than no figure at all, because pricing and class
 * inference are both derived from these.
 */
export interface CarSpecs {
  /**
   * Peak power in bhp, converted from kW where the author used it.
   */
  bhp: number | null;
  /**
   * Peak torque in Nm, converted from lb-ft where the author used it.
   */
  torqueNm: number | null;
  /**
   * Kerb weight in kilograms, converted from pounds where the author used them.
   */
  weightKg: number | null;
  /**
   * Top speed in km/h, converted from mph where the author used it.
   */
  topSpeedKph: number | null;
  /**
   * Nought to 100 km/h in seconds.
   */
  accelerationSeconds: number | null;
  /**
   * Ours, derived as bhp per tonne from the parsed power and weight. Null unless
   * both parsed. Deliberately not taken from the author's own pwratio, which
   * mods leave stale after retuning a car and disagree about the direction of.
   */
  powerToWeight: number | null;
  /**
   * The author's original strings, for display when a number could not be read.
   */
  raw: CarSpecsRaw;
}

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
  /**
   * The `class` field from ui_car.json - usually "street" or "race", but mod
   * authors write anything. Named carClass because `class` is a reserved word.
   * Null when absent.
   */
  carClass: string | null;
  /**
   * Model year, or null when absent or unreadable.
   */
  year: number | null;
  /**
   * Country of origin from ui_car.json, or null when the mod omits it.
   */
  country: string | null;
  /**
   * Performance figures, every one of which may be null.
   */
  specs: CarSpecs;
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
 * Which collection a content issue is about.
 */
export type ContentKind = 'car' | 'track' | 'weather' | 'weatherController';

/**
 * Why an entry is broken.
 *
 * A code rather than a sentence, so the UI can translate it and the CLI can
 * print its own English.
 */
export type ContentIssueReason =
  | 'uiMissing'
  | 'uiUnparsable'
  | 'uiSalvaged'
  | 'noLayouts'
  | 'noSkins';

/**
 * One piece of installed content that is broken, incomplete or degraded.
 *
 * Scanning stays lenient - a bad entry is skipped or falls back to its folder
 * name rather than throwing - but every such decision is recorded here, so a
 * broken mod is visible instead of silently missing.
 */
export interface ContentIssue {
  /**
   * Which collection the entry belongs to.
   */
  kind: ContentKind;
  /**
   * Folder name, or `id/layout` when the issue is about one track layout.
   */
  id: string;
  /**
   * What is wrong with it.
   */
  reason: ContentIssueReason;
  /**
   * The underlying error message when there was one, for the console.
   */
  detail: string | null;
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
  /**
   * Every entry that could not be read properly, so broken mods are visible
   * rather than silently missing.
   */
  issues: ContentIssue[];
}

/**
 * How many of each thing a scan found.
 */
export interface ContentCounts {
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
}

/**
 * Counts from a content scan, without the content itself. Sent over IPC in place
 * of the full Content, which is megabytes of skin arrays on a large mod library.
 */
export interface ContentSummary extends ContentCounts {
  /**
   * How many entries were broken, incomplete or degraded.
   */
  issues: number;
  /**
   * ISO timestamp of when the scan finished.
   */
  scannedAt: string;
  /**
   * How long the scan took, in milliseconds.
   */
  durationMs: number;
  /**
   * True when nothing had to be re-read, which is why the duration is tiny.
   */
  cached: boolean;
}

/**
 * What changed when content appeared or disappeared while the app was open.
 */
export interface ContentChange {
  /**
   * The counts as they stand now.
   */
  summary: ContentSummary;
  /**
   * How many entries appeared, per collection.
   */
  added: ContentCounts;
  /**
   * How many entries went away, per collection.
   */
  removed: ContentCounts;
}
