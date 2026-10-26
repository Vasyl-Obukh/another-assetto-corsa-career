import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Tuner Invitational - invented, for the tuned road cars.
 *
 * The base game ships stage-tuned versions of many of its road cars, and the
 * Japanese Pack two time-attack builds and a tuned AE86. Real clubs put
 * modified cars in open classes rather than giving them championships of their
 * own, so this is an invitational by class, made up and saying so: Unlimited
 * for the fastest - the F40 and 458 Stage 3 and the Supra MkIV Time Attack;
 * Street for the middle; Club for the rest. The time-attack cars race here
 * because time attack itself is not wheel-to-wheel. The Gallardo SL Stage 3 is
 * left out: its data claims 1200 bhp.
 *
 * It needs the Japanese Pack, since a class names its cars and every car named
 * is a requirement.
 */
export const TUNER_INVITATIONAL: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'tuner-invitational',
  name: 'Tuner Invitational',
  description: 'Invented: the base game\'s stage-tuned road cars and the Japanese Pack\'s tuners, raced in'
    + ' three classes by pace. It needs the Japanese Pack.',
  teams: [
    team('tuner-tokyo', 'Daikoku Tuning', 'JPN', TeamBudget.INDEPENDENT),
    team('tuner-uk', 'Stage Three Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('tuner-de', 'Tuningwerk Süd', 'DEU', TeamBudget.PRIVATEER),
    team('tuner-it', 'Officina Elaborazioni', 'ITA', TeamBudget.PRIVATEER),
    team('tuner-us', 'Boost Society', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'unlimited',
      name: 'Unlimited',
      ladder: { discipline: Discipline.ROAD, tier: 2 },
      seats: [
        seat('unl-tok-1', 'tuner-tokyo', 'Kazuya Moriguchi', 'JPN'),
        seat('unl-it-1', 'tuner-it', 'Marco Lanfredi', 'ITA'),
        seat('unl-it-2', 'tuner-it', 'Stefano Agnelotti', 'ITA'),
        seat('unl-us-1', 'tuner-us', 'Brent Kowalski', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_f40_s3', 'ferrari_458_s3', 'ks_toyota_supra_mkiv_tuned'] },
      grid: { strength: 3 },
    },
    {
      id: 'street',
      name: 'Street',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('str-tok-1', 'tuner-tokyo', 'Shinji Arakawa', 'JPN'),
        seat('str-uk-1', 'tuner-uk', 'Craig Mottershead', 'GBR'),
        seat('str-uk-2', 'tuner-uk', 'Lee Ashbridge', 'GBR'),
        seat('str-de-1', 'tuner-de', 'Andreas Kerschbaum', 'DEU'),
        seat('str-de-2', 'tuner-de', 'Nico Pfeuffer', 'DEU'),
        seat('str-us-1', 'tuner-us', 'Tyson Whitaker', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_mazda_rx7_tuned',
          'bmw_1m_s3',
          'bmw_m3_e92_s1',
          'lotus_evora_s_s2',
          'ks_lamborghini_countach_s1',
          'lotus_exige_240_s3',
          'ks_audi_sport_quattro_s1',
        ],
      },
      entryFee: 1200,
      prizes: {
        positions: [6000, 4200, 3000, 2300, 1750, 1300, 950, 700, 500, 300],
        standings: [48000, 30000, 19000, 12500, 8000],
      },
    },
    {
      id: 'club',
      name: 'Club',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('clb-tok-1', 'tuner-tokyo', 'Yuji Hasegawa', 'JPN'),
        seat('clb-uk-1', 'tuner-uk', 'Danny Fairclough', 'GBR'),
        seat('clb-de-1', 'tuner-de', 'Kevin Brunnhuber', 'DEU'),
        seat('clb-it-1', 'tuner-it', 'Simone Vacchetti', 'ITA'),
        seat('clb-it-2', 'tuner-it', 'Luca Barbieri-Conti', 'ITA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_toyota_ae86_tuned',
          'lotus_elise_sc_s1',
          'lotus_elise_sc_s2',
          'bmw_z4_s1',
          'bmw_m3_e30_s1',
          'abarth500_s1',
        ],
      },
      grid: { strength: -3 },
      entryFee: 700,
      prizes: {
        positions: [3600, 2500, 1800, 1350, 1050, 800, 600, 450, 300, 200],
        standings: [29000, 18000, 11500, 7500, 4500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Time attack', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 50, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'tsukuba',
      name: 'Tsukuba',
      track: { id: 'ddm_gts_tsukuba', layout: 'full_lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: 'Fuji Speedway',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'okayama',
      name: 'Okayama',
      track: { id: 'okayama', layout: 'circuit_gp' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -1, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2000,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
