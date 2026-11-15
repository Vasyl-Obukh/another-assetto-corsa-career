import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * American Le Mans Series, 2013 - its last season, the GT class alone.
 *
 * The GTE (2013) spec is URD's EGT cars of the season: the Bayro, the
 * Corvette C6.R, the Darche, the Ferruccio and the Venom stand for the BMW Z4
 * GTE, the Corvette, the Porsche 911 RSR, the Ferrari 458 and the SRT Viper
 * that raced the class, and the Valor for the Aston Martin. The prototype
 * classes have no cars of the season, so this is the GT class alone, the way
 * ILMC_2011_GTE races the base game's GTEs. Eight of ten rounds - the Sebring
 * 12 Hours, Long Beach, Laguna Seca's six hours, Lime Rock, Road America, the
 * Circuit of the Americas, VIR and Petit Le Mans. Mosport and Baltimore have
 * no recommended track. The race lengths are the real races' hours turned
 * into laps at GTE pace, not the laps the class covered.
 *
 * Points are 20-16-13-10-8-6-4-3-2-1 with a point for pole, as understood
 * rather than checked. The field is invented, the EGT Championship's paddock.
 *
 * Source: https://en.wikipedia.org/wiki/2013_American_Le_Mans_Series
 */
export const ALMS_2013_GT: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'alms-2013-gt',
  name: 'American Le Mans Series 2013 GT',
  description: {
    en: 'The GT class of the American Le Mans Series\' last season on URD\'s EGT cars: eight rounds '
      + 'from the Sebring 12 Hours to Petit Le Mans.',
    uk: 'Клас GT останнього сезону American Le Mans Series на машинах EGT від URD: вісім етапів від '
      + '12 годин Себрінга до Petit Le Mans.',
  },
  teams: [
    team('arrowhead', 'Arrowhead Endurance', 'GBR', TeamBudget.WORKS),
    team('donau', 'Donau Racing', 'DEU', TeamBudget.WORKS),
    team('rubicone', 'Scuderia Rubicone', 'ITA', TeamBudget.WORKS),
    team('route-66', 'Route Sixty-Six Racing', 'USA', TeamBudget.WORKS),
    team('neckar', 'Neckar Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('loire', 'Loire Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('pacific-rim', 'Pacific Rim Racing', 'USA', TeamBudget.INDEPENDENT),
    team('laurentian', 'Laurentian Racing', 'CAN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('arr-1', 'arrowhead', 'Edward Halsbury', 'GBR'),
        seat('arr-2', 'arrowhead', 'Samuel Crowther', 'GBR'),
        seat('don-1', 'donau', 'Maximilian Straubinger', 'DEU'),
        seat('don-2', 'donau', 'Leonhard Irlbacher', 'DEU'),
        seat('rub-1', 'rubicone', 'Giulio Santarcangeli', 'ITA'),
        seat('rub-2', 'rubicone', 'Nicola Verucchi', 'ITA'),
        seat('rou-1', 'route-66', 'Hunter Blankenship', 'USA'),
        seat('rou-2', 'route-66', 'Mason Tedrick', 'USA'),
        seat('nec-1', 'neckar', 'Jonas Eisenlohr', 'DEU'),
        seat('nec-2', 'neckar', 'Pascal Wohlfahrt', 'DEU'),
        seat('loi-1', 'loire', 'Victor Aubineau', 'FRA'),
        seat('loi-2', 'loire', 'Rémi Pelletan', 'FRA'),
        seat('pac-1', 'pacific-rim', 'Kai Ashford', 'USA'),
        seat('pac-2', 'pacific-rim', 'Dylan Ybarra', 'USA'),
        seat('lau-1', 'laurentian', 'Olivier Bergevin', 'CAN'),
        seat('lau-2', 'laurentian', 'Samuel Pouliot', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2013 },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Two hours forty-five',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { id: 'race', type: 'race', name: 'Race', laps: 88, day: 1 },
      ],
    },
    {
      id: 'endurance',
      name: 'Endurance',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 1 },
        { id: 'race', type: 'race', name: 'Race', laps: 330, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'sprint',
  rounds: [
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: recommendedTrack('sebring/full'),
      eventFormat: 'endurance',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'long-beach',
      name: 'Long Beach',
      track: recommendedTrack('long-beach/street'),
      sessionLengths: [{ session: 'race', laps: 75 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'laguna-seca',
      name: 'Monterey, six hours',
      track: recommendedTrack('laguna-seca/full'),
      eventFormat: 'endurance',
      sessionLengths: [{ session: 'race', laps: 230 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'lime-rock',
      name: 'Lime Rock Park',
      track: recommendedTrack('lime-rock/full'),
      sessionLengths: [{ session: 'race', laps: 175 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America, four hours',
      track: recommendedTrack('road-america/full'),
      sessionLengths: [{ session: 'race', laps: 105 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      sessionLengths: [{ session: 'race', laps: 75 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: recommendedTrack('vir/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'petit-le-mans',
      name: 'Petit Le Mans',
      track: recommendedTrack('road-atlanta/gp'),
      eventFormat: 'endurance',
      sessionLengths: [{ session: 'race', laps: 380 }],
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 16, 13, 10, 8, 6, 4, 3, 2, 1], qualifying: [1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
