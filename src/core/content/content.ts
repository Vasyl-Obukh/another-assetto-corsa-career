// Scanning installed content. Car and track IDs are just folder names, so mods
// need no special handling - but mod authors ship malformed ui_*.json routinely,
// so reads are lenient and a failure skips the entry rather than throwing.
// Nothing is hidden: every skipped or degraded entry becomes a ContentIssue, and
// every entry carries a fingerprint so the next scan re-reads only what moved.

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  CARS_DIR,
  EXTENSION_DIR,
  HIDDEN_FOLDER_PREFIX,
  MANIFEST_INI,
  NATION_FLAGS_DIR,
  SCAN_CONCURRENCY,
  SKIN_CONCURRENCY,
  SKINS_DIR,
  TRACKS_DIR,
  UI_CAR_FILE,
  UI_DIR,
  UI_SKIN_FILE,
  UI_TRACK_FILE,
  WEATHER_CONTROLLERS_DIR,
  WEATHER_DIR,
  WEATHER_INI,
} from './constants.ts';
import type {
  ContentScan, PreviousScan, ScanPart, UiCar, UiSkin, UiTrack,
} from './types.ts';
import {
  fingerprintCar,
  fingerprintTrack,
  listDirs,
  listFiles,
  makeTrack,
  mapLimit,
  parseFollows,
  parseRain,
  plainDescription,
  readJsonFile,
  skinNumber,
  trimmed,
} from './utils.ts';
import {
  CAR_BADGE_FILE,
  FLAG_FILE_EXTENSION,
  SKIN_LIVERY_FILE,
  SKIN_PREVIEW_FILE,
  TRACK_LOGO_FILE,
  TRACK_OUTLINE_FILE,
  TRACK_PHOTO_EXTENSION,
  TRACK_PREVIEW_FILE,
} from '../../shared/constants/index.ts';
import type {
  Car, Content, ContentIssue, Skin, Track, Weather, WeatherController,
} from '../../shared/types/index.ts';
import type { ContentUrlTarget } from '../../shared/utils/content-url/index.ts';
import { parseCarCurves, parseCarPerformance, parseYear } from '../car-performance/index.ts';
import { carProvenance } from '../content-catalogue/index.ts';
import { parseIni } from '../ini/index.ts';
import type { IniData } from '../ini/index.ts';

export { looseJson, parseGeotag } from './utils.ts';
export type {
  ContentFingerprints,
  ContentScan,
  JsonRead,
  LooseJson,
  PreviousScan,
  ScanPart,
  UiCar,
  UiSkin,
  UiTrack,
} from './types.ts';

/**
 * Lists the visible content folders of a directory.
 * @param dir Absolute path to the collection folder
 * @returns Folder names, with hidden ones such as `.git` left out
 */
const listContentDirs = async (dir: string): Promise<string[]> => (
  (await listDirs(dir)).filter((id) => !id.startsWith(HIDDEN_FOLDER_PREFIX))
);

/**
 * Groups a previous scan's issues by the content folder they belong to.
 * @param issues The issues that scan recorded
 * @returns Issues keyed by folder name, so a reused entry keeps its own
 */
const issuesByFolder = (issues: readonly ContentIssue[]): Map<string, ContentIssue[]> => {
  const grouped = new Map<string, ContentIssue[]>();

  for (const issue of issues) {
    // Track layout issues are keyed `id/layout`; the folder is the first segment.
    const folder = issue.id.split('/')[0];
    const existing = grouped.get(folder);
    if (existing) existing.push(issue);
    else grouped.set(folder, [issue]);
  }

  return grouped;
};

/**
 * Reads one livery folder's metadata.
 *
 * Nothing here can fail loudly: a livery with no ui_skin.json, or one whose
 * ui_skin.json is broken, still races perfectly - only its metadata is lost. So
 * it wears its folder name and carries nothing else, and no issue is raised.
 * @param skinsDir The car's skins directory
 * @param id Livery folder name
 * @returns The livery, with every field the author omitted left null
 */
