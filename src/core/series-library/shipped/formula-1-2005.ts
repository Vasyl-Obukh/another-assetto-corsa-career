import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2005: practice both days and single-lap
 * qualifying. The aggregate of two sessions the season opened with is one
 * session here.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'practice', name: 'Saturday practice', minutes: 90, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 2005 - Fernando Alonso's first title, Renault against McLaren.
 *
 * The real entry list on VRC's McLaren MP4-20 and Renault R25 - the two cars
 * that fought for the title - every seat in whichever of them is installed.
 * Fourteen of nineteen rounds at their real distances; Silverstone has changed
 * since, so its laps cover the real race's distance. Melbourne, Monaco,
 * Indianapolis, Hockenheim and Suzuka are not in Assetto Corsa.
 *
 * Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2005_Formula_One_World_Championship
 */
export const FORMULA_1_2005: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2005',
  name: 'Formula 1 2005',
  description: 'Fernando Alonso\'s first title, with the real entry list in VRC\'s MP4-20 and R25 and '
    + 'fourteen of its grands prix at their real distances.',
  teams: [
    team('renault', 'Mild Seven Renault F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'Italy', 'ITA', TeamBudget.WORKS),
    team('toyota', 'Panasonic Toyota Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('bar', 'Lucky Strike BAR Honda', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('red-bull', 'Red Bull Racing', 'Austria', 'AUT', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber Petronas', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
    team('jordan', 'Jordan Toyota', 'Ireland', 'IRL', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Cosworth', 'Italy', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('renault-alonso', 'renault', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('mclaren-raikkonen', 'mclaren', 'Kimi Räikkönen', 'Finland', 'FIN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'Germany', 'GER'),
        seat('mclaren-montoya', 'mclaren', 'Juan Pablo Montoya', 'Colombia', 'COL'),
        seat('renault-fisichella', 'renault', 'Giancarlo Fisichella', 'Italy', 'ITA'),
        seat('toyota-schumacher', 'toyota', 'Ralf Schumacher', 'Germany', 'GER'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'Italy', 'ITA'),
        seat('ferrari-barrichello', 'ferrari', 'Rubens Barrichello', 'Brazil', 'BRA'),
        seat('bar-button', 'bar', 'Jenson Button', 'Great Britain', 'GBR'),
        seat('williams-webber', 'williams', 'Mark Webber', 'Australia', 'AUS'),
        seat('williams-heidfeld', 'williams', 'Nick Heidfeld', 'Germany', 'GER'),
        seat('red-bull-coulthard', 'red-bull', 'David Coulthard', 'Great Britain', 'GBR'),
        seat('sauber-massa', 'sauber', 'Felipe Massa', 'Brazil', 'BRA'),
        seat('sauber-villeneuve', 'sauber', 'Jacques Villeneuve', 'Canada', 'CAN'),
        seat('bar-sato', 'bar', 'Takuma Sato', 'Japan', 'JPN'),
        seat('red-bull-klien', 'red-bull', 'Christian Klien', 'Austria', 'AUT'),
        seat('jordan-monteiro', 'jordan', 'Tiago Monteiro', 'Portugal', 'POR'),
        seat('jordan-karthikeyan', 'jordan', 'Narain Karthikeyan', 'India', 'IND'),
        seat('minardi-albers', 'minardi', 'Christijan Albers', 'Netherlands', 'NED'),
        seat('minardi-friesacher', 'minardi', 'Patrick Friesacher', 'Austria', 'AUT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2005, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    { id: 'malaysia', name: 'Malaysian Grand Prix', track: { id: 'acu_sepang' }, climate: Climate.TEMPERATE },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'san-marino',
      name: 'San Marino Grand Prix',
      track: { id: 'imola' },
      sessionLengths: [{ session: 'grand-prix', laps: 62 }],
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'europe',
      name: 'European Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    { id: 'france', name: 'French Grand Prix', track: { id: 'magnycours22' }, climate: Climate.TEMPERATE },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 53 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: { id: 'rj_istanbul_park', layout: 'layout_f1_2005' },
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 97, aiLevelMin: 89, aiAggression: 40 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
