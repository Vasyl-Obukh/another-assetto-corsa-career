import { describe, expect, it } from '@jest/globals';

import { makeCars, makeTracks } from './fixtures.ts';
import {
  carFacets, queryCars, queryTracks, trackFacets,
} from '../content-query.ts';

/**
 * Reads the IDs off a page, which is what most of these assertions compare.
 * @param page A page of entries carrying IDs
 * @returns The IDs, in page order
 */
const ids = (page: { items: { id: string }[] }): string[] => page.items.map((item) => item.id);

describe('core/content-query', () => {
  describe('queryCars', () => {
    it('returns everything, by name, when asked for nothing', () => {
      const page = queryCars(makeCars());

      expect(page.total).toBe(5);
      expect(page.items.map((car) => car.name)).toEqual([
        'Citroën DS3', 'Ferrari 488 GT3', 'Ferrari F40', 'Nameless Mod', 'Porsche 911 GT3',
      ]);
    });

    it('searches the name, brand, folder id and tags', () => {
      expect(ids(queryCars(makeCars(), { search: 'ferrari' }))).toEqual(['ferrari_488_gt3', 'ferrari_f40']);
      expect(ids(queryCars(makeCars(), { search: 'gt3' }))).toEqual(['ferrari_488_gt3', 'porsche_911_gt3']);
      expect(ids(queryCars(makeCars(), { search: 'nameless_mod' }))).toEqual(['nameless_mod']);
    });

    it('requires every search term', () => {
      expect(ids(queryCars(makeCars(), { search: 'porsche gt3' }))).toEqual(['porsche_911_gt3']);
      expect(ids(queryCars(makeCars(), { search: 'porsche ferrari' }))).toEqual([]);
    });

    it('finds an accented name typed without the accent', () => {
      expect(ids(queryCars(makeCars(), { search: 'citroen' }))).toEqual(['citroen_ds3']);
    });

    it('ors within one filter', () => {
      const page = queryCars(makeCars(), { brands: ['Ferrari', 'Porsche'] });
      expect(page.total).toBe(3);
    });

    it('ands across separate filters', () => {
      const page = queryCars(makeCars(), { brands: ['Ferrari', 'Porsche'], classes: ['street'] });
      expect(ids(page)).toEqual(['ferrari_f40']);
    });

    // A tag list describes one car rather than partitioning the library, so
    // picking two tags means both of them.
    it('ands within the tag filter, unlike every other one', () => {
      expect(ids(queryCars(makeCars(), { tags: ['gt3', 'street'] }))).toEqual(['porsche_911_gt3']);
      expect(queryCars(makeCars(), { tags: ['gt3'] }).total).toBe(2);
    });

    it('filters by year and by power range', () => {
      expect(ids(queryCars(makeCars(), { yearFrom: 2000 })))
        .toEqual(['ferrari_488_gt3', 'porsche_911_gt3']);
      expect(ids(queryCars(makeCars(), { yearTo: 1990 }))).toEqual(['ferrari_f40']);
      expect(ids(queryCars(makeCars(), { bhpFrom: 500 })))
        .toEqual(['ferrari_488_gt3', 'porsche_911_gt3']);
    });

    it('keeps only cars that have a livery when asked', () => {
      expect(ids(queryCars(makeCars(), { hasSkins: true }))).not.toContain('nameless_mod');
      expect(ids(queryCars(makeCars(), { hasSkins: false }))).toContain('nameless_mod');
    });

    it('sorts by any of its keys, in either direction', () => {
      expect(ids(queryCars(makeCars(), { sort: 'bhp', direction: 'desc' })).slice(0, 3))
        .toEqual(['ferrari_488_gt3', 'porsche_911_gt3', 'ferrari_f40']);
      expect(ids(queryCars(makeCars(), { sort: 'powerToWeight', direction: 'desc' })).slice(0, 2))
        .toEqual(['ferrari_488_gt3', 'ferrari_f40']);
      expect(ids(queryCars(makeCars(), { sort: 'year' })).slice(0, 1)).toEqual(['ferrari_f40']);
    });

    it('sorts cars with no figure last whichever way it runs', () => {
      const withoutBhp = ['citroen_ds3', 'nameless_mod'];
      expect(ids(queryCars(makeCars(), { sort: 'bhp', direction: 'asc' })).slice(-2))
        .toEqual(withoutBhp);
      expect(ids(queryCars(makeCars(), { sort: 'bhp', direction: 'desc' })).slice(-2))
        .toEqual(withoutBhp);
    });

    it('reports the match count rather than the page size', () => {
      const page = queryCars(makeCars(), { limit: 2 });

      expect(page.items).toHaveLength(2);
      expect(page.total).toBe(5);
    });

    it('clamps the limit rather than serving whatever was asked for', () => {
      expect(queryCars(makeCars(), { limit: 1_000_000 }).limit).toBe(500);
    });
  });

  describe('queryTracks', () => {
    it('returns every layout, by name, when asked for nothing', () => {
      expect(ids(queryTracks(makeTracks()))).toEqual(['imola', 'mod_track', 'monza', 'spa']);
    });

    it('searches the name, folder id and country', () => {
      expect(ids(queryTracks(makeTracks(), { search: 'belgium' }))).toEqual(['spa']);
      expect(ids(queryTracks(makeTracks(), { search: 'mod_track' }))).toEqual(['mod_track']);
    });

    it('filters by country and by grid capacity', () => {
      expect(ids(queryTracks(makeTracks(), { countries: ['Italy'] }))).toEqual(['imola', 'monza']);
      expect(ids(queryTracks(makeTracks(), { pitboxesFrom: 24 }))).toEqual(['monza', 'spa']);
      expect(ids(queryTracks(makeTracks(), { pitboxesTo: 24 }))).toEqual(['imola', 'spa']);
    });

    it('keeps only layouts whose real-world position is known when asked', () => {
      expect(ids(queryTracks(makeTracks(), { hasGeotags: true }))).toEqual(['imola', 'spa']);
    });

    it('sorts by grid capacity, with unknown capacities last', () => {
      expect(ids(queryTracks(makeTracks(), { sort: 'pitboxes', direction: 'desc' })))
        .toEqual(['monza', 'spa', 'imola', 'mod_track']);
    });
  });

  describe('carFacets', () => {
    it('counts every dimension the browser filters on', () => {
      const facets = carFacets(makeCars());

      expect(facets.brands).toEqual([
        { value: 'Ferrari', count: 2 },
        { value: 'Citroën', count: 1 },
        { value: 'Porsche', count: 1 },
      ]);
      expect(facets.classes).toEqual([
        { value: 'race', count: 2 },
        { value: 'street', count: 1 },
      ]);
      expect(facets.countries).toHaveLength(3);
    });

    it('lists years most recent first, not commonest first', () => {
      expect(carFacets(makeCars()).years).toEqual([
        { value: '2018', count: 2 },
        { value: '1987', count: 1 },
      ]);
    });

    // Ticking one brand must leave the others pickable, or the filter list
    // collapses to the single choice already made and there is no way back.
    it('does not count a dimension against its own filter', () => {
      const all = carFacets(makeCars());
      const picked = carFacets(makeCars(), { brands: ['Ferrari'] });

      expect(picked.brands).toEqual(all.brands);
    });

    it('does narrow every other dimension to the current filter', () => {
      const picked = carFacets(makeCars(), { brands: ['Ferrari'] });

      expect(picked.countries).toEqual([{ value: 'Italy', count: 2 }]);
      expect(picked.tags.map((facet) => facet.value).sort()).toEqual(['gt3', 'race', 'street']);
    });

    it('narrows on a search as well as on a filter', () => {
      expect(carFacets(makeCars(), { search: 'porsche' }).brands)
        .toEqual([{ value: 'Porsche', count: 1 }]);
    });
  });

  describe('trackFacets', () => {
    it('counts countries', () => {
      expect(trackFacets(makeTracks()).countries).toEqual([
        { value: 'Italy', count: 2 },
        { value: 'Belgium', count: 1 },
      ]);
    });

    it('does not count countries against the country filter', () => {
      expect(trackFacets(makeTracks(), { countries: ['Italy'] }).countries)
        .toEqual(trackFacets(makeTracks()).countries);
    });

    it('narrows on a search', () => {
      expect(trackFacets(makeTracks(), { search: 'monza' }).countries)
        .toEqual([{ value: 'Italy', count: 1 }]);
    });
  });
});
