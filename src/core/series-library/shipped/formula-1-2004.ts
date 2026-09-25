import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of 2004: two practices, a Saturday practice, one-lap
 * qualifying - one hour here, since a grid is set from one session - and the
 * race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 60, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 45, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 2004 - the Ferrari F2004's season, thirteen wins from eighteen.
 *
 * The real entry list on the 2004 spec, which is the Ferrari 70th pack's F2004
 * and nothing else, so every seat drives one. Fourteen of the eighteen rounds
 * at their real distances, from Sepang to Interlagos; Barcelona runs the
 * layout without its later chicane, and where a circuit has changed since, the
 * laps cover the real race's distance. Melbourne, Monaco, Indianapolis,
 * Hockenheim and Suzuka are not in Assetto Corsa.
 *
 * Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2004_Formula_One_World_Championship
 */
export const FORMULA_1_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2004',
  name: 'Formula 1 2004',
  description: 'The Ferrari F2004\'s season, with the real entry list in the F2004 and fourteen of its '
    + 'grands prix at their real distances.',
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'Italy', 'ITA', TeamBudget.WORKS),
    team('bar', 'Lucky Strike BAR Honda', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('renault', 'Mild Seven Renault F1 Team', 'France', 'FRA', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('sauber', 'Sauber Petronas', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
    team('jaguar', 'Jaguar Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('toyota', 'Panasonic Toyota Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('jordan', 'Jordan Ford', 'Ireland', 'IRL', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Cosworth', 'Italy', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('fer-schumacher', 'ferrari', 'Michael Schumacher', 'Germany', 'GER'),
        seat('fer-barrichello', 'ferrari', 'Rubens Barrichello', 'Brazil', 'BRA'),
        seat('bar-button', 'bar', 'Jenson Button', 'Great Britain', 'GBR'),
        seat('ren-alonso', 'renault', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('wil-montoya', 'williams', 'Juan Pablo Montoya', 'Colombia', 'COL'),
        seat('ren-trulli', 'renault', 'Jarno Trulli', 'Italy', 'ITA'),
        seat('mcl-raikkonen', 'mclaren', 'Kimi Räikkönen', 'Finland', 'FIN'),
        seat('bar-sato', 'bar', 'Takuma Sato', 'Japan', 'JPN'),
        seat('wil-schumacher', 'williams', 'Ralf Schumacher', 'Germany', 'GER'),
        seat('mcl-coulthard', 'mclaren', 'David Coulthard', 'Great Britain', 'GBR'),
        seat('sau-fisichella', 'sauber', 'Giancarlo Fisichella', 'Italy', 'ITA'),
        seat('sau-massa', 'sauber', 'Felipe Massa', 'Brazil', 'BRA'),
        seat('jag-webber', 'jaguar', 'Mark Webber', 'Australia', 'AUS'),
        seat('toy-panis', 'toyota', 'Olivier Panis', 'France', 'FRA'),
        seat('toy-da-matta', 'toyota', 'Cristiano da Matta', 'Brazil', 'BRA'),
        seat('jag-klien', 'jaguar', 'Christian Klien', 'Austria', 'AUT'),
        seat('jor-heidfeld', 'jordan', 'Nick Heidfeld', 'Germany', 'GER'),
        seat('jor-pantano', 'jordan', 'Giorgio Pantano', 'Italy', 'ITA'),
        seat('min-baumgartner', 'minardi', 'Zsolt Baumgartner', 'Hungary', 'HUN'),
        seat('min-bruni', 'minardi', 'Gianmaria Bruni', 'Italy', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2004, minModels: 1 },
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
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: { id: 'ks_barcelona', layout: 'layout_moto' },
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
    },
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
      climate: Climate.OCEANIC,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
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
  grid: { strength: 5, aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [90000, 60000, 42000, 30000, 22000, 16000, 12000, 8000],
    standings: [600000, 360000, 240000, 160000, 100000],
  },
};
