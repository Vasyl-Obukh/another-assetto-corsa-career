import { describe, expect, it } from '@jest/globals';

import { RECOMMENDED_CIRCUITS } from '../../../../../shared/constants';
import { ContentSource, Discipline } from '../../../../../shared/types';
import type {
  RecommendedCircuit, RecommendedTrackInfo, RecommendedTrackState, TrackSource,
} from '../../../../../shared/types';
import { searchTerms } from '../../../../../shared/utils/search';
import {
  countUnder, matchesSearch, sortCircuits, underDisciplines, underFilter, underStates,
} from '../utils.ts';
import type { CircuitUsage } from '@/lib/circuit-usage';

/**
 * A circuit of the given layouts.
 * @param id Its id, which its layouts' ids start with
 * @param name Its name
 * @param nation Its nation code
 * @param layouts Its layouts' own names
 * @returns The circuit
 */
const circuit = (id: string, name: string, nation: string, layouts: string[] = ['GP']): RecommendedCircuit => ({
  id,
  name,
  nation,
  layouts: layouts.map((layout) => ({
    id: `${id}/${layout.toLowerCase()}`, name: layout, length: 5000, folders: [],
  })),
});

const SUZUKA = circuit('suzuka', 'Suzuka', 'JPN', ['GP', 'East']);
const SPA = circuit('spa', 'Spa-Francorchamps', 'BEL');
const IMOLA = circuit('imola', 'Imola', 'ITA');

/**
 * An installed track as a layout's state describes it.
 * @param key Its track key
 * @param name What it calls itself
 * @returns The track
 */
const info = (key: string, name = key): RecommendedTrackInfo => ({
  key,
  id: key,
  layout: '',
  name,
  lengthM: null,
  pitboxes: null,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
});

/**
 * States by layout id.
 * @param entries Each layout's id and what it reads as
 * @returns The states
 */
const statesOf = (
  entries: [string, TrackSource | 'guess', RecommendedTrackInfo?][],
): Map<string, RecommendedTrackState> => new Map(entries.map(([id, kind, track]) => [id, {
  id,
  source: kind === 'guess' ? 'missing' : kind,
  track: kind === 'guess' ? null : track ?? null,
  guess: kind === 'guess' ? track ?? info('guessed') : null,
}]));

/**
 * How much of the library races a circuit.
 * @param championships How many championships
 * @param disciplines The disciplines they race
 * @returns The usage
 */
const used = (championships: number, disciplines: Discipline[] = []): CircuitUsage => ({
  championships,
  disciplines: new Map(disciplines.map((discipline) => [discipline, 1])),
});

