import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * F4 CEZ Championship, 2025 - Formula 4 for the Central European Zone.
 *
 * RSS's Formula RSS 4 2024 is the car, the Tatuus F4-T421 the series has run
 * since it began. Six rounds: the Red Bull Ring twice and the Salzburgring as
 * raced, and the Hungaroring, the Salzburgring again and the Hungaroring again
 * in place of Most, the Slovakia Ring and Brno, which are not in Assetto Corsa;
 * the Hungaroring held rounds in 2023 and 2026. Three races a round: the first
 * from qualifying, the second from the first, and the third from the first
 * with the top six reversed - the real number, four to eight, was drawn by
 * lot. Twenty-four cars make the grid.
 *
 * The real races run 25 minutes, 60 km at Formula 4 pace. The
 * second-generation car races a rung above the first, on the Bronze rung, so
 * each is 75 km, about a quarter longer. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap. The field is invented.
 *
 * Source: https://feederseries.net/2025/04/09/f4-cez-2024-season-guide-2
 */
export const F4_CEZ_2025: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'f4-cez-2025',
  name: 'F4 CEZ Championship 2025',
  description: {
    en: 'Central European Formula 4 on RSS\'s Formula RSS 4 2024: three races a round, one of them '
      + 'from a reversed grid, in Austria and Hungary.',
    uk: 'Центральноєвропейська Формула-4 на Formula RSS 4 2024 від RSS: три гонки за етап, одна з них '
      + 'зі зворотної стартової решітки, в Австрії та Угорщині.',
  },
  teams: [
    team('vltava', 'Vltava Racing', 'CZE', TeamBudget.INDEPENDENT),
    team('morava', 'Morava Motorsport', 'CZE', TeamBudget.PRIVATEER),
    team('tatra', 'Tatra Junior Team', 'SVK', TeamBudget.PRIVATEER),
    team('donau', 'Donau Racing', 'AUT', TeamBudget.INDEPENDENT),
    team('alpenland', 'Alpenland Motorsport', 'AUT', TeamBudget.PRIVATEER),
    team('puszta', 'Puszta Racing', 'HUN', TeamBudget.PRIVATEER),
    team('jura', 'Jura Formula', 'CHE', TeamBudget.INDEPENDENT),
    team('oder', 'Oder Racing', 'POL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 4 },
      seats: [
        seat('vlt-1', 'vltava', 'Matyáš Horáček', 'CZE'),
        seat('vlt-2', 'vltava', 'Vojtěch Kubíček', 'CZE'),
        seat('vlt-3', 'vltava', 'Adam Šindelář', 'CZE'),
        seat('mor-1', 'morava', 'Tobiáš Zedník', 'CZE'),
        seat('mor-2', 'morava', 'Ondřej Valenta', 'CZE'),
        seat('mor-3', 'morava', 'Jakub Hrubý', 'CZE'),
        seat('tat-1', 'tatra', 'Samuel Kováčik', 'SVK'),
        seat('tat-2', 'tatra', 'Matej Hudec', 'SVK'),
        seat('tat-3', 'tatra', 'Lukáš Ďurčo', 'SVK'),
        seat('don-1', 'donau', 'Felix Haberl', 'AUT'),
        seat('don-2', 'donau', 'Jonas Eibl', 'AUT'),
        seat('don-3', 'donau', 'Valentin Pirker', 'AUT'),
        seat('alp-1', 'alpenland', 'Elias Gruber', 'AUT'),
        seat('alp-2', 'alpenland', 'Maximilian Straka', 'AUT'),
        seat('alp-3', 'alpenland', 'Paul Hinterleitner', 'AUT'),
        seat('pus-1', 'puszta', 'Bence Halmos', 'HUN'),
        seat('pus-2', 'puszta', 'Levente Csizmadia', 'HUN'),
        seat('pus-3', 'puszta', 'Áron Takáts', 'HUN'),
        seat('jur-1', 'jura', 'Nils Imboden', 'CHE'),
        seat('jur-2', 'jura', 'Mattia Bernasconi', 'CHE'),
        seat('jur-3', 'jura', 'Julien Monnier', 'CHE'),
        seat('odr-1', 'oder', 'Filip Kaczmarczyk', 'POL'),
        seat('odr-2', 'oder', 'Wiktor Żmuda', 'POL'),
        seat('odr-3', 'oder', 'Jan Ostrowiak', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_2 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 75,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 75,
          day: 2,
          inherit: { from: 'race-1' },
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 75,
          day: 2,
          inherit: { from: 'race-1', reverse: 6 },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'spielberg', name: 'Red Bull Ring', track: recommendedTrack('red-bull-ring/gp') },
    { id: 'spielberg-2', name: 'Red Bull Ring 2', track: recommendedTrack('red-bull-ring/gp') },
    { id: 'salzburgring', name: 'Salzburgring', track: recommendedTrack('salzburgring/full') },
    { id: 'hungaroring', name: 'Hungaroring', track: recommendedTrack('hungaroring/gp') },
    { id: 'salzburgring-2', name: 'Salzburgring 2', track: recommendedTrack('salzburgring/full') },
    { id: 'hungaroring-2', name: 'Hungaroring 2', track: recommendedTrack('hungaroring/gp') },
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
  entryFee: 2250,
  prizes: {
    positions: [12000, 8400, 6000, 4600, 3450, 2650, 1950, 1450, 1000, 600],
    standings: [96000, 60000, 38250, 25500, 15750],
  },
};
