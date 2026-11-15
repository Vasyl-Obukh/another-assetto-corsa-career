import { describe, expect, it } from '@jest/globals';

import { ContentSource } from '../../../../../shared/types';
import type { RecommendedTrackInfo, RecommendedTrackState } from '../../../../../shared/types';
import { rowKind, shownTrack } from '../track-rows.ts';

/**
 * An installed track as a layout's state describes it.
 * @param key Its track key
 * @returns The track
 */
const info = (key: string): RecommendedTrackInfo => ({
  key,
  id: key,
  layout: '',
  name: key,
  lengthM: null,
  pitboxes: null,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
});

/**
 * A layout's state.
 * @param fields What it says
 * @returns The state
 */
const state = (fields: Partial<RecommendedTrackState>): RecommendedTrackState => ({
  id: 'suzuka/gp', source: 'missing', track: null, guess: null, ...fields,
});

describe('renderer/lib/track-rows', () => {
  describe('rowKind', () => {
    it('reads a layout by where its track came from', () => {
      expect(rowKind(state({ source: 'found', track: info('a') }))).toBe('found');
      expect(rowKind(state({ source: 'choice', track: info('a') }))).toBe('choice');
      expect(rowKind(state({ source: 'kunos', track: info('a') }))).toBe('kunos');
      expect(rowKind(state({ source: 'missing' }))).toBe('missing');
    });

    it('reads a layout racing nothing but with a guess as one to confirm', () => {
      expect(rowKind(state({ source: 'missing', guess: info('a') }))).toBe('guess');
    });
  });

  describe('shownTrack', () => {
    it('shows the track a layout races', () => {
      expect(shownTrack(state({ source: 'found', track: info('a') }))?.key).toBe('a');
    });

    it('shows the guess while it races nothing', () => {
      expect(shownTrack(state({ guess: info('b') }))?.key).toBe('b');
    });

    it('shows nothing while there is nothing, or no state yet', () => {
      expect(shownTrack(state({}))).toBeNull();
      expect(shownTrack(null)).toBeNull();
      expect(shownTrack(undefined)).toBeNull();
    });
  });
});