const readSkin = async (skinsDir: string, id: string): Promise<Skin> => {
  const ui = await readJsonFile<UiSkin>(path.join(skinsDir, id, UI_SKIN_FILE));

  return {
    id,
    name: trimmed(ui.value?.skinname) ?? id,
    driver: trimmed(ui.value?.drivername),
    team: trimmed(ui.value?.team),
    number: skinNumber(ui.value?.number),
    country: trimmed(ui.value?.country),
  };
};

/**
 * Reads every livery a car ships, in folder order.
 *
 * That order is preserved rather than sorted by ui_skin.json's `priority`,
 * because race.ini picks the player's livery by position: re-ordering here would
 * silently change which car the player is handed.
 * @param carsDir The content/cars directory
 * @param id Car folder name
 * @returns The car's liveries, empty when it has none
 */
const readSkins = async (carsDir: string, id: string): Promise<Skin[]> => {
  const skinsDir = path.join(carsDir, id, SKINS_DIR);
  const ids = await listDirs(skinsDir);

  return mapLimit(ids, SKIN_CONCURRENCY, (skin) => readSkin(skinsDir, skin));
};

/**
 * Reads one car folder.
 * @param carsDir The content/cars directory
 * @param id Car folder name
 * @returns The car, which is always produced, and anything wrong with it
 */
const readCar = async (
  carsDir: string,
  id: string,
): Promise<{ car: Car; issues: ContentIssue[] }> => {
  const ui = await readJsonFile<UiCar>(path.join(carsDir, id, UI_DIR, UI_CAR_FILE));
  const skins = await readSkins(carsDir, id);

  const issues: ContentIssue[] = [];
  if (ui.error !== null) issues.push({ kind: 'car', id, reason: 'uiMissing', detail: ui.error });
  else if (ui.value === null) issues.push({ kind: 'car', id, reason: 'uiUnparsable', detail: null });
  else if (ui.salvaged) issues.push({ kind: 'car', id, reason: 'uiSalvaged', detail: null });

  // A car with no liveries cannot be put on a grid, which race.ini validation
  // only discovers at launch time. Say so now.
  if (skins.length === 0) issues.push({ kind: 'car', id, reason: 'noSkins', detail: null });

  return {
    car: {
      id,
      name: ui.value?.name ?? id,
      brand: ui.value?.brand ?? null,
      tags: Array.isArray(ui.value?.tags) ? ui.value.tags : [],
      skins,
      carClass: typeof ui.value?.class === 'string' ? ui.value.class : null,
      year: parseYear(ui.value?.year),
      country: typeof ui.value?.country === 'string' ? ui.value.country : null,
      performance: parseCarPerformance(ui.value?.specs),
      description: plainDescription(ui.value?.description),
      curves: parseCarCurves(ui.value?.powerCurve, ui.value?.torqueCurve),
      provenance: carProvenance(id),
    },
    issues,
  };
};

/**
 * Scans all installed cars.
 * @param contentDir The AC content directory
 * @param previous The last scan's cars, or null to read every one of them again
 * @returns Every installed car sorted by display name, plus issues and fingerprints
 */
