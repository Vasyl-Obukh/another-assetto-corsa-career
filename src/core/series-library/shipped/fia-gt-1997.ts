import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA GT Championship, 1997 - the GT1 homologation specials at their height.
 *
 * The 1990s GT1 spec: Dream Pack 1's McLaren F1 GTR and Porsche Pack 2's 911
 * GT1, with the mods that model the Mercedes CLR and the Le Mans prototypes
 * joining for anyone who has them. Seven of eleven rounds at their real
 * lengths: four hours at Silverstone, the Nurburgring, Spa, the A1-Ring - the
 * Red Bull Ring's layout before it was renamed - and Mugello, and three at
 * Sebring and Laguna Seca. Hockenheim, Helsinki, Suzuka and Donington are not
 * in Assetto Corsa.
 *
 * Points are 10-6-4-3-2-1, which is how the sources found read the table; it
 * is not confirmed. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1997_FIA_GT_Championship
 */
export const FIA_GT_1997: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'fia-gt-1997',
  name: 'FIA GT Championship 1997',
  description: 'The GT1 homologation specials at their height: seven of the 1997 season\'s rounds at '
    + 'their real lengths, on whichever of the F1 GTR, the 911 GT1 and the mod GT1 cars you '
    + 'own.',
  teams: [
    team('stuttgart-gt', 'Neckar GT Racing', 'DEU', TeamBudget.WORKS),
    team('weissach-gt', 'Schwarzwald Motorsport', 'DEU', TeamBudget.WORKS),
    team('woking-97', 'Surrey GT Team', 'GBR', TeamBudget.WORKS),
    team('roock', 'Leverkusen Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('dams-gt', 'Écurie Vexin', 'FRA', TeamBudget.INDEPENDENT),
    team('gtc', 'Grampian Racing', 'GBR', TeamBudget.PRIVATEER),
    team('konrad', 'Tirol Motorsport', 'AUT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt1',
      name: 'GT1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('nec-1', 'stuttgart-gt', 'Rainer Fessler', 'DEU'),
        seat('nec-2', 'stuttgart-gt', 'Jochen Albrecht', 'DEU'),
        seat('nec-3', 'stuttgart-gt', 'Matthias Tanner', 'DEU'),
        seat('sch-1', 'weissach-gt', 'Hartmut Seebach', 'DEU'),
        seat('sch-2', 'weissach-gt', 'Leonhard Rieger', 'DEU'),
        seat('sur-1', 'woking-97', 'Gavin Pettigrew', 'GBR'),
        seat('sur-2', 'woking-97', 'Neil Chamberlayne', 'GBR'),
        seat('sur-3', 'woking-97', 'Owen Dymock', 'GBR'),
        seat('lev-1', 'roock', 'Dirk Hollmann', 'DEU'),
        seat('lev-2', 'roock', 'Sascha Wernicke', 'DEU'),
        seat('vex-1', 'dams-gt', 'Olivier Lamarque', 'FRA'),
        seat('vex-2', 'dams-gt', 'Fabien Rostand', 'FRA'),
        seat('gra-1', 'gtc', 'Kenneth Arbuthnot', 'GBR'),
        seat('gra-2', 'gtc', 'Duncan Macrae', 'GBR'),
        seat('tir-1', 'konrad', 'Franz Obermoser', 'AUT'),
        seat('tir-2', 'konrad', 'Walter Kostner', 'AUT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT1_1990S, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { id: 'race', type: 'race', name: '4 Hours', laps: 130, day: 1 },
      ],
    },
    {
      id: 'three-hours',
      name: 'Three hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '3 Hours', distance: 530, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'four-hours',
  rounds: [
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 119 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'race', laps: 101 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'a1-ring',
      name: 'A1-Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      sessionLengths: [{ session: 'race', laps: 161 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: 'Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      weekendFormat: 'three-hours',
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: { id: 'ks_laguna_seca' }, weekendFormat: 'three-hours' },
    {
      id: 'mugello',
      name: 'Mugello',
      track: { id: 'mugello' },
      sessionLengths: [{ session: 'race', laps: 132 }],
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
