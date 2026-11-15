import { describe, expect, it } from '@jest/globals';

import { RECOMMENDED_CIRCUITS } from '../../../constants/index.ts';
import { ContentSource } from '../../../types/index.ts';
import type {
  Championship, ContentProvenance, RecommendedTrackState, Round, Track,
} from '../../../types/index.ts';
import {
  guessTrack,
  isRecommendedCircuit,
  layoutOfFolder,
  layoutOfRound,
  recommendedLayout,
  recommendedStates,
  recommendedTrack,
  resolveLayout,
  splitTrackKey,
  trackKeyOf,
  withRecommendedTracks,
} from '../recommended-tracks.ts';
import type { RecommendedEntry } from '../recommended-tracks.ts';

/**
 * A mod nobody is credited with.
 */
const ANONYMOUS: ContentProvenance = {
  source: ContentSource.MOD, pack: null, maker: null, distributor: null,
};

/**
 * An installed track carrying what the lookups read.
 * @param key Its track key
 * @param fields Anything else it says
 * @returns The track
 */
const track = (key: string, fields: Partial<Track> = {}): Track => ({
  ...splitTrackKey(key),
  key,
  name: key,
  country: null,
  pitboxes: 30,
  lengthM: null,
  provenance: ANONYMOUS,
  ...fields,
} as unknown as Track);

/**
 * A round at a track.
 * @param id The round's id
 * @param at The round's track
 * @returns The round
 */
const round = (id: string, at: Round['track']): Round => ({ id, name: id, track: at });

/**
 * A championship of rounds.
 * @param rounds Its rounds
 * @returns The championship
 */
const championship = (rounds: Round[]): Championship => ({ id: 'cup', rounds } as unknown as Championship);

/**
 * A catalogue entry the tests lean on.
 * @param id The layout's id
 * @returns The entry
 */
const entryOf = (id: string): RecommendedEntry => {
  const entry = recommendedLayout(id);
  if (!entry) throw new Error(`No ${id} in the catalogue`);
  return entry;
};

const SUZUKA_GP = entryOf('suzuka/gp');
const SUZUKA_EAST = entryOf('suzuka/east');
const SPA_GP = entryOf('spa/gp');

/**
 * A lookup over the keys given.
 * @param keys The installed keys
 * @returns Whether a key is installed
 */
const installedOf = (...keys: string[]): ((key: string) => boolean) => (key) => keys.includes(key);

