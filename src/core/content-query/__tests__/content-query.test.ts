import { describe, expect, it } from '@jest/globals';

import { makeCars, makeTrackEntry, makeTracks } from './fixtures.ts';
import { CarClass, ContentSource, DLCPack } from '../../../shared/types/index.ts';
import type { CarPricing, Track } from '../../../shared/types/index.ts';
import { resolveCatalogue } from '../../../shared/utils/car-classes/index.ts';
import { CAR_PRICES, PRICE_FLOOR } from '../../../shared/utils/car-prices/index.ts';
import {
  carFacets, circuitOf, queryCars, queryTracks, trackFacets,
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

/**
 * The user added the mod and the Citroën and priced the mod themselves, which
 * leaves the Citroën on its suggestion and the Ferrari GT3 off the library.
 */
const PRICING: CarPricing = { prices: { nameless_mod: 250_000 }, added: ['nameless_mod', 'citroen_ds3'] };

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

    // The browser shows class and spec as one tree, so a class ticked beside a
    // spec of another means either rather than a car that is both.
    it('ors a class with a spec of another class', () => {
      const page = queryCars(makeCars(), { classes: [CarClass.GT3], specs: [USER_SPEC] }, USER_CATALOGUE);

      expect(ids(page)).toEqual(['nameless_mod']);
      expect(ids(queryCars(makeCars(), { classes: [CarClass.GT3], specs: [USER_SPEC] })))
        .toEqual(['ks_porsche_911_gt3_r_2016']);
    });

    it('ors the provenance lists, so a source beside a pack means either', () => {
      const page = queryCars(makeCars(), { sources: [ContentSource.BASE], packs: [DLCPack.PORSCHE_PACK_3] });

      expect(ids(page)).toEqual(['ferrari_f40', 'ks_porsche_911_gt3_r_2016']);
    });

    it('filters by the nation a free-text country names', () => {
      expect(ids(queryCars(makeCars(), { countries: ['DEU', 'FRA'] })))
        .toEqual(['citroen_ds3', 'ks_porsche_911_gt3_r_2016']);
    });

    it('keeps only the cars it is asked for by id', () => {
      expect(ids(queryCars(makeCars(), { ids: ['ferrari_f40', 'not_installed'] }))).toEqual(['ferrari_f40']);
    });

    it("sorts by price - listed, the user's own or suggested - cheapest first", () => {
      expect(ids(queryCars(makeCars(), { sort: 'price' }, undefined, PRICING))).toEqual([
        'citroen_ds3', 'ks_porsche_911_gt3_r_2016', 'nameless_mod', 'ferrari_488_gt3', 'ferrari_f40',
      ]);
    });

    it('filters by a price range, its bounds included', () => {
      expect(ids(queryCars(makeCars(), { priceFrom: 200_000, priceTo: 250_000 }, undefined, PRICING)))
        .toEqual(['nameless_mod', 'ks_porsche_911_gt3_r_2016']);
    });

    it('keeps the cars a career can pay for', () => {
      expect(ids(queryCars(makeCars(), { payable: { money: 250_000, share: 0, models: [] } }, undefined, PRICING)))
        .toEqual(['citroen_ds3', 'nameless_mod', 'ks_porsche_911_gt3_r_2016']);
    });

    it("counts a sponsor's backing on the cars it covers, and only those", () => {
      const payable = { money: 250_000, share: 50, models: ['ferrari_488_gt3'] };

      expect(ids(queryCars(makeCars(), { payable }, undefined, PRICING))).toContain('ferrari_488_gt3');
      expect(ids(queryCars(makeCars(), { payable }, undefined, PRICING))).not.toContain('ferrari_f40');
    });

    it('still narrows to the price range on the list price, a backed car included', () => {
      const payable = { money: 250_000, share: 50, models: ['ferrari_488_gt3'] };

      expect(ids(queryCars(makeCars(), { payable, priceTo: 100_000 }, undefined, PRICING))).not.toContain('ferrari_488_gt3');
    });

    it('filters by where a price comes from, a suggestion counting only for a car the user added', () => {
      expect(ids(queryCars(makeCars(), { priceOrigins: ['suggested'] }, undefined, PRICING))).toEqual(['citroen_ds3']);
      expect(ids(queryCars(makeCars(), { priceOrigins: ['yours'] }, undefined, PRICING))).toEqual(['nameless_mod']);
      expect(ids(queryCars(makeCars(), { priceOrigins: ['catalogue'] }, undefined, PRICING)))
        .toEqual(['ferrari_f40', 'ks_porsche_911_gt3_r_2016']);
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
      expect(ids(queryTracks(makeTracks(), { countries: ['ITA'] }))).toEqual(['imola', 'monza']);
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

    it('filters and sorts by lap length, with unknown lengths last', () => {
      const tracks = makeTracks().map((track): Track => ({
        ...track, lengthM: ({ spa: 7004, monza: 5793, imola: 4909 } as Record<string, number>)[track.id] ?? null,
      }));

      expect(ids(queryTracks(tracks, { lengthFrom: 5000 }))).toEqual(['monza', 'spa']);
      expect(ids(queryTracks(tracks, { lengthTo: 6000 }))).toEqual(['imola', 'monza']);
      expect(ids(queryTracks(tracks, { sort: 'length' }))).toEqual(['imola', 'monza', 'spa', 'mod_track']);
    });

    it('keeps only the circuits it is asked for by id', () => {
      expect(ids(queryTracks(makeTracks(), { ids: ['spa', 'imola'] }))).toEqual(['imola', 'spa']);
    });

    it('ors the provenance lists, as the car browser does', () => {
      expect(ids(queryTracks(makeTracks(), { sources: [ContentSource.MOD], packs: [DLCPack.PORSCHE_PACK_3] })))
        .toEqual(['mod_track']);
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

    it('spreads years across the range installed', () => {
      const { years } = carFacets(makeCars());

      expect(years).toMatchObject({ min: 1987, max: 2018 });
      expect(years?.counts[0]).toBe(1);
      expect(years?.counts.at(-1)).toBe(2);
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

      expect(picked.countries).toEqual([{ value: 'ITA', count: 2 }]);
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

    // One tree in the browser, so picking a class must leave every spec
    // pickable, and the other way round.
    it('counts classes and specs against neither of their own filters', () => {
      const all = carFacets(makeCars(), {}, USER_CATALOGUE);
      const picked = carFacets(makeCars(), { specs: [USER_SPEC] }, USER_CATALOGUE);

      expect(picked.classes).toEqual(all.classes);
      expect(picked.specs).toEqual(all.specs);
    });

    it('counts the provenance lists against none of the four', () => {
      const all = carFacets(makeCars());
      const picked = carFacets(makeCars(), { packs: [DLCPack.PORSCHE_PACK_3] });

      expect(picked.sources).toEqual(all.sources);
      expect(picked.makers).toEqual(all.makers);
    });

    it('counts where each price comes from, against every filter but its own', () => {
      const counts = (pricing: CarPricing, query = {}): string[] => carFacets(makeCars(), query, undefined, pricing)
        .priceOrigins.map((one) => `${one.value}:${one.count}`).sort();

      expect(counts(PRICING)).toEqual(['catalogue:2', 'suggested:1', 'yours:1']);
      expect(counts(PRICING, { priceOrigins: ['yours'] })).toEqual(counts(PRICING));
      expect(counts(PRICING, { brands: ['Ferrari'] })).toEqual(['catalogue:1']);
    });

    it('spreads prices over their logarithm, from the cheapest car to the dearest', () => {
      const { prices } = carFacets(makeCars(), {}, undefined, PRICING);

      expect(prices?.min).toBeCloseTo(Math.log10(PRICE_FLOOR));
      expect(prices?.max).toBeCloseTo(Math.log10(CAR_PRICES.ferrari_f40));
      expect(prices?.counts.reduce((sum, count) => sum + count, 0)).toBe(5);
    });

    it('spreads power over every car installed, counting what the other filters leave', () => {
      const { power } = carFacets(makeCars(), { brands: ['Ferrari'], bhpFrom: 590 });

      expect(power).toMatchObject({ min: 471, max: 600 });
      expect(power?.counts.reduce((sum, count) => sum + count, 0)).toBe(2);
    });
  });

  describe('trackFacets', () => {
    it('counts countries', () => {
      expect(trackFacets(makeTracks()).countries).toEqual([
        { value: 'ITA', count: 2 },
        { value: 'BEL', count: 1 },
      ]);
    });

    it('does not count countries against the country filter', () => {
      expect(trackFacets(makeTracks(), { countries: ['ITA'] }).countries)
        .toEqual(trackFacets(makeTracks()).countries);
    });

    it('narrows on a search', () => {
      expect(trackFacets(makeTracks(), { search: 'monza' }).countries)
        .toEqual([{ value: 'ITA', count: 1 }]);
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
        { value: 'ITA', count: 2 },
        { value: 'BEL', count: 1 },
        { value: 'DEU', count: 1 },
      ]);
    });

    it('spreads pit boxes over layouts, counting what the other filters leave', () => {
      const { pitboxes } = trackFacets(makeTracks(), { countries: ['ITA'], pitboxesFrom: 30 });

      expect(pitboxes).toMatchObject({ min: 12, max: 30 });
      expect(pitboxes?.counts.reduce((sum, count) => sum + count, 0)).toBe(2);
    });

    it('has no length spread when no layout states one', () => {
      expect(trackFacets(makeTracks()).length).toBeNull();
    });
  });

  describe('circuitOf', () => {
    it('gathers every layout installed under a circuit', () => {
      const layouts = ['gp', 'club'].map((layout) => makeTrackEntry({
        id: 'multi', layout, name: `Multi ${layout}`, country: 'Italy',
      }));
      const circuit = circuitOf([...makeTracks(), ...layouts], 'multi');

      expect(circuit?.id).toBe('multi');
      expect(circuit?.layouts.map((track) => track.layout).sort()).toEqual(['club', 'gp']);
    });

    it('is null for a circuit that is not installed', () => {
      expect(circuitOf(makeTracks(), 'nowhere')).toBeNull();
    });
  });
});
