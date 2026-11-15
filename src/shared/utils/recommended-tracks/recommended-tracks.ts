// Recommended tracks read against an install: which folder a recommended
// layout races, and which installed track looks like one nobody found. Shared
// because main lowers rounds on the answer and the Tracks tab shows it, and the
// renderer names a round's circuit from the catalogue whatever is installed.

import { GENERIC_WORDS, GUESS_LENGTH_SHARE, GUESS_MIN_WORD } from './constants.ts';
import { RECOMMENDED_CIRCUITS } from '../../constants/index.ts';
import type {
  Championship,
  RecommendedCircuit,
  RecommendedLayout,
  RecommendedTrackInfo,
  RecommendedTrackState,
  ResolvedTrack,
  Round,
  Track,
  TrackChoice,
} from '../../types/index.ts';
import { nationOfCountry } from '../nations/index.ts';
import { normalise } from '../search/index.ts';

/**
 * A recommended layout together with the circuit it belongs to.
 */
export interface RecommendedEntry {
  /**
   * The circuit.
   */
  circuit: RecommendedCircuit;
  /**
   * The layout.
   */
  layout: RecommendedLayout;
}

const BY_ID = new Map<string, RecommendedEntry>(RECOMMENDED_CIRCUITS.flatMap((circuit) => (
  circuit.layouts.map((layout): [string, RecommendedEntry] => [layout.id, { circuit, layout }])
)));

const BY_FOLDER = new Map<string, string>(RECOMMENDED_CIRCUITS.flatMap((circuit) => (
  circuit.layouts.flatMap((layout) => layout.folders.map((folder): [string, string] => [folder, layout.id]))
)).reverse());

/**
 * Splits a track key into its folder and layout.
 * @param key A track key, `id/layout` or a bare id
 * @returns The folder id and the layout, empty for a single-layout track
 */
export const splitTrackKey = (key: string): { id: string; layout: string } => {
  const slash = key.indexOf('/');

  return slash === -1 ? { id: key, layout: '' } : { id: key.slice(0, slash), layout: key.slice(slash + 1) };
};

/**
 * The folder ids a recommended layout is known by, which belong in the library
 * whoever made them. Kunos' own are left out, being in it already.
 */
const CIRCUIT_FOLDERS = new Set(RECOMMENDED_CIRCUITS.flatMap((circuit) => (
  circuit.layouts.flatMap((layout) => layout.folders.map((folder) => splitTrackKey(folder).id))
)));

/**
 * Writes a folder and layout as a track key.
 * @param track The folder id and the layout, empty or absent for a
 * single-layout track
 * @returns The key
 */
export const trackKeyOf = ({ id, layout }: { id: string; layout?: string }): string => (
  layout ? `${id}/${layout}` : id
);

/**
 * A round's track at a recommended layout, raced on the folder a key names.
 * @param recommended The recommended layout's id
 * @param key The track key raced
 * @returns The round's track
 */
const roundTrack = (recommended: string, key: string): Round['track'] => {
  const { id, layout } = splitTrackKey(key);

  return layout ? { recommended, id, layout } : { recommended, id };
};

/**
 * Looks a recommended layout up.
 * @param id The layout's id
 * @returns It and its circuit, or null when the catalogue has no such layout
 */
export const recommendedLayout = (id: string): RecommendedEntry | null => BY_ID.get(id) ?? null;

/**
 * The recommended layout a round races, if it names one.
 * @param round The round
 * @returns The layout and its circuit, or null for a round at a plain folder or
 * at a layout the catalogue does not have
 */
export const layoutOfRound = (round: Round): RecommendedEntry | null => (
  round.track.recommended ? recommendedLayout(round.track.recommended) : null
);

/**
 * Which recommended layout an installed folder is known to be.
 *
 * Only the folders a layout lists count: Kunos' own version stands for a
 * layout only when nothing better is installed, so a round written at Kunos'
 * Spa stays at Kunos' Spa.
 * @param key The track key
 * @returns The layout's id, or null when the folder stands for none
 */
export const layoutOfFolder = (key: string): string | null => BY_FOLDER.get(key) ?? null;

/**
 * Whether a track folder holds a layout the catalogue recommends, which puts
 * it in the library whoever made it.
 * @param id The track's folder id
 * @returns True when one of its layouts is recommended
 */
