import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';

import { appErrorInfo } from '../../../../../shared/errors';
import {
  ContentSource, Discipline, DLCPack, ModMaker,
} from '../../../../../shared/types';
import type {
  Career, CareerSeason, Championship, ClassEntry, SeasonEntry, Seat, SeriesAvailability, SeriesListing, Team,
} from '../../../../../shared/types';
import { DEFAULT_STANDINGS, TIER_METAL_KEYS } from '../constants.ts';
import {
  availabilityState,
  contentFacets,
  contentPicks,
  contentValues,
  enterHintOf,
  isListed,
  ladderDepth,
  pursesOf,
  raceLabels,
  readStandingsLayout,
  rungsAt,
  shownRun,
  teamGroups,
  tierAccent,
  tierMetalKey,
  withPicked,
} from '../utils.ts';
import { TIER_ACCENT } from '@/lib/accents';
import { readPreference } from '@/lib/stored-preference';

jest.mock('@/lib/stored-preference', () => ({ readPreference: jest.fn() }));

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
    round: 'magione', track: null, pitboxes: null, entries: [], races: [],
  }],
  requires: {
    sources: [],
    packs: [],
    makers: [],
    distributors: [],
    pools: [],
    rounds: { packs: [], makers: [], distributors: [] },
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
      seriesActive: {}, showFillerSeries: true, hiddenContentSources: { packs: [], makers: [], distributors: [] },
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
            rounds: { packs: [], makers: [], distributors: [] },
            widenedBy: { packs: [], makers: [], distributors: [] },
          },
        }),
        origin: 'shipped',
      };

      expect(isListed(shipped, { ...everything, hiddenContentSources: {
        packs: [DLCPack.RED_PACK], makers: [], distributors: [],
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
     * A class entry carrying only what a purse reads.
     * @param name Its name
     * @param prizes What it pays of its own, if anything
     * @returns The entry
     */
    const entry = (name: string, prizes?: ClassEntry['prizes']): ClassEntry => (
      { name, prizes } as ClassEntry
    );
    const championship = { positions: [100, 50], standings: [1000] };

    it('pays every class the championship\'s purse where none pays its own', () => {
      expect(pursesOf(championship, [entry('LMP2'), entry('GTE')]))
        .toEqual([{ prizes: championship, classes: ['LMP2', 'GTE'] }]);
    });

    it('lists a class paying its own apart, and classes paying alike together', () => {
      const own = { positions: [300], standings: [3000] };

      expect(pursesOf(championship, [entry('Hypercar', own), entry('LMP2'), entry('GTE')]))
        .toEqual([
          { prizes: own, classes: ['Hypercar'] },
          { prizes: championship, classes: ['LMP2', 'GTE'] },
        ]);
    });

    // Found in review: a class stating one table paid nothing on the other,
    // while the editor told the user it paid what the championship does.
    it('pays a table a class leaves out as the championship does', () => {
      expect(pursesOf(championship, [entry('Am', { positions: [70] })])).toEqual([{
        prizes: { positions: [70], standings: [1000] }, classes: ['Am'],
      }]);
    });

    it('is one purse of nothing for a championship paying nothing', () => {
      expect(pursesOf(undefined, [entry('Main')])).toEqual([{ prizes: undefined, classes: ['Main'] }]);
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
    it('stands a championship on a rung once per class entering there, in list order', () => {
      const elms = laddered('elms', [
        { entry: 'lmp2', discipline: Discipline.SPORTSCAR, tier: 2 },
        { entry: 'lmp2-pro-am', discipline: Discipline.SPORTSCAR, tier: 2 },
        { entry: 'lmp3', discipline: Discipline.SPORTSCAR, tier: 3 },
      ]);
      const imsa = laddered('imsa', [{ entry: 'gtd', discipline: Discipline.SPORTSCAR, tier: 2 }]);

      expect(rungsAt([elms, imsa], Discipline.SPORTSCAR, 2).map((rung) => [rung.listing.series.id, rung.entry.id]))
        .toEqual([['elms', 'lmp2'], ['elms', 'lmp2-pro-am'], ['imsa', 'gtd']]);
    });

    it('leaves out a class at the same tier in another discipline', () => {
      const mixed = laddered('mixed', [{ entry: 'gt', discipline: Discipline.SPORTSCAR, tier: 2 }]);

      expect(rungsAt([mixed], Discipline.TOURING, 2)).toEqual([]);
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
    const read = jest.mocked(readPreference);

    beforeEach(() => {
      read.mockReset();
    });

    it('opens on the default layout when nothing was saved', () => {
      read.mockReturnValue(undefined);

      expect(readStandingsLayout()).toEqual(DEFAULT_STANDINGS);
    });

    it('restores a layout saved before', () => {
      read.mockReturnValue({ who: 'teams', shape: 'table', view: 'positions' });

      expect(readStandingsLayout()).toEqual({ who: 'teams', shape: 'table', view: 'positions' });
    });

    it('narrows field by field, so only what is stale or broken falls back', () => {
      read.mockReturnValue({ who: 'teams', shape: 'carousel', view: 7 });
      expect(readStandingsLayout()).toEqual({ ...DEFAULT_STANDINGS, who: 'teams' });

      read.mockReturnValue('not an object');
      expect(readStandingsLayout()).toEqual(DEFAULT_STANDINGS);
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
});
