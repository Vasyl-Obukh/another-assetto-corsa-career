import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { appErrorInfo } from '../../../../../shared/errors';
import {
  ContentSource, Discipline, DLCPack, ModMaker,
} from '../../../../../shared/types';
import type {
  Career,
  CareerSeason,
  Championship,
  ClassEntry,
  Mail,
  PrizeMoney,
  Round,
  SeasonEntry,
  Seat,
  SeriesAvailability,
  SeriesListing,
  Team,
} from '../../../../../shared/types';
import { DEFAULT_STANDINGS, TIER_METAL_KEYS } from '../constants.ts';
import {
  availabilityState,
  carsFor,
  contentFacets,
  contentPicks,
  contentValues,
  editionOffers,
  enterHintOf,
  isListed,
  ladderDepth,
  layoutLabel,
  missingContent,
  missingTrackLabel,
  opensWith,
  pursesOf,
  raceLabels,
  readStandingsLayout,
  rungsAt,
  shownRun,
  teamGroups,
  tierAccent,
  tierMetalKey,
  trackLabelOf,
  withPicked,
} from '../utils.ts';
import { TIER_ACCENT } from '@/lib/accents';

/**
 * A translator that echoes the key it was handed and whatever it interpolates.
 * @param key The catalogue key
 * @param options What it interpolates
 * @returns The key, with the options beside it where there are any
 */
const t = ((key: string, options?: object) => (
  options ? `${key} ${JSON.stringify(options)}` : key
)) as unknown as TFunction;

/**
 * An availability with nothing wrong with it, for a test to spoil one field of.
 * @param overrides What to change about it
 * @returns The availability
 */
const availability = (overrides: Partial<SeriesAvailability> = {}): SeriesAvailability => ({
  series: 'sunday-cup',
  available: true,
  problems: [],
  entries: [{
    entry: 'main', eligible: ['ks_mazda_mx5_cup'], missing: [], enough: true,
  }],
  rounds: [{
    round: 'magione', track: null, pitboxes: null, racedOn: null, entries: [], races: [],
  }],
  requires: {
    sources: [],
    packs: [],
    makers: [],
    distributors: [],
    pools: [],
    rounds: { packs: [] },
    widenedBy: { packs: [], makers: [], distributors: [] },
  },
  ...overrides,
});

/**
 * A listing wrapping one availability, which is all these helpers read.
 * @param overrides What to change about the availability
 * @returns The listing
 */
const listing = (overrides: Partial<SeriesAvailability> = {}): SeriesListing => ({
  series: { id: 'sunday-cup' } as SeriesListing['series'],
  availability: availability(overrides),
  origin: 'user',
  activeByDefault: true,
  filler: false,
  event: null,
});

