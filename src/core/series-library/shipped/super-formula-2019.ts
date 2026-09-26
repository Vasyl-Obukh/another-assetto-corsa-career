import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Super Formula weekend: practice on Saturday morning, the three-part
 * knockout in the afternoon, and the race on Sunday.
 */
const WEEKEND: WeekendFormat = {
  id: 'race-weekend',
  name: 'Race weekend',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 90, day: 0 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 20, day: 1 },
    { id: 'q2', type: 'qualify', name: 'Q2', minutes: 7, day: 1, inherit: { from: 'q1', top: 14 } },
    { id: 'q3', type: 'qualify', name: 'Q3', minutes: 7, day: 1, inherit: { from: 'q2', top: 8 } },
    { id: 'race', type: 'race', name: 'Race', distance: 250, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Super Formula, 2019 - the first season of the SF19.
 *
 * RSS's Formula RSS Supreme is that car. Only two of seven rounds are on
 * circuits Assetto Corsa has - Fuji and Okayama; Suzuka, Autopolis, Sportsland
 * SUGO and Motegi are not. Races run the series' usual 250 km or near it,
 * worked out per circuit rather than checked; the compulsory tyre change
 * cannot be stated yet. Qualifying is the three-part knockout, twenty cars cut
 * to fourteen and then to eight.
 *
 * Points are 20-15-11-8-6-5-4-3-2-1 with a point for pole. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_Super_Formula_Championship
 */
export const SUPER_FORMULA_2019: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'super-formula-2019',
  name: 'Super Formula 2019',
  description: 'Japan\'s top single-seater series on RSS\'s Formula RSS Supreme, the SF19: the two rounds '
    + 'of its 2019 season that Assetto Corsa has, at Fuji and Okayama.',
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
  ],
  entries: [
    {
      id: 'super-formula',
      name: 'Super Formula',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('aob-1', 'aoba', 'Takahiro Minegishi', 'JPN'),
        seat('aob-2', 'aoba', 'Soma Kuribayashi', 'JPN'),
        seat('shi-1', 'shinano', 'Yohei Tachibana', 'JPN'),
        seat('shi-2', 'shinano', 'Ryunosuke Oikawa', 'JPN'),
        seat('kyu-1', 'kyushu', 'Kenshin Hamaguchi', 'JPN'),
        seat('kyu-b-1', 'kyushu', 'Lorenzo Castellucci', 'ITA'),
        seat('hok-1', 'hokuto', 'Tetsuya Nishikiori', 'JPN'),
        seat('hok-2', 'hokuto', 'Kosuke Yamagiwa', 'JPN'),
        seat('set-1', 'seto', 'Genki Awashima', 'JPN'),
        seat('set-b-1', 'seto', 'Harrison Keel', 'NZL'),
        seat('kam-1', 'kaminari', 'Taiga Mitarai', 'JPN'),
        seat('kam-2', 'kaminari', 'Shunpei Kodama', 'JPN'),
        seat('tsu-1', 'tsubame', 'Itsuki Hanazono', 'JPN'),
        seat('tsu-2', 'tsubame', 'Masaya Kitajima', 'JPN'),
        seat('asa-1', 'asagiri', 'Yuma Sonobe', 'JPN'),
        seat('asa-b-1', 'asagiri', 'Felipe Arantes', 'BRA'),
        seat('biw-1', 'biwako', 'Kotaro Utsunomiya', 'JPN'),
        seat('biw-2', 'biwako', 'Kei Horiuchi', 'JPN'),
        seat('izu-1', 'izumo', 'Daigo Fukunaga', 'JPN'),
        seat('izu-b-1', 'izumo', 'Mathis Ferreol', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.SUPER_FORMULA_2019, minModels: 1 },
    },
  ],
  weekendFormats: [
    WEEKEND,
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    {
      id: 'fuji',
      name: 'Fuji Speedway',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'okayama',
      name: 'Okayama International Circuit',
      track: { id: 'okayama', layout: 'circuit_gp' },
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
