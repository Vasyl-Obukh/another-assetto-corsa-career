import type { RecommendedTrackState, Track } from '../../../../shared/types';

/**
 * What choosing a track needs of it.
 */
export type ChosenTrack = Pick<Track, 'id' | 'key' | 'provenance'>;

/**
 * Every recommended layout as the install stands, and what can be done to one.
 */
export interface RecommendedTracks {
  /**
   * Each layout's state by its id, or null while it is being read.
   */
  states: ReadonlyMap<string, RecommendedTrackState> | null;
  /**
   * Races a layout on a track the player picked, bringing its circuit into
   * the library.
   * @param layout The recommended layout's id
   * @param track The track picked
   */
  choose: (layout: string, track: ChosenTrack) => void;
  /**
   * Takes a guess, racing the layout on it.
   * @param layout The recommended layout's id
   * @param track The guessed track
   */
  accept: (layout: string, track: ChosenTrack) => void;
  /**
   * Turns a guess down for good.
   * @param layout The recommended layout's id
   * @param key The guessed track's key
   */
  refuse: (layout: string, key: string) => void;
  /**
   * Forgets the player's pick, so the layout races whatever the app finds.
   * @param layout The recommended layout's id
   */
  forget: (layout: string) => void;
}