describe('shared/utils/recommended-tracks', () => {
  describe('splitTrackKey', () => {
    it('splits a key into its folder and layout', () => {
      expect(splitTrackKey('rt_suzuka/suzukagp')).toEqual({ id: 'rt_suzuka', layout: 'suzukagp' });
    });

    it('reads a bare folder as a single-layout track', () => {
      expect(splitTrackKey('imola')).toEqual({ id: 'imola', layout: '' });
    });
  });

  describe('trackKeyOf', () => {
    it('writes a folder and layout as a key', () => {
      expect(trackKeyOf({ id: 'rt_suzuka', layout: 'suzukagp' })).toBe('rt_suzuka/suzukagp');
    });

    it('writes a single-layout track as its folder alone', () => {
      expect(trackKeyOf({ id: 'imola' })).toBe('imola');
      expect(trackKeyOf({ id: 'imola', layout: '' })).toBe('imola');
    });
  });

  describe('recommendedLayout', () => {
    it('finds a layout and the circuit it belongs to', () => {
      expect(recommendedLayout('suzuka/east')?.circuit.name).toBe('Suzuka');
      expect(recommendedLayout('suzuka/east')?.layout.name).toBe('East');
    });

    it('finds nothing for a layout the catalogue does not have', () => {
      expect(recommendedLayout('suzuka/west')).toBeNull();
    });
  });

  describe('layoutOfRound', () => {
    it('finds the layout a round names', () => {
      expect(layoutOfRound(round('r1', { recommended: 'spa/gp', id: 'spa' }))).toBe(SPA_GP);
    });

    it('finds nothing for a round at a plain folder or at an unknown layout', () => {
      expect(layoutOfRound(round('r1', { id: 'spa' }))).toBeNull();
      expect(layoutOfRound(round('r1', { recommended: 'spa/club', id: 'spa' }))).toBeNull();
    });
  });

  describe('layoutOfFolder', () => {
    it('names the layout a known folder is', () => {
      expect(layoutOfFolder('rt_suzuka/suzukagp')).toBe('suzuka/gp');
      expect(layoutOfFolder('spa/2022')).toBe('spa/gp');
    });

    // Kunos' version stands for a layout only while nothing better is
    // installed, so it is never taken for one.
    it('never takes Kunos\' own version for the layout', () => {
      expect(layoutOfFolder('spa')).toBeNull();
      expect(layoutOfFolder('ks_silverstone/gp')).toBeNull();
    });

    it('names nothing for a folder it does not know', () => {
      expect(layoutOfFolder('my_track')).toBeNull();
    });
  });

  describe('isRecommendedCircuit', () => {
    it('holds for a folder some layout is known by', () => {
      expect(isRecommendedCircuit('rt_suzuka')).toBe(true);
    });

    it('does not hold for a folder known only as Kunos\' version, or for any other', () => {
      expect(isRecommendedCircuit('ks_silverstone')).toBe(false);
      expect(isRecommendedCircuit('my_track')).toBe(false);
    });
  });

  describe('resolveLayout', () => {
    const { layout } = SPA_GP;

    it('races the player\'s choice while it is installed', () => {
      expect(resolveLayout(layout, installedOf('my_spa', 'spa/2022'), { track: 'my_spa' }))
        .toEqual({ source: 'choice', key: 'my_spa' });
    });

    // Guards a fixed bug: a choice made before the catalogue learnt the folder
    // stayed "Your choice" once the app picked that very folder itself.
    it('reads a choice of the app\'s own pick as the app\'s own', () => {
      expect(resolveLayout(layout, installedOf('spa/2022_lfm_rolling'), { track: 'spa/2022_lfm_rolling' }))
        .toEqual({ source: 'found', key: 'spa/2022_lfm_rolling' });
      expect(resolveLayout(layout, installedOf('spa'), { track: 'spa' }))
        .toEqual({ source: 'kunos', key: 'spa' });
    });

    it('races a choice of a lesser known folder over the app\'s own pick', () => {
      expect(resolveLayout(layout, installedOf('spa/2022', 'spa/2022_lfm_rolling'), { track: 'spa/2022' }))
        .toEqual({ source: 'choice', key: 'spa/2022' });
    });

    it('passes over a choice that is no longer installed', () => {
      expect(resolveLayout(layout, installedOf('spa/2022'), { track: 'my_spa' }))
        .toEqual({ source: 'found', key: 'spa/2022' });
    });

    it('races the best known folder installed', () => {
      expect(resolveLayout(layout, installedOf('spa/2022', 'spa/2022_lfm_rolling')))
        .toEqual({ source: 'found', key: 'spa/2022_lfm_rolling' });
    });

    it('falls back to Kunos\' version when no known folder is installed', () => {
      expect(resolveLayout(layout, installedOf('spa'))).toEqual({ source: 'kunos', key: 'spa' });
    });

    it('races nothing when nothing is installed', () => {
      expect(resolveLayout(layout, installedOf())).toEqual({ source: 'missing', key: null });
    });
  });

  describe('recommendedTrack', () => {
    it('writes a round at the layout\'s first known folder', () => {
      expect(recommendedTrack('suzuka/gp'))
        .toEqual({ recommended: 'suzuka/gp', id: 'rt_suzuka', layout: 'suzukagp_lfm_nodrs' });
    });

    it('writes a layout only Kunos ship at Kunos\' version', () => {
      expect(recommendedTrack('silverstone/gp')).toEqual({ recommended: 'silverstone/gp', id: 'ks_silverstone', layout: 'gp' });
    });

    it('leaves the layout off a single-layout folder', () => {
      expect(recommendedTrack('albert-park/gp')).toEqual({ recommended: 'albert-park/gp', id: 'melbourne_2019' });
    });

    it('throws for a layout the catalogue does not have, so a typo fails the library', () => {
      expect(() => recommendedTrack('suzuka/west')).toThrow('suzuka/west');
    });
  });

  describe('withRecommendedTracks', () => {
    it('points a round at the track its layout races', () => {
      const series = championship([round('r1', recommendedTrack('spa/gp'))]);

      expect(withRecommendedTracks(series, [track('spa/2022')], {}).rounds[0]?.track)
        .toEqual({ recommended: 'spa/gp', id: 'spa', layout: '2022' });
    });

    it('races the player\'s choice', () => {
      const series = championship([round('r1', recommendedTrack('spa/gp'))]);
      const placed = withRecommendedTracks(series, [track('spa/2022'), track('my_spa')], { 'spa/gp': { track: 'my_spa' } });

      expect(placed.rounds[0]?.track).toEqual({ recommended: 'spa/gp', id: 'my_spa' });
    });

    it('keeps the track a round was written with when its layout races nothing', () => {
      const series = championship([round('r1', recommendedTrack('suzuka/gp'))]);

      expect(withRecommendedTracks(series, [], {})).toBe(series);
    });

    it('leaves a round at a plain folder alone', () => {
      const plain = round('r2', { id: 'spa' });
      const series = championship([round('r1', recommendedTrack('spa/gp')), plain]);

      expect(withRecommendedTracks(series, [track('spa/2022'), track('my_spa')], {}).rounds[1]).toBe(plain);
    });

    it('hands the championship itself back when nothing moved', () => {
      const series = championship([round('r1', recommendedTrack('spa/gp'))]);
      const plain = championship([round('r1', { id: 'spa' })]);

      expect(withRecommendedTracks(series, [track('spa/2022_lfm_standing')], {})).toBe(series);
      expect(withRecommendedTracks(plain, [track('spa')], {})).toBe(plain);
    });
  });

  describe('guessTrack', () => {
    const suzuka = (key: string, fields: Partial<Track> = {}): Track => track(key, {
      name: 'Suzuka Circuit', country: 'Japan', lengthM: 5807, ...fields,
    });
    const none = new Set<string>();

    it('offers a track of the layout\'s length whose name shares a telling word', () => {
      const guess = suzuka('my_suzuka');

      expect(guessTrack(SUZUKA_GP, [guess], none, none, [])).toBe(guess);
    });

    it('allows a couple of percent either way on the length', () => {
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka', { lengthM: 5700 })], none, none, [])).not.toBeNull();
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka', { lengthM: 5600 })], none, none, [])).toBeNull();
    });

    it('never offers a track whose length is not known', () => {
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka', { lengthM: null })], none, none, [])).toBeNull();
    });

    it('never offers a track in another country', () => {
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka', { country: 'Belgium' })], none, none, [])).toBeNull();
    });

    it('never matches on a word that only says it is a circuit', () => {
      expect(guessTrack(SUZUKA_GP, [track('my_circuit', { name: 'Grand Prix Circuit', lengthM: 5807 })], none, none, []))
        .toBeNull();
    });

    it('offers a nameless layout of a folder already racing another layout of the circuit', () => {
      const east = track('x_ring/east', { name: 'Eastern loop', lengthM: 2243 });

      expect(guessTrack(SUZUKA_EAST, [east], none, new Set(['x_ring']), [])).toBe(east);
      expect(guessTrack(SUZUKA_EAST, [east], none, none, [])).toBeNull();
    });

    it('passes over a track racing another layout, one known to be a layout, or one turned down', () => {
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka')], new Set(['my_suzuka']), none, [])).toBeNull();
      expect(guessTrack(SUZUKA_GP, [suzuka('rt_suzuka/suzukagp')], none, none, [])).toBeNull();
      expect(guessTrack(SUZUKA_GP, [suzuka('my_suzuka')], none, none, ['my_suzuka'])).toBeNull();
    });

    it('offers the nearest in length', () => {
      const near = suzuka('my_suzuka/a', { lengthM: 5800 });
      const far = suzuka('my_suzuka/b', { lengthM: 5750 });

      expect(guessTrack(SUZUKA_GP, [far, near], none, none, [])).toBe(near);
    });

    it('between layouts of one length, offers the one whose name says it is this layout', () => {
      const short = suzuka('my_suzuka/short');
      const gp = suzuka('my_suzuka/gp');

      expect(guessTrack(SUZUKA_GP, [short, gp], none, none, [])).toBe(gp);
      expect(guessTrack(SUZUKA_GP, [gp, short], none, none, [])).toBe(gp);
    });
  });

  describe('recommendedStates', () => {
    const stateOf = (states: RecommendedTrackState[], id: string): RecommendedTrackState | undefined => (
      states.find((state) => state.id === id)
    );

    it('gives every layout a state, in the catalogue\'s order', () => {
      const ids = RECOMMENDED_CIRCUITS.flatMap((circuit) => circuit.layouts.map((layout) => layout.id));

      expect(recommendedStates([], {}).map((state) => state.id)).toEqual(ids);
    });

    it('says what a layout races and where it came from', () => {
      const states = recommendedStates([track('spa', { name: 'Spa' }), track('my_spa', { name: 'My Spa' })], {
        'suzuka/gp': { track: 'my_spa' },
      });

      expect(stateOf(states, 'spa/gp')).toMatchObject({ source: 'kunos', track: { key: 'spa', name: 'Spa' }, guess: null });
      expect(stateOf(states, 'suzuka/gp')).toMatchObject({ source: 'choice', track: { key: 'my_spa' } });
    });

    it('offers a guess for a layout that races nothing', () => {
      const states = recommendedStates([track('my_suzuka', { name: 'Suzuka', country: 'Japan', lengthM: 5807 })], {});

      expect(stateOf(states, 'suzuka/gp')).toMatchObject({ source: 'missing', track: null, guess: { key: 'my_suzuka' } });
    });

    it('never guesses a track another layout already races', () => {
      const states = recommendedStates([track('my_suzuka', { name: 'Suzuka', country: 'Japan', lengthM: 5807 })], {
        'spa/gp': { track: 'my_suzuka' },
      });

      expect(stateOf(states, 'suzuka/gp')?.guess).toBeNull();
    });
  });
});
