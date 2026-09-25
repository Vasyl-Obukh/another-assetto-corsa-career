import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Porsche Mobil 1 Supercup, 2021 - the first season of the 992 GT3 Cup.
 *
 * The Porsche Cup 992 (URD) spec, which is URD's Darche 992 Cup - the 911 GT3
 * Cup under a made-up name; the 992s of LFM and Guerilla are specs of their
 * own. Six of its races, as understood rather than checked: two at the Red
 * Bull Ring, then the Hungaroring, Spa, Zandvoort and Monza. Monaco is not in
 * Assetto Corsa. The real races run half an hour and a lap, which Assetto
 * Corsa cannot time offline, so the race is the 75 km that covers at Cup pace.
 * The
 * base circuits' twenty-four boxes cap the grid.
 *
 * Points are 25-20-17-14-12-10-9-8-7-6-5-4-3-2-1, the table as understood
 * rather than checked. The field is invented, and is the same paddock as the
 * 2025 season's.
 *
 * Source: https://en.wikipedia.org/wiki/2021_Porsche_Supercup
 */
export const PORSCHE_SUPERCUP_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'porsche-supercup-2021',
  name: 'Porsche Supercup 2021',
  description: 'The Supercup\'s first 992 season on URD\'s Darche 992 Cup: six races supporting Formula '
    + '1\'s European rounds.',
  teams: [
    team('elbflorenz', 'Elbflorenz Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('taunus', 'Taunus Motorsport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('kempen', 'Kempen Racing', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('veluwe', 'Veluwe Motorsport', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('garrigue', 'Garrigue Racing', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('ardeche', 'Ardèche Racing', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('verbano', 'Scuderia Verbano', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('wachau', 'Wachau Racing', 'Austria', 'AUT', TeamBudget.PRIVATEER),
    team('jura', 'Jura Motorsport', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('kattegat', 'Kattegat Racing', 'Denmark', 'DEN', TeamBudget.PRIVATEER),
    team('surrey-hills', 'Surrey Hills Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('tasman-cup', 'Tasman Cup Racing', 'Australia', 'AUS', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'supercup',
      name: 'Supercup',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('elb-1', 'elbflorenz', 'Leon Dittrich', 'Germany', 'GER'),
        seat('elb-2', 'elbflorenz', 'Hannes Wenzke', 'Germany', 'GER'),
        seat('tau-1', 'taunus', 'Jonathan Kronauer', 'Germany', 'GER'),
        seat('tau-2', 'taunus', 'Moritz Hailer', 'Germany', 'GER'),
        seat('kem-1', 'kempen', 'Thijmen Rutjes', 'Netherlands', 'NED'),
        seat('kem-2', 'kempen', 'Luc Wildenburg', 'Netherlands', 'NED'),
        seat('vel-1', 'veluwe', 'Stan Harmsen', 'Netherlands', 'NED'),
        seat('vel-2', 'veluwe', 'Koen Drijfhout', 'Netherlands', 'NED'),
        seat('gar-1', 'garrigue', 'Nathan Estève', 'France', 'FRA'),
        seat('gar-2', 'garrigue', 'Clément Aurousseau', 'France', 'FRA'),
        seat('ard-1', 'ardeche', 'Enzo Chabrier', 'France', 'FRA'),
        seat('ard-2', 'ardeche', 'Louis Vernoux', 'France', 'FRA'),
        seat('ver-1', 'verbano', 'Giacomo Tamborini', 'Italy', 'ITA'),
        seat('ver-2', 'verbano', 'Filippo Bertagnoli', 'Italy', 'ITA'),
        seat('wac-1', 'wachau', 'Felix Kremsner', 'Austria', 'AUT'),
        seat('wac-2', 'wachau', 'David Leutgeb', 'Austria', 'AUT'),
        seat('jur-1', 'jura', 'Maxime Chételat', 'Switzerland', 'SUI'),
        seat('jur-2', 'jura', 'Timothée Rérat', 'Switzerland', 'SUI'),
        seat('kat-1', 'kattegat', 'Oliver Skaarup', 'Denmark', 'DEN'),
        seat('kat-2', 'kattegat', 'Magnus Høgh', 'Denmark', 'DEN'),
        seat('sur-1', 'surrey-hills', 'Charlie Fenwick', 'Great Britain', 'GBR'),
        seat('sur-2', 'surrey-hills', 'Max Pilbeam', 'Great Britain', 'GBR'),
        seat('tas-1', 'tasman-cup', 'Josh Burrowes', 'Australia', 'AUS'),
        seat('tas-2', 'tasman-cup', 'Riley Fairbairn', 'Australia', 'AUS'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.PORSCHE_CUP_992_URD, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { type: 'race', name: 'Race', distance: 75, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    {
      id: 'spielberg',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spielberg-2',
      name: 'Red Bull Ring, second race',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    { id: 'budapest', name: 'Hungaroring', track: { id: 'rt_hungaroring' }, climate: Climate.TEMPERATE },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 20, 17, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
