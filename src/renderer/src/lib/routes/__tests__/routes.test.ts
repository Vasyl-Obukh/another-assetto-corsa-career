import { describe, expect, it } from '@jest/globals';

import { ROUTE } from '../constants.ts';
import {
  buildPath, linkRun, path, routeOf, runOf, sectionOf,
} from '../routes.ts';
import type { RouteId } from '../types.ts';

describe('renderer/lib/routes/routes', () => {
  describe('buildPath', () => {
    it('fills a placeholder in', () => {
      expect(buildPath('/cars/:id', { id: 'ks_ferrari_488_gt3' })).toBe('/cars/ks_ferrari_488_gt3');
    });

    it('returns a pattern carrying no placeholders unchanged', () => {
      expect(buildPath('/cars', {})).toBe('/cars');
    });

    it('fills every placeholder of a multi-parameter pattern', () => {
      expect(buildPath('/series/:seriesId/rounds/:roundId', { seriesId: 'f2', roundId: '3' }))
        .toBe('/series/f2/rounds/3');
    });

    // Routes are hash routes, so an unescaped # would end the route early and a
    // ? would start a query string. A car folder may hold either.
    it('encodes what would otherwise break the hash route', () => {
      expect(buildPath('/cars/:id', { id: 'car#1' })).toBe('/cars/car%231');
      expect(buildPath('/cars/:id', { id: 'a?b' })).toBe('/cars/a%3Fb');
      expect(buildPath('/cars/:id', { id: 'a/b' })).toBe('/cars/a%2Fb');
    });

    it('encodes a space, which mod livery folders use freely', () => {
      expect(buildPath('/cars/:id', { id: '1 Oreca Showcar' })).toBe('/cars/1%20Oreca%20Showcar');
    });

    // encodeURIComponent escapes these, and a path segment need not. Left
    // escaped they make a URL needlessly unreadable, so they are put back.
    it('leaves characters that are legal in a path segment alone', () => {
      for (const character of ['$', '&', '+', ',', ':', ';', '=', '@']) {
        expect(buildPath('/cars/:id', { id: `a${character}b` })).toBe(`/cars/a${character}b`);
      }
    });

    it('still encodes a percent, so an encoded value cannot be double-read', () => {
      expect(buildPath('/cars/:id', { id: '100%' })).toBe('/cars/100%25');
    });

    // The placeholder pattern is a global regex, and a global regex carries a
    // lastIndex. String.replace resets it; this is what says so.
    it('gives the same answer when called twice with one pattern', () => {
      expect(buildPath('/cars/:id', { id: 'a' })).toBe('/cars/a');
      expect(buildPath('/cars/:id', { id: 'a' })).toBe('/cars/a');
    });

    it('throws rather than building a path with "undefined" in it', () => {
      expect(() => buildPath('/cars/:id', {} as { id: string }))
        .toThrow('Route /cars/:id is missing :id');
    });
  });

  describe('path', () => {
    it('builds one car\'s page from its folder name', () => {
      expect(path.car({ id: 'ks_ferrari_488_gt3' })).toBe('/cars/ks_ferrari_488_gt3');
    });

    it('encodes the folder name on the way in', () => {
      expect(path.car({ id: 'car#1' })).toBe('/cars/car%231');
    });

    // An archive is named by an ISO timestamp with its colons replaced, so the
    // file name reaches the URL as it stands.
    it('builds the page for one archived result from its file name', () => {
      expect(path.result({ file: '2026-08-31T18-04-11-123Z.json' }))
        .toBe('/home/results/2026-08-31T18-04-11-123Z.json');
    });

    it('builds a championship editor under settings, where the library is managed', () => {
      expect(path.championshipEdit({ id: 'lotus-cup' })).toBe('/settings/championships/lotus-cup/edit');
    });

    it('builds the settings tab\'s own page for one championship', () => {
      expect(path.settingsChampionship({ id: 'lotus-cup' })).toBe('/settings/championships/lotus-cup');
    });

    // Under settings, so the nav lights Settings on every screen that manages
    // the library - Diagnostics included, now that it is one of its tabs.
    it('puts every managing screen under settings', () => {
      [path.diagnostics(), path.settingsChampionships(), path.championshipNew()]
        .forEach((url) => expect(url.startsWith(`${ROUTE.settings}/`)).toBe(true));
    });

    it('returns the pattern itself where a destination takes no parameters', () => {
      expect(path.race()).toBe(ROUTE.race);
      expect(path.results()).toBe(ROUTE.results);
      expect(path.cars()).toBe(ROUTE.cars);
      expect(path.tracks()).toBe(ROUTE.tracks);
      expect(path.diagnostics()).toBe(ROUTE.diagnostics);
      expect(path.settings()).toBe(ROUTE.settings);
      expect(path.settingsContent()).toBe(ROUTE.settingsContent);
      expect(path.settingsSources()).toBe(ROUTE.settingsSources);
      expect(path.settingsChampionships()).toBe(ROUTE.settingsChampionships);
      expect(path.championshipNew()).toBe(ROUTE.championshipNew);
    });

    // Adding a route without a builder would leave callers reaching for the
    // pattern and linking to a literal ":id".
    it('gives every destination a builder', () => {
      expect(Object.keys(path).sort()).toEqual((Object.keys(ROUTE) as RouteId[]).sort());
    });

    it('builds the home page and one race event of the player\'s own', () => {
      expect(path.home()).toBe(ROUTE.home);
      expect(path.raceEvent({ id: 'abc' })).toBe('/race/abc');
    });

    it('builds a circuit\'s page, on a layout when given one', () => {
      expect(path.track({ id: 'spa' })).toBe('/tracks/spa');
      expect(path.track({ id: 'spa' }, 'gp 2022')).toBe('/tracks/spa?layout=gp%202022');
    });

    it('builds a championship\'s page on a run and a tab when given them', () => {
      expect(path.championship({ id: 'cup' })).toBe('/championships/cup');
      expect(path.championship({ id: 'cup' }, { season: 1, edition: 2 })).toBe('/championships/cup?season=1&edition=2');
      expect(path.championship({ id: 'cup' }, { edition: 0 }, 'standings'))
        .toBe('/championships/cup?edition=0&tab=standings');
    });

    it('builds a round\'s page on a run when given one', () => {
      expect(path.event({ series: 'cup', round: 'r1' }, {})).toBe('/calendar/cup/r1');
      expect(path.event({ series: 'cup', round: 'r1' }, { season: 0 })).toBe('/calendar/cup/r1?season=0');
    });

    it('builds History and the reviews it opens under Home', () => {
      expect(path.history()).toBe('/home/history');
      expect(path.yearReview({ season: 2 })).toBe('/home/history/2');
      expect(path.championshipReview({ series: 'lotus cup', season: 2, edition: 1 }))
        .toBe('/home/history/2/lotus%20cup/1');
    });
  });

  describe('linkRun', () => {
    // Guards a bug: links within the season under way named it, so the page
    // stayed pinned to that season once the next one opened.
    it('names no season for the current one, and no edition for a championship run once a year', () => {
      expect(linkRun({ season: 2, edition: 0 }, 2, 1)).toEqual({});
    });

    it('names a season gone by', () => {
      expect(linkRun({ season: 1, edition: 0 }, 2, 1)).toEqual({ season: 1 });
    });

    it('names the edition of a championship that runs more than once a year', () => {
      expect(linkRun({ season: 2, edition: 3 }, 2, 4)).toEqual({ edition: 3 });
      expect(linkRun({ season: 0, edition: 1 }, 2, 2)).toEqual({ season: 0, edition: 1 });
    });
  });

  describe('runOf', () => {
    it('reads back the run a page\'s URL names', () => {
      const query = path.championship({ id: 'cup' }, { season: 3, edition: 1 }).split('?')[1];

      expect(runOf(new URLSearchParams(query))).toEqual({ season: 3, edition: 1 });
    });

    it('names nothing a URL leaves out', () => {
      expect(runOf(new URLSearchParams('tab=standings'))).toEqual({});
      expect(runOf(new URLSearchParams('edition=2'))).toEqual({ edition: 2 });
    });

    // A hand-edited URL falls back to the page's own default rather than
    // asking main for season NaN.
    it('names nothing for a value that is not a whole number of zero or more', () => {
      expect(runOf(new URLSearchParams('season=two&edition=-1'))).toEqual({});
      expect(runOf(new URLSearchParams('season=1.5'))).toEqual({});
    });
  });

  describe('routeOf', () => {
    it('finds the destination a path is', () => {
      expect(routeOf('/cars')).toBe('cars');
      expect(routeOf('/cars/ks_audi_r8')).toBe('car');
      expect(routeOf('/calendar/lotus-cup/r1')).toBe('event');
    });

    it('allows a trailing slash', () => {
      expect(routeOf('/tracks/')).toBe('tracks');
    });

    // `/settings/championships/new` also fits `/settings/championships/:id`;
    // the literal has to win or the new championship reads as one called "new".
    it('prefers a literal route over a pattern the same path fits', () => {
      expect(routeOf('/settings/championships/new')).toBe('championshipNew');
      expect(routeOf('/settings/championships/lotus-cup')).toBe('settingsChampionship');
    });

    it('finds nothing for a path no route matches', () => {
      expect(routeOf('/nowhere/at/all')).toBeNull();
    });

    it('finds every route from its own built path', () => {
      (Object.keys(ROUTE) as RouteId[]).forEach((id) => {
        expect(routeOf(ROUTE[id].replaceAll(/:[a-z]+/gi, 'x'))).toBe(id);
      });
    });
  });

  describe('sectionOf', () => {
    it('reads the section a link\'s state names', () => {
      expect(sectionOf({ section: 'settings' })).toBe('settings');
    });

    it('reads nothing from state that names no section navigation offers', () => {
      expect(sectionOf({ section: 'car' })).toBeNull();
      expect(sectionOf({ section: 'results' })).toBeNull();
      expect(sectionOf({ other: true })).toBeNull();
      expect(sectionOf(null)).toBeNull();
      expect(sectionOf('settings')).toBeNull();
    });
  });
});
