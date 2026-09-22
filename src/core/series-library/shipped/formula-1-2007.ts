import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2007: three practices, the three-part
 * knockout, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, day: 1 },
    {
      id: 'q2',
      type: 'qualify',
      name: 'Q2',
      minutes: 15,
      day: 1,
      inherit: { from: 'q1', top: 16 },
    },
    {
      id: 'q3',
      type: 'qualify',
      name: 'Q3',
      minutes: 15,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2007 - Kimi Räikkönen's title by a single point.
 *
 * The real entry list on VRC's Formula Alpha 2007, its Ferrenzo F07 and
 * McLenna MC22 - the Ferrari and the McLaren in all but name - every seat in
 * whichever is installed. Fifteen of seventeen rounds at their real distances,
 * Fuji's Japanese Grand Prix among them; Silverstone has changed since, so its
 * laps cover the real race's distance. Melbourne, Monaco and Indianapolis are
 * not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty-two cars cut to sixteen and
 * then to ten. Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2007_Formula_One_World_Championship
 */
export const FORMULA_1_2007: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2007',
  name: 'Formula 1 2007',
  description: 'Kimi Räikkönen\'s title by a point, with the real entry list in VRC\'s Formula Alpha 2007 '
    + 'and fifteen of its grands prix at their real distances.',
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'Italy', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Vodafone McLaren Mercedes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('bmw-sauber', 'BMW Sauber F1 Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('renault', 'ING Renault F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('williams', 'AT&T Williams', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('red-bull', 'Red Bull Racing', 'Austria', 'AUT', TeamBudget.INDEPENDENT),
    team('toyota', 'Panasonic Toyota Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('toro-rosso', 'Scuderia Toro Rosso', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('honda', 'Honda Racing F1 Team', 'Japan', 'JPN', TeamBudget.WORKS),
    team('super-aguri', 'Super Aguri F1 Team', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('spyker', 'Etihad Aldar Spyker F1 Team', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'Finland', 'FIN'),
        seat('mclaren-hamilton', 'mclaren', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('mclaren-alonso', 'mclaren', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'Brazil', 'BRA'),
        seat('bmw-sauber-heidfeld', 'bmw-sauber', 'Nick Heidfeld', 'Germany', 'GER'),
        seat('bmw-sauber-kubica', 'bmw-sauber', 'Robert Kubica', 'Poland', 'POL'),
        seat('renault-kovalainen', 'renault', 'Heikki Kovalainen', 'Finland', 'FIN'),
        seat('renault-fisichella', 'renault', 'Giancarlo Fisichella', 'Italy', 'ITA'),
        seat('williams-rosberg', 'williams', 'Nico Rosberg', 'Germany', 'GER'),
        seat('red-bull-coulthard', 'red-bull', 'David Coulthard', 'Great Britain', 'GBR'),
        seat('williams-wurz', 'williams', 'Alexander Wurz', 'Austria', 'AUT'),
        seat('red-bull-webber', 'red-bull', 'Mark Webber', 'Australia', 'AUS'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'Italy', 'ITA'),
        seat('toro-rosso-vettel', 'toro-rosso', 'Sebastian Vettel', 'Germany', 'GER'),
        seat('honda-button', 'honda', 'Jenson Button', 'Great Britain', 'GBR'),
        seat('toyota-schumacher', 'toyota', 'Ralf Schumacher', 'Germany', 'GER'),
        seat('toro-rosso-liuzzi', 'toro-rosso', 'Vitantonio Liuzzi', 'Italy', 'ITA'),
        seat('super-aguri-sato', 'super-aguri', 'Takuma Sato', 'Japan', 'JPN'),
        seat('super-aguri-davidson', 'super-aguri', 'Anthony Davidson', 'Great Britain', 'GBR'),
        seat('honda-barrichello', 'honda', 'Rubens Barrichello', 'Brazil', 'BRA'),
        seat('spyker-sutil', 'spyker', 'Adrian Sutil', 'Germany', 'GER'),
        seat('spyker-albers', 'spyker', 'Christijan Albers', 'Netherlands', 'NED'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2007, minModels: 1 },
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
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: { id: 'ks_barcelona', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 65 }],
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
      id: 'europe',
      name: 'European Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
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
      id: 'japan',
      name: 'Japanese Grand Prix',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 67 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
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
