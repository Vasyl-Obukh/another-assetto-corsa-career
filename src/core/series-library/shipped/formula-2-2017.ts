import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Formula 2 weekend of the era: practice and qualifying on Friday, the
 * feature race on Saturday, and on Sunday a sprint with the feature race's top
 * eight reversed.
 */
const WEEKEND: WeekendFormat = {
  id: 'race-weekend',
  name: 'Feature and sprint',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 170,
      day: 1,
      inherit: { from: 'qualifying' },
      pointsSystem: 'feature',
    },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 120,
      day: 2,
      inherit: { from: 'feature', reverse: 8 },
      pointsSystem: 'sprint',
    },
  ],
};

/**
 * FIA Formula 2, 2017 - the first season under the name, on the GP2 car it
 * inherited.
 *
 * RSS's Formula RSS 2 is that car. Eight of eleven rounds, each a feature race
 * and a sprint at their real lengths - the sprint from the feature race's
 * result with the top eight reversed. Monaco, Baku and Jerez are not in
 * Assetto Corsa. The feature race's compulsory pit stop cannot be stated yet.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in the feature race, with 4 for pole and
 * 2 for the fastest lap, and 15-12-10-8-6-4-2-1 in the sprint, with 2 for the
 * fastest lap. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2017_FIA_Formula_2_Championship
 */
export const FORMULA_2_2017: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-2-2017',
  name: 'FIA Formula 2 2017',
  description: 'The first season of FIA Formula 2, on RSS\'s Formula RSS 2: eight rounds of a feature '
    + 'race and a reverse-grid sprint, at their real lengths.',
  teams: [
    team('arcadia', 'Arcadia Motorsport', 'Italy', 'ITA', TeamBudget.WORKS),
    team('north-sea', 'North Sea Racing', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('lumen', 'Lumen Grand Prix', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('volga', 'Volga Racing Team', 'Russia', 'RUS', TeamBudget.INDEPENDENT),
    team('meridian', 'Meridian Motorsport', 'Spain', 'ESP', TeamBudget.INDEPENDENT),
    team('kestrel', 'Kestrel Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('lagunare', 'Scuderia Lagunare', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('bergfeld', 'Bergfeld Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('orion', 'Orion Formula', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('costa-azul', 'Costa Azul Racing', 'Portugal', 'POR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-2',
      name: 'Formula 2',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('arc-1', 'arcadia', 'Matteo Casalegno', 'Italy', 'ITA'),
        seat('arc-2', 'arcadia', 'Alvise Fornari', 'Italy', 'ITA'),
        seat('nsr-1', 'north-sea', 'Joost Brinkhorst', 'Netherlands', 'NED'),
        seat('nsr-2', 'north-sea', 'Daan Oosterveld', 'Netherlands', 'NED'),
        seat('lum-1', 'lumen', 'Anatole Rivière', 'France', 'FRA'),
        seat('lum-2', 'lumen', 'Maxence Dutertre', 'France', 'FRA'),
        seat('vol-1', 'volga', 'Kirill Zhdanovsky', 'Russia', 'RUS'),
        seat('vol-2', 'volga', 'Timur Belozerov', 'Russia', 'RUS'),
        seat('mer-1', 'meridian', 'Íñigo Larrañeta', 'Spain', 'ESP'),
        seat('mer-2', 'meridian', 'Pau Casademunt', 'Spain', 'ESP'),
        seat('kes-1', 'kestrel', 'Rory Hepplewhite', 'Great Britain', 'GBR'),
        seat('kes-2', 'kestrel', 'Oliver Pendleford', 'Great Britain', 'GBR'),
        seat('lag-1', 'lagunare', 'Nicolò Barbarigo', 'Italy', 'ITA'),
        seat('lag-b-1', 'lagunare', 'Rafael Quintanilha', 'Brazil', 'BRA'),
        seat('ber-1', 'bergfeld', 'Jonas Wetterich', 'Germany', 'GER'),
        seat('ber-2', 'bergfeld', 'Linus Harnisch', 'Germany', 'GER'),
        seat('ori-1', 'orion', 'Ethan Makepeace', 'Great Britain', 'GBR'),
        seat('ori-b-1', 'orion', 'Arjun Venkatraman', 'India', 'IND'),
        seat('cos-1', 'costa-azul', 'Duarte Meireles', 'Portugal', 'POR'),
        seat('cos-2', 'costa-azul', 'Tomás Albergaria', 'Portugal', 'POR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_2_2017, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'bahrain', name: 'Sakhir', track: { id: 'fn_bahrain', layout: 'gp' }, climate: Climate.ARID },
    { id: 'barcelona', name: 'Barcelona', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'spielberg',
      name: 'Spielberg',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'budapest',
      name: 'Budapest',
      track: { id: 'rt_hungaroring' },
      sessionLengths: [{ session: 'feature', laps: 37 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      sessionLengths: [{ session: 'sprint', laps: 21 }],
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    {
      id: 'feature',
      name: 'Feature race',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 2,
      qualifying: [4],
    },
    { id: 'sprint', name: 'Sprint race', positions: [15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 2 },
  ],
  defaultPointsSystem: 'feature',
  grid: { strength: 3, aggression: 15 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