export const scanCars = async (
  contentDir: string,
  previous: PreviousScan<Car> | null = null,
): Promise<ScanPart<Car>> => {
  const carsDir = path.join(contentDir, CARS_DIR);
  const ids = await listContentDirs(carsDir);

  const stamps = new Map(Object.entries(previous?.fingerprints ?? {}));
  const cached = new Map((previous?.entries ?? []).map((car) => [car.id, car]));
  const kept = issuesByFolder(previous?.issues ?? []);

  const scanned = await mapLimit(ids, SCAN_CONCURRENCY, async (id) => {
    // The fingerprint covers each livery's own ui_skin.json, so revalidating a
    // car needs the livery list the last scan found, which the cached car carries.
    const car = cached.get(id);
    if (car) {
      const known = car.skins.map((skin) => skin.id);
      const fingerprint = await fingerprintCar(carsDir, id, known);
      if (stamps.get(id) === fingerprint) {
        return { cars: [car], issues: kept.get(id) ?? [], fingerprint };
      }
    }

    const read = await readCar(carsDir, id);

    return {
      cars: [read.car],
      issues: read.issues,
      fingerprint: await fingerprintCar(carsDir, id, read.car.skins.map((skin) => skin.id)),
    };
  });

  return {
    entries: scanned.flatMap((part) => part.cars).sort((a, b) => a.name.localeCompare(b.name)),
    issues: scanned.flatMap((part) => part.issues),
    fingerprints: Object.fromEntries(ids.map((id, index) => [id, scanned[index].fingerprint])),
  };
};

/**
 * Reads one track folder, producing one entry per layout.
 * @param contentDir The AC content directory
 * @param id Track folder name
 * @returns The layouts that could be read, and anything wrong with the rest
 */
const readTrack = async (
  contentDir: string,
  id: string,
): Promise<{ tracks: Track[]; issues: ContentIssue[] }> => {
  const uiDir = path.join(contentDir, TRACKS_DIR, id, UI_DIR);
  const issues: ContentIssue[] = [];

  // Single-layout tracks put ui_track.json directly in ui/. A root file does not
  // rule out layouts beside it: a layout pack dropped into a Kunos track leaves
  // the original selectable.
  const root = await readJsonFile<UiTrack>(path.join(uiDir, UI_TRACK_FILE));
  const rootTrack: Track[] = [];
  if (root.value !== null) {
    if (root.salvaged) issues.push({ kind: 'track', id, reason: 'uiSalvaged', detail: null });
    rootTrack.push(makeTrack(id, '', root.value, await listFiles(uiDir)));
  } else if (root.error === null) {
    // The file was there but nothing survived the parse, which is a different
    // thing from a track that legitimately has no root ui_track.json.
    issues.push({ kind: 'track', id, reason: 'uiUnparsable', detail: null });
  }

  const layouts = await listDirs(uiDir);
  const resolved = await Promise.all(layouts.map(async (layout) => {
    const ui = await readJsonFile<UiTrack>(path.join(uiDir, layout, UI_TRACK_FILE));
    const key = `${id}/${layout}`;

    if (ui.value === null) {
      issues.push({
        kind: 'track',
        id: key,
        reason: ui.error === null ? 'uiUnparsable' : 'uiMissing',
        detail: ui.error,
      });
      return null;
    }

    if (ui.salvaged) issues.push({ kind: 'track', id: key, reason: 'uiSalvaged', detail: null });
    return makeTrack(id, layout, ui.value, await listFiles(path.join(uiDir, layout)));
  }));

  const tracks = [...rootTrack, ...resolved.filter((track): track is Track => track !== null)];

  if (tracks.length === 0 && layouts.length > 0) {
    issues.push({ kind: 'track', id, reason: 'noLayouts', detail: null });
  } else if (tracks.length === 0 && layouts.length === 0 && root.error !== null) {
    issues.push({ kind: 'track', id, reason: 'uiMissing', detail: root.error });
  }

  return { tracks, issues };
};

/**
 * Scans all installed tracks, one entry per layout.
 *
 * Layout granularity is what race.ini works at, through TRACK plus CONFIG_TRACK.
 * @param contentDir The AC content directory
 * @param previous The last scan's tracks, or null to read every one of them again
 * @returns Every installed layout sorted by display name, plus issues and fingerprints
 */
