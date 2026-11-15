import { F4_CEZ_2025 } from './f4-cez-2025.ts';
import { seat } from './utils.ts';
import {
  CarSpec, Climate, Discipline,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * ACCR Formula 4 Trophy, 2022 - the season before the F4 CEZ Championship,
 * run as a trophy when delivery delays held the new cars back.
 *
 * The Tatuus F4-T014 raced in its Trophy class beside the new F4-T421; RSS's
 * Formula RSS 4 is the T014 and fields the grid. The calendar is the season as
 * planned, seven rounds: the Hungaroring, cancelled, the Red Bull Ring, and
 * Vallelunga and Monza, both cancelled, as written; the Salzburgring, the Red
 * Bull Ring again and the Hungaroring again in place of Grobnik, the Slovakia
 * Ring and Brno, which are not in Assetto Corsa. Two races a round, both from
 * qualifying. The real trophy drew a handful of cars; twenty-four make the
 * grid.
 *
 * Races are 60 km, a judgement: the real lengths were not found. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap. The teams are those of the 2025 F4 CEZ Championship and the field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2022_ACCR_Formula_4_Trophy
 */
export const ACCR_F4_2022: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'accr-f4-2022',
  name: 'ACCR Formula 4 Trophy 2022',
  description: {
    en: 'Central European Formula 4 on RSS\'s Formula RSS 4, the season before the F4 CEZ: two races a '
      + 'round in Austria, Hungary and Italy.',
    uk: 'Центральноєвропейська Формула-4 на Formula RSS 4 від RSS, сезон перед F4 CEZ: дві гонки за '
      + 'етап в Австрії, Угорщині та Італії.',
  },
  teams: F4_CEZ_2025.teams,
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      seats: [
        seat('vlt-1', 'vltava', 'Dominik Pešek', 'CZE'),
        seat('vlt-2', 'vltava', 'Štěpán Kolář', 'CZE'),
        seat('vlt-3', 'vltava', 'Martin Doležal', 'CZE'),
        seat('mor-1', 'morava', 'Patrik Vybíral', 'CZE'),
        seat('mor-2', 'morava', 'Daniel Sklenář', 'CZE'),
        seat('mor-3', 'morava', 'Filip Navrátil', 'CZE'),
        seat('tat-1', 'tatra', 'Andrej Baláž', 'SVK'),
        seat('tat-2', 'tatra', 'Tomáš Gajdoš', 'SVK'),
        seat('tat-3', 'tatra', 'Michal Pavlík', 'SVK'),
        seat('don-1', 'donau', 'Lukas Wimmer', 'AUT'),
        seat('don-2', 'donau', 'Florian Aigner', 'AUT'),
        seat('don-3', 'donau', 'Tobias Rauscher', 'AUT'),
        seat('alp-1', 'alpenland', 'Niklas Brandstätter', 'AUT'),
        seat('alp-2', 'alpenland', 'Simon Pichler', 'AUT'),
        seat('alp-3', 'alpenland', 'Moritz Leitgeb', 'AUT'),
        seat('pus-1', 'puszta', 'Dávid Kerekes', 'HUN'),
        seat('pus-2', 'puszta', 'Márton Vadász', 'HUN'),
        seat('pus-3', 'puszta', 'Gergő Szalontai', 'HUN'),
        seat('jur-1', 'jura', 'Loris Chappatte', 'CHE'),
        seat('jur-2', 'jura', 'Gian Caduff', 'CHE'),
        seat('jur-3', 'jura', 'Remo Truffer', 'CHE'),
        seat('odr-1', 'oder', 'Kacper Piątek', 'POL'),
        seat('odr-2', 'oder', 'Hubert Wilczyński', 'POL'),
        seat('odr-3', 'oder', 'Oskar Zalewski', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_1 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 60,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 60,
          day: 2,
          inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'hungaroring', name: 'Hungaroring', track: recommendedTrack('hungaroring/gp') },
    { id: 'spielberg', name: 'Red Bull Ring', track: recommendedTrack('red-bull-ring/gp') },
    {
      id: 'vallelunga',
      name: 'Vallelunga',
      track: recommendedTrack('vallelunga/full'),
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'salzburgring', name: 'Salzburgring', track: recommendedTrack('salzburgring/full') },
    { id: 'spielberg-2', name: 'Red Bull Ring 2', track: recommendedTrack('red-bull-ring/gp') },
    { id: 'hungaroring-2', name: 'Hungaroring 2', track: recommendedTrack('hungaroring/gp') },
    {
      id: 'monza',
      name: 'Monza',
      track: recommendedTrack('monza/gp'),
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
