import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * JDM Production - invented, for the Japanese Pack's road cars.
 *
 * Japan races its road cars in production classes - Super Taikyu is the famous
 * one - but not these particular cars against each other, so this is made up
 * and says so. Two classes: Sports, the RX-7 Spirit R, the 370Z Nismo, the
 * Skyline R34 and the Supra, balanced towards each other on the install's
 * figures; and Hachiroku, the AE86 on its own. Japanese circuits: Fuji in both
 * its layouts, Okayama, Tsukuba and Sendai Hi-Land.
 */
export const JDM_PRODUCTION: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'jdm-production',
  name: 'JDM Production',
  description: 'Invented: the Japanese Pack\'s road cars in two production classes, on Japanese circuits.',
  teams: [
    team('gunma', 'Gunma Street Racing', 'Japan', 'JPN', TeamBudget.INDEPENDENT),
    team('shizuoka', 'Shizuoka Motorsport', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('okayama-club', 'Kibi Racing', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('ibaraki', 'Tsukuba Garage', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('miyagi', 'Sendai Speed Works', 'Japan', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sports',
      name: 'Sports',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('sp-gun-1', 'gunma', 'Takeshi Nakabayashi', 'Japan', 'JPN'),
        seat('sp-gun-2', 'gunma', 'Ryo Kanzaki', 'Japan', 'JPN'),
        seat('sp-shi-1', 'shizuoka', 'Hiroki Asahina', 'Japan', 'JPN'),
        seat('sp-shi-2', 'shizuoka', 'Yuto Kagawa', 'Japan', 'JPN'),
        seat('sp-oka-1', 'okayama-club', 'Daichi Morishige', 'Japan', 'JPN'),
        seat('sp-oka-2', 'okayama-club', 'Kaito Ebina', 'Japan', 'JPN'),
        seat('sp-iba-1', 'ibaraki', 'Shota Inagaki', 'Japan', 'JPN'),
        seat('sp-miy-1', 'miyagi', 'Naoki Hirabayashi', 'Japan', 'JPN'),
        seat('sp-miy-2', 'miyagi', 'Sayaka Tomita', 'Japan', 'JPN'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_mazda_rx7_spirit_r',
          'ks_nissan_370z',
          'ks_nissan_skyline_r34',
          'ks_toyota_supra_mkiv',
        ],
      },
      // Towards the Supra, the slowest of the four on the install's figures.
      bop: [
        { car: 'ks_nissan_370z', restrictor: 8 },
        { car: 'ks_mazda_rx7_spirit_r', ballast: 30 },
      ],
    },
    {
      id: 'hachiroku',
      name: 'Hachiroku',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('ae-gun-1', 'gunma', 'Koichi Sugawara', 'Japan', 'JPN'),
        seat('ae-iba-1', 'ibaraki', 'Tatsuya Onodera', 'Japan', 'JPN'),
        seat('ae-iba-2', 'ibaraki', 'Mei Kurosaki', 'Japan', 'JPN'),
        seat('ae-miy-1', 'miyagi', 'Haruto Ishiyama', 'Japan', 'JPN'),
        seat('ae-oka-1', 'okayama-club', 'Kenji Minagawa', 'Japan', 'JPN'),
        seat('ae-shi-1', 'shizuoka', 'Yusuke Hanamura', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_toyota_ae86'] },
      grid: { strength: -3 },
      prizes: {
        positions: [4800, 3350, 2400, 1850, 1400, 1050, 800, 550, 400, 250],
        standings: [38500, 24000, 15500, 10000, 6500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 65, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'fuji',
      name: 'Fuji Speedway',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
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
      id: 'fuji-short',
      name: 'Fuji Speedway Short',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gpshort' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -4, aggression: 10 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
