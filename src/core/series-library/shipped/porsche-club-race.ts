import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Porsche Club Race - road Porsches racing in classes, on the Porsche Club of
 * America's club-racing rules.
 *
 * PCA Club Racing puts showroom Porsches in stock classes by model: S4 for the
 * 911 Carrera S and the 718 Boxster and Cayman S, S6 for the GT3 RS. The
 * Porsche Packs' road cars fall into those two on their own figures, the 911 R
 * and the Turbo S joining the GT3 RS and the Cayman GT4 ballasted into S4. The
 * classes are real; the season is invented, on the American circuits PCA races
 * at.
 *
 * It needs all three Porsche Packs, since a class names its cars and every car
 * named is a requirement.
 *
 * Source: https://pcaclubracing.org/rules/rulebook/
 */
export const PORSCHE_CLUB_RACE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'porsche-club-race',
  name: 'Porsche Club Race',
  description: {
    en: 'Road Porsches in the Porsche Club of America\'s stock classes, S4 and S6, on an invented '
      + 'season at American circuits. It needs all three Porsche Packs.',
    uk: 'Дорожні Porsche у серійних класах Porsche Club of America, S4 і S6, у вигаданому сезоні на '
      + 'американських трасах. Потрібні всі три Porsche Packs.',
  },
  teams: [
    team('pca-atlanta', 'Peach State Porsche Racing', 'USA', TeamBudget.INDEPENDENT),
    team('pca-florida', 'Gulf Coast Club Racing', 'USA', TeamBudget.PRIVATEER),
    team('pca-virginia', 'Blue Ridge Region Racing', 'USA', TeamBudget.PRIVATEER),
    team('pca-wisconsin', 'Kettle Moraine Racing', 'USA', TeamBudget.PRIVATEER),
    team('pca-california', 'Monterey Bay Porsche', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 's6',
      name: 'S6',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('s6-pea-1', 'pca-atlanta', 'Grant Hollister', 'USA'),
        seat('s6-pea-2', 'pca-atlanta', 'Beau Talmadge', 'USA'),
        seat('s6-gul-1', 'pca-florida', 'Carlos Ibarguen', 'USA'),
        seat('s6-blu-1', 'pca-virginia', 'Wes Tuckerman', 'USA'),
        seat('s6-ket-1', 'pca-wisconsin', 'Erik Halvorsen', 'USA'),
        seat('s6-mon-1', 'pca-california', 'Paige Winslow', 'USA'),
        seat('s6-mon-2', 'pca-california', 'Derek Castellano', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_porsche_911_gt3_rs',
          'ks_porsche_911_r',
          'ks_porsche_991_turbo_s',
        ],
      },
      // The Turbo S is the all-wheel-drive car of the three.
      bop: [
        { car: 'ks_porsche_991_turbo_s', ballast: 30 },
      ],
    },
    {
      id: 's4',
      name: 'S4',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('s4-pea-1', 'pca-atlanta', 'Mason Treadwell', 'USA'),
        seat('s4-pea-2', 'pca-atlanta', 'Callie Burgess', 'USA'),
        seat('s4-gul-1', 'pca-florida', 'Tanner Oakes', 'USA'),
        seat('s4-gul-2', 'pca-florida', 'Luis Echevarría', 'USA'),
        seat('s4-blu-1', 'pca-virginia', 'Hollis Barnwell', 'USA'),
        seat('s4-blu-2', 'pca-virginia', 'Reid Castleberry', 'USA'),
        seat('s4-ket-1', 'pca-wisconsin', 'Gunnar Pedersen', 'USA'),
        seat('s4-ket-2', 'pca-wisconsin', 'Molly Schroeder', 'USA'),
        seat('s4-mon-1', 'pca-california', 'Jake Arrowsmith', 'USA'),
        seat('s4-mon-2', 'pca-california', 'Dana Kurosawa', 'USA'),
        seat('s4-mon-3', 'pca-california', 'Elliot Faber', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_porsche_991_carrera_s',
          'ks_porsche_718_cayman_s',
          'ks_porsche_718_boxster_s',
          'ks_porsche_718_boxster_s_pdk',
          'ks_porsche_cayman_gt4_std',
        ],
      },
      // The Cayman GT4 is the one car of the class built for the track.
      bop: [
        { car: 'ks_porsche_cayman_gt4_std', ballast: 60 },
      ],
      entryFee: 1500,
      prizes: {
        positions: [6000, 4200, 3000, 2300, 1750, 1300, 950, 700, 500, 300],
        standings: [48000, 30000, 19000, 12500, 8000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Club',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', classGrid: 'mixed', name: 'Sprint race', distance: 75, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: recommendedTrack('road-atlanta/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: 'Sebring',
      track: recommendedTrack('sebring/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: recommendedTrack('vir/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: recommendedTrack('watkins-glen/boot'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: recommendedTrack('road-america/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: recommendedTrack('laguna-seca/full') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2500,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