export const scanTracks = async (
  contentDir: string,
  previous: PreviousScan<Track> | null = null,
): Promise<ScanPart<Track>> => {
  const ids = await listContentDirs(path.join(contentDir, TRACKS_DIR));

  const stamps = new Map(Object.entries(previous?.fingerprints ?? {}));
  const kept = issuesByFolder(previous?.issues ?? []);

  const cached = new Map<string, Track[]>();
  for (const track of previous?.entries ?? []) {
    const existing = cached.get(track.id);
    if (existing) existing.push(track);
    else cached.set(track.id, [track]);
  }

  const scanned = await mapLimit(ids, SCAN_CONCURRENCY, async (id) => {
    const stamp = stamps.get(id);

    if (stamp !== undefined) {
      const known = cached.get(id) ?? [];
      const layouts = known.map((track) => track.layout).filter((layout) => layout !== '');
      const fingerprint = await fingerprintTrack(contentDir, id, layouts);
      if (stamp === fingerprint) return { tracks: known, issues: kept.get(id) ?? [], fingerprint };
    }

    const read = await readTrack(contentDir, id);
    const layouts = read.tracks.map((track) => track.layout).filter((layout) => layout !== '');

    return { ...read, fingerprint: await fingerprintTrack(contentDir, id, layouts) };
  });

  return {
    entries: scanned.flatMap((part) => part.tracks).sort((a, b) => a.name.localeCompare(b.name)),
    issues: scanned.flatMap((part) => part.issues),
    fingerprints: Object.fromEntries(ids.map((id, index) => [id, scanned[index].fingerprint])),
  };
};

/**
 * Scans all installed weather presets.
 *
 * The CSP weather type is read from each weather.ini rather than a hardcoded
 * table, which is how Content Manager gets it too, so mod weathers need no extra
 * mapping. Not fingerprinted: there are tens of these, each a small ini.
 * @param contentDir The AC content directory
 * @returns Every readable weather preset sorted by ID, plus issues
 */
export const scanWeather = async (contentDir: string): Promise<ScanPart<Weather>> => {
  const weatherDir = path.join(contentDir, WEATHER_DIR);
  const ids = await listContentDirs(weatherDir);
  const issues: ContentIssue[] = [];

  const weathers = await mapLimit(ids, SCAN_CONCURRENCY, async (id): Promise<Weather | null> => {
    let ini: IniData;
    try {
      ini = parseIni(await readFile(path.join(weatherDir, id, WEATHER_INI), 'utf8'));
    } catch (error) {
      issues.push({
        kind: 'weather', id, reason: 'uiMissing', detail: (error as Error).message,
      });
      return null;
    }

    // Kunos weathers have no __LAUNCHER_CM section; null means "let CM decide".
    const type = ini.__LAUNCHER_CM?.WEATHER_TYPE;

    return {
      id,
      name: ini.LAUNCHER?.NAME ?? id,
      type: type === undefined ? null : parseInt(type, 10),
      temperatureCoeff: parseFloat(ini.LAUNCHER?.TEMPERATURE_COEFF ?? '0') || 0,
      author: ini.__LAUNCHER_CM?.AUTHOR ?? null,
      timeDiapason: ini.__LAUNCHER_CM?.TIME_DIAPASON ?? null,
      cloudCover: parseFloat(ini.CLOUDS?.COVER ?? '0') || 0,
      rain: parseRain(ini.RAINFX),
      forceHeadlights: ini.CAR_LIGHTS?.FORCE_ON === '1',
    };
  });

  return {
    entries: weathers
      .filter((weather): weather is Weather => weather !== null)
      .sort((a, b) => a.id.localeCompare(b.id)),
    issues,
    fingerprints: {},
  };
};

/**
 * Scans installed CSP weather controllers, from extension/weather-controllers.
 *
 * A controller without a manifest is not an issue - the ID is what race.ini
 * needs, and the name is only for display.
 * @param acRoot The AC install root, not the content directory
 * @returns Every installed controller
 */
