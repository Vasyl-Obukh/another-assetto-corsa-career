// Recommended tracks: real circuits' layouts the shipped championships race,
// each standing for whichever installed folder is that layout.

import type { ContentProvenance } from './content.ts';

/**
 * One layout of a recommended circuit.
 */
export interface RecommendedLayout {
  /**
   * Our own id, `circuit/layout`, which a round names. Never a folder name.
   */
  id: string;
  /**
   * What the layout is called.
   */
  name: string;
  /**
   * The real layout's length in metres, which a guess is measured against.
   */
  length: number;
  /**
   * The installed folders known to be this layout, as track keys - `id/layout`,
   * or the bare id for a single-layout track - best first.
   */
  folders: readonly string[];
  /**
   * Kunos' own version of the layout, raced when none of `folders` is
   * installed. An older version of the same layout, never a different one.
   */
  kunos?: string;
}

/**
 * A real circuit, with the layouts of it the championships race.
 */
export interface RecommendedCircuit {
  /**
   * Our own id, the first half of each layout's.
   */
  id: string;
  /**
   * What the circuit is called.
   */
  name: string;
  /**
   * Where it is, as Assetto Corsa's nation code.
   */
  nation: string;
  /**
   * Its layouts, in the order they are listed.
   */
  layouts: readonly RecommendedLayout[];
}

/**
 * What the player decided about one recommended layout.
 */
export interface TrackChoice {
  /**
   * The track they chose for it, as a track key. Absent while they chose none.
   */
  track?: string;
  /**
   * Guesses they turned down, as track keys, so none of them comes back.
   */
  refused?: readonly string[];
}

/**
 * Where the track a recommended layout races came from: the player's own
 * choice, a folder known to be it, Kunos' own version, or nothing at all.
 */
export type TrackSource = 'choice' | 'found' | 'kunos' | 'missing';

/**
 * The track a recommended layout races, as the install and the player's
 * choices stand.
 */
export interface ResolvedTrack {
  /**
   * Where it came from.
   */
  source: TrackSource;
  /**
   * The track key raced, or null when nothing is.
   */
  key: string | null;
}

/**
 * An installed track one recommended layout races or could race, described for
 * the Tracks tab.
 */
export interface RecommendedTrackInfo {
  /**
   * Its track key.
   */
  key: string;
  /**
   * Its folder id.
   */
  id: string;
  /**
   * Its layout folder, or an empty string.
   */
  layout: string;
  /**
   * What it calls itself.
   */
  name: string;
  /**
   * Its length in metres, when it says.
   */
  lengthM: number | null;
  /**
   * Its pit boxes, when it says.
   */
  pitboxes: number | null;
  /**
   * Where it came from, which says whether choosing it brings it into the
   * library.
   */
  provenance: ContentProvenance;
}

/**
 * One recommended layout as the install stands, for the Tracks tab.
 */
export interface RecommendedTrackState {
  /**
   * The recommended layout's id.
   */
  id: string;
  /**
   * Where the track it races came from.
   */
  source: TrackSource;
  /**
   * The track it races, or null when nothing is installed.
   */
  track: RecommendedTrackInfo | null;
  /**
   * An installed track that looks like it - by name, country and length - when
   * nothing else is raced. Offered to the player, never raced unasked.
   */
  guess: RecommendedTrackInfo | null;
}
