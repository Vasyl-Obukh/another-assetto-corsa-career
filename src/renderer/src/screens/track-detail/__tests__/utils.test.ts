import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import {
  makeCircuit, makeListing, makeTrack, sportscar,
} from './fixtures.ts';
import { Discipline } from '../../../../../shared/types';
import { MIN_DESCRIPTION } from '../constants.ts';
import type { CircuitChampionship } from '../types.ts';
import {
  byDiscipline, circuitChampionships, circuitLogo, circuitPlace, firstOf, layoutShortName, longestFirst, longestLayout,
  racingOn, stagePhotos, worthReading,
} from '../utils.ts';

/**
 * A championship at a circuit, as circuitChampionships hands them on.
 * @param id Its id
 * @param discipline The discipline it is listed under
 * @param tier Its highest rung
 * @param layouts The layout of each of its rounds here
 * @returns The championship
 */
const championship = (
  id: string,
  discipline: Discipline,
  tier: number,
  layouts: readonly string[] = [''],
): CircuitChampionship => ({
  id,
  name: id,
  discipline,
  ladders: [{ discipline, tier }],
  rounds: layouts.map((layout) => ({ name: `${id} ${layout}`, layout })),
  field: 20,
});

describe('renderer/screens/track-detail/utils', () => {
  describe('layoutShortName', () => {
    it('takes the circuit name and its separator off the front', () => {
      expect(layoutShortName({ name: 'Brands Hatch - GP' }, 'Brands Hatch')).toBe('GP');
      expect(layoutShortName({ name: 'Spa: Endurance' }, 'Spa')).toBe('Endurance');
    });

    it('unwraps a name left wholly in brackets', () => {
      expect(layoutShortName({ name: 'Mont Tremblant (North Loop)' }, 'Mont Tremblant')).toBe('North Loop');
    });

    it('keeps brackets that do not close the name', () => {
      expect(layoutShortName({ name: 'Imola (2001) GP' }, 'Imola')).toBe('(2001) GP');
    });

    it('matches the circuit name whatever its case', () => {
      expect(layoutShortName({ name: 'MONZA - Junior' }, 'Monza')).toBe('Junior');
    });

    it('keeps the whole name when it does not start with the circuit', () => {
      expect(layoutShortName({ name: 'Nordschleife Tourist' }, 'Nürburgring')).toBe('Nordschleife Tourist');
    });

    // A single-layout circuit's layout is named just as the circuit is.
    it('keeps the whole name when nothing is left of it', () => {
      expect(layoutShortName({ name: 'Magione' }, 'Magione')).toBe('Magione');
      expect(layoutShortName({ name: 'Magione -' }, 'Magione')).toBe('Magione -');
    });
  });

  describe('longestLayout', () => {
    it('picks the longest layout', () => {
      const full = makeTrack({ id: 'nords', layout: 'endurance', lengthM: 25378 });
      const circuit = makeCircuit('Nordschleife', [makeTrack({ id: 'nords', layout: 'gp', lengthM: 5148 }), full]);

      expect(longestLayout(circuit)).toBe(full);
    });

    it('picks the first when no layout states a length', () => {
      const first = makeTrack({ id: 'x', layout: 'a' });

      expect(longestLayout(makeCircuit('X', [first, makeTrack({ id: 'x', layout: 'b' })]))).toBe(first);
    });
  });

  describe('longestFirst', () => {
    it('sorts the layouts longest first, those stating no length last', () => {
      const layouts = [
        makeTrack({ id: 'x', layout: 'short', lengthM: 1000 }),
        makeTrack({ id: 'x', layout: 'unknown' }),
        makeTrack({ id: 'x', layout: 'long', lengthM: 5000 }),
      ];

      expect(longestFirst(layouts).map((layout) => layout.layout)).toEqual(['long', 'short', 'unknown']);
    });

    it('does not reorder the list it was given', () => {
      const layouts = [makeTrack({ id: 'x', layout: 'a', lengthM: 1 }), makeTrack({ id: 'x', layout: 'b', lengthM: 2 })];
      longestFirst(layouts);

      expect(layouts.map((layout) => layout.layout)).toEqual(['a', 'b']);
    });
  });

  describe('circuitChampionships', () => {
    it('lists each championship with its rounds at the circuit and the layouts they run', () => {
      const listing = makeListing('gtwc', [sportscar(2)], [
        { name: 'Spa 24', track: 'spa', layout: 'gp' },
        { name: 'Monza', track: 'monza' },
        { name: 'Spa sprint', track: 'spa', layout: 'short' },
      ]);

      expect(circuitChampionships('spa', [listing])).toEqual([{
        id: 'gtwc',
        name: 'gtwc name',
        discipline: Discipline.SPORTSCAR,
        ladders: [sportscar(2)],
        rounds: [{ name: 'Spa 24', layout: 'gp' }, { name: 'Spa sprint', layout: 'short' }],
        field: 1,
      }]);
    });

    it('reads a round naming no layout as the single-layout circuit', () => {
      const [found] = circuitChampionships('monza', [makeListing('gt', [sportscar(1)], [{ name: 'M', track: 'monza' }])]);

      expect(found?.rounds).toEqual([{ name: 'M', layout: '' }]);
    });

    it('leaves out a championship with no round at the circuit', () => {
      expect(circuitChampionships('spa', [makeListing('gt', [sportscar(1)], [{ name: 'M', track: 'monza' }])]))
        .toEqual([]);
    });

    it('lists it under its first class\'s discipline, each rung once, top first', () => {
      const touring = { discipline: Discipline.TOURING, tier: 1 };
      const listing = makeListing('multi', [sportscar(3), touring, sportscar(3), sportscar(2)], [
        { name: 'R', track: 'spa' },
      ]);
      const [found] = circuitChampionships('spa', [listing]);

      expect(found?.discipline).toBe(Discipline.SPORTSCAR);
      expect(found?.ladders).toEqual([touring, sportscar(2), sportscar(3)]);
    });

    it('leaves out a championship with no class entries', () => {
      expect(circuitChampionships('spa', [makeListing('empty', [], [{ name: 'R', track: 'spa' }])])).toEqual([]);
    });
  });

  describe('byDiscipline', () => {
    it('groups the championships in ladder order, leaving out empty disciplines', () => {
      const groups = byDiscipline([
        championship('btcc', Discipline.TOURING, 1),
        championship('f1', Discipline.SINGLE_SEATER, 1),
      ]);

      expect(groups.map((group) => group.discipline)).toEqual([Discipline.SINGLE_SEATER, Discipline.TOURING]);
    });

    it('sorts each discipline by its highest rung', () => {
      const [group] = byDiscipline([
        championship('gt4', Discipline.SPORTSCAR, 3),
        championship('wec', Discipline.SPORTSCAR, 1),
        championship('gt3', Discipline.SPORTSCAR, 2),
      ]);

      expect(group?.championships.map((one) => one.id)).toEqual(['wec', 'gt3', 'gt4']);
    });

    it('is empty when there is nothing to group', () => {
      expect(byDiscipline([])).toEqual([]);
    });
  });

  describe('racingOn', () => {
    it('keeps the championships with a round on the layout', () => {
      const gp = championship('gp-only', Discipline.SPORTSCAR, 1, ['gp']);
      const both = championship('both', Discipline.SPORTSCAR, 1, ['short', 'gp']);
      const short = championship('short-only', Discipline.SPORTSCAR, 1, ['short']);

      expect(racingOn([gp, both, short], 'gp')).toEqual([gp, both]);
    });
  });

  describe('stagePhotos', () => {
    it('steps through every loading-screen photograph of the layouts in view', () => {
      const layout = makeTrack({ id: 'spa', layout: 'gp', photos: ['bgr01', 'bgr02'] });

      expect(stagePhotos([layout])).toEqual([
        { key: 'spa/gp/bgr01', sources: ['accontent://track/spa/bgr01/gp'], soft: false },
        { key: 'spa/gp/bgr02', sources: ['accontent://track/spa/bgr02/gp'], soft: false },
      ]);
    });

    // GP and GP OSRW are one shape redistributed, and showing both only repeats.
    it('shows a redistributed copy of a layout once', () => {
      const layouts = [
        makeTrack({ id: 'spa', layout: 'gp', lengthM: 7004, photos: ['bgr01'] }),
        makeTrack({ id: 'spa', layout: 'gp_osrw', lengthM: 7004, photos: ['bgr01'] }),
        makeTrack({ id: 'spa', layout: 'short', lengthM: 4000, photos: ['bgr01'] }),
      ];

      expect(stagePhotos(layouts).map((photo) => photo.key)).toEqual(['spa/gp/bgr01', 'spa/short/bgr01']);
    });

    it('falls back to each layout\'s preview, softened, where none ships a photograph', () => {
      const layouts = [makeTrack({ id: 'spa', layout: 'gp' }), makeTrack({ id: 'spa', layout: 'short' })];

      expect(stagePhotos(layouts)).toEqual([
        { key: 'spa/gp', sources: ['accontent://track/spa/preview/gp'], soft: true },
        { key: 'spa/short', sources: ['accontent://track/spa/preview/short'], soft: true },
      ]);
    });

    it('skips a layout whose folders could never be served', () => {
      const layouts = [
        makeTrack({ id: 'spa', layout: 'a:b', photos: ['bgr01'] }),
        makeTrack({ id: 'spa', layout: 'gp', photos: ['bgr01'] }),
      ];

      expect(stagePhotos(layouts).map((photo) => photo.key)).toEqual(['spa/gp/bgr01']);
      expect(stagePhotos([makeTrack({ id: 'a/b' })])).toEqual([]);
    });
  });

  describe('circuitLogo', () => {
    it('serves the logo of the first layout that ships one', () => {
      const circuit = makeCircuit('Spa', [
        makeTrack({ id: 'spa', layout: 'gp' }),
        makeTrack({ id: 'spa', layout: 'short', logo: true }),
      ]);

      expect(circuitLogo(circuit)).toBe('accontent://track/spa/logo/short');
    });

    it('passes over a layout whose folders could never be served', () => {
      const circuit = makeCircuit('Spa', [
        makeTrack({ id: 'spa', layout: '..', logo: true }),
        makeTrack({ id: 'spa', layout: 'gp', logo: true }),
      ]);

      expect(circuitLogo(circuit)).toBe('accontent://track/spa/logo/gp');
    });

    it('is null when no layout ships a logo', () => {
      expect(circuitLogo(makeCircuit('Spa', [makeTrack({ id: 'spa' })]))).toBeNull();
    });
  });

  describe('firstOf', () => {
    it('reads the first value any layout states', () => {
      const layouts = [makeTrack({ id: 'x' }), makeTrack({ id: 'x', city: 'Stavelot' }), makeTrack({ id: 'x', city: 'Liège' })];

      expect(firstOf(layouts, (layout) => layout.city)).toBe('Stavelot');
    });

    it('keeps a stated zero', () => {
      expect(firstOf([makeTrack({ id: 'x', year: 0 })], (layout) => layout.year)).toBe(0);
    });

    it('is null when no layout states it', () => {
      expect(firstOf([makeTrack({ id: 'x' })], (layout) => layout.author)).toBeNull();
    });
  });

  describe('circuitPlace', () => {
    const t = ((key: string, options?: { country: string; city: string }) => (
      `${key}:${options?.country}/${options?.city}`
    )) as unknown as TFunction;
    const formatNation = (code: string): string => `name of ${code}`;

    it('names the nation a free-text country reads as, beside the first city stated', () => {
      const circuit = makeCircuit('Spa', [makeTrack({ id: 'spa' }), makeTrack({ id: 'spa', city: 'Stavelot' })]);

      expect(circuitPlace({ ...circuit, country: 'Belgium' }, formatNation, t)).toEqual({
        nation: 'BEL',
        place: 'tracks.detail.place:name of BEL/Stavelot',
      });
    });

    it('keeps a country no nation code reads as, as written', () => {
      const circuit = makeCircuit('Nowhere', [makeTrack({ id: 'x' })]);

      expect(circuitPlace({ ...circuit, country: 'Atlantis' }, formatNation, t)).toEqual({ nation: null, place: 'Atlantis' });
    });

    it('falls back to the city alone, and to nothing at all', () => {
      const circuit = makeCircuit('X', [makeTrack({ id: 'x', city: 'Imola' })]);

      expect(circuitPlace(circuit, formatNation, t)).toEqual({ nation: null, place: 'Imola' });
      expect(circuitPlace(makeCircuit('Y', [makeTrack({ id: 'y' })]), formatNation, t)).toEqual({ nation: null, place: null });
    });
  });

  describe('worthReading', () => {
    it('shows a description that says something', () => {
      expect(worthReading('x'.repeat(MIN_DESCRIPTION), 'Spa')).toBe(true);
    });

    it('passes over a line too short to be worth a panel', () => {
      expect(worthReading('x'.repeat(MIN_DESCRIPTION - 1), 'Spa')).toBe(false);
    });

    // Kunos write "Circuit of Silverstone", which says nothing the page does not.
    it('does not count the circuit\'s own name towards the length', () => {
      const name = 'Circuit de Spa-Francorchamps';

      expect(worthReading(`${name} ${'x'.repeat(MIN_DESCRIPTION - 2)}`, name)).toBe(false);
      expect(worthReading(`${name} ${'x'.repeat(MIN_DESCRIPTION)}`, name)).toBe(true);
    });
  });
});
