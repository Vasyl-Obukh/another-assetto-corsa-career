// How a recommended layout's row reads, which the Tracks tab filters on and the
// circuit card draws. Pure, so the tab's helpers can be tested without React.

import type { RecommendedTrackInfo, RecommendedTrackState, TrackSource } from '../../../../shared/types';

/**
 * How a layout row reads: where its track came from, or a guess waiting to be
 * confirmed.
 */
export type TrackRowKind = TrackSource | 'guess';

/**
 * Reads a layout's state as its row shows it.
 * @param state The layout's state
 * @returns How the row reads
 */
export const rowKind = (state: RecommendedTrackState): TrackRowKind => (
  state.source === 'missing' && state.guess ? 'guess' : state.source
);

/**
 * The track a layout's row shows: the one it races, else the guess.
 * @param state The layout's state, or undefined while there is none
 * @returns The track, or null when there is nothing to show
 */
export const shownTrack = (state: RecommendedTrackState | null | undefined): RecommendedTrackInfo | null => (
  state?.track ?? state?.guess ?? null
);