describe('renderer/screens/recommended-tracks/utils', () => {
  describe('underFilter', () => {
    const states = statesOf([['suzuka/gp', 'choice', info('a')], ['suzuka/east', 'guess']]);

    it('takes a circuit with any layout reading as the filter says', () => {
      expect(underFilter(SUZUKA, states, 'guess')).toBe(true);
      expect(underFilter(SUZUKA, states, 'missing')).toBe(false);
    });

    it('counts the player\'s own pick as installed', () => {
      expect(underFilter(SUZUKA, states, 'found')).toBe(true);
    });

    it('takes every circuit under all, and none whose state is not in yet', () => {
      expect(underFilter(SPA, states, 'all')).toBe(true);
      expect(underFilter(SPA, states, 'found')).toBe(false);
    });
  });

  describe('countUnder', () => {
    it('counts the catalogue\'s circuits under a filter', () => {
      const [first, second] = RECOMMENDED_CIRCUITS;
      const states = statesOf([[first?.layouts[0]?.id ?? '', 'kunos', info('a')], [second?.layouts[0]?.id ?? '', 'kunos', info('b')]]);

      expect(countUnder(states, 'kunos')).toBe(2);
      expect(countUnder(states, 'all')).toBe(RECOMMENDED_CIRCUITS.length);
    });
  });

  describe('underStates', () => {
    const states = statesOf([['suzuka/gp', 'kunos', info('a')], ['suzuka/east', 'missing']]);

    it('takes a circuit under any of the states picked', () => {
      expect(underStates(SUZUKA, states, ['found', 'missing'])).toBe(true);
      expect(underStates(SUZUKA, states, ['found', 'guess'])).toBe(false);
    });

    it('takes every circuit while none is picked', () => {
      expect(underStates(SPA, states, [])).toBe(true);
    });
  });

  describe('underDisciplines', () => {
    it('takes a circuit raced at any of the disciplines picked', () => {
      expect(underDisciplines(used(1, [Discipline.TOURING]), [Discipline.ROAD, Discipline.TOURING])).toBe(true);
      expect(underDisciplines(used(1, [Discipline.TOURING]), [Discipline.ROAD])).toBe(false);
    });

    it('takes every circuit while none is picked, raced or not', () => {
      expect(underDisciplines(undefined, [])).toBe(true);
    });

    it('never takes a circuit nothing races once one is picked', () => {
      expect(underDisciplines(undefined, [Discipline.ROAD])).toBe(false);
    });
  });

  describe('matchesSearch', () => {
    const states = statesOf([['suzuka/gp', 'found', info('rt_suzuka/suzukagp', 'Suzuka Circuit')], ['suzuka/east', 'guess', info('x_east')]]);

    it('finds a circuit by its name or a layout\'s', () => {
      expect(matchesSearch(SUZUKA, states, searchTerms('suzu'))).toBe(true);
      expect(matchesSearch(SUZUKA, states, searchTerms('east'))).toBe(true);
    });

    it('finds a circuit by the folder or name of a track a layout races, or the guess', () => {
      expect(matchesSearch(SUZUKA, states, searchTerms('rt_suzuka'))).toBe(true);
      expect(matchesSearch(SUZUKA, states, searchTerms('x_east'))).toBe(true);
    });

    it('needs every term found', () => {
      expect(matchesSearch(SUZUKA, states, searchTerms('suzuka monza'))).toBe(false);
    });

    it('searches the catalogue alone while the states are being read', () => {
      expect(matchesSearch(SUZUKA, null, searchTerms('east'))).toBe(true);
      expect(matchesSearch(SUZUKA, null, searchTerms('rt_suzuka'))).toBe(false);
    });
  });

  describe('sortCircuits', () => {
    const usage = new Map([['suzuka', used(5)], ['spa', used(9)], ['imola', used(5)]]);
    const named = (nation: string): string => ({ JPN: 'Japan', BEL: 'Belgium', ITA: 'Italy' })[nation] ?? nation;
    const ids = (circuits: readonly RecommendedCircuit[]): string[] => circuits.map((one) => one.id);

    it('sorts by how many championships race a circuit, ties by name', () => {
      expect(ids(sortCircuits([SUZUKA, SPA, IMOLA], usage, 'championships', 'desc', named)))
        .toEqual(['spa', 'imola', 'suzuka']);
    });

    it('sorts by name or by country as the reader calls it', () => {
      expect(ids(sortCircuits([SUZUKA, SPA, IMOLA], usage, 'name', 'asc', named))).toEqual(['imola', 'spa', 'suzuka']);
      expect(ids(sortCircuits([SUZUKA, SPA, IMOLA], usage, 'country', 'asc', named))).toEqual(['spa', 'imola', 'suzuka']);
    });

    it('turns the order round, ties still by name', () => {
      expect(ids(sortCircuits([SUZUKA, SPA, IMOLA], usage, 'championships', 'asc', named)))
        .toEqual(['imola', 'suzuka', 'spa']);
    });

    it('counts a circuit nothing races as none', () => {
      expect(ids(sortCircuits([SUZUKA, SPA], new Map(), 'championships', 'desc', named))).toEqual(['spa', 'suzuka']);
    });

    it('leaves the circuits it was given alone', () => {
      const circuits = [SUZUKA, SPA];
      sortCircuits(circuits, usage, 'name', 'asc', named);

      expect(ids(circuits)).toEqual(['suzuka', 'spa']);
    });
  });
});