export const scanWeatherControllers = async (
  acRoot: string,
): Promise<ScanPart<WeatherController>> => {
  const dir = path.join(acRoot, EXTENSION_DIR, WEATHER_CONTROLLERS_DIR);
  const ids = await listDirs(dir);

  const entries = await mapLimit(ids, SCAN_CONCURRENCY, async (id): Promise<WeatherController> => {
    let ini: IniData = {};
    try {
      ini = parseIni(await readFile(path.join(dir, id, MANIFEST_INI), 'utf8'));
    } catch {
      // A controller without a manifest still works; the id is what matters.
    }

    // The FOLLOWS_ flags sit inside [ABOUT], beside the name and version rather
    // than in a section of their own.
    return {
      id,
      name: ini.ABOUT?.NAME ?? id,
      author: ini.ABOUT?.AUTHOR ?? null,
      description: ini.ABOUT?.DESCRIPTION ?? null,
      version: ini.ABOUT?.VERSION ?? null,
      follows: {
        weather: parseFollows(ini.ABOUT?.FOLLOWS_SELECTED_WEATHER),
        temperature: parseFollows(ini.ABOUT?.FOLLOWS_SELECTED_TEMPERATURE),
        wind: parseFollows(ini.ABOUT?.FOLLOWS_SELECTED_WIND),
      },
    };
  });

  return {
    entries: entries.sort((a, b) => a.name.localeCompare(b.name)),
    issues: [],
    fingerprints: {},
  };
};

/**
 * Scans everything, reusing whatever a previous scan already read.
 *
 * Cars and tracks whose fingerprint has not moved are taken from `previous`
 * without touching their files at all, which turns a rescan of a large mod
 * library from thousands of reads into a few thousand stats.
 * @param contentDir The AC content directory; the install root is its parent
 * @param previous The last scan, or null to read everything from scratch
 * @returns The content, the fingerprints to keep, and how long it took
 */
export const rescanContent = async (
  contentDir: string,
  previous: ContentScan | null,
): Promise<ContentScan> => {
  const startedAt = Date.now();
  const acRoot = path.dirname(contentDir);

  const issues = previous?.content.issues ?? [];
  const previousCars = previous && {
    entries: previous.content.cars,
    fingerprints: previous.fingerprints.cars,
    issues: issues.filter((issue) => issue.kind === 'car'),
  };
  const previousTracks = previous && {
    entries: previous.content.tracks,
    fingerprints: previous.fingerprints.tracks,
    issues: issues.filter((issue) => issue.kind === 'track'),
  };

  const [cars, tracks, weather, controllers] = await Promise.all([
    scanCars(contentDir, previousCars),
    scanTracks(contentDir, previousTracks),
    scanWeather(contentDir),
    scanWeatherControllers(acRoot),
  ]);

  return {
    content: {
      cars: cars.entries,
      tracks: tracks.entries,
      weather: weather.entries,
      controllers: controllers.entries,
      issues: [...cars.issues, ...tracks.issues, ...weather.issues, ...controllers.issues],
    },
    fingerprints: { cars: cars.fingerprints, tracks: tracks.fingerprints },
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  };
};

/**
 * Scans everything at once, for the scan command and for race validation.
 * @param contentDir The AC content directory; the install root is its parent
 * @returns Cars, tracks, weathers, weather controllers and anything broken
 */
export const scanContent = async (contentDir: string): Promise<Content> => (
  (await rescanContent(contentDir, null)).content
);

/**
 * The folders worth watching for content being installed or removed.
 *
 * Only the collection folders themselves, never their contents: a recursive
 * watch over a modded install is tens of thousands of files that AC writes to,
 * Content Manager caches into and antivirus reads, and its kernel buffer
 * overflows by dropping events silently. These four fire on exactly the thing
 * that matters, which is a top-level folder appearing or disappearing.
 * @param contentDir The AC content directory; the install root is its parent
 * @returns Absolute paths, some of which may not exist
 */
