// Turning route patterns into the URLs links and navigations use.
//
// Two things that read alike and are not, and only agree when a destination
// takes no parameters:
//
//   ROUTE.car    '/cars/:id'          the pattern - <Route path>, useMatch
//   path.car()   '/cars/ks_ferrari'   the URL     - <Link to>, navigate, <Navigate>
//
// react-router's own generatePath does exactly what buildPath does and is
// deliberately not used: the package is ESM-only and its graph reaches an
// `import.meta.hot`, which the CommonJS Jest compiles to cannot express, so
// importing it would put this module and its dependents out of reach of the
// suite. The type-only import in types.ts is erased before either sees it.

import {
  CAREER_NAV,
  CHAMPIONSHIP_NAV,
  DETAIL_TAB_PARAM,
  MAIL_PARAM,
  OVER_ESCAPED,
  PARAM_PLACEHOLDER,
  QUICK_NAV,
  ROUTE,
  RUN_PARAM,
  SESSION_PARAM,
  TRACK_LAYOUT_PARAM,
} from './constants.ts';
import type { NavId, RouteId, RouteParams } from './types.ts';
import type { CareerKind, ChampionshipRun } from '../../../../shared/types';

/**
 * Encodes one path segment the way a URL wants it.
 *
 * `encodeURIComponent` is deliberately over-eager - it escapes the sub-delimiters
 * `$&+,;=`, plus `:` and `@`, which are all legal in a path segment and read
 * badly when escaped. They are put back, which is what react-router's own
 * generatePath does.
 * @param value The raw parameter value
 * @returns The value, safe to sit in a path
 */
const encodeSegment = (value: string): string => (
  encodeURIComponent(value).replace(OVER_ESCAPED, decodeURIComponent)
);

/**
 * Fills a route pattern's placeholders in to make a URL.
 *
 * Only required `:name` placeholders are understood - not react-router's
 * optional `:name?` or its trailing `*`. Neither is used by any route here, and
 * adding one is the moment to teach this function about it rather than now.
 * @param pattern The route pattern to fill in
 * @param params A value for every placeholder the pattern carries
 * @returns The URL to navigate to
 * @throws When a placeholder has no value, which the types should have prevented
 */
export const buildPath = <P extends string>(pattern: P, params: RouteParams<P>): string => (
  pattern.replace(PARAM_PLACEHOLDER, (placeholder, name: string) => {
    // The one place the pattern's derived key type has to become an ordinary
    // lookup; everything above this line is checked.
    const value = (params as Readonly<Record<string, string | undefined>>)[name];
    if (value === undefined) throw new Error(`Route ${pattern} is missing ${placeholder}`);

    return encodeSegment(value);
  })
);

/**
 * How many placeholders a route pattern carries.
 * @param pattern The pattern
 * @returns Its `:name` count
 */
const placeholders = (pattern: string): number => pattern.match(PARAM_PLACEHOLDER)?.length ?? 0;

/**
 * Which destination a URL path is, the reverse of `path`.
 *
 * Patterns with fewer placeholders are tried first, so a literal such as
 * `/settings/championships/new` is never read as one championship's page.
 * @param pathname The path, as `useLocation` reports it
 * @returns The route's ID, or null for a path no route matches
 */
export const routeOf = (pathname: string): RouteId | null => {
  const ids = (Object.keys(ROUTE) as RouteId[])
    .sort((a, b) => placeholders(ROUTE[a]) - placeholders(ROUTE[b]));

  return ids.find((id) => new RegExp(`^${ROUTE[id].replace(PARAM_PLACEHOLDER, '[^/]+')}/?$`).test(pathname))
    ?? null;
};

/**
 * The query string that names a run, for a page that shows one.
 * @param run Which season and edition, either of which may be left out
 * @param opened What else the page is opened on, each left out when undefined
 * @returns The query, with its leading `?`, or nothing when it names nothing
 */
