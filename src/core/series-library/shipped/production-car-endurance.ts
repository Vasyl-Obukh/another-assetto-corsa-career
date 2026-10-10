import { seat, team } from './utils.ts';
import { Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Production Car Endurance - road cars racing in classes, on the Bathurst 6
 * Hour's class rules.
 *
 * Production-car endurance racing is real and the classes are its own: the
 * Bathurst 6 Hour and Australia's production car series put the BMW M3 and M4
 * and the V8 Mustang in their top classes, and six-cylinder coupes like the 1M
 * a class below. The base game's cars fall into those two classes on their own
 * figures, the Giulia and the Corvette - which no production series named -
 * ballasted into the upper one.
 *
 * The series itself is invented: hour-long races, and a finale at the Bathurst
 * 6 Hour itself.
 *
 * Sources: https://en.wikipedia.org/wiki/Bathurst_6_Hour,
 * https://bathurst6hour.com.au/2024/03/29/explaining-the-bathurst-6-hour-classes/
 */
export const PRODUCTION_CAR_ENDURANCE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'production-car-endurance',
  name: 'Production Car Endurance',
  description: 'Road cars racing in two classes on the Bathurst 6 Hour\'s class rules: 140 km races '
    + 'and the Bathurst 6 Hour as the finale. The series is invented; its classes are real.',
  teams: [
    team('bavaria', 'Bavaria Road Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('mountain', 'Mountain Straight Motorsport', 'AUS', TeamBudget.INDEPENDENT),
    team('conrod', 'Conrod Racing', 'AUS', TeamBudget.PRIVATEER),
    team('kemmel', 'Kemmel Endurance', 'BEL', TeamBudget.PRIVATEER),
    team('woodcote', 'Woodcote Garage', 'GBR', TeamBudget.PRIVATEER),
    team('lesmo', 'Lesmo Corse', 'ITA', TeamBudget.PRIVATEER),
    team('salinas', 'Salinas Road Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'class-x',
      name: 'Class X/A',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('x-bav-1', 'bavaria', 'Florian Hechenberger', 'DEU'),
        seat('x-bav-2', 'bavaria', 'Lukas Weinzierl', 'DEU'),
        seat('x-mou-1', 'mountain', 'Brodie Kellaway', 'AUS'),
        seat('x-mou-2', 'mountain', 'Jayce Tolhurst', 'AUS'),
        seat('x-con-1', 'conrod', 'Mitchell Dunleavy', 'AUS'),
        seat('x-con-2', 'conrod', 'Tahlia Rourke', 'AUS'),
        seat('x-kem-1', 'kemmel', 'Jens Vercauteren', 'BEL'),
        seat('x-woo-1', 'woodcote', 'Harvey Ellingham', 'GBR'),
        seat('x-les-1', 'lesmo', 'Matteo Cattaneo', 'ITA'),
        seat('x-les-2', 'lesmo', 'Federica Lodigiani', 'ITA'),
        seat('x-sal-1', 'salinas', 'Cody Brennerman', 'USA'),
        seat('x-sal-2', 'salinas', 'Dale Oberholtzer', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_bmw_m4',
          'ks_bmw_m4_akrapovic',
          'bmw_m3_e92',
          'ks_ford_mustang_2015',
          'ks_corvette_c7_stingray',
          'ks_alfa_giulia_qv',
        ],
      },
      // The class runs at about 3.7 kg per horsepower, where the M4 and the
      // Mustang sit; the three quicker cars are brought to it.
      bop: [
        { car: 'ks_bmw_m4_akrapovic', ballast: 50 },
        { car: 'ks_corvette_c7_stingray', ballast: 80, restrictor: 5 },
        { car: 'ks_alfa_giulia_qv', ballast: 60, restrictor: 10 },
      ],
      grid: { strength: -1 },
    },
    {
      id: 'class-b',
      name: 'Class B',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('b-bav-1', 'bavaria', 'Tobias Aigner', 'DEU'),
        seat('b-mou-1', 'mountain', 'Liam Castellano', 'AUS'),
        seat('b-con-1', 'conrod', 'Nathan Pearce-Hill', 'AUS'),
        seat('b-kem-1', 'kemmel', 'Stien Martens', 'BEL'),
        seat('b-kem-2', 'kemmel', 'Pieter-Jan Coolen', 'BEL'),
        seat('b-woo-1', 'woodcote', 'Georgina Swale', 'GBR'),
        seat('b-woo-2', 'woodcote', 'Nathaniel Crisp', 'GBR'),
        seat('b-les-1', 'lesmo', 'Riccardo Tosetti', 'ITA'),
        seat('b-sal-1', 'salinas', 'Travis Holcombe', 'USA'),
        seat('b-sal-2', 'salinas', 'Marisol Arredondo', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['bmw_1m', 'bmw_z4', 'lotus_evora_s'] },
      // The Evora is the light car of the three.
      bop: [{ car: 'lotus_evora_s', ballast: 60, restrictor: 5 }],
      grid: { strength: -4 },
      prizes: {
        positions: [4800, 3350, 2400, 1800, 1300, 950, 700, 550, 350, 200],
        standings: [36000, 21500, 14500, 9500, 6000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'One hour',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        { type: 'race', name: 'Race', distance: 140, day: 1 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 131, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: { id: 'ks_laguna_seca' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'bathurst',
      name: 'Bathurst 6 Hour',
      track: { id: 'rt_bathurst' },
      eventFormat: 'six-hours',
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2500,
  prizes: {
    positions: [8000, 5600, 4000, 3000, 2200, 1600, 1200, 900, 600, 350],
    standings: [60000, 36000, 24000, 16000, 10000],
  },
};