export const contentWatchDirs = (contentDir: string): string[] => [
  path.join(contentDir, CARS_DIR),
  path.join(contentDir, TRACKS_DIR),
  path.join(contentDir, WEATHER_DIR),
  path.join(path.dirname(contentDir), EXTENSION_DIR, WEATHER_CONTROLLERS_DIR),
];

/**
 * Builds the path to a car skin's preview image.
 * @param contentDir The AC content directory
 * @param carId Car folder name
 * @param skinId Skin folder name
 * @returns An absolute path, which may not exist
 */
export const skinPreview = (contentDir: string, carId: string, skinId: string): string => (
  path.join(contentDir, CARS_DIR, carId, SKINS_DIR, skinId, SKIN_PREVIEW_FILE)
);

/**
 * Builds the path to a car's manufacturer badge.
 * @param contentDir The AC content directory
 * @param carId Car folder name
 * @returns An absolute path, which may not exist
 */
export const carBadge = (contentDir: string, carId: string): string => (
  path.join(contentDir, CARS_DIR, carId, UI_DIR, CAR_BADGE_FILE)
);

/**
 * Builds the path to a track layout's photo.
 * @param contentDir The AC content directory
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns An absolute path, which may not exist
 */
export const trackPreview = (contentDir: string, trackId: string, layout: string): string => (
  path.join(contentDir, TRACKS_DIR, trackId, UI_DIR, layout, TRACK_PREVIEW_FILE)
);

/**
 * Builds the path to a track layout's map outline.
 * @param contentDir The AC content directory
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns An absolute path, which may not exist
 */
export const trackOutline = (contentDir: string, trackId: string, layout: string): string => (
  path.join(contentDir, TRACKS_DIR, trackId, UI_DIR, layout, TRACK_OUTLINE_FILE)
);

/**
 * Resolves what an accontent:// URL pointed at into a path on disk.
 * @param contentDir The AC content directory
 * @param target What the URL pointed at
 * @returns An absolute path, which may not exist
 */
export const contentPath = (contentDir: string, target: ContentUrlTarget): string => {
  switch (target.kind) {
    case 'carSkin': return skinPreview(contentDir, target.carId, target.skinId);
    case 'carLivery': return path.join(contentDir, CARS_DIR, target.carId, SKINS_DIR, target.skinId, SKIN_LIVERY_FILE);
    case 'carBadge': return carBadge(contentDir, target.carId);
    case 'trackPreview': return trackPreview(contentDir, target.trackId, target.layout);
    case 'trackPhoto': return path.join(
      contentDir, TRACKS_DIR, target.trackId, UI_DIR, target.layout, `${target.photo}${TRACK_PHOTO_EXTENSION}`,
    );
    case 'trackLogo': return path.join(contentDir, TRACKS_DIR, target.trackId, UI_DIR, target.layout, TRACK_LOGO_FILE);
    case 'nationFlag': return path.join(contentDir, ...NATION_FLAGS_DIR, `${target.code}${FLAG_FILE_EXTENSION}`);
    default: return trackOutline(contentDir, target.trackId, target.layout);
  }
};

/**
 * Checks that a resolved path really sits under the AC content directory.
 *
 * The protocol handler serves bytes off disk, so this is the gate that stops a
 * crafted URL reading anything outside the game folder. Symlinks are
 * deliberately not resolved: modded installs routinely junction content onto
 * another drive, and with the filename fixed to one of four images, following a
 * link the user made themselves is not an escalation.
 * @param contentDir The AC content directory
 * @param target The absolute path to test
 * @returns True when target is inside contentDir
 */
export const isInsideContentDir = (contentDir: string, target: string): boolean => {
  const relative = path.relative(path.resolve(contentDir), path.resolve(target));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Checks whether a path exists.
 * @param target Absolute path to test
 * @returns True when something is there
 */
export const fileExists = async (target: string): Promise<boolean> => {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
};