describe('renderer/screens/championships/utils', () => {
  describe('availabilityState', () => {
    it('reads a championship with nothing wrong as available', () => {
      expect(availabilityState(availability())).toBe('available');
    });

    it('reads missing content as unavailable', () => {
      expect(availabilityState(availability({ available: false }))).toBe('unavailable');
    });

    // Two states were not enough: problems force `available` to false, so a
    // broken file used to read as "Unavailable" - the same word as "you do not
    // own this mod", which points at a fix that does not exist.
    it('reads a file that does not validate as misconfigured rather than unavailable', () => {
      const problems = [appErrorInfo('series.entry.noCars', { entry: 'main' })];

      expect(availabilityState(availability({ available: false, problems })))
        .toBe('misconfigured');
    });

    // The content answer behind an invalid document is derived from a
    // championship already called incoherent, so it is not the one to lead with.
    it('lets problems win over missing content', () => {
      const problems = [appErrorInfo('series.entry.noCars', { entry: 'main' })];
      const entries = [{
        entry: 'main', eligible: [], missing: [], enough: false,
      }];

      expect(availabilityState(availability({ available: false, problems, entries })))
        .toBe('misconfigured');
    });
  });

  describe('isListed', () => {
    const everything = {
      seriesActive: {},
      showFillerSeries: true,
      offeredContentSources: { packs: [DLCPack.RED_PACK], makers: [], distributors: [] },
    };

    it('lists a championship that is switched on, offered and available', () => {
      expect(isListed(listing(), everything)).toBe(true);
    });

    it('leaves out one the user switched off', () => {
      expect(isListed(listing(), { ...everything, seriesActive: { 'sunday-cup': false } })).toBe(false);
    });

    it('lists one that starts switched off only once the user switches it on', () => {
      const off: SeriesListing = { ...listing(), activeByDefault: false };

      expect(isListed(off, everything)).toBe(false);
      expect(isListed(off, { ...everything, seriesActive: { 'sunday-cup': true } })).toBe(true);
    });

    it('leaves out a filler championship while fillers are switched off', () => {
      const filler: SeriesListing = { ...listing(), filler: true };

      expect(isListed(filler, everything)).toBe(true);
      expect(isListed(filler, { ...everything, showFillerSeries: false })).toBe(false);
    });

    it('leaves out a shipped championship the content sources hide', () => {
      const shipped: SeriesListing = {
        ...listing({
          requires: {
            sources: [],
            packs: [DLCPack.RED_PACK],
            makers: [],
            distributors: [],
            pools: [],
            rounds: { packs: [] },
            widenedBy: { packs: [], makers: [], distributors: [] },
          },
        }),
        origin: 'shipped',
      };

      expect(isListed(shipped, { ...everything, offeredContentSources: {
        packs: [], makers: [], distributors: [],
      } }))
        .toBe(false);
    });

    it('leaves out one that cannot be raced, whether content is missing or the file is broken', () => {
      expect(isListed(listing({ available: false }), everything)).toBe(false);
      expect(isListed(listing({ problems: [appErrorInfo('series.entry.noCars', { entry: 'main' })] }), everything)).toBe(false);
    });
  });

  describe('pursesOf', () => {
    /**
     * A class entry carrying only what a purse reads: a full grid, so it pays
     * its tables in full.
     * @param name Its name
     * @param prizes What it pays of its own, if anything
     * @returns The entry
     */
    const entry = (name: string, prizes?: ClassEntry['prizes']): ClassEntry => ({
      name, prizes, seats: Array.from({ length: 12 }), ladder: { tier: 3 },
    }) as unknown as ClassEntry;
    const championship = { positions: [100, 50], standings: [1000] };
    /**
     * A championship paying a purse, with its classes.
     * @param prizes What it pays
     * @param entries Its classes
     * @returns The championship, as a purse reads it
     */
    const series = (
      prizes: PrizeMoney | undefined,
      entries: ClassEntry[],
    ): Pick<Championship, 'prizes' | 'entries'> => ({ prizes, entries });

    it('pays every class the championship\'s purse where none pays its own', () => {
      expect(pursesOf(series(championship, [entry('LMP2'), entry('GTE')])))
        .toEqual([{ prizes: championship, classes: ['LMP2', 'GTE'] }]);
    });

    it('lists a class paying its own apart, and classes paying alike together', () => {
      const own = { positions: [300], standings: [3000] };

      expect(pursesOf(series(championship, [entry('Hypercar', own), entry('LMP2'), entry('GTE')])))
        .toEqual([
          { prizes: own, classes: ['Hypercar'] },
          { prizes: championship, classes: ['LMP2', 'GTE'] },
        ]);
    });

    // Found in review: a class stating one table paid nothing on the other,
    // while the editor told the user it paid what the championship does.
    it('pays a table a class leaves out as the championship does', () => {
      expect(pursesOf(series(championship, [entry('Am', { positions: [70] })]))).toEqual([{
        prizes: { positions: [70], standings: [1000] }, classes: ['Am'],
      }]);
    });

    it('is one purse of nothing for a championship paying nothing', () => {
      expect(pursesOf(series(undefined, [entry('Main')]))).toEqual([{ prizes: undefined, classes: ['Main'] }]);
      expect(pursesOf(series(undefined, [entry('Main')]), 2)).toEqual([{ prizes: undefined, classes: ['Main'] }]);
    });

    it('pays every table at the progression speed it is handed, grouped as the purses are written', () => {
      expect(pursesOf(series(championship, [entry('Am', { positions: [70] }), entry('Pro')]), 1.5)).toEqual([
        { prizes: { positions: [105], standings: [1500] }, classes: ['Am'] },
        { prizes: { positions: [150, 75], standings: [1500] }, classes: ['Pro'] },
      ]);
    });

    it('pays a class of a smaller field its share, apart from those its table pays in full', () => {
      const small = { ...entry('Am'), seats: Array.from({ length: 6 }) } as ClassEntry;

      expect(pursesOf(series(championship, [entry('Pro'), small]))).toEqual([
        { prizes: championship, classes: ['Pro'] },
        { prizes: { positions: [50, 25], standings: [500] }, classes: ['Am'] },
      ]);
    });

    it('scales a historic purse to the rung it is raced from', () => {
      expect(pursesOf(series(championship, [entry('GT')]), 1, 5)).toEqual([
        { prizes: { positions: [14, 7], standings: [140] }, classes: ['GT'] },
      ]);
    });
  });

  describe('raceLabels', () => {
    it('names an unnamed race by its type', () => {
      expect(raceLabels(['Sprint', null], 'Race')).toEqual(['Sprint', 'Race']);
    });

    // Found in use: an unnamed race was labelled by its id, "race-2".
    it('numbers races that would otherwise read alike, and only those', () => {
      expect(raceLabels([null, 'Feature', null], 'Race')).toEqual(['Race 1', 'Feature', 'Race 2']);
      expect(raceLabels(['Heat', 'Heat'], 'Race')).toEqual(['Heat 1', 'Heat 2']);
    });
  });

  describe('tierAccent', () => {
    it('gives each of the top rungs its own metal, platinum first', () => {
      expect([1, 2, 3, 4, 5].map(tierAccent)).toEqual(TIER_ACCENT);
    });

    it('keeps the last metal for every rung below it, since a ladder has no floor', () => {
      expect(tierAccent(9)).toBe(TIER_ACCENT[TIER_ACCENT.length - 1]);
    });

    it('reads a tier above the top as the top rather than reaching past the ramp', () => {
      expect(tierAccent(0)).toBe(TIER_ACCENT[0]);
      expect(tierAccent(-2)).toBe(TIER_ACCENT[0]);
    });
  });

  describe('tierMetalKey', () => {
    it('names each of the top rungs by its own metal, platinum first', () => {
      expect([1, 2, 3, 4, 5].map(tierMetalKey)).toEqual(TIER_METAL_KEYS);
    });

    it('clamps as tierAccent does, so a rung is named for the metal it wears', () => {
      expect(tierMetalKey(9)).toBe(TIER_METAL_KEYS[TIER_METAL_KEYS.length - 1]);
      expect(tierMetalKey(0)).toBe(TIER_METAL_KEYS[0]);
    });
  });

  /**
   * A listing whose classes enter at the rungs given, all else left out.
   * @param id The championship's id
   * @param rungs Each class's id, discipline and tier
   * @returns The listing
   */
  const laddered = (
    id: string,
    rungs: readonly { entry: string; discipline: Discipline; tier: number }[],
  ): SeriesListing => ({
    ...listing(),
    series: {
      id,
      entries: rungs.map(({ entry, discipline, tier }) => ({ id: entry, ladder: { discipline, tier } })),
    } as unknown as Championship,
  });

  describe('ladderDepth', () => {
    it('runs to the lowest rung any class enters at', () => {
      expect(ladderDepth([
        laddered('gt3', [{ entry: 'pro', discipline: Discipline.SPORTSCAR, tier: 2 }]),
        laddered('cup', [
          { entry: 'main', discipline: Discipline.TOURING, tier: 3 },
          { entry: 'am', discipline: Discipline.TOURING, tier: 5 },
        ]),
      ])).toBe(5);
    });

    it('is a single rung for an empty ladder', () => {
      expect(ladderDepth([])).toBe(1);
    });
  });

  describe('rungsAt', () => {
    const elms = laddered('elms', [
      { entry: 'lmp2', discipline: Discipline.SPORTSCAR, tier: 2 },
      { entry: 'lmgt3', discipline: Discipline.SPORTSCAR, tier: 3 },
      { entry: 'lmp3', discipline: Discipline.SPORTSCAR, tier: 3 },
    ]);
    const imsa = laddered('imsa', [{ entry: 'gtd', discipline: Discipline.SPORTSCAR, tier: 3 }]);

    it('stands a championship on a rung once, with every class entering there, in list order', () => {
      expect(rungsAt([elms, imsa], Discipline.SPORTSCAR, 3)
        .map((rung) => [rung.listing.series.id, rung.entries.map((entry) => entry.id)]))
        .toEqual([['elms', ['lmgt3', 'lmp3']], ['imsa', ['gtd']]]);
    });

    it('leaves out a class at the same tier in another discipline', () => {
      const mixed = laddered('mixed', [{ entry: 'gt', discipline: Discipline.SPORTSCAR, tier: 2 }]);

      expect(rungsAt([mixed], Discipline.TOURING, 2)).toEqual([]);
    });

    it('carries only the classes the filter keeps', () => {
      const rungs = rungsAt([elms, imsa], Discipline.SPORTSCAR, 3, (_, entry) => entry.id !== 'lmp3');

      expect(rungs.map((rung) => rung.entries.map((entry) => entry.id))).toEqual([['lmgt3'], ['gtd']]);
    });

    it('leaves a championship off the rung once the filter keeps none of its classes there', () => {
      const rungs = rungsAt([elms, imsa], Discipline.SPORTSCAR, 3, (one) => one.series.id !== 'elms');

      expect(rungs.map((rung) => rung.listing.series.id)).toEqual(['imsa']);
    });
  });

  describe('teamGroups', () => {
    const teams = [
      { id: 'red', name: 'Red' },
      { id: 'blue', name: 'Blue' },
    ] as Team[];
    /**
     * A seat in a team, or in none.
     * @param id The seat's id
     * @param team The team it names
     * @returns The seat
     */
    const seat = (id: string, team?: string): Seat => ({ id, team });

    it('groups seats by team in the order each team first appears', () => {
      const groups = teamGroups([seat('a', 'blue'), seat('b', 'red'), seat('c', 'blue')], teams);

      expect(groups.map((group) => [group.team?.id, group.seats.map((one) => one.id)]))
        .toEqual([['blue', ['a', 'c']], ['red', ['b']]]);
    });

    it('gathers the seats naming no team, or a team not fielded, last and together', () => {
      const groups = teamGroups([seat('a'), seat('b', 'red'), seat('c', 'gone')], teams);

      expect(groups.map((group) => [group.team?.id ?? null, group.seats.map((one) => one.id)]))
        .toEqual([['red', ['b']], [null, ['a', 'c']]]);
    });
  });

  describe('contentValues', () => {
    it('prefixes each list\'s values with the list, in the source tree\'s order', () => {
      expect(contentValues({
        makers: [ModMaker.RSS],
        sources: [ContentSource.MOD],
        packs: [DLCPack.RED_PACK],
      })).toEqual([`sources:${ContentSource.MOD}`, `packs:${DLCPack.RED_PACK}`, `makers:${ModMaker.RSS}`]);
    });

    it('reads a championship\'s requirements, ignoring what is not one of the tree\'s lists', () => {
      expect(contentValues(availability().requires)).toEqual([]);
    });
  });

  describe('contentPicks', () => {
    it('reads prefixed values back into the tree\'s lists, round-tripping contentValues', () => {
      const picks = {
        sources: [ContentSource.MOD], packs: [DLCPack.RED_PACK], makers: [ModMaker.RSS], distributors: [],
      };

      expect(contentPicks(contentValues(picks))).toEqual(picks);
    });

    it('drops a value carrying no list it knows', () => {
      expect(contentPicks(['nothing', 'tracks:spa', ':mod'])).toEqual({
        sources: [], packs: [], makers: [], distributors: [],
      });
    });
  });

  describe('contentFacets', () => {
    it('splits the counts into the tree\'s lists, unprefixed', () => {
      expect(contentFacets([
        { value: 'sources:base', count: 12 },
        { value: 'makers:rss', count: 3 },
        { value: 'bogus', count: 1 },
      ])).toEqual({
        sources: [{ value: 'base', count: 12 }],
        packs: [],
        makers: [{ value: 'rss', count: 3 }],
        distributors: [],
      });
    });
  });

  describe('withPicked', () => {
    it('replaces one dimension\'s picks and keeps the rest of the criteria', () => {
      const criteria = {
        picked: { tiers: ['1'], origins: ['user'] }, sort: 'name' as const, direction: 'asc' as const,
      };

      expect(withPicked(criteria, 'tiers', ['2', '3'])).toEqual({
        picked: { tiers: ['2', '3'], origins: ['user'] }, sort: 'name', direction: 'asc',
      });
      expect(criteria.picked.tiers).toEqual(['1']);
    });
  });

  describe('readStandingsLayout', () => {
    it('opens on the default layout when nothing was saved', () => {
      expect(readStandingsLayout(undefined)).toEqual(DEFAULT_STANDINGS);
    });

    it('restores a layout saved before', () => {
      expect(readStandingsLayout({ who: 'teams', shape: 'table', view: 'positions' }))
        .toEqual({ who: 'teams', shape: 'table', view: 'positions' });
    });

    it('narrows field by field, so only what is stale or broken falls back', () => {
      expect(readStandingsLayout({ who: 'teams', shape: 'carousel', view: 7 })).toEqual({ ...DEFAULT_STANDINGS, who: 'teams' });
      expect(readStandingsLayout('not an object')).toEqual(DEFAULT_STANDINGS);
    });

    it('reads back drivers and the grid as well as their alternatives', () => {
      expect(readStandingsLayout({ who: 'drivers', shape: 'grid', view: 'points' })).toEqual(DEFAULT_STANDINGS);
    });
  });

  describe('enterHintOf', () => {
    it('reads the class and car a link handed the page', () => {
      expect(enterHintOf({ enter: { entry: 'pro', car: { model: 'ks_car', skin: 'red' } } }))
        .toEqual({ entry: 'pro', car: { model: 'ks_car', skin: 'red' } });
    });

    it('reads a car named without a livery', () => {
      expect(enterHintOf({ enter: { entry: 'pro', car: { model: 'ks_car', skin: 3 } } }))
        .toEqual({ entry: 'pro', car: { model: 'ks_car' } });
    });

    it('reads nothing from state that carries no whole hint', () => {
      expect(enterHintOf(null)).toBeNull();
      expect(enterHintOf({ section: 'home' })).toBeNull();
      expect(enterHintOf({ enter: null })).toBeNull();
      expect(enterHintOf({ enter: { entry: 'pro' } })).toBeNull();
      expect(enterHintOf({ enter: { car: { model: 'ks_car' } } })).toBeNull();
    });
  });

  describe('shownRun', () => {
    /**
     * An edition of the championship, its rounds in the states given.
     * @param at Which of the season's editions
     * @param statuses Each round's state
     * @param overrides What to change about it
     * @returns The entry
     */
    const edition = (
      at: number,
      statuses: readonly SeasonEntry['events'][number]['status'][],
      overrides: Partial<SeasonEntry> = {},
    ): SeasonEntry => ({
      series: 'cup',
      edition: at,
      events: statuses.map((status, round) => ({ round: `r${round}`, status })),
      ...overrides,
    } as SeasonEntry);
    /**
     * A season holding the entries given.
     * @param index Which season it is
     * @param entries Its entries
     * @returns The season
     */
    const season = (index: number, ...entries: SeasonEntry[]): CareerSeason => ({
      index, startDate: `${2026 + index}-01-01`, endDate: `${2026 + index}-12-31`, entries,
    });
    const past = season(0, edition(0, ['raced']), edition(1, ['missed'], { withdrawn: true }));
    const now = season(1, edition(0, ['raced']), edition(1, ['scheduled']), edition(2, ['missed'], { withdrawn: true }));
    const career = { seasons: [past, now] } as unknown as Career;

    it('shows the current season and the edition the career is racing when the URL names neither', () => {
      expect(shownRun(career, 'cup', {}, undefined, false)).toEqual({
        season: now, closed: false, edition: 1, entered: now.entries[1],
      });
    });

    it('prefers the edition the URL names, then the one main answered for', () => {
      expect(shownRun(career, 'cup', { edition: 0 }, 1, false).edition).toBe(0);
      expect(shownRun(career, 'cup', {}, 3, false).edition).toBe(3);
    });

    it('reads back a season gone by, and an edition the career pulled out of in it', () => {
      expect(shownRun(career, 'cup', { season: 0, edition: 1 }, undefined, false)).toEqual({
        season: past, closed: true, edition: 1, entered: past.entries[1],
      });
    });

    // In the season under way an edition left can be entered again, so the page
    // treats it as not entered.
    it('holds no entry for an edition of the current season the career pulled out of', () => {
      expect(shownRun(career, 'cup', { edition: 2 }, undefined, false).entered).toBeNull();
    });

    it('holds no entry for a page that manages the library', () => {
      expect(shownRun(career, 'cup', {}, undefined, true).entered).toBeNull();
    });

    it('shows nothing before the career is read', () => {
      expect(shownRun(null, 'cup', {}, undefined, false)).toEqual({
        season: null, closed: false, edition: undefined, entered: null,
      });
    });
  });

  describe('missingContent', () => {
    const base = { source: ContentSource.MOD, pack: null, maker: null, distributor: null };

    it('lists every missing car once, whether a class or a round names it', () => {
      const missing = missingContent(listing({
        entries: [{
          entry: 'main', eligible: [], missing: [{ id: 'rss_gt3', provenance: base }], enough: false,
        }],
        rounds: [{
          round: 'spa',
          track: null,
          pitboxes: null,
          racedOn: null,
          races: [],
          entries: [{
            entry: 'main',
            eligible: [],
            missing: [{ id: 'rss_gt3', provenance: base }, { id: 'rss_gt4', provenance: base }],
            enough: false,
          }],
        }],
      }));

      expect(missing.cars.map((car) => car.id)).toEqual(['rss_gt3', 'rss_gt4']);
    });

    it('lists the track of every round that is not installed', () => {
      const track = {
        key: 'rt_lusail', id: 'rt_lusail', layout: '', provenance: base,
      };
      const missing = missingContent(listing({
        rounds: [
          {
            round: 'lusail', track, pitboxes: null, racedOn: null, entries: [], races: [],
          },
          {
            round: 'magione', track: null, pitboxes: null, racedOn: null, entries: [], races: [],
          },
        ],
      }));

      expect(missing.tracks).toEqual([track]);
    });

    it('lists nothing for a championship the install can race', () => {
      expect(missingContent(listing())).toEqual({ cars: [], tracks: [], pitboxes: [] });
    });

    // Found in review: two rounds at one layout listed it twice, under one
    // React key.
    it('lists a track two rounds race once', () => {
      const track = {
        key: 'spa/gp', id: 'spa', layout: '', provenance: base, recommended: 'spa/gp',
      };
      const missing = missingContent(listing({
        rounds: ['sprint', 'feature'].map((round) => ({
          round, track, pitboxes: null, racedOn: null, entries: [], races: [],
        })),
      }));

      expect(missing.tracks).toEqual([track]);
    });

    it('lists each installed track too small for the field once, apart from tracks with the same name', () => {
      const shortfall = (key: string) => ({
        needed: 30, available: 24, key, track: 'Spa',
      });
      const missing = missingContent(listing({
        rounds: [['sprint', 'spa_a'], ['feature', 'spa_a'], ['finale', 'spa_b']].map(([round, key]) => ({
          round, track: null, pitboxes: shortfall(key), racedOn: null, entries: [], races: [],
        })),
      }));

      expect(missing.pitboxes).toEqual([shortfall('spa_a'), shortfall('spa_b')]);
    });
  });

  describe('carsFor', () => {
    it("answers with the round's own cars where the round changes what a class drives", () => {
      const one = listing({
        rounds: [{
          round: 'magione',
          track: null,
          pitboxes: null,
          racedOn: null,
          races: [],
          entries: [{
            entry: 'main', eligible: ['ks_mazda_mx5_nd'], missing: [], enough: true,
          }],
        }],
      });

      expect(carsFor(one, 'main', 'magione')).toEqual(['ks_mazda_mx5_nd']);
    });

    it("falls back to the season's cars for a round that changes nothing", () => {
      expect(carsFor(listing(), 'main', 'magione')).toEqual(['ks_mazda_mx5_cup']);
    });

    it('answers with nothing for a class the championship does not hold', () => {
      expect(carsFor(listing(), 'other', 'magione')).toEqual([]);
    });
  });

  describe('layoutLabel', () => {
    it('names a recommended layout by its circuit and its own name', () => {
      expect(layoutLabel('suzuka/east', t)).toBe(t('recommendedTracks.layoutName', { circuit: 'Suzuka', layout: 'East' }));
    });

    it('names nothing the catalogue does not have', () => {
      expect(layoutLabel('suzuka/west', t)).toBeNull();
    });
  });

  describe('trackLabelOf', () => {
    const round = (track: Round['track']): Round => ({ id: 'r1', name: 'Round 1', track });

    it('names a round at a recommended layout by the layout, whatever folder races it', () => {
      expect(trackLabelOf(round({ recommended: 'suzuka/east', id: 'my_suzuka' }), t)).toBe(layoutLabel('suzuka/east', t));
    });

    it('names any other round by its track key', () => {
      expect(trackLabelOf(round({ id: 'ks_brands_hatch', layout: 'indy' }), t)).toBe('ks_brands_hatch/indy');
      expect(trackLabelOf(round({ id: 'magione' }), t)).toBe('magione');
    });

    it('falls back to the key for a layout the catalogue does not have', () => {
      expect(trackLabelOf(round({ recommended: 'suzuka/west', id: 'my_suzuka' }), t)).toBe('my_suzuka');
    });
  });

  describe('missingTrackLabel', () => {
    const provenance = {
      source: ContentSource.MOD, pack: null, maker: null, distributor: null,
    };

    it('names a missing recommended layout by the layout', () => {
      expect(missingTrackLabel({
        key: 'suzuka/east', id: 'rt_suzuka', layout: 'suzukaeast', provenance, recommended: 'suzuka/east',
      }, t)).toBe(layoutLabel('suzuka/east', t));
    });

    it('names any other missing track by its key', () => {
      expect(missingTrackLabel({
        key: 'rt_lusail', id: 'rt_lusail', layout: '', provenance,
      }, t)).toBe('rt_lusail');
    });
  });

  describe('opensWith', () => {
    it('opens the top rung on its own floor alone', () => {
      expect(opensWith(Discipline.SPORTSCAR, 1, t, String)).toBe(t('championships.ladder.opensAt', {
        tier: 1, rating: '8000', discipline: t('championships.discipline.sportscar'),
      }));
    });

    it('opens any other rung on its own floor or the rung above it anywhere', () => {
      const own = t('championships.ladder.opensAt', {
        tier: 3, rating: '3500', discipline: t('championships.discipline.road'),
      });

      expect(opensWith(Discipline.ROAD, 3, t, String)).toBe(t('championships.ladder.orAnywhere', { own, tier: 2 }));
    });
  });

  describe('editionOffers', () => {
    /**
     * An edition's seat offers, as the mail they came in.
     * @param id The mail's id, which names the edition
     * @param overrides What to change about it
     * @returns The mail
     */
    const offers = (id: string, overrides: Partial<Mail> = {}): Mail => ({
      id,
      kind: 'offer',
      season: 1,
      arrived: '2027-04-01',
      opened: false,
      deadline: '2027-04-15',
      offers: [],
      ...overrides,
    });

    /**
     * A career on 10 April 2027 holding the mail given.
     * @param inbox Its mail
     * @returns The career
     */
    const holding = (...inbox: Mail[]): Career => ({ date: '2027-04-10', inbox } as unknown as Career);

    it("is the mail holding the edition's offers while it waits for an answer", () => {
      const mine = offers('offer:cup:1.1');
      const career = holding(offers('offer:cup:1.0'), offers('offer:gt:1.1'), offers('offer:cup:0.1'), mine);

      expect(editionOffers(career, 1, 'cup', 1)).toBe(mine);
    });

    it('is none once the mail was answered or has lapsed', () => {
      const answered = offers('offer:cup:1.0', { reply: { answer: 'declined', on: '2027-04-02' } });
      const lapsed = offers('offer:cup:1.0', { deadline: '2027-04-09' });

      expect(editionOffers(holding(answered), 1, 'cup', 0)).toBeNull();
      expect(editionOffers(holding(lapsed), 1, 'cup', 0)).toBeNull();
    });

    it('is none for an edition no team offered a seat in', () => {
      expect(editionOffers(holding(), 1, 'cup', 0)).toBeNull();
    });
  });
});