export const isRecommendedCircuit = (id: string): boolean => CIRCUIT_FOLDERS.has(id);

/**
 * The track the app itself picks for a layout: the first folder known to be
 * it, else Kunos' own version, else nothing.
 * @param layout The recommended layout
 * @param installed Whether a track key is installed
 * @returns Where the track came from and its key
 */
const ownTrack = (layout: RecommendedLayout, installed: (key: string) => boolean): ResolvedTrack => {
  const found = layout.folders.find(installed);
  if (found) return { source: 'found', key: found };
  if (layout.kunos && installed(layout.kunos)) return { source: 'kunos', key: layout.kunos };

  return { source: 'missing', key: null };
};

/**
 * Works out which installed track a recommended layout races.
 *
 * The player's own choice while it is installed, else the app's own pick. A
 * choice of the very track the app would pick anyway - a folder the catalogue
 * learnt after the player chose it - reads as the app's own.
 * @param layout The recommended layout
 * @param installed Whether a track key is installed
 * @param choice What the player decided about it, if anything
 * @returns Where the track came from and its key
 */
export const resolveLayout = (
  layout: RecommendedLayout,
  installed: (key: string) => boolean,
  choice?: TrackChoice,
): ResolvedTrack => {
  const own = ownTrack(layout, installed);

  if (choice?.track && choice.track !== own.key && installed(choice.track)) {
    return { source: 'choice', key: choice.track };
  }

  return own;
};

/**
 * The track a round at a recommended layout is written with, before anything
 * is installed: its first known folder, else Kunos' version, else none at all.
 * @param id The recommended layout's id
 * @returns The round's track
 * @throws When the catalogue has no such layout - a shipped round naming one is
 * a typo, and the library would not build
 */
export const recommendedTrack = (id: string): Round['track'] => {
  const entry = recommendedLayout(id);
  if (!entry) throw new Error(`No recommended layout ${id}`);

  const [first = entry.layout.kunos ?? ''] = entry.layout.folders;

  return roundTrack(id, first);
};

/**
 * Makes an installed-key lookup over a list of tracks.
 * @param tracks Every installed track
 * @returns Whether a key is installed
 */
const installedIn = (tracks: readonly Track[]): ((key: string) => boolean) => {
  const keys = new Set(tracks.map((track) => track.key));
  return (key) => keys.has(key);
};

/**
 * Points every round at a recommended layout at the track it races as the
 * install and the player's choices stand.
 *
 * A round whose layout races nothing keeps the track it was written with, so
 * it reads as not installed exactly as a missing track always has. Returns the
 * championship itself when nothing moved.
 * @param series The championship
 * @param tracks Every installed track, in the library or not
 * @param choices What the player decided, by layout id
 * @returns The championship, its rounds pointed at what they race
 */
export const withRecommendedTracks = (
  series: Championship,
  tracks: readonly Track[],
  choices: Readonly<Record<string, TrackChoice>>,
): Championship => {
  if (!series.rounds.some((round) => round.track.recommended)) return series;

  const installed = installedIn(tracks);
  let moved = false;
  const rounds = series.rounds.map((round) => {
    const entry = layoutOfRound(round);
    if (!entry) return round;

    const { id } = entry.layout;
    const { key } = resolveLayout(entry.layout, installed, choices[id]);
    if (key === null || key === trackKeyOf(round.track)) return round;

    moved = true;
    return { ...round, track: roundTrack(id, key) };
  });

  return moved ? { ...series, rounds } : series;
};

/**
 * Describes an installed track for the Tracks tab.
 * @param track The track
 * @returns What the tab shows of it
 */
const infoOf = (track: Track): RecommendedTrackInfo => ({
  key: track.key,
  id: track.id,
  layout: track.layout,
  name: track.name,
  lengthM: track.lengthM,
  pitboxes: track.pitboxes,
  provenance: track.provenance,
});

/**
 * The words of a circuit's name a track would have to share to look like it.
 * @param circuit The circuit
 * @returns Its telling words, folded
 */
const tellingWords = (circuit: RecommendedCircuit): string[] => (
  normalise(circuit.name).split(/[^a-z0-9]+/)
    .filter((word) => word.length >= GUESS_MIN_WORD && !GENERIC_WORDS.has(word))
);

