import { describe, expect, it } from '@jest/globals';

import { makeCars, makeTrackEntry, makeTracks } from './fixtures.ts';
import { CarClass } from '../../../shared/types/index.ts';
import { resolveCatalogue } from '../../../shared/utils/car-classes/index.ts';
import {
  carFacets, queryCars, queryTracks, trackFacets,
} from '../content-query.ts';

const USER_CLASS = 'user-class';
const USER_SPEC = 'user-spec';

/**
 * A catalogue where the user took the Porsche off its grid and classified the
 * mod the shipped tables do not name.
 */
const USER_CATALOGUE = resolveCatalogue({
  version: 1,
  classes: [{ id: USER_CLASS, name: 'Hillclimb' }],
  specs: [{ id: USER_SPEC, name: 'Hillclimb (2020s)', class: USER_CLASS }],
  cars: { ks_porsche_911_gt3_r_2016: [], nameless_mod: [USER_SPEC] },
});

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

    it('searches the name, brand and folder id', () => {
      expect(ids(queryCars(makeCars(), { search: 'ferrari' }))).toEqual(['ferrari_488_gt3', 'ferrari_f40']);
      expect(ids(queryCars(makeCars(), { search: 'gt3' }))).toEqual(['ferrari_488_gt3', 'ks_porsche_911_gt3_r_2016']);
      expect(ids(queryCars(makeCars(), { search: 'nameless_mod' }))).toEqual(['nameless_mod']);
    });

    it('requires every search term', () => {
      expect(ids(queryCars(makeCars(), { search: 'porsche gt3' }))).toEqual(['ks_porsche_911_gt3_r_2016']);
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
      const page = queryCars(makeCars(), {
        brands: ['Ferrari', 'Porsche'], classes: [CarClass.GT3],
      });
      expect(ids(page)).toEqual(['ks_porsche_911_gt3_r_2016']);
    });

    it('filters by year and by power range', () => {
      expect(ids(queryCars(makeCars(), { yearFrom: 2000 })))
        .toEqual(['ferrari_488_gt3', 'ks_porsche_911_gt3_r_2016']);
      expect(ids(queryCars(makeCars(), { yearTo: 1990 }))).toEqual(['ferrari_f40']);
      expect(ids(queryCars(makeCars(), { bhpFrom: 500 })))
        .toEqual(['ferrari_488_gt3', 'ks_porsche_911_gt3_r_2016']);
    });

    it('keeps only cars that have a livery when asked', () => {
      expect(ids(queryCars(makeCars(), { hasSkins: true }))).not.toContain('nameless_mod');
      expect(ids(queryCars(makeCars(), { hasSkins: false }))).toContain('nameless_mod');
    });

    it('sorts by any of its keys, in either direction', () => {
      expect(ids(queryCars(makeCars(), { sort: 'bhp', direction: 'desc' })).slice(0, 3))
        .toEqual(['ferrari_488_gt3', 'ks_porsche_911_gt3_r_2016', 'ferrari_f40']);
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

    it('filters on classes and specs through the catalogue it is handed', () => {
      expect(ids(queryCars(makeCars(), { classes: [USER_CLASS] }, USER_CATALOGUE))).toEqual(['nameless_mod']);
      expect(ids(queryCars(makeCars(), { specs: [USER_SPEC] }, USER_CATALOGUE))).toEqual(['nameless_mod']);
      expect(ids(queryCars(makeCars(), { classes: [CarClass.GT3] }, USER_CATALOGUE))).toEqual([]);
    });
  });

  describe('queryTracks', () => {
    it('returns every track, by name, when asked for nothing', () => {
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

    it('keeps only tracks whose real-world position is known when asked', () => {
      expect(ids(queryTracks(makeTracks(), { hasGeotags: true }))).toEqual(['imola', 'spa']);
    });

    it('sorts by grid capacity, with unknown capacities last', () => {
      expect(ids(queryTracks(makeTracks(), { sort: 'pitboxes', direction: 'desc' })))
        .toEqual(['monza', 'spa', 'imola', 'mod_track']);
    });

    // Everything above uses single-layout fixtures, where a track and a layout
    // are the same thing. These are the cases where they are not.
    describe('over a track with several layouts', () => {
      const nordschleife = [
        makeTrackEntry({
          id: 'ks_nordschleife',
          layout: 'endurance',
          name: 'Nordschleife - Endurance',
          country: 'Germany',
          pitboxes: 24,
        }),
        makeTrackEntry({
          id: 'ks_nordschleife',
          layout: 'endurance_108_lfm',
          name: 'Nordschleife - Endurance 108 LFM',
          country: 'Germany',
          pitboxes: 108,
        }),
        makeTrackEntry({
          id: 'ks_nordschleife',
          layout: 'touristenfahrten',
          name: 'Nordschleife - Tourist',
          country: 'Germany',
          pitboxes: 32,
        }),
      ];

      const library = [...makeTracks(), ...nordschleife];

      it('counts a track once, however many layouts it ships', () => {
        const page = queryTracks(library);

        expect(page.total).toBe(5);
        expect(ids(page)).toEqual(['imola', 'mod_track', 'monza', 'ks_nordschleife', 'spa']);
      });

      it('keeps a track whose layouts only partly match, narrowed to those', () => {
        const page = queryTracks(library, { pitboxesFrom: 100 });
        const [group] = page.items;

        expect(ids(page)).toEqual(['ks_nordschleife']);
        expect(group.layouts.map((track) => track.layout)).toEqual(['endurance_108_lfm']);
      });

      it('sorts on the largest grid any of a track\'s layouts allows', () => {
        expect(ids(queryTracks(library, { sort: 'pitboxes', direction: 'desc' })))
          .toEqual(['ks_nordschleife', 'monza', 'spa', 'imola', 'mod_track']);
      });

      it('searches a layout name and answers with the track', () => {
        const page = queryTracks(library, { search: 'tourist' });

        expect(ids(page)).toEqual(['ks_nordschleife']);
        expect(page.items[0].name).toBe('Nordschleife');
      });
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
      // Only the Porsche is named by the class catalogue; the rest are cars it
      // does not list, and those are absent rather than bucketed as unknown.
      expect(facets.classes).toEqual([{ value: 'gt3', count: 1 }]);
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
    });

    it('narrows on a search as well as on a filter', () => {
      expect(carFacets(makeCars(), { search: 'porsche' }).brands)
        .toEqual([{ value: 'Porsche', count: 1 }]);
    });

    it('counts classes and specs through the catalogue it is handed', () => {
      const facets = carFacets(makeCars(), {}, USER_CATALOGUE);

      expect(facets.classes).toEqual([{ value: USER_CLASS, count: 1 }]);
      expect(facets.specs).toEqual([{ value: USER_SPEC, count: 1 }]);
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

    // The numbers have to match the cards: a Nordschleife with three layouts is
    // one German track, not three.
    it('counts a track once, however many layouts it ships', () => {
      const nordschleife = ['endurance', 'endurance_108_lfm', 'touristenfahrten'].map(
        (layout) => makeTrackEntry({
          id: 'ks_nordschleife', layout, name: `Nordschleife - ${layout}`, country: 'Germany',
        }),
      );

      expect(trackFacets([...makeTracks(), ...nordschleife]).countries).toEqual([
        { value: 'Italy', count: 2 },
        { value: 'Belgium', count: 1 },
        { value: 'Germany', count: 1 },
      ]);
    });

  });
});
