import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Roadster Party Race - Japan's one-make series for the fourth-generation
 * MX-5.
 *
 * Mazda runs it for the ND Roadster in its NR-A club-racing trim; the Japanese
 * Pack's MX-5 ND is the road car it is built from, which is as near as Assetto
 * Corsa comes. Japanese circuits: Tsukuba, Okayama, Sendai Hi-Land and Fuji's
 * short course. The race length and points were not found, so thirty-minute
 * races and the 25-18-15 scale stand in. The field is invented.
 *
 * Source: https://www.roadster.blog/2015/09/mazda-roadster-nr-a.html
 */
export const ROADSTER_PARTY_RACE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'roadster-party-race',
  name: 'Roadster Party Race',
  description: 'Japan\'s one-make series for the ND MX-5, on the road car the club racer is built from, '
    + 'at Japanese circuits.',
  teams: [
    team('roadster-club', 'Roadster Club Hiroshima', 'Japan', 'JPN', TeamBudget.INDEPENDENT),
    team('kanto-nd', 'Kanto ND Racing', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('kansai-nd', 'Kansai Jinba Ittai', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('tohoku-nd', 'Tohoku Roadster Team', 'Japan', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'nr-a',
      name: 'NR-A',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('hir-1', 'roadster-club', 'Masato Yoshikawa', 'Japan', 'JPN'),
        seat('hir-2', 'roadster-club', 'Aoi Takenaka', 'Japan', 'JPN'),
        seat('hir-3', 'roadster-club', 'Shunsuke Oda', 'Japan', 'JPN'),
        seat('hir-4', 'roadster-club', 'Rin Kitamura', 'Japan', 'JPN'),
        seat('kan-1', 'kanto-nd', 'Takumi Iwasawa', 'Japan', 'JPN'),
        seat('kan-2', 'kanto-nd', 'Yuki Nagatomo', 'Japan', 'JPN'),
        seat('kan-3', 'kanto-nd', 'Keisuke Arima', 'Japan', 'JPN'),
        seat('kan-4', 'kanto-nd', 'Mao Shibuya', 'Japan', 'JPN'),
        seat('kns-1', 'kansai-nd', 'Ryota Fukushige', 'Japan', 'JPN'),
        seat('kns-2', 'kansai-nd', 'Hayato Kishimoto', 'Japan', 'JPN'),
        seat('kns-3', 'kansai-nd', 'Emi Yokoyama', 'Japan', 'JPN'),
        seat('kns-4', 'kansai-nd', 'Daisuke Tsuruta', 'Japan', 'JPN'),
        seat('toh-1', 'tohoku-nd', 'Kazuki Sasaki', 'Japan', 'JPN'),
        seat('toh-2', 'tohoku-nd', 'Riku Onuma', 'Japan', 'JPN'),
        seat('toh-3', 'tohoku-nd', 'Nanami Endo', 'Japan', 'JPN'),
        seat('toh-4', 'tohoku-nd', 'Sho Hatakeyama', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_nd'] },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race day',
      sessions: [
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', name: 'Race', distance: 55, day: 0 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'tsukuba',
      name: 'Tsukuba',
      track: { id: 'ddm_gts_tsukuba', layout: 'full_lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'okayama',
      name: 'Okayama',
      track: { id: 'okayama', layout: 'circuit_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sendai',
      name: 'Sendai Hi-Land',
      track: { id: 'sendai_hiland', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: 'Fuji Speedway Short',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gpshort' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -7, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 500,
  prizes: {
    positions: [4000, 2800, 2000, 1500, 1150, 900, 650, 500, 300, 200],
    standings: [32000, 20000, 13000, 8500, 5000],
  },
};