/**
 * The words a layout's own name goes by in a folder, Grand Prix as GP too.
 * @param layout The layout
 * @returns Its telling words, folded
 */
const layoutWords = (layout: RecommendedLayout): string[] => {
  const name = normalise(layout.name);
  const words = name.split(/[^a-z0-9]+/).filter((word) => word.length >= GUESS_MIN_WORD - 1);

  return name.includes('grand prix') ? [...words, 'gp'] : words;
};

/**
 * Finds an installed track that looks like a recommended layout nothing is
 * known to be.
 *
 * Its length within a couple of percent of the real layout's, its country not
 * another one, and its name sharing a telling word with the circuit's - or,
 * failing the name, its folder already racing another layout of the circuit.
 * The nearest length wins.
 * @param entry The layout and its circuit
 * @param tracks Every installed track
 * @param taken Track keys already racing a recommended layout
 * @param siblings Folder ids racing the circuit's other layouts
 * @param refused Keys the player turned down for this layout
 * @returns The likeliest track, or null when none looks like it
 */
export const guessTrack = (
  entry: RecommendedEntry,
  tracks: readonly Track[],
  taken: ReadonlySet<string>,
  siblings: ReadonlySet<string>,
  refused: readonly string[],
): Track | null => {
  const { circuit, layout } = entry;
  const words = tellingWords(circuit);
  const tolerance = layout.length * GUESS_LENGTH_SHARE;

  const candidates = tracks.filter((track) => {
    if (taken.has(track.key) || refused.includes(track.key) || layoutOfFolder(track.key) !== null) return false;
    if (track.lengthM === null || Math.abs(track.lengthM - layout.length) > tolerance) return false;

    const nation = nationOfCountry(track.country);
    if (nation !== null && nation !== circuit.nation) return false;

    const name = normalise(`${track.name} ${track.id}`);
    return siblings.has(track.id) || words.some((word) => name.includes(word));
  });

  // Nearest in length first; between layouts of one folder measuring the same,
  // the one whose own name says it is this layout.
  const named = layoutWords(layout);
  const rank = (track: Track): [number, number] => [
    Math.abs((track.lengthM ?? 0) - layout.length),
    named.some((word) => normalise(`${track.layout} ${track.name}`).includes(word)) ? 0 : 1,
  ];

  return candidates.reduce<Track | null>((best, track) => {
    if (best === null) return track;
    const [length, name] = rank(track);
    const [bestLength, bestName] = rank(best);

    return length < bestLength || (length === bestLength && name < bestName) ? track : best;
  }, null);
};

/**
 * Every recommended layout as the install stands: what it races, where that
 * came from, and a guess where it races nothing.
 * @param tracks Every installed track, in the library or not
 * @param choices What the player decided, by layout id
 * @returns One state per layout, in the catalogue's order
 */
export const recommendedStates = (
  tracks: readonly Track[],
  choices: Readonly<Record<string, TrackChoice>>,
): RecommendedTrackState[] => {
  const byKey = new Map(tracks.map((track) => [track.key, track]));
  const installed = (key: string): boolean => byKey.has(key);

  const resolved = RECOMMENDED_CIRCUITS.flatMap((circuit) => circuit.layouts.map((layout) => ({
    circuit,
    layout,
    resolved: resolveLayout(layout, installed, choices[layout.id]),
  })));
  const taken = new Set(resolved.flatMap(({ resolved: { key } }) => (key ? [key] : [])));

  return resolved.map(({ circuit, layout, resolved: { source, key } }) => {
    const track = key ? byKey.get(key) ?? null : null;
    if (source !== 'missing') return { id: layout.id, source, track: track && infoOf(track), guess: null };

    const siblings = new Set(resolved
      .filter((other) => other.circuit === circuit && other.resolved.source !== 'kunos' && other.resolved.key)
      .map((other) => splitTrackKey(other.resolved.key ?? '').id));
    const guess = guessTrack({ circuit, layout }, tracks, taken, siblings, choices[layout.id]?.refused ?? []);

    return {
      id: layout.id, source, track: null, guess: guess && infoOf(guess),
    };
  });
};
