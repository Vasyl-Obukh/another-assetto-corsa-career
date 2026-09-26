// Installed content, as scanned from the Assetto Corsa folder. IDs are folder
// names throughout, which is what makes mods first-class here.

/**
 * What the mod author wrote in ui_car.json's specs block, verbatim.
 *
 * Kept alongside the parsed numbers because these are free text - "300+ km/h",
 * "N/A", "1,200 kg" - and showing the author's own words beats showing nothing
 * when no number could be read out of them.
 */
export interface CarPerformanceRaw {
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
export interface CarPerformance {
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
  raw: CarPerformanceRaw;
}

/**
 * Where a piece of content came from.
 *
 * Base covers the game everyone owns, free updates and bonus packs included -
 * Steam ships those in the base depot, so they are never something a user can be
 * missing. DLC is the eleven paid packs. Anything else is a mod, whether or not
 * we know who made it.
 */
export enum ContentSource {
  BASE = 'base',
  DLC = 'dlc',
  MOD = 'mod',
}

/**
 * A paid Kunos DLC pack - something a user either owns or can be told to buy.
 *
 * Eleven members, one per Steam DLC. Bonus packs are deliberately absent: they
 * are free, so they are base content rather than something to own.
 */
export enum DLCPack {
  DREAM_PACK_1 = 'dream-pack-1',
  DREAM_PACK_2 = 'dream-pack-2',
  DREAM_PACK_3 = 'dream-pack-3',
  JAPANESE_PACK = 'japanese-pack',
  TRIPL3_PACK = 'tripl3-pack',
  RED_PACK = 'red-pack',
  PORSCHE_PACK_1 = 'porsche-pack-1',
  PORSCHE_PACK_2 = 'porsche-pack-2',
  PORSCHE_PACK_3 = 'porsche-pack-3',
  READY_TO_RACE = 'ready-to-race',
  FERRARI_70TH = 'ferrari-70th',
}

/**
 * A mod team whose content the catalogue names.
 *
 * Anything not attributed to one is still a mod, just an anonymous one. Guessing
 * an author from a folder name would be worse than admitting we do not know.
 */
export enum ModMaker {
  RSS = 'rss',
  VRC = 'vrc',
  URD = 'urd',
  GUERILLA = 'guerilla',
  YEZHROD = 'yezhrod',
}

/**
 * Someone who redistributes content rather than authoring it.
 *
 * Separate from ModMaker because the two answer different questions: LFM ships
 * other teams' cars, and ships layouts into a Kunos track, so a car can be
 * RSS-made and LFM-distributed at once.
 */
export enum ModDistributor {
  LFM = 'lfm',
}

/**
 * Where one car or track layout came from.
 *
 * Every field is a lookup in the shipped catalogue in
 * src/core/content-catalogue/, which lists each folder ID explicitly. Nothing
 * here is inferred from the content: folder prefixes miss as often as they hit,
 * and AC's own dlc_ui_car.json marker gets copied verbatim by mods.
 */
export interface ContentProvenance {
  /**
   * Base game, DLC or mod.
   */
  source: ContentSource;
  /**
   * Which DLC pack, when the source is dlc. Null otherwise.
   */
  pack: DLCPack | null;
  /**
   * Which mod team, when the catalogue names one. Null otherwise.
   */
  maker: ModMaker | null;
  /**
   * Who redistributed this, when anyone did. Independent of source, since a
   * redistributor can ship into base or DLC content as readily as into a mod.
   */
  distributor: ModDistributor | null;
}

/**
 * One livery installed under a car's skins folder.
 *
 * Everything but the ID comes from ui_skin.json, which around a twelfth of
 * liveries do not ship and a handful ship broken. A livery with no readable
 * metadata is still perfectly raceable, so it is never an issue - it just wears
 * its folder name and carries nothing else.
 */
export interface Skin {
  /**
   * Folder name under skins/, and the ID race.ini's SKIN refers to.
   */
  id: string;
  /**
   * Display name from ui_skin.json, falling back to the folder name.
   */
  name: string;
  /**
   * Who drives this livery, or null when nobody is named. Often a whole
   * endurance crew in one string, exactly as the author wrote it.
   */
  driver: string | null;
  /**
   * The team the livery belongs to, or null when none is named.
   */
  team: string | null;
  /**
   * Racing number, or null when the livery carries none. Kept as a string
   * because leading zeros are meaningful on a car.
   */
  number: string | null;
  /**
   * The driver's or team's country, in the author's own wording. Free text and
   * inconsistent across the library, so it is never matched against anything.
   */
  country: string | null;
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
   * Liveries under skins/, in scan order. That order is load-bearing: race.ini
   * picks the player's livery by position.
   */
  skins: Skin[];
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
  performance: CarPerformance;
  /**
   * The author's own description from ui_car.json as plain text, line breaks
   * kept, or null when there is none.
   */
  description: string | null;
  /**
   * The power and torque curves from ui_car.json, or null when the author
   * shipped neither.
   */
  curves: CarCurves | null;
  /**
   * Base game, DLC or mod, and who made or redistributed it.
   */
  provenance: ContentProvenance;
}

/**
 * One point of a curve: engine speed in rpm, and the value there.
 */
export type CurvePoint = readonly [rpm: number, value: number];

/**
 * A car's power and torque across its rev range, as ui_car.json states them.
 * Either may be empty when the author shipped only the other.
 */
export interface CarCurves {
  /**
   * Power in bhp, in rising rpm order.
   */
  power: CurvePoint[];
  /**
   * Torque in Nm, in rising rpm order.
   */
  torque: CurvePoint[];
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
 * Which way round a layout is driven.
 */
export type TrackRun = 'clockwise' | 'anticlockwise';

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
   * Lap length in metres, or null when ui_track.json does not say.
   *
   * Always metres, whatever the author wrote: they use metres and kilometres
   * about equally often, and a figure whose unit depends on who made the track
   * is not a figure.
   */
  lengthM: number | null;
  /**
   * Track width in metres, or null when ui_track.json does not say.
   */
  widthM: number | null;
  /**
   * Real-world position, for CSP.
   */
  geotags: Geotags;
  /**
   * Town or region from ui_track.json, or null when the mod omits it.
   */
  city: string | null;
  /**
   * Which way round it is driven, or null when ui_track.json does not say in
   * words this reads.
   */
  run: TrackRun | null;
  /**
   * The author's description from ui_track.json as plain text, or null.
   */
  description: string | null;
  /**
   * Free-text tags from ui_track.json.
   */
  tags: string[];
  /**
   * Who made it, as ui_track.json says, or null.
   */
  author: string | null;
  /**
   * The mod's own version string, or null.
   */
  version: string | null;
  /**
   * Year from ui_track.json, or null when absent or implausible.
   */
  year: number | null;
  /**
   * The loading-screen photographs in the layout's ui folder, by name without
   * the extension - `bgr00` and on - sorted. Empty for most mods.
   */
  photos: string[];
  /**
   * Whether the layout's ui folder ships a logo.
   */
  logo: boolean;
  /**
   * Base game, DLC or mod, and who made or redistributed it. Per layout, since
   * a redistributor can add layouts to a track it did not ship.
   */
  provenance: ContentProvenance;
}

/**
 * One installed track, with its layouts gathered under it.
 *
 * What the browser shows: a circuit is one thing to pick, not eight. The scan
 * stays per layout, because that is what race.ini works at - this is a view over
 * it, built at query time.
 */
export interface TrackGroup {
  /**
   * Folder name under content/tracks, shared by every layout in the group.
   */
  id: string;
  /**
   * Display name for the circuit, derived from the layouts' own names.
   */
  name: string;
  /**
   * Country, from the first layout that names one.
   */
  country: string | null;
  /**
   * Where the circuit came from. Source, pack and maker are keyed by track, so
   * every layout agrees on them; the distributor is whoever redistributes any
   * layout here, since LFM adds layouts to circuits it did not ship.
   */
  provenance: ContentProvenance;
  /**
   * The layouts, sorted by name. Under a filter this holds only the layouts that
   * matched, so a group narrows rather than disappearing.
   */
  layouts: Track[];
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
   * Preset author, or null when unattributed. Also the grouping the weather
   * menu uses, since sorting forty-five presets by folder ID interleaves the
   * Kunos seven, Sol's set and our own meaninglessly.
   */
  author: string | null;
  /**
   * When the preset is meant to be used, as `HH:MM-HH:MM`, or null when it says
   * nothing. Sol and PURE presets use it heavily; a night preset at noon is
   * something the menu can warn about rather than let through.
   */
  timeDiapason: string | null;
  /**
   * How much of the sky is covered, 0 to 1, from `[CLOUDS] COVER`.
   */
  cloudCover: number;
  /**
   * Rain figures CSP reads directly, or null when the preset carries no
   * `[RAINFX]` section.
   *
   * Almost nothing does: on a Sol-equipped library six of forty-five presets
   * have one, and all six are ours. That is the whole reason
   * `src/core/weather/` installs its own - PURE reads these values instead of
   * resolving the weather type, which makes rain deterministic.
   */
  rain: WeatherRain | null;
  /**
   * Whether the preset forces headlights on, from `[CAR_LIGHTS] FORCE_ON`.
   */
  forceHeadlights: boolean;
}

/**
 * The rain a weather preset asks CSP for, all 0 to 1.
 */
export interface WeatherRain {
  /**
   * How hard it falls.
   */
  intensity: number;
  /**
   * How wet the surface gets.
   */
  wetness: number;
  /**
   * How much standing water collects.
   */
  water: number;
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
  /**
   * Controller version from the manifest, or null when it names none.
   */
  version: string | null;
  /**
   * What the controller takes from the race, and what it decides for itself.
   */
  follows: WeatherFollows;
}

/**
 * Whether a controller honours what the race asked for.
 *
 * "no" is the load-bearing one: a controller that does not follow the selected
 * weather ignores it entirely and drives the weather from its own planner app.
 * PURE's manifest says as much beside the flag - "this parameter is static and
 * moves weather controller into a different section" - so those are not
 * controllers to choose between at all, they are dynamic weather.
 */
export type WeatherFollow = 'yes' | 'no' | 'depends';

/**
 * A controller's three follow flags.
 */
export interface WeatherFollows {
  /**
   * Whether the race's weather is honoured.
   */
  weather: WeatherFollow;
  /**
   * Whether the race's ambient temperature is honoured.
   */
  temperature: WeatherFollow;
  /**
   * Whether the race's wind is honoured.
   */
  wind: WeatherFollow;
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
 * How much installed content the catalogue does not name.
 *
 * Those entries are left out of the library the browsers and pickers show, so
 * this is what stops a third of someone's install disappearing with nothing
 * said. Tracks are counted in layouts, as ContentCounts counts them.
 */
export interface HiddenCounts {
  /**
   * Cars in no provenance record.
   */
  cars: number;
  /**
   * Track layouts in no provenance record.
   */
  tracks: number;
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
   * How much of the above the catalogue does not name, and so is not offered.
   */
  hidden: HiddenCounts;
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

/**
 * Whether Custom Shaders Patch's weather and rain modules are switched on.
 *
 * Separate from the weather controller and from each other, and either being off
 * changes what a race can meaningfully be asked for: with WeatherFX off no
 * controller runs at all, and with RainFX off a wet weather is simply never wet.
 * Neither reports itself anywhere, which is the reason to read them.
 */
export interface WeatherFxState {
  /**
   * Whether WeatherFX runs at all.
   */
  weatherFx: boolean;
  /**
   * Whether RainFX draws rain.
   */
  rainFx: boolean;
}