const runQuery = (
  run: Partial<ChampionshipRun> | undefined,
  opened: Record<string, string | number | undefined> = {},
): string => {
  const query = new URLSearchParams();
  if (run?.season !== undefined) query.set(RUN_PARAM.season, String(run.season));
  if (run?.edition !== undefined) query.set(RUN_PARAM.edition, String(run.edition));
  Object.entries(opened).forEach(([name, value]) => {
    if (value !== undefined) query.set(name, String(value));
  });
  const text = query.toString();

  return text === '' ? '' : `?${text}`;
};

/**
 * Which run a page's query string names.
 *
 * Whatever is not a whole number is read as not named at all, so a hand-edited
 * URL falls back to the page's own default rather than asking for season NaN.
 * @param search The page's search parameters
 * @returns The season and edition named, each left out when it is not
 */
export const runOf = (search: URLSearchParams): Partial<ChampionshipRun> => {
  const read = (name: string): number | undefined => {
    const value = Number(search.get(name) ?? Number.NaN);

    return Number.isInteger(value) && value >= 0 ? value : undefined;
  };
  const season = read(RUN_PARAM.season);
  const edition = read(RUN_PARAM.edition);

  return {
    ...(season === undefined ? {} : { season }),
    ...(edition === undefined ? {} : { edition }),
  };
};

/**
 * Which session a round's query string opens it on.
 * @param search The page's search parameters
 * @returns The launch index, or null when it names none or not a whole number
 */
export const sessionOf = (search: URLSearchParams): number | null => {
  const text = search.get(SESSION_PARAM);
  // Number('') is 0, so an empty value has to be told from session 0.
  const value = text === null || text === '' ? Number.NaN : Number(text);

  return Number.isInteger(value) && value >= 0 ? value : null;
};

/**
 * The run a link names: the season only where it is not the current one, and
 * the edition only for a championship that runs more than once a year - so a
 * link within the season under way follows it rather than pinning it.
 * @param run The season and edition the link leads to
 * @param current The current season's index, or undefined before it is read
 * @param editions How many editions the championship runs a season
 * @returns What the link's query names
 */
export const linkRun = (
  run: ChampionshipRun,
  current: number | undefined,
  editions: number,
): Partial<ChampionshipRun> => ({
  ...(run.season === current ? {} : { season: run.season }),
  ...(editions > 1 ? { edition: run.edition } : {}),
});

/**
 * Where a career of a kind opens: a career's Home, or a standalone
 * championship's own page.
 * @param kind The career's kind
 * @returns The URL
 */
export const homeOf = (kind: CareerKind): string => (kind === 'championship' ? ROUTE.standalone : ROUTE.home);

/**
 * The section a page's router state says navigation should light.
 * @param state The location's state, whatever pushed it
 * @returns The section a `NavState` names, or null for any other state
 */
export const sectionOf = (state: unknown): NavId | null => {
  if (typeof state !== 'object' || state === null || !('section' in state)) return null;
  const { section } = state;

  return [...CAREER_NAV, ...CHAMPIONSHIP_NAV, ...QUICK_NAV].find((entry) => entry.id === section)?.id ?? null;
};

/**
 * The URL for every destination, keyed by route ID.
 *
 * Always a call, even where a destination takes no parameters, so there is one
 * way to ask for a URL rather than two.
 */
