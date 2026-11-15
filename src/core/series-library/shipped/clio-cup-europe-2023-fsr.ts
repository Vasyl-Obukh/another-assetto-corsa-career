import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Clio Cup Europe, 2023 - Renault's one-make touring car series, on First
 * Studio Race's Clio Cup.
 *
 * The nine meetings that scored for Clio Cup Europe, of the Clio Cup Series'
 * thirteen, in the real order - Monza, Spa, the Hungaroring, the Nurburgring,
 * the Red Bull Ring, Valencia, Zandvoort, Imola and Barcelona; the opening
 * Nogaro round scored for France and Spain alone. Two races a meeting, both
 * lining up on qualifying; how the real second race's grid was set was not
 * checked. Races of 25 minutes and a lap, as understood, run 60 km.
 *
 * Points are the overall classification's 50-42-36-33-30-27-24-22-20-18-16-
 * 14-12-10-8-6-4-3-2-1; the two worst scores were dropped, which cannot be
 * stated. The Red Bull Ring's twenty-four boxes cap a field that ran over
 * forty. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023_Renault_Clio_Cup_Series
 */
export const CLIO_CUP_EUROPE_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'clio-cup-europe-2023-fsr',
  name: 'Clio Cup Europe 2023 (FSR)',
  description: {
    en: 'Renault\'s one-make touring car series on First Studio Race\'s Clio Cup: nine meetings of '
      + 'two races at Europe\'s Grand Prix circuits.',
    uk: 'Монокубок Renault з турингових гонок на Clio Cup від First Studio Race: дев\'ять етапів по '
      + 'дві гонки на європейських трасах Гран-прі.',
  },
  teams: [
    team('armorique', 'Armorique Racing', 'FRA', TeamBudget.PRIVATEER),
    team('ardennes', 'Ardennes Motorsport', 'BEL', TeamBudget.PRIVATEER),
    team('brianza', 'Brianza Corse', 'ITA', TeamBudget.PRIVATEER),
    team('meseta', 'Meseta Racing', 'ESP', TeamBudget.PRIVATEER),
    team('veluwe', 'Veluwe Racing', 'NLD', TeamBudget.PRIVATEER),
    team('balaton', 'Balaton Motorsport', 'HUN', TeamBudget.PRIVATEER),
    team('vltava', 'Vltava Racing', 'CZE', TeamBudget.PRIVATEER),
    team('mosel', 'Mosel Motorsport', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'clio-cup',
      name: 'Clio Cup',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('arm-1', 'armorique', 'Yannick Le Goff', 'FRA'),
        seat('arm-2', 'armorique', 'Maël Kerbrat', 'FRA'),
        seat('arm-3', 'armorique', 'Antoine Plourin', 'FRA'),
        seat('ard-1', 'ardennes', 'Gilles Vanderhaegen', 'BEL'),
        seat('ard-2', 'ardennes', 'Thibault Malmedy', 'BEL'),
        seat('ard-3', 'ardennes', 'Jens Peeterbroeck', 'BEL'),
        seat('bri-1', 'brianza', 'Matteo Seregni', 'ITA'),
        seat('bri-2', 'brianza', 'Davide Lissone', 'ITA'),
        seat('bri-3', 'brianza', 'Lorenzo Carate', 'ITA'),
        seat('mes-1', 'meseta', 'Álvaro Peñafiel', 'ESP'),
        seat('mes-2', 'meseta', 'Iker Arandilla', 'ESP'),
        seat('mes-3', 'meseta', 'Pau Solsona', 'ESP'),
        seat('vel-1', 'veluwe', 'Daan Apeldoorn', 'NLD'),
        seat('vel-2', 'veluwe', 'Ruben Harderwijk', 'NLD'),
        seat('vel-3', 'veluwe', 'Thijs Ermelo', 'NLD'),
        seat('bal-1', 'balaton', 'Bence Fonyódi', 'HUN'),
        seat('bal-2', 'balaton', 'Zsolt Keszthelyi', 'HUN'),
        seat('bal-3', 'balaton', 'Ádám Siófoki', 'HUN'),
        seat('vlt-1', 'vltava', 'Ondřej Budějovský', 'CZE'),
        seat('vlt-2', 'vltava', 'Marek Krumlovský', 'CZE'),
        seat('vlt-3', 'vltava', 'Kamil Wiśniewski', 'POL'),
        seat('mos-1', 'mosel', 'Lukas Bernkastel', 'DEU'),
        seat('mos-2', 'mosel', 'Felix Traben', 'DEU'),
        seat('mos-3', 'mosel', 'Tobias Zeller', 'AUT'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_clio_cup_2023'] },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          type: 'race', name: 'Race 1', distance: 60, day: 1, inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Race 2', distance: 60, day: 2, inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'monza',
      name: 'Monza',
      track: recommendedTrack('monza/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: recommendedTrack('spa/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'hungaroring',
      name: 'Hungaroring',
      track: recommendedTrack('hungaroring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'valencia',
      name: 'Valencia',
      track: recommendedTrack('valencia/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'imola',
      name: 'Imola',
      track: recommendedTrack('imola/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'barcelona',
      name: 'Barcelona',
      track: recommendedTrack('barcelona/gp'),
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [50, 42, 36, 33, 30, 27, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1800,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
