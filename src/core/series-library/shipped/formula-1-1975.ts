import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of the mid seventies: a day of practice, a day of timed
 * practice setting the grid, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 315, day: 2 },
  ],
};

/**
 * Formula 1, 1975 - Niki Lauda's first title, in the Ferrari 312T.
 *
 * The real entry list on the 1975 spec, which is the base game's 312T and
 * nothing else, so every seat drives one. Seven of fourteen rounds at their
 * real distances: Interlagos, on its modern layout over the long circuit's
 * distance; Zolder; Zandvoort, where James Hunt beat Lauda for Hesketh's only
 * win; Silverstone, on the pre-chicane circuit the base game has, since
 * Woodcote's 1975 chicane is not in any layout; the Nordschleife; Monza, which
 * had its chicanes by then and so races the modern circuit; and Watkins Glen.
 * The rest are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1; the season counted a driver's best six results of
 * each half, which a points system cannot say yet. Zandvoort's eighteen boxes
 * cap the grid, and Jacky Ickx, who left Lotus mid-season, is the one regular
 * left off.
 *
 * Source: https://en.wikipedia.org/wiki/1975_Formula_One_World_Championship
 */
export const FORMULA_1_1975: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1975',
  name: 'Formula 1 1975',
  description: 'Niki Lauda\'s first title season, with the real entry list in the base game\'s '
    + 'Ferrari 312T and seven of its grands prix at their real distances.',
  teams: [
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Marlboro Team Texaco', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('brabham', 'Martini Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('hesketh', 'Hesketh Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Elf Team Tyrrell', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('lotus', 'John Player Team Lotus', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('shadow', 'UOP Shadow Racing Team', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('march', 'Lavazza March', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('williams', 'Frank Williams Racing Cars', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('hill', 'Embassy Racing with Graham Hill', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('penske', 'Penske Cars', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('surtees', 'Team Surtees', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('ferrari-lauda', 'ferrari', 'Niki Lauda', 'Austria', 'AUT'),
        seat('mclaren-fittipaldi', 'mclaren', 'Emerson Fittipaldi', 'Brazil', 'BRA'),
        seat('brabham-reutemann', 'brabham', 'Carlos Reutemann', 'Argentina', 'ARG'),
        seat('hesketh-hunt', 'hesketh', 'James Hunt', 'Great Britain', 'GBR'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'Switzerland', 'SUI'),
        seat('brabham-pace', 'brabham', 'Carlos Pace', 'Brazil', 'BRA'),
        seat('tyrrell-scheckter', 'tyrrell', 'Jody Scheckter', 'South Africa', 'RSA'),
        seat('mclaren-mass', 'mclaren', 'Jochen Mass', 'Germany', 'GER'),
        seat('lotus-peterson', 'lotus', 'Ronnie Peterson', 'Sweden', 'SWE'),
        seat('march-brambilla', 'march', 'Vittorio Brambilla', 'Italy', 'ITA'),
        seat('williams-laffite', 'williams', 'Jacques Laffite', 'France', 'FRA'),
        seat('tyrrell-depailler', 'tyrrell', 'Patrick Depailler', 'France', 'FRA'),
        seat('shadow-pryce', 'shadow', 'Tom Pryce', 'Great Britain', 'GBR'),
        seat('shadow-jarier', 'shadow', 'Jean-Pierre Jarier', 'France', 'FRA'),
        seat('surtees-watson', 'surtees', 'John Watson', 'Great Britain', 'GBR'),
        seat('penske-donohue', 'penske', 'Mark Donohue', 'United States', 'USA'),
        seat('hill-brise', 'hill', 'Tony Brise', 'Great Britain', 'GBR'),
        seat('march-lombardi', 'march', 'Lella Lombardi', 'Italy', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1975, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'rt_zolder' },
      sessionLengths: [{ session: 'grand-prix', laps: 70 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: { id: 'ks_zandvoort' },
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      sessionLengths: [{ session: 'grand-prix', laps: 14 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'italy',
      name: 'Italian Grand Prix',
      track: { id: 'monza' },
      sessionLengths: [{ session: 'grand-prix', laps: 52 }],
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'boot_classic' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 96, aiLevelMin: 88, aiAggression: 30 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [55000, 35000, 23000, 16000, 12000, 8500],
    standings: [360000, 215000, 140000, 95000, 62000],
  },
};
