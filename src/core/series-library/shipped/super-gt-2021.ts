import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Super GT, 2021 - GT500 and GT300 on URD's cars.
 *
 * Both classes on one grid. GT500 is the GT500 2021 spec, URD's JT5 Moyoda,
 * Shiro and SNX standing for the Toyota GR Supra, the Nissan GT-R and the
 * Honda NSX that raced; GT300 the GT3 (URD) spec, where the real class mixed
 * GT3s with its own JAF-GT and mother-chassis cars. Four of eight rounds: 300
 * km at Okayama and Suzuka, the Fuji 500 km and the 300 km finale at Fuji.
 * Motegi, twice, Sugo and Autopolis have no recommended track. Okayama's and
 * Fuji's thirty-six boxes cap the grid, well short of the real class's thirty
 * GT300 cars.
 *
 * Super GT qualifies in two knockout stages, each driver of a crew taking one;
 * Assetto Corsa races one driver to a car, so each class has a single
 * qualifying. Points are 20-15-11-8-6-5-4-3-2-1 with a point for pole, as
 * understood rather than checked. The field is invented: a team to a car.
 *
 * Source: https://en.wikipedia.org/wiki/2021_Super_GT_Series
 */
export const SUPER_GT_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'super-gt-2021',
  name: 'Super GT 2021',
  description: {
    en: 'Japan\'s GT championship of 2021 on URD\'s cars: the JT5 GT500s and the GT3s of GT300 on '
      + 'one grid, at Okayama, Fuji and Suzuka.',
    uk: 'Японський чемпіонат GT 2021 року на машинах URD: GT500 серії JT5 та GT3 класу GT300 на '
      + 'одному старті, в Окаямі, Фудзі та Судзуці.',
  },
  teams: [
    team('omotesando', 'Team Omotesando', 'JPN', TeamBudget.WORKS),
    team('hakone', 'Hakone Racing', 'JPN', TeamBudget.WORKS),
    team('kanto', 'Kanto Motorsport', 'JPN', TeamBudget.WORKS),
    team('naniwa', 'Naniwa Racing', 'JPN', TeamBudget.WORKS),
    team('setouchi', 'Setouchi Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('tohoku', 'Tohoku Racing Team', 'JPN', TeamBudget.INDEPENDENT),
    team('kyushu', 'Kyushu Speed', 'JPN', TeamBudget.INDEPENDENT),
    team('hokuriku', 'Hokuriku Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('sapporo', 'Team Sapporo', 'JPN', TeamBudget.INDEPENDENT),
    team('shonan', 'Shonan Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('yokohama', 'Yokohama Bay Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('kobe', 'Kobe Port Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('tokai', 'Tokai GT', 'JPN', TeamBudget.INDEPENDENT),
    team('chiba', 'Chiba Racing Factory', 'JPN', TeamBudget.INDEPENDENT),
    team('kawaguchi', 'Kawaguchi Motorsport', 'JPN', TeamBudget.PRIVATEER),
    team('nagano', 'Nagano GT', 'JPN', TeamBudget.PRIVATEER),
    team('shikoku', 'Shikoku Racing', 'JPN', TeamBudget.PRIVATEER),
    team('hiroshima', 'Hiroshima Racing', 'JPN', TeamBudget.PRIVATEER),
    team('okinawa', 'Okinawa Racing', 'JPN', TeamBudget.PRIVATEER),
    team('gifu', 'Gifu Motorsport', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt500',
      name: 'GT500',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('500-omo-1', 'omotesando', 'Ryo Hirakawa', 'JPN'),
        seat('500-omo-2', 'omotesando', 'Sena Kitazawa', 'JPN'),
        seat('500-hak-1', 'hakone', 'Takumi Morioka', 'JPN'),
        seat('500-kan-1', 'kanto', 'Yuta Kunimoto', 'JPN'),
        seat('500-kan-2', 'kanto', 'Felipe Andrade', 'BRA'),
        seat('500-nan-1', 'naniwa', 'Kazuki Ohara', 'JPN'),
        seat('500-nan-2', 'naniwa', 'Shota Yamagishi', 'JPN'),
        seat('500-set-1', 'setouchi', 'Hiroki Nojima', 'JPN'),
        seat('500-toh-1', 'tohoku', 'Ren Sasamoto', 'JPN'),
        seat('500-kyu-1', 'kyushu', 'Tatsuya Yoshinaga', 'JPN'),
        seat('500-hok-1', 'hokuriku', 'Lorenzo Bellucci', 'ITA'),
        seat('500-sap-1', 'sapporo', 'Kaito Hayakawa', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT500_2021 },
    },
    {
      id: 'gt300',
      name: 'GT300',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('300-sho-1', 'shonan', 'Naoya Kusaka', 'JPN'),
        seat('300-sho-2', 'shonan', 'Jun Takenouchi', 'JPN'),
        seat('300-yok-1', 'yokohama', 'Masaki Oshiro', 'JPN'),
        seat('300-yok-2', 'yokohama', 'Daisuke Tachibana', 'JPN'),
        seat('300-kob-1', 'kobe', 'Haruto Imanishi', 'JPN'),
        seat('300-tok-1', 'tokai', 'Kenji Mizuhara', 'JPN'),
        seat('300-chi-1', 'chiba', 'Yuki Ishizaka', 'JPN'),
        seat('300-kaw-1', 'kawaguchi', 'Takeshi Narumi', 'JPN'),
        seat('300-nag-1', 'nagano', 'Shingo Oda', 'JPN'),
        seat('300-shi-1', 'shikoku', 'Akira Funabashi', 'JPN'),
        seat('300-hir-1', 'hiroshima', 'Tomoya Aokage', 'JPN'),
        seat('300-oki-1', 'okinawa', 'Kosei Higa', 'JPN'),
        seat('300-gif-1', 'gifu', 'Yusuke Kanamori', 'JPN'),
        seat('300-gif-2', 'gifu', 'Mitsuru Endo', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_URD },
      entryFee: 6500,
      prizes: {
        positions: [25200, 17650, 12600, 9600, 7300, 5550, 4050, 3000, 2000, 1250],
        standings: [201500, 126000, 80500, 53000, 33000],
      },
    },
  ],
  eventFormats: [
    {
      id: '300-km',
      name: '300 km',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 95, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 15, day: 0 },
        { id: 'race', type: 'race', name: '300 km', distance: 300, day: 1 },
      ],
    },
    {
      id: '500-km',
      name: '500 km',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 95, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 15, day: 0 },
        { id: 'race', type: 'race', name: '500 km', distance: 500, day: 1 },
      ],
    },
  ],
  defaultEventFormat: '300-km',
  rounds: [
    {
      id: 'okayama', name: 'Okayama GT 300 km', track: recommendedTrack('okayama/gp'), climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji-500',
      name: 'Fuji GT 500 km',
      track: recommendedTrack('fuji/gp'),
      eventFormat: '500-km',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'suzuka', name: 'Suzuka GT 300 km', track: recommendedTrack('suzuka/gp'), climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji', name: 'Fuji GT 300 km', track: recommendedTrack('fuji/gp'), climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 15, 11, 8, 6, 5, 4, 3, 2, 1], qualifying: [1] },
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
