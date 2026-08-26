import { describe, expect, it } from '@jest/globals';

import { makeTrackEntry } from './fixtures.ts';
import { ContentSource, ModDistributor } from '../../../shared/types/index.ts';
import type { Track, TrackGroup } from '../../../shared/types/index.ts';
import {
  countValues,
  groupPitboxes,
  groupTracks,
  inBounds,
  isOneOf,
  paginate,
  sortBy,
} from '../utils.ts';

/**
 * Reads the name off a fixture, for sorting and for reading results back.
 * @param item Anything with a name
 * @returns The name
 */
const nameOf = (item: { name: string }): string => item.name;

/**
 * Reads the sort value off a fixture.
 * @param item Anything with a value
 * @returns The value, which may be missing
 */
const valueOf = (item: { value: number | null }): number | null => item.value;

describe('core/content-query/utils', () => {
  describe('inBounds', () => {
    it('accepts everything when neither bound is set', () => {
      expect(inBounds(null, undefined, undefined)).toBe(true);
      expect(inBounds(500, undefined, undefined)).toBe(true);
    });

    it('treats both bounds as inclusive', () => {
      expect(inBounds(500, 500, 600)).toBe(true);
      expect(inBounds(600, 500, 600)).toBe(true);
      expect(inBounds(499, 500, 600)).toBe(false);
      expect(inBounds(601, 500, 600)).toBe(false);
    });

    it('accepts one-sided bounds', () => {
      expect(inBounds(700, 500, undefined)).toBe(true);
      expect(inBounds(400, undefined, 500)).toBe(true);
    });

    // A car whose power nobody wrote down is not evidence that it is over 500bhp.
    it('excludes an entry with no value once a bound is set', () => {
      expect(inBounds(null, 500, undefined)).toBe(false);
      expect(inBounds(null, undefined, 500)).toBe(false);
    });
  });

  describe('isOneOf', () => {
    it('accepts everything when the filter is unset or empty', () => {
      expect(isOneOf('Ferrari', undefined)).toBe(true);
      expect(isOneOf(null, [])).toBe(true);
    });

    it('keeps only the accepted values', () => {
      expect(isOneOf('Ferrari', ['Ferrari', 'Porsche'])).toBe(true);
      expect(isOneOf('Lotus', ['Ferrari', 'Porsche'])).toBe(false);
    });

    it('excludes an entry with no value once the filter is set', () => {
      expect(isOneOf(null, ['Ferrari'])).toBe(false);
    });
  });

  describe('sortBy', () => {
    const items = (): { name: string; value: number | null }[] => [
      { name: 'B', value: 2 },
      { name: 'A', value: 3 },
      { name: 'C', value: null },
      { name: 'D', value: 1 },
    ];

    it('orders ascending by default', () => {
      expect(sortBy(items(), valueOf, nameOf, undefined).map(nameOf)).toEqual(['D', 'B', 'A', 'C']);
    });

    it('orders descending when asked', () => {
      expect(sortBy(items(), valueOf, nameOf, 'desc').map(nameOf)).toEqual(['A', 'B', 'D', 'C']);
    });

    // Reversing the sort should not promote everything nobody filled in.
    it('keeps entries with no value last whichever way it runs', () => {
      expect(sortBy(items(), valueOf, nameOf, 'asc').map(nameOf).at(-1)).toBe('C');
      expect(sortBy(items(), valueOf, nameOf, 'desc').map(nameOf).at(-1)).toBe('C');
    });

    it('breaks a tie by name, so the order is deterministic', () => {
      const tied = [{ name: 'Z', value: 1 }, { name: 'A', value: 1 }];
      expect(sortBy(tied, valueOf, nameOf, 'desc').map(nameOf)).toEqual(['A', 'Z']);
    });

    it('orders text naturally, so Formula 2 comes before Formula 10', () => {
      const texts = [{ name: 'Formula 10' }, { name: 'Formula 2' }];
      expect(sortBy(texts, nameOf, nameOf, 'asc').map(nameOf)).toEqual(['Formula 2', 'Formula 10']);
    });

    it('does not mutate what it was given', () => {
      const original = items();
      const same = items();
      sortBy(same, valueOf, nameOf, 'desc');
      expect(same).toEqual(original);
    });
  });

  describe('paginate', () => {
    const items = Array.from({ length: 10 }, (_, index) => index);

    it('reports the full match count beside the page', () => {
      expect(paginate(items, 0, 3)).toEqual({
        items: [0, 1, 2], total: 10, offset: 0, limit: 3,
      });
    });

    it('cuts a page from the middle', () => {
      expect(paginate(items, 8, 5).items).toEqual([8, 9]);
    });

    it('defaults to fifty when no limit was asked for', () => {
      expect(paginate(items, undefined, undefined).limit).toBe(50);
    });

    // The renderer is sandboxed but not trusted with reads either; a request for
    // a million rows should come back as five hundred.
    it('clamps an absurd limit', () => {
      expect(paginate(items, 0, 1_000_000).limit).toBe(500);
    });

    it('treats a negative offset as the beginning', () => {
      expect(paginate(items, -5, 2)).toMatchObject({ offset: 0, items: [0, 1] });
    });

    it('allows a limit of zero, which is a count with no rows', () => {
      expect(paginate(items, 0, 0)).toMatchObject({ items: [], total: 10 });
    });

    it('is empty past the end rather than wrapping', () => {
      expect(paginate(items, 99, 5).items).toEqual([]);
    });
  });

  describe('countValues', () => {
    const tagged = [
      { tags: ['gt3', 'race'] },
      { tags: ['gt3'] },
      { tags: ['street'] },
      { tags: [] },
    ];

    it('counts every value an entry contributes', () => {
      expect(countValues(tagged, (item) => item.tags)).toEqual([
        { value: 'gt3', count: 2 },
        { value: 'race', count: 1 },
        { value: 'street', count: 1 },
      ]);
    });

    // A synthetic "Unknown" bucket would be a display decision made in the wrong
    // layer; a browser can derive one from the total if it wants.
    it('leaves out entries with nothing to count', () => {
      const brands = [{ brand: null }, { brand: '' }, { brand: 'Ferrari' }];
      expect(countValues(brands, (item) => [item.brand])).toEqual([{ value: 'Ferrari', count: 1 }]);
    });

    it('takes a different tie-break when asked', () => {
      const years = [{ year: '1987' }, { year: '2018' }];
      const counted = countValues(years, (item) => [item.year], (a, b) => b.localeCompare(a));
      expect(counted.map((facet) => facet.value)).toEqual(['2018', '1987']);
    });
  });

  describe('groupTracks', () => {
    /**
     * Builds the layouts of one track.
     * @param id Track folder name
     * @param named Layout folder name to display name
     * @returns One entry per layout
     */
    const layoutsOf = (id: string, named: Record<string, string>): Track[] => (
      Object.entries(named).map(([layout, name]) => makeTrackEntry({ id, layout, name }))
    );

    const redBullRing = layoutsOf('ks_red_bull_ring', {
      layout_gp: 'Red Bull Ring - GP',
      layout_gp_lfm: 'Red Bull Ring - GP - LFM',
      layout_national: 'Red Bull Ring - National',
    });

    it('gathers a track\'s layouts into one entry', () => {
      const [group, ...rest] = groupTracks(redBullRing, redBullRing);

      expect(rest).toEqual([]);
      expect(group.id).toBe('ks_red_bull_ring');
      expect(group.layouts).toHaveLength(3);
    });

    // AC has no track-level name once a track has layouts, so the name is the
    // part they share - which is what Content Manager shows too.
    it('names the track from the prefix its layouts share', () => {
      expect(groupTracks(redBullRing, redBullRing)[0].name).toBe('Red Bull Ring');
    });

    it('cuts the shared prefix back to a word boundary', () => {
      const most = layoutsOf('rt_autodrom_most', {
        chicane: 'Autodrom Most 2024 (chicane)',
        no_chicane: 'Autodrom Most 2024 (no chicane)',
      });

      expect(groupTracks(most, most)[0].name).toBe('Autodrom Most 2024');
    });

    it('sorts the layouts by name', () => {
      const shuffled = [redBullRing[2], redBullRing[0], redBullRing[1]];

      expect(groupTracks(shuffled, shuffled)[0].layouts.map((track) => track.layout))
        .toEqual(['layout_gp', 'layout_gp_lfm', 'layout_national']);
    });

    it('keeps only the layouts that matched', () => {
      const [, lfm] = redBullRing;
      const group = groupTracks([lfm], redBullRing)[0];

      expect(group.layouts).toEqual([lfm]);
    });

    // The card must not rename itself when a filter narrows it, so identity
    // comes from every installed layout rather than from the matching ones.
    it('names the track from every installed layout, not just the matching ones', () => {
      const [, lfm] = redBullRing;

      expect(groupTracks([lfm], redBullRing)[0].name).toBe('Red Bull Ring');
      expect(groupTracks([lfm], [lfm])[0].name).toBe('Red Bull Ring - GP - LFM');
    });

    it('takes the country from the first layout that names one', () => {
      const layouts = [
        makeTrackEntry({ id: 'spa', layout: 'gp', name: 'Spa - GP' }),
        makeTrackEntry({
          id: 'spa', layout: 'endurance', name: 'Spa - Endurance', country: 'Belgium',
        }),
      ];

      expect(groupTracks(layouts, layouts)[0].country).toBe('Belgium');
    });

    // LFM adds layouts to circuits it did not ship, so one redistributed layout
    // makes the whole card say so.
    it('reports a redistributor that any one layout carries', () => {
      const plain = { source: ContentSource.DLC, pack: null, maker: null, distributor: null };
      const layouts = [
        makeTrackEntry({ id: 'x', layout: 'gp', name: 'X - GP', provenance: plain }),
        makeTrackEntry({
          id: 'x',
          layout: 'gp_lfm',
          name: 'X - GP LFM',
          provenance: { ...plain, distributor: ModDistributor.LFM },
        }),
      ];

      expect(groupTracks(layouts, layouts)[0].provenance).toMatchObject({
        source: ContentSource.DLC, distributor: ModDistributor.LFM,
      });
    });

    it('falls back to the root layout when the names share nothing', () => {
      const layouts = [
        makeTrackEntry({ id: 'acu_unitedstates', layout: '', name: 'United States GP' }),
        makeTrackEntry({ id: 'acu_unitedstates', layout: 'a', name: 'Circuit of The Americas' }),
      ];

      expect(groupTracks(layouts, layouts)[0].name).toBe('United States GP');
    });

    it('falls back to the shortest name when there is no root layout', () => {
      const layouts = layoutsOf('sx_lemans_lfm', {
        acf_chicane_24h: 'ACF Le Mans 24h',
        chicane: 'Le Mans',
      });

      expect(groupTracks(layouts, layouts)[0].name).toBe('Le Mans');
    });

    // A mod that leaves the name blank should not name the circuit after it.
    it('falls back to the folder name when no layout is named', () => {
      const layouts = layoutsOf('someones_circuit', { gp: '', club: '' });

      expect(groupTracks(layouts, layouts)[0].name).toBe('someones_circuit');
    });

    it('keeps a single-layout track as a group of one', () => {
      const spa = [makeTrackEntry({ id: 'spa', name: 'Spa-Francorchamps' })];
      const [group] = groupTracks(spa, spa);

      expect(group.name).toBe('Spa-Francorchamps');
      expect(group.layouts).toHaveLength(1);
    });

    it('keeps separate tracks apart, even when they share a name', () => {
      const bahrain = [
        makeTrackEntry({ id: 'fn_bahrain', layout: 'gp', name: 'Bahrain International Circuit' }),
        makeTrackEntry({ id: 'bahrain_international_circuit', name: 'Bahrain International Circuit' }),
      ];

      expect(groupTracks(bahrain, bahrain).map((group) => group.id))
        .toEqual(['fn_bahrain', 'bahrain_international_circuit']);
    });
  });

  describe('groupPitboxes', () => {
    /**
     * Builds a group whose layouts state the given grid sizes.
     * @param pitboxes One capacity per layout, null where unstated
     * @returns The group
     */
    const withPitboxes = (pitboxes: (number | null)[]): TrackGroup => {
      const layouts = pitboxes.map((count, index) => makeTrackEntry({
        id: 'x', layout: `l${index}`, name: `X ${index}`, pitboxes: count,
      }));

      return groupTracks(layouts, layouts)[0];
    };

    // Sorting by grid size asks what will fit here, and one layout being able to
    // hold it is the answer.
    it('takes the largest grid any layout allows', () => {
      expect(groupPitboxes(withPitboxes([24, 48, 24]))).toBe(48);
    });

    it('ignores the layouts that state nothing', () => {
      expect(groupPitboxes(withPitboxes([null, 30, null]))).toBe(30);
    });

    it('is null when no layout states a grid size', () => {
      expect(groupPitboxes(withPitboxes([null, null]))).toBeNull();
    });
  });

});
