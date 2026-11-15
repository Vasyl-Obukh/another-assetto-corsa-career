import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Porsche Mobil 1 Supercup, 2025 - Formula 1's one-make support series, on the
 * 992 GT3 Cup.
 *
 * The Porsche Cup 992 (LFM) spec, which is LFM's 911 GT3 Cup; the 992s of URD
 * and Guerilla are specs of their own. The eight European grands prix it
 * supported, as understood rather than checked: Imola, Monaco, Barcelona, the
 * Red Bull Ring, Spa, the Hungaroring, Zandvoort and Monza, one race each.
 * Monaco races the
 * 17 laps of a full race there, on monaco_2020's layouts - the older monaco mod has
 * twenty-two boxes for twenty-four cars. The real races run half an hour and a
 * lap, which Assetto Corsa cannot time offline, so the race is the 75 km that
 * covers at Cup pace. The base circuits' twenty-four boxes cap a grid that runs
 * past thirty.
 *
 * Points are 25-20-17-14-12-10-9-8-7-6-5-4-3-2-1, the table as understood
 * rather than checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2025_Porsche_Supercup
 */
export const PORSCHE_SUPERCUP_2025: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'porsche-supercup-2025',
  name: 'Porsche Supercup 2025',
  description: {
    en: 'Formula 1\'s one-make support series of 2025 on LFM\'s 911 GT3 Cup: eight European grands '
      + 'prix, one race each.',
    uk: 'Монокубок підтримки Формули-1 сезону 2025 на 911 GT3 Cup від LFM: вісім європейських Гран-прі, по '
      + 'одній гонці на кожному.',
  },
  teams: [
    team('elbflorenz', 'Elbflorenz Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('taunus', 'Taunus Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('kempen', 'Kempen Racing', 'NLD', TeamBudget.INDEPENDENT),
    team('veluwe', 'Veluwe Motorsport', 'NLD', TeamBudget.INDEPENDENT),
    team('garrigue', 'Garrigue Racing', 'FRA', TeamBudget.PRIVATEER),
    team('ardeche', 'Ardèche Racing', 'FRA', TeamBudget.PRIVATEER),
    team('verbano', 'Scuderia Verbano', 'ITA', TeamBudget.PRIVATEER),
    team('wachau', 'Wachau Racing', 'AUT', TeamBudget.PRIVATEER),
    team('jura', 'Jura Motorsport', 'CHE', TeamBudget.PRIVATEER),
    team('kattegat', 'Kattegat Racing', 'DNK', TeamBudget.PRIVATEER),
    team('surrey-hills', 'Surrey Hills Racing', 'GBR', TeamBudget.PRIVATEER),
    team('tasman-cup', 'Tasman Cup Racing', 'AUS', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'supercup',
      name: 'Supercup',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('elb-1', 'elbflorenz', 'Leon Dittrich', 'DEU'),
        seat('elb-2', 'elbflorenz', 'Hannes Wenzke', 'DEU'),
        seat('tau-1', 'taunus', 'Jonathan Kronauer', 'DEU'),
        seat('tau-2', 'taunus', 'Moritz Hailer', 'DEU'),
        seat('kem-1', 'kempen', 'Thijmen Rutjes', 'NLD'),
        seat('kem-2', 'kempen', 'Luc Wildenburg', 'NLD'),
        seat('vel-1', 'veluwe', 'Stan Harmsen', 'NLD'),
        seat('vel-2', 'veluwe', 'Koen Drijfhout', 'NLD'),
        seat('gar-1', 'garrigue', 'Nathan Estève', 'FRA'),
        seat('gar-2', 'garrigue', 'Clément Aurousseau', 'FRA'),
        seat('ard-1', 'ardeche', 'Enzo Chabrier', 'FRA'),
        seat('ard-2', 'ardeche', 'Louis Vernoux', 'FRA'),
        seat('ver-1', 'verbano', 'Giacomo Tamborini', 'ITA'),
        seat('ver-2', 'verbano', 'Filippo Bertagnoli', 'ITA'),
        seat('wac-1', 'wachau', 'Felix Kremsner', 'AUT'),
        seat('wac-2', 'wachau', 'David Leutgeb', 'AUT'),
        seat('jur-1', 'jura', 'Maxime Chételat', 'CHE'),
        seat('jur-2', 'jura', 'Timothée Rérat', 'CHE'),
        seat('kat-1', 'kattegat', 'Oliver Skaarup', 'DNK'),
        seat('kat-2', 'kattegat', 'Magnus Høgh', 'DNK'),
        seat('sur-1', 'surrey-hills', 'Charlie Fenwick', 'GBR'),
        seat('sur-2', 'surrey-hills', 'Max Pilbeam', 'GBR'),
        seat('tas-1', 'tasman-cup', 'Josh Burrowes', 'AUS'),
        seat('tas-2', 'tasman-cup', 'Riley Fairbairn', 'AUS'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.PORSCHE_CUP_992_LFM },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { id: 'race', type: 'race', name: 'Race', distance: 75, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'imola', name: 'Imola', track: recommendedTrack('imola/gp') },
    {
      id: 'monaco',
      name: 'Monaco',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'race', laps: 17 }],
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'barcelona', name: 'Barcelona', track: recommendedTrack('barcelona/gp') },
    {
      id: 'spielberg',
      name: 'Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    { id: 'budapest', name: 'Hungaroring', track: recommendedTrack('hungaroring/gp'), climate: Climate.TEMPERATE },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 20, 17, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
