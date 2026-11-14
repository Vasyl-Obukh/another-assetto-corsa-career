import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT86 Cup - the base game's Toyota GT86 in a one-make cup of its own.
 *
 * A real idea with an invented calendar. Toyota Motorsport ran a GT86 Cup
 * inside the VLN from 2013 to 2015, on the Nordschleife, which is Dream Pack 1;
 * Japan's 86/BRZ Race and a string of national 86 series are the car's
 * one-make homes elsewhere, on circuits the base game does not have. So this is
 * those series' shape - one qualifying, two short races - on base circuits,
 * with one round on the Nordschleife where Toyota's own cup ran, and its
 * description says the calendar is invented.
 */
export const GT86_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt86-cup',
  name: 'GT86 Cup',
  description: {
    en: 'A one-make cup for the Toyota GT86, in the shape of the car\'s real 86 series - one '
      + 'qualifying and two short races - on an invented calendar of base circuits.',
    uk: 'Монокубок для Toyota GT86 за зразком справжньої серії 86 - одна кваліфікація й дві короткі гонки '
      + '- на вигаданому календарі трас базової гри.',
  },
  teams: [
    team('hachiroku', 'Hachiroku Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('boxer', 'Boxer Sport', 'DEU', TeamBudget.PRIVATEER),
    team('kaiten', 'Kaiten Motorsport', 'JPN', TeamBudget.PRIVATEER),
    team('marram', 'Marram Racing', 'NLD', TeamBudget.PRIVATEER),
    team('cotswold', 'Cotswold Coupés', 'GBR', TeamBudget.PRIVATEER),
    team('saar', 'Saarland Clubsport', 'DEU', TeamBudget.PRIVATEER),
    team('bruges', 'Brugse Racing', 'BEL', TeamBudget.PRIVATEER),
    team('kvarn', 'Kvarn Racing', 'SWE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'cup',
      name: 'Cup',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('hac-1', 'hachiroku', 'Ryota Sagawa', 'JPN'),
        seat('hac-2', 'hachiroku', 'Haruka Nishimaki', 'JPN'),
        seat('box-1', 'boxer', 'Lennart Voss', 'DEU'),
        seat('box-2', 'boxer', 'Mats Ohlendorf', 'DEU'),
        seat('kai-1', 'kaiten', 'Daisuke Ogura', 'JPN'),
        seat('kai-2', 'kaiten', 'Shun Kuribayashi', 'JPN'),
        seat('mar-1', 'marram', 'Thijs Rozendaal', 'NLD'),
        seat('mar-2', 'marram', 'Evi Brandsma', 'NLD'),
        seat('cot-1', 'cotswold', 'Archie Pendleford', 'GBR'),
        seat('cot-2', 'cotswold', 'Will Hartnell', 'GBR'),
        seat('saa-1', 'saar', 'Philipp Nieswand', 'DEU'),
        seat('saa-2', 'saar', 'Anja Schwarzkopf', 'DEU'),
        seat('bru-1', 'bruges', 'Seppe Vandewalle', 'BEL'),
        seat('bru-2', 'bruges', 'Arne Goossens', 'BEL'),
        seat('kva-1', 'kvarn', 'Oskar Lindqvist', 'SWE'),
        seat('kva-2', 'kvarn', 'Linnea Sjöberg', 'SWE'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_toyota_gt86'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 25, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 50,
          day: 0,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Race 2', distance: 50, day: 1, inherit: { from: 'race-1' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort', name: 'Zandvoort', track: { id: 'ks_zandvoort' }, climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone International',
      track: { id: 'ks_silverstone', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring-sprint',
      name: 'Nurburgring Sprint',
      track: { id: 'ks_nurburgring', layout: 'layout_sprint_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nordschleife',
      name: 'Nordschleife',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -6, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 700,
  prizes: {
    positions: [2200, 1500, 1100, 800, 600, 450, 320, 220, 150, 100],
    standings: [16000, 9500, 6500, 4300, 2700],
  },
};
