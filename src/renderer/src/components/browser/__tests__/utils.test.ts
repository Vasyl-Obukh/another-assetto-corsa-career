import {
  describe, expect, it, jest,
} from '@jest/globals';
import type { TFunction } from 'i18next';

import { ContentSource, DLCPack, ModDistributor } from '../../../../../shared/types';
import type { RailItem } from '../types.ts';
import {
  letterGroups, provenanceLabel, provenanceNames, provenancePills, rangeName, toggledIn,
} from '../utils.ts';

// The badges' folder reaches the app's providers and, through them, the
// router, which no suite may load; the key lookups are all these helpers use.
jest.mock('@/components/provenance-badges', () => jest.requireActual('@/components/provenance-badges/utils.ts'));

/**
 * A translator that writes back the key it was asked for, and the name it was
 * handed for a template.
 */
const t = ((key: string, options?: { name?: string }) => (
  options?.name === undefined ? key : `${key}(${options.name})`
)) as unknown as TFunction;

/**
 * One value of a rail list.
 * @param label What it reads as
 * @returns The item
 */
const item = (label: string): RailItem => ({ value: label.toLowerCase(), label, count: 1 });

describe('renderer/components/browser/utils', () => {
  describe('provenanceLabel', () => {
    it('names a source, a pack and a maker by their own keys', () => {
      expect(provenanceLabel(t, 'sources', ContentSource.DLC)).toBe('content.source.dlc');
      expect(provenanceLabel(t, 'packs', DLCPack.RED_PACK)).toBe('content.pack.red-pack');
      expect(provenanceLabel(t, 'makers', 'rss')).toBe('content.maker.rss');
    });

    it('names a redistributor as what came through it', () => {
      expect(provenanceLabel(t, 'distributors', ModDistributor.LFM)).toBe('browse.via(content.distributor.lfm)');
    });

    it('shows a value the catalogue has no name for as it came', () => {
      expect(provenanceLabel(t, 'packs', 'future-pack')).toBe('future-pack');
      expect(provenanceLabel(t, 'distributors', 'someone')).toBe('browse.via(someone)');
    });
  });

  describe('provenanceNames', () => {
    it('names every pick, sources then packs, makers and redistributors', () => {
      expect(provenanceNames({
        distributors: [ModDistributor.LFM], packs: [DLCPack.RED_PACK], sources: [ContentSource.MOD],
      }, t)).toEqual([
        { list: 'sources', value: ContentSource.MOD, label: 'content.source.mod' },
        { list: 'packs', value: DLCPack.RED_PACK, label: 'content.pack.red-pack' },
        { list: 'distributors', value: ModDistributor.LFM, label: 'browse.via(content.distributor.lfm)' },
      ]);
    });

    it('names nothing when nothing is picked', () => {
      expect(provenanceNames({}, t)).toEqual([]);
    });
  });

  describe('provenancePills', () => {
    it('gives each pick a pill that lifts it alone', () => {
      const onChange = jest.fn();
      const picks = { sources: [ContentSource.BASE, ContentSource.MOD], packs: [DLCPack.RED_PACK] };
      const pills = provenancePills(picks, t, onChange);

      expect(pills.map((pill) => [pill.key, pill.name, pill.value])).toEqual([
        ['sources-base', 'browse.source', 'content.source.base'],
        ['sources-mod', 'browse.source', 'content.source.mod'],
        ['packs-red-pack', 'browse.source', 'content.pack.red-pack'],
      ]);

      pills[1].onRemove();
      expect(onChange).toHaveBeenCalledWith({ sources: [ContentSource.BASE], packs: [DLCPack.RED_PACK] });
    });
  });

  describe('rangeName', () => {
    const spread = { min: 1960, max: 2024, counts: [] };
    const format = (figure: number): string => `${figure}`;

    it('writes nothing when neither end is picked', () => {
      expect(rangeName({}, spread, format)).toBeNull();
    });

    it('writes both ends of a closed range', () => {
      expect(rangeName({ from: 1990, to: 2000 }, spread, format)).toBe('1990-2000');
    });

    it('closes an open end at the library\'s own edge', () => {
      expect(rangeName({ from: 1990 }, spread, format)).toBe('1990-2024');
      expect(rangeName({ to: 2000 }, spread, format)).toBe('1960-2000');
    });

    it('leaves an open end blank when nothing states the spread', () => {
      expect(rangeName({ from: 1990 }, null, format)).toBe('1990-');
    });
  });

  describe('letterGroups', () => {
    it('groups values under the letter each starts with, whatever its case', () => {
      const groups = letterGroups([item('Audi'), item('alfa'), item('BMW')]);

      expect([...groups].map(([letter, members]) => [letter, members.map((one) => one.label)])).toEqual([
        ['A', ['Audi', 'alfa']],
        ['B', ['BMW']],
      ]);
    });

    it('gathers anything not starting with a Latin letter under one heading', () => {
      const groups = letterGroups([item('2 Fast'), item('Ëlan'), item('Zenvo')]);

      expect([...groups.keys()]).toEqual(['#', 'Z']);
      expect(groups.get('#')?.map((one) => one.label)).toEqual(['2 Fast', 'Ëlan']);
    });

    it('has no groups for no values', () => {
      expect(letterGroups([]).size).toBe(0);
    });
  });

  describe('toggledIn', () => {
    it('adds a value the list lacks at the end', () => {
      expect(toggledIn(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
    });

    it('takes out a value the list holds, keeping the rest in order', () => {
      expect(toggledIn(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
    });

    it('leaves the list it was handed alone', () => {
      const list = ['a'];
      toggledIn(list, 'b');

      expect(list).toEqual(['a']);
    });
  });
});
