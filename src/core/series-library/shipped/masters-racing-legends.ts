import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Masters Racing Legends - today's historic championship for three-litre
 * Formula 1 cars of 1966 to 1985.
 *
 * A championship of now for cars of then, which is why it starts switched off
 * with the seasons its cars raced. Masters classes its grid by era and scores
 * each class on its own: the Stewart class for cars before 1972 - here the
 * Lotus 49 and the 72D - and the Fittipaldi class for the cars that followed,
 * up to ground effect, which is the Ferrari 312T. The event is Masters' own: one
 * qualifying and two 25-minute races.
 *
 * The 2025 calendar, less Paul Ricard and Hockenheim, which are not in Assetto
 * Corsa: Brands Hatch, Zandvoort, the Nurburgring, Silverstone and Yas Marina.
 * The field is invented, since the real one is private owners. The points are
 * the 25-18-15 scale: Masters' own table was not found. Zandvoort's eighteen
 * boxes cap the grid.
 *
 * Sources: https://www.mastershistoricracing.com/en/race-serie/masters-racing-legends/,
 * https://racingcalendar.net/championship/fia-masters-historic-formula-one-championship/2025
 */
export const MASTERS_RACING_LEGENDS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'masters-racing-legends',
  name: 'Masters Racing Legends',
  description: {
    en: 'Today\'s historic championship for three-litre Formula 1 cars, classed by era: the '
      + 'Lotus 49 and 72D in the Stewart class, the Ferrari 312T in the Fittipaldi class. One '
      + 'qualifying and two 25-minute races a round.',
    uk: 'Сучасний історичний чемпіонат для трилітрових машин Формули-1 з класами за епохами: Lotus 49 і '
      + '72D у класі Стюарта, Ferrari 312T у класі Фіттіпальді. Одна кваліфікація та дві 25-хвилинні '
      + 'гонки за етап.',
  },
  teams: [
    team('cosworth-heritage', 'DFV Heritage Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('hethel-historic', 'Hethel Historic', 'GBR', TeamBudget.INDEPENDENT),
    team('scuderia-storica', 'Scuderia Storica', 'ITA', TeamBudget.INDEPENDENT),
    team('flat-twelve', 'Flat Twelve Racing', 'CHE', TeamBudget.PRIVATEER),
    team('classic-gp', 'Classic Grand Prix Cars', 'DEU', TeamBudget.PRIVATEER),
    team('gentlemen', 'Gentlemen Drivers Club', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'stewart',
      name: 'Stewart class',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('stw-dfv-1', 'cosworth-heritage', 'Alastair Pennycook', 'GBR'),
        seat('stw-dfv-2', 'cosworth-heritage', 'Rupert Aylmer', 'GBR'),
        seat('stw-het-1', 'hethel-historic', 'Nigel Stannard', 'GBR'),
        seat('stw-het-2', 'hethel-historic', 'Clive Bettany', 'GBR'),
        seat('stw-cgp-1', 'classic-gp', 'Heinrich Waldmann', 'DEU'),
        seat('stw-gen-1', 'gentlemen', 'Philippe de Vaulx', 'FRA'),
        seat('stw-sto-1', 'scuderia-storica', 'Umberto Castelnuovo', 'ITA'),
        seat('stw-cgp-2', 'classic-gp', 'Dieter Hohenstein', 'DEU'),
        seat('stw-gen-2', 'gentlemen', 'Olivier Marchadier', 'FRA'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_49', 'ks_lotus_72d'] },
    },
    {
      id: 'fittipaldi',
      name: 'Fittipaldi class',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('fit-sto-1', 'scuderia-storica', 'Federico Anzilotti', 'ITA'),
        seat('fit-sto-2', 'scuderia-storica', 'Claudio Venturelli', 'ITA'),
        seat('fit-flt-1', 'flat-twelve', 'Beat Zimmerli', 'CHE'),
        seat('fit-flt-2', 'flat-twelve', 'Marco Bernasconi', 'CHE'),
        seat('fit-dfv-1', 'cosworth-heritage', 'Julian Fotheringham', 'GBR'),
        seat('fit-het-1', 'hethel-historic', 'Andrew Sillitoe', 'GBR'),
        seat('fit-cgp-1', 'classic-gp', 'Georg Lindemayr', 'AUT'),
        seat('fit-gen-1', 'gentlemen', 'Jean-Marc Robichon', 'FRA'),
        seat('fit-gen-2', 'gentlemen', 'Henri Delorme', 'FRA'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_312t'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          classGrid: 'mixed',
          name: 'Race 1',
          distance: 70,
          day: 0,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Race 2', distance: 70, day: 1, inherit: { from: 'race-1' },
          classGrid: 'mixed',
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 8000,
  prizes: {
    positions: [20000, 14000, 10000, 7500, 5500, 4000, 3000, 2200, 1500, 900],
    standings: [140000, 85000, 55000, 36000, 22000],
  },
};
