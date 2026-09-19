import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of the era: practice both days and Saturday's hour of
 * qualifying, twelve laps a driver.
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
 * Formula 1, 1997 - Jacques Villeneuve's title, settled at Jerez.
 *
 * The real entry list on VRC's Ferrari F310B and Williams FW19 - the two cars
 * that fought for the title - every seat in whichever of them is installed.
 * Michael Schumacher keeps his seat, though he was excluded from the standings
 * afterwards. Eleven of seventeen rounds at their real distances, the A1-Ring
 * on the Red Bull Ring's layout; where a circuit has changed since, the laps
 * cover the real race's distance. Melbourne, Buenos Aires, Monaco, Hockenheim,
 * Suzuka and Jerez are not in Assetto Corsa.
 *
 * Points are 10-6-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/1997_Formula_One_World_Championship
 */
export const FORMULA_1_1997: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1997',
  name: 'Formula 1 1997',
  description: 'Jacques Villeneuve\'s title season, with the real entry list in VRC\'s F310B and FW19 and '
    + 'eleven of its grands prix at their real distances.',
  teams: [
    team('williams', 'Rothmans Williams Renault', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'Italy', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('benetton', 'Mild Seven Benetton Renault', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('jordan', 'B&H Total Jordan Peugeot', 'Ireland', 'IRL', TeamBudget.INDEPENDENT),
    team('prost', 'Prost Gauloises Blondes', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('sauber', 'Red Bull Sauber Petronas', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
    team('arrows', 'Danka Arrows Yamaha', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('stewart', 'Stewart Ford', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Tyrrell', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'Italy', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('williams-villeneuve', 'williams', 'Jacques Villeneuve', 'Canada', 'CAN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'Germany', 'GER'),
        seat('williams-frentzen', 'williams', 'Heinz-Harald Frentzen', 'Germany', 'GER'),
        seat('mclaren-coulthard', 'mclaren', 'David Coulthard', 'Great Britain', 'GBR'),
        seat('benetton-alesi', 'benetton', 'Jean Alesi', 'France', 'FRA'),
        seat('benetton-berger', 'benetton', 'Gerhard Berger', 'Austria', 'AUT'),
        seat('mclaren-hakkinen', 'mclaren', 'Mika Häkkinen', 'Finland', 'FIN'),
        seat('ferrari-irvine', 'ferrari', 'Eddie Irvine', 'Great Britain', 'GBR'),
        seat('jordan-fisichella', 'jordan', 'Giancarlo Fisichella', 'Italy', 'ITA'),
        seat('prost-panis', 'prost', 'Olivier Panis', 'France', 'FRA'),
        seat('sauber-herbert', 'sauber', 'Johnny Herbert', 'Great Britain', 'GBR'),
        seat('jordan-schumacher', 'jordan', 'Ralf Schumacher', 'Germany', 'GER'),
        seat('arrows-hill', 'arrows', 'Damon Hill', 'Great Britain', 'GBR'),
        seat('stewart-barrichello', 'stewart', 'Rubens Barrichello', 'Brazil', 'BRA'),
        seat('tyrrell-salo', 'tyrrell', 'Mika Salo', 'Finland', 'FIN'),
        seat('stewart-magnussen', 'stewart', 'Jan Magnussen', 'Denmark', 'DEN'),
        seat('arrows-diniz', 'arrows', 'Pedro Diniz', 'Brazil', 'BRA'),
        seat('prost-nakano', 'prost', 'Shinji Nakano', 'Japan', 'JPN'),
        seat('tyrrell-verstappen', 'tyrrell', 'Jos Verstappen', 'Netherlands', 'NED'),
        seat('minardi-katayama', 'minardi', 'Ukyo Katayama', 'Japan', 'JPN'),
        seat('minardi-trulli', 'minardi', 'Jarno Trulli', 'Italy', 'ITA'),
        seat('sauber-larini', 'sauber', 'Nicola Larini', 'Italy', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1997, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 72 }],
      climate: Climate.TEMPERATE,
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
      track: { id: 'ks_barcelona', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 65 }],
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'france',
      name: 'French Grand Prix',
      track: { id: 'magnycours22' },
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
      climate: Climate.TEMPERATE,
    },
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
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'luxembourg',
      name: 'Luxembourg Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 6, 4, 3, 2, 1] },
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
