import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of the era: practice both days and the hour of
 * qualifying on Saturday. Friday's hour, whose best times counted too, is
 * not run.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 90, day: 0 },
    { type: 'practice', name: 'Saturday practice', minutes: 90, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 1991 - Ayrton Senna's third title, and Jordan's first season.
 *
 * The real entry list on VRC's Jordan 191, every seat in it - the season's
 * most admired newcomer as the whole grid. Cut to twenty-four by the Kunos
 * layouts' pit boxes: the drivers who started most of the season. Eleven of
 * sixteen rounds at their real distances, Barcelona's first grand prix among
 * them; where a circuit has changed since, the laps cover the real race's
 * distance. Phoenix, Monaco, Hockenheim, Suzuka and Adelaide are not in
 * Assetto Corsa.
 *
 * Points are 10-6-4-3-2-1, every result counting for the first time.
 *
 * Source: https://en.wikipedia.org/wiki/1991_Formula_One_World_Championship
 */
export const FORMULA_1_1991: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1991',
  name: 'Formula 1 1991',
  description: 'Ayrton Senna\'s third title, with the real entry list in VRC\'s Jordan 191 and eleven of its'
    + ' grands prix at their real distances.',
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('williams', 'Canon Williams Team', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Camel Benetton Ford', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Braun Tyrrell Honda', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('jordan', 'Team 7UP Jordan', 'Ireland', 'IRL', TeamBudget.INDEPENDENT),
    team('dallara', 'BMS Scuderia Italia', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('lotus', 'Team Lotus', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('larrousse', 'Larrousse F1', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('leyton-house', 'Leyton House Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('brabham', 'Motor Racing Developments', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('ligier', 'Ligier Gitanes', 'France', 'FRA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('mclaren-senna', 'mclaren', 'Ayrton Senna', 'Brazil', 'BRA'),
        seat('williams-mansell', 'williams', 'Nigel Mansell', 'Great Britain', 'GBR'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'Italy', 'ITA'),
        seat('mclaren-berger', 'mclaren', 'Gerhard Berger', 'Austria', 'AUT'),
        seat('ferrari-prost', 'ferrari', 'Alain Prost', 'France', 'FRA'),
        seat('benetton-piquet', 'benetton', 'Nelson Piquet', 'Brazil', 'BRA'),
        seat('ferrari-alesi', 'ferrari', 'Jean Alesi', 'France', 'FRA'),
        seat('tyrrell-modena', 'tyrrell', 'Stefano Modena', 'Italy', 'ITA'),
        seat('jordan-cesaris', 'jordan', 'Andrea de Cesaris', 'Italy', 'ITA'),
        seat('benetton-moreno', 'benetton', 'Roberto Moreno', 'Brazil', 'BRA'),
        seat('jordan-gachot', 'jordan', 'Bertrand Gachot', 'Belgium', 'BEL'),
        seat('dallara-lehto', 'dallara', 'JJ Lehto', 'Finland', 'FIN'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'Italy', 'ITA'),
        seat('tyrrell-nakajima', 'tyrrell', 'Satoru Nakajima', 'Japan', 'JPN'),
        seat('lotus-hakkinen', 'lotus', 'Mika Häkkinen', 'Finland', 'FIN'),
        seat('larrousse-suzuki', 'larrousse', 'Aguri Suzuki', 'Japan', 'JPN'),
        seat('larrousse-bernard', 'larrousse', 'Éric Bernard', 'France', 'FRA'),
        seat('dallara-pirro', 'dallara', 'Emanuele Pirro', 'Italy', 'ITA'),
        seat('minardi-morbidelli', 'minardi', 'Gianni Morbidelli', 'Italy', 'ITA'),
        seat('leyton-house-capelli', 'leyton-house', 'Ivan Capelli', 'Italy', 'ITA'),
        seat('leyton-house-gugelmin', 'leyton-house', 'Maurício Gugelmin', 'Brazil', 'BRA'),
        seat('brabham-brundle', 'brabham', 'Martin Brundle', 'Great Britain', 'GBR'),
        seat('brabham-blundell', 'brabham', 'Mark Blundell', 'Great Britain', 'GBR'),
        seat('ligier-boutsen', 'ligier', 'Thierry Boutsen', 'Belgium', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1991, minModels: 1 },
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
    },
    { id: 'san-marino', name: 'San Marino Grand Prix', track: { id: 'imola' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
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
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    {
      id: 'portugal',
      name: 'Portuguese Grand Prix',
      track: { id: 'estoril_2021', layout: 'estoril_no_chicane' },
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: { id: 'ks_barcelona', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 67 }],
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
