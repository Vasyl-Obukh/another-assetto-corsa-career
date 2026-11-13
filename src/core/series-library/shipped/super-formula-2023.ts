import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Super Formula event: practice on Saturday morning, two-part qualifying
 * in the afternoon, and the race on Sunday.
 */
const EVENT: EventFormat = {
  id: 'standard',
  name: 'Standard',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 90, day: 0 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 10, day: 1 },
    { id: 'q2', type: 'qualify', name: 'Q2', minutes: 7, day: 1, inherit: { from: 'q1', top: 12 } },
    { id: 'race', type: 'race', name: 'Race', distance: 185, day: 2, inherit: { from: 'q2' } },
  ],
};

/**
 * Super Formula, 2023 - the first season of the SF23, built for closer racing.
 *
 * RSS's Formula RSS Supreme 25 is that car. Three of nine rounds are on a
 * circuit Assetto Corsa has, and all three at Fuji: the opening double header
 * and the summer round. Suzuka, Autopolis, Sportsland SUGO and Motegi are not
 * in Assetto Corsa. Race lengths are the series' usual ones at Fuji rather
 * than checked round by round; the compulsory tyre change cannot be stated
 * yet. Qualifying is two parts, twenty-two cars cut to twelve.
 *
 * Points are 20-15-11-8-6-5-4-3-2-1 with a point for pole; whether 2023 paid
 * more for pole was not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023_Super_Formula_Championship
 */
export const SUPER_FORMULA_2023: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'super-formula-2023',
  name: 'Super Formula 2023',
  description: {
    en: 'Japan\'s top single-seater series on RSS\'s Formula RSS Supreme 25, the SF23: the three '
      + 'rounds of its 2023 season that Assetto Corsa has, all at Fuji.',
    uk: 'Найвища японська формульна серія на Formula RSS Supreme 25 від RSS, тобто SF23: три етапи '
      + 'сезону 2023, наявні в Assetto Corsa, усі на Фудзі.',
  },
  teams: [
    team('aoba', 'Team Aoba', 'JPN', TeamBudget.WORKS),
    team('shinano', 'Shinano Racing', 'JPN', TeamBudget.WORKS),
    team('kyushu', 'Kyushu Speed', 'JPN', TeamBudget.INDEPENDENT),
    team('hokuto', 'Hokuto Motorsport', 'JPN', TeamBudget.INDEPENDENT),
    team('seto', 'Seto Inland Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('kaminari', 'Kaminari Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('tsubame', 'Tsubame Formula', 'JPN', TeamBudget.PRIVATEER),
    team('asagiri', 'Asagiri Racing', 'JPN', TeamBudget.PRIVATEER),
    team('biwako', 'Biwako Racing', 'JPN', TeamBudget.PRIVATEER),
    team('izumo', 'Izumo Motorsport', 'JPN', TeamBudget.PRIVATEER),
    team('shirakawa', 'Shirakawa Racing', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-formula',
      name: 'Super Formula',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('aob-1', 'aoba', 'Soma Kuribayashi', 'JPN'),
        seat('aob-2', 'aoba', 'Hinata Okabe', 'JPN'),
        seat('shi-1', 'shinano', 'Ryunosuke Oikawa', 'JPN'),
        seat('shi-2', 'shinano', 'Kaede Morooka', 'JPN'),
        seat('kyu-1', 'kyushu', 'Kenshin Hamaguchi', 'JPN'),
        seat('kyu-b-1', 'kyushu', 'Tomasz Wilkoszewski', 'POL'),
        seat('hok-1', 'hokuto', 'Kosuke Yamagiwa', 'JPN'),
        seat('hok-2', 'hokuto', 'Asahi Kurokami', 'JPN'),
        seat('set-1', 'seto', 'Genki Awashima', 'JPN'),
        seat('set-b-1', 'seto', 'Liam Cordner', 'AUS'),
        seat('kam-1', 'kaminari', 'Taiga Mitarai', 'JPN'),
        seat('kam-2', 'kaminari', 'Eita Nobuoka', 'JPN'),
        seat('tsu-1', 'tsubame', 'Itsuki Hanazono', 'JPN'),
        seat('tsu-2', 'tsubame', 'Riku Tsujimoto', 'JPN'),
        seat('asa-1', 'asagiri', 'Yuma Sonobe', 'JPN'),
        seat('asa-b-1', 'asagiri', 'Felipe Arantes', 'BRA'),
        seat('biw-1', 'biwako', 'Kei Horiuchi', 'JPN'),
        seat('biw-2', 'biwako', 'Sota Imagawa', 'JPN'),
        seat('izu-1', 'izumo', 'Daigo Fukunaga', 'JPN'),
        seat('izu-b-1', 'izumo', 'Mathis Ferreol', 'FRA'),
        seat('shr-1', 'shirakawa', 'Yuto Kasamatsu', 'JPN'),
        seat('shr-2', 'shirakawa', 'Haruma Shinozuka', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.SUPER_FORMULA_2023 },
    },
  ],
  eventFormats: [
    EVENT,
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'fuji-1',
      name: 'Fuji Speedway, round 1',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji-2',
      name: 'Fuji Speedway, round 2',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji-6',
      name: 'Fuji Speedway, round 6',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 15, 11, 8, 6, 5, 4, 3, 2, 1], qualifying: [1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4, aggression: 10 },
  generatedWeather: { climate: Climate.TEMPERATE },
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