export const path = {
  /**
   * The start screen, where the app always opens.
   * @returns Its URL
   */
  start: (): string => ROUTE.start,
  /**
   * Every career, the one picked beside them - what Load opens.
   * @returns Its URL
   */
  careers: (): string => ROUTE.careers,
  /**
   * New career.
   * @returns Its URL
   */
  careerNew: (): string => ROUTE.careerNew,
  /**
   * Every standalone championship, the one picked beside them - what the
   * Championship tile's Load opens.
   * @returns Its URL
   */
  standalones: (): string => ROUTE.standalones,
  /**
   * New championship.
   * @returns Its URL
   */
  standaloneNew: (): string => ROUTE.standaloneNew,
  /**
   * The open standalone championship's own page, which is its home.
   * @returns Its URL
   */
  standalone: (): string => ROUTE.standalone,
  /**
   * The open career's own settings.
   * @returns Its URL
   */
  settingsCareer: (): string => ROUTE.settingsCareer,
  /**
   * The career's home page, where the app opens.
   * @returns Its URL
   */
  home: (): string => ROUTE.home,
  /**
   * The career's inbox, showing one mail when one is named.
   * @param mail The mail to open, by its id
   * @returns Its URL
   */
  inbox: (mail?: string): string => (
    mail === undefined ? ROUTE.inbox : `${ROUTE.inbox}?${new URLSearchParams({ [MAIL_PARAM]: mail }).toString()}`
  ),
  /**
   * Every race event of the player's own.
   * @returns Its URL
   */
  race: (): string => ROUTE.race,
  /**
   * One race event of the player's own, where it is set up and run.
   * @param params The race's id
   * @returns Its URL, with the id encoded
   */
  raceEvent: (
    params: RouteParams<typeof ROUTE.raceEvent>,
  ): string => buildPath(ROUTE.raceEvent, params),
  /**
   * The career's calendar.
   * @returns Its URL
   */
  calendar: (): string => ROUTE.calendar,
  /**
   * One round of the career's season, where its sessions are run.
   * @param params The championship's and the round's ids
   * @param run Which season and edition, where the page should not pick its own
   * @param session The launch to open it on, where not the one it would pick
   * @returns Its URL, with both ids encoded
   */
  event: (
    params: RouteParams<typeof ROUTE.event>,
    run?: Partial<ChampionshipRun>,
    session?: number,
  ): string => buildPath(ROUTE.event, params) + runQuery(run, { [SESSION_PARAM]: session }),
  /**
   * The list of shipped championships.
   * @returns Its URL
   */
  championships: (): string => ROUTE.championships,
  /**
   * One championship's page.
   * @param params The championship's id
   * @param run Which season and edition, where the page should not pick its own
   * @param tab The tab to open it on, where not its first
   * @returns Its URL, with the id encoded
   */
  championship: (
    params: RouteParams<typeof ROUTE.championship>,
    run?: Partial<ChampionshipRun>,
    tab?: string,
  ): string => buildPath(ROUTE.championship, params) + runQuery(run, { [DETAIL_TAB_PARAM]: tab }),
  /**
   * The list of archived results, reached from Home.
   * @returns Its URL
   */
  results: (): string => ROUTE.results,
  /**
   * One archived result.
   * @param params The archive's file name
   * @returns Its URL, with the file name encoded
   */
  result: (params: RouteParams<typeof ROUTE.result>): string => buildPath(ROUTE.result, params),
  /**
   * Every season of the career, reached from Home.
   * @returns Its URL
   */
  history: (): string => ROUTE.history,
  /**
   * The career's money and every change of it, reached from Home.
   * @returns Its URL
   */
  finances: (): string => ROUTE.finances,
  /**
   * The career's ratings and every change of them, reached from Home and the
   * header.
   * @returns Its URL
   */
  rating: (): string => ROUTE.rating,
  /**
   * Every contract the career signed, and the ones it holds now, reached from
   * Home.
   * @returns Its URL
   */
  contracts: (): string => ROUTE.contracts,
  /**
   * Every sponsor backing the career, and every deal it signed, reached from
   * Home.
   * @returns Its URL
   */
  sponsors: (): string => ROUTE.sponsors,
  /**
   * One season of the career, looked back on.
   * @param params Which season, counting from zero
   * @param params.season The season's index
   * @returns Its URL
   */
  yearReview: (params: { season: number }): string => buildPath(ROUTE.yearReview, { season: String(params.season) }),
  /**
   * One edition of a championship the career raced, looked back on.
   * @param params Which championship, season and edition
   * @param params.series The championship's id
   * @param params.season The season's index
   * @param params.edition Which of the season's editions
   * @returns Its URL, with the championship's id encoded
   */
  championshipReview: (params: { series: string; season: number; edition: number }): string => buildPath(
    ROUTE.championshipReview,
    { series: params.series, season: String(params.season), edition: String(params.edition) },
  ),
  /**
   * The settings screen, on its General tab.
   * @returns Its URL
   */
  settings: (): string => ROUTE.settings,
  /**
   * The settings screen's Your content tab, which adds anonymous mods to the
   * library.
   * @returns Its URL
   */
  settingsContent: (): string => ROUTE.settingsContent,
  /**
   * The settings screen's Classes tab, where the user makes classes and specs
   * of their own.
   * @returns Its URL
   */
  settingsClasses: (): string => ROUTE.settingsClasses,
  /**
   * The settings screen's Championships tab, where the championship library is
   * managed.
   * @returns Its URL
   */
  settingsChampionships: (): string => ROUTE.settingsChampionships,
  /**
   * The settings screen's Content sources tab, which decides which of the
   * app's own championships are offered.
   * @returns Its URL
   */
  settingsSources: (): string => ROUTE.settingsSources,
  /**
   * One championship's page as the settings tab opens it: the same page a
   * career reads, with nothing on it that races a round.
   * @param params The championship's id
   * @returns Its URL, with the id encoded
   */
  settingsChampionship: (
    params: RouteParams<typeof ROUTE.settingsChampionship>,
  ): string => buildPath(ROUTE.settingsChampionship, params),
  /**
   * The editor, on a championship that does not exist yet. Nothing is written
   * until the first save.
   * @returns Its URL
   */
  championshipNew: (): string => ROUTE.championshipNew,
  /**
   * One championship's editor. Under settings, since that is where the library
   * is managed - the Championships page itself never edits anything.
   * @param params The championship's id
   * @returns Its URL, with the id encoded
   */
  championshipEdit: (
    params: RouteParams<typeof ROUTE.championshipEdit>,
  ): string => buildPath(ROUTE.championshipEdit, params),
  /**
   * The settings screen's Historic events tab, where the pool a career draws
   * its historic events from is managed.
   * @returns Its URL
   */
  settingsHistoric: (): string => ROUTE.settingsHistoric,
  /**
   * One historic event's page, as the settings tab opens it.
   * @param params The historic event's id
   * @returns Its URL, with the id encoded
   */
  settingsHistoricEvent: (
    params: RouteParams<typeof ROUTE.settingsHistoricEvent>,
  ): string => buildPath(ROUTE.settingsHistoricEvent, params),
  /**
   * The editor, on a historic event that does not exist yet.
   * @returns Its URL
   */
  historicNew: (): string => ROUTE.historicNew,
  /**
   * One historic event's editor.
   * @param params The historic event's id
   * @returns Its URL, with the id encoded
   */
  historicEdit: (
    params: RouteParams<typeof ROUTE.historicEdit>,
  ): string => buildPath(ROUTE.historicEdit, params),
  /**
   * A career's Store, which sells every car in the library.
   * @returns Its URL
   */
  store: (): string => ROUTE.store,
  /**
   * A career's Garage, the cars it owns.
   * @returns Its URL
   */
  garage: (): string => ROUTE.garage,
  /**
   * One car's page.
   * @param params The car's folder name
   * @returns Its URL, with the folder name encoded
   */
  car: (params: RouteParams<typeof ROUTE.car>): string => buildPath(ROUTE.car, params),
  /**
   * One circuit's page.
   * @param params The circuit's folder name
   * @param layout A layout to open it on, rather than on the whole circuit
   * @returns Its URL, with the folder name encoded
   */
  track: (params: RouteParams<typeof ROUTE.track>, layout?: string): string => buildPath(ROUTE.track, params)
    + (layout ? `?${TRACK_LAYOUT_PARAM}=${encodeURIComponent(layout)}` : ''),
  /**
   * The settings screen's Diagnostics tab: where Assetto Corsa lives and what
   * the content scan found.
   * @returns Its URL
   */
  diagnostics: (): string => ROUTE.diagnostics,
};
