import { FORMULA_3_2024 } from './formula-3-2024.ts';
import { seat } from './utils.ts';
import { Hemisphere } from '../../../shared/types/index.ts';
import {
  CarSpec, Climate, Discipline,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat, SeriesSession } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Practice on Friday, as every event opens.
 */
const PRACTICE: SeriesSession = { type: 'practice', name: 'Practice', minutes: 45, day: 0 };

/**
 * An event of the current format: practice and qualifying on Friday, on
 * Saturday a sprint with qualifying's top twelve reversed, and on Sunday the
 * feature race from qualifying as it stood.
 */
const EVENT: EventFormat = {
  id: 'standard',
  name: 'Sprint and feature',
  sessions: [
    PRACTICE,
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 80,
      day: 1,
      inherit: { from: 'qualifying', reverse: 12 },
      pointsSystem: 'sprint',
    },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 117,
      day: 2,
      inherit: { from: 'qualifying' },
      pointsSystem: 'feature',
    },
  ],
};

/**
 * The Madrid finale, given a second feature race for the lost Bahrain round:
 * two qualifying sessions on Friday, the first setting both of Saturday's
 * races and the second Sunday's feature race.
 */
const FINALE: EventFormat = {
  id: 'finale',
  name: 'Sprint and two features',
  sessions: [
    PRACTICE,
    { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
    { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 80,
      day: 1,
      inherit: { from: 'qualifying-1', reverse: 12 },
      pointsSystem: 'sprint',
    },
    {
      id: 'feature-1',
      type: 'race',
      name: 'Feature race 1',
      distance: 117,
      day: 1,
      inherit: { from: 'qualifying-1' },
      pointsSystem: 'feature',
    },
    {
      id: 'feature-2',
      type: 'race',
      name: 'Feature race 2',
      distance: 117,
      day: 2,
      inherit: { from: 'qualifying-2' },
      pointsSystem: 'feature',
    },
  ],
};

/**
 * FIA Formula 3, 2026 - the rung below Formula 2, on the same events, in the
 * second season of the current car.
 *
 * RSS's Formula RSS 3 2026 V6 is that car, the Dallara F3 2025; the 2019 car
 * races FIA Formula 3 2024. All nine rounds, each a sprint on Saturday
 * with qualifying's top twelve reversed and a feature race on Sunday from
 * qualifying; Bahrain was cancelled, and the Madrid finale ran a second
 * feature race from a second qualifying session in its place. The real grid
 * is thirty cars, three to a team; the Kunos layouts' twenty-four boxes hold
 * eight teams. The lengths are the 2024 championship's, worked out from the
 * series' usual distances rather than checked round by round, and Monaco
 * races 2024's 23 and 27 laps. Monaco needs monaco_2020's layouts, the older
 * monaco mod having 22 pit boxes.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each feature race, with 2 for pole and
 * 1 for the fastest lap, and 10-9-8-7-6-5-4-3-2-1 in the sprint, with 1 for
 * the fastest lap. The teams are those of the 2024 championship and the field
 * is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2026_FIA_Formula_3_Championship
 */
export const FORMULA_3_2026: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-3-2026',
  name: 'FIA Formula 3 2026',
  description: {
    en: 'FIA Formula 3 on RSS\'s Formula RSS 3 2026 V6: nine rounds of a reverse-grid sprint and'
      + ' a feature race, with a second feature race at the Madrid finale, three cars to a team.',
    uk: 'FIA Formula 3 на Formula RSS 3 2026 V6 від RSS: дев\'ять етапів зі спринтом за зворотною '
      + 'стартовою решіткою та основною гонкою, з другою основною гонкою на фіналі в Мадриді, по три '
      + 'машини в команді.',
  },
  teams: FORMULA_3_2024.teams,
  entries: [
    {
      id: 'formula-3',
      name: 'Formula 3',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 3 },
      seats: [
        seat('gle-1', 'glenmore', 'Oscar Pemberton', 'GBR'),
        seat('gle-2', 'glenmore', 'Freddie Lockyer', 'GBR'),
        seat('gle-3', 'glenmore', 'Alfie Harcourt', 'GBR'),
        seat('lig-1', 'ligure', 'Gabriele Rapallini', 'ITA'),
        seat('lig-2', 'ligure', 'Tommaso Bertolotto', 'ITA'),
        seat('lig-3', 'ligure', 'Edoardo Massone', 'ITA'),
        seat('ard-1', 'ardennes', 'Maxime Lambotte', 'BEL'),
        seat('ard-2', 'ardennes', 'Louis Verhaegen', 'BEL'),
        seat('ard-3', 'ardennes', 'Nathan Dethier', 'BEL'),
        seat('nor-1', 'nordvik', 'William Engström', 'SWE'),
        seat('nor-2', 'nordvik', 'Isak Wallgren', 'SWE'),
        seat('nor-3', 'nordvik', 'Viktor Ahlqvist', 'SWE'),
        seat('pac-1', 'pacifica', 'Logan Pettibone', 'USA'),
        seat('pac-2', 'pacifica', 'Hunter Ashcombe', 'USA'),
        seat('pac-3', 'pacifica', 'Cole Brannigan', 'USA'),
        seat('alc-1', 'alcazar', 'Diego Arrieta', 'ESP'),
        seat('alc-2', 'alcazar', 'Mateo Villalonga', 'ESP'),
        seat('alc-3', 'alcazar', 'Álvaro Recuenco', 'ESP'),
        seat('eif-1', 'eifel', 'Finn Ostermann', 'DEU'),
        seat('eif-2', 'eifel', 'Leon Kaltenbach', 'DEU'),
        seat('eif-3', 'eifel', 'Moritz Ebeling', 'DEU'),
        seat('sou-1', 'southern-cross', 'Hamish Ballantyne', 'NZL'),
        seat('sou-2', 'southern-cross', 'Archer Tuhiwai', 'NZL'),
        seat('sou-3', 'southern-cross', 'Toby McCrostie', 'NZL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_3_2025 },
    },
  ],
  eventFormats: [EVENT, FINALE],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'albert-park',
      name: 'Albert Park',
      track: recommendedTrack('albert-park/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'monaco',
      name: 'Monaco',
      track: recommendedTrack('monaco/gp'),
      // 2024's lap counts.
      sessionLengths: [{ session: 'sprint', laps: 23 }, { session: 'feature', laps: 27 }],
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'barcelona', name: 'Barcelona', track: recommendedTrack('barcelona/gp') },
    {
      id: 'spielberg',
      name: 'Spielberg',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    {
      id: 'budapest',
      name: 'Budapest',
      track: recommendedTrack('hungaroring/gp'),
      sessionLengths: [{ session: 'sprint', laps: 18 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    {
      id: 'madrid',
      name: 'Madrid',
      track: recommendedTrack('madring/gp'),
      eventFormat: 'finale',
    },
  ],
  pointsSystems: [
    {
      id: 'feature',
      name: 'Feature race',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [2],
    },
    { id: 'sprint', name: 'Sprint race', positions: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], fastestLap: 1 },
  ],
  defaultPointsSystem: 'feature',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
