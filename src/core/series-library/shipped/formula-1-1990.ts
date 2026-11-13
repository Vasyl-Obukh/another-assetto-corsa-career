import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 1990: practice both days and the hour of
 * qualifying on Saturday. Friday's hour, whose best times counted too, is
 * not run.
 */
const EVENT: EventFormat = {
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
 * Formula 1, 1990 - Ayrton Senna's second title, settled at Suzuka's first corner.
 *
 * The real entry list on RSS's Formula 1990, its V12 and V10 between them, cut
 * to twenty by Silverstone's pit boxes: the drivers who started most of the
 * season. Nine of sixteen rounds at their real distances. Interlagos, Imola,
 * Silverstone before its rebuild, Spa and Monza run their real laps or near
 * them; Montreal, Mexico City, the Hungaroring and Estoril have changed since,
 * so their laps cover the real distance. Phoenix, Monaco, Paul Ricard,
 * Hockenheim, Jerez, Suzuka and Adelaide are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1, counting a driver's best eleven, which a points
 * system cannot say yet.
 *
 * Source: https://en.wikipedia.org/wiki/1990_Formula_One_World_Championship
 */
export const FORMULA_1_1990: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1990',
  name: 'Formula 1 1990',
  description: {
    en: 'Ayrton Senna\'s second title season, with the real entry list on RSS\'s Formula 1990 and '
      + 'nine of its grands prix at their real distances.',
    uk: 'Сезон другого титулу Айртона Сенни зі справжнім списком учасників на Formula 1990 '
      + 'від RSS і дев\'ятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Benetton Formula', 'GBR', TeamBudget.WORKS),
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('leyton-house', 'Leyton House Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('larrousse', 'Espo Larrousse F1', 'FRA', TeamBudget.PRIVATEER),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.PRIVATEER),
    team('lotus', 'Camel Team Lotus', 'GBR', TeamBudget.INDEPENDENT),
    team('dallara', 'BMS Scuderia Italia', 'ITA', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('mclaren-senna', 'mclaren', 'Ayrton Senna', 'BRA'),
        seat('ferrari-prost', 'ferrari', 'Alain Prost', 'FRA'),
        seat('benetton-piquet', 'benetton', 'Nelson Piquet', 'BRA'),
        seat('mclaren-berger', 'mclaren', 'Gerhard Berger', 'AUT'),
        seat('ferrari-mansell', 'ferrari', 'Nigel Mansell', 'GBR'),
        seat('williams-boutsen', 'williams', 'Thierry Boutsen', 'BEL'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'ITA'),
        seat('benetton-nannini', 'benetton', 'Alessandro Nannini', 'ITA'),
        seat('tyrrell-alesi', 'tyrrell', 'Jean Alesi', 'FRA'),
        seat('leyton-house-capelli', 'leyton-house', 'Ivan Capelli', 'ITA'),
        seat('larrousse-suzuki', 'larrousse', 'Aguri Suzuki', 'JPN'),
        seat('larrousse-bernard', 'larrousse', 'Éric Bernard', 'FRA'),
        seat('tyrrell-nakajima', 'tyrrell', 'Satoru Nakajima', 'JPN'),
        seat('brabham-modena', 'brabham', 'Stefano Modena', 'ITA'),
        seat('lotus-warwick', 'lotus', 'Derek Warwick', 'GBR'),
        seat('leyton-house-gugelmin', 'leyton-house', 'Maurício Gugelmin', 'BRA'),
        seat('lotus-donnelly', 'lotus', 'Martin Donnelly', 'GBR'),
        seat('dallara-cesaris', 'dallara', 'Andrea de Cesaris', 'ITA'),
        seat('dallara-pirro', 'dallara', 'Emanuele Pirro', 'ITA'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1990 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    { id: 'san-marino', name: 'San Marino Grand Prix', track: { id: 'imola' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
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
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
