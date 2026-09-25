import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Group C weekend: practice, qualifying and a 480-kilometre race.
 * @param id The format's id
 * @param laps How many laps 480 kilometres takes on the round's circuit
 * @returns The format
 */
const weekend = (id: string, laps: number): WeekendFormat => ({
  id,
  name: '480 km',
  sessions: [
    { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
    { type: 'race', name: '480 km', laps, day: 1 },
  ],
});

/**
 * World Sports-Prototype Championship, 1990 - Group C at its height.
 *
 * The Group C spec: the base game's Mazda 787B, with Dream Pack 1's Mercedes C9
 * and Porsche Pack 2's 962 C in both tails joining the grid for anyone who owns
 * them. The 787B is a 1991 car, a year on from this season; it is the only
 * Group C car the base game has, and the spec is the grid it would have raced
 * against.
 *
 * Every round of 1990 ran 480 kilometres. Five of its nine circuits are raced
 * - Monza, Silverstone, Spa, the Nurburgring and Montreal - each over the laps
 * 480 kilometres takes on the layout Assetto Corsa has. Suzuka, Dijon,
 * Donington and Mexico City are not in it. Points are the season's
 * 20-15-12-10-8-6-4-3-2-1.
 *
 * The field is invented, since cars are assigned from whatever of the spec is
 * installed and the real crews would be in the wrong ones.
 *
 * Source: https://en.wikipedia.org/wiki/1990_World_Sports_Prototype_Championship
 */
export const WORLD_SPORTSCAR_1990: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'world-sportscar-1990',
  name: 'World Sports-Prototype Championship 1990',
  description: 'Group C at its height: five rounds of 480 kilometres. It runs on the base game\'s Mazda '
    + '787B, and the Mercedes C9 and Porsche 962 C join the grid if you own their packs.',
  teams: [
    team('silberpfeil', 'Silberpfeil Sportwagen', 'Switzerland', 'SUI', TeamBudget.WORKS),
    team('coventry', 'Coventry Prototypes', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('hiroshima', 'Rotary Racing Hiroshima', 'Japan', 'JPN', TeamBudget.WORKS),
    team('weissach', 'Weissach Kundensport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lausanne', 'Écurie Léman', 'Switzerland', 'SUI', TeamBudget.INDEPENDENT),
    team('kremer', 'Rheinbrücke Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('fuji-racing', 'Fujimi Motorsport', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('spice', 'Thames Valley Prototypes', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-c',
      name: 'Group C',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('sil-1', 'silberpfeil', 'Markus Ebersold', 'Germany', 'GER'),
        seat('sil-2', 'silberpfeil', 'Christophe Delarue', 'France', 'FRA'),
        seat('cov-1', 'coventry', 'Duncan McAllister', 'Great Britain', 'GBR'),
        seat('cov-2', 'coventry', 'Jan-Willem Terpstra', 'Netherlands', 'NED'),
        seat('hir-1', 'hiroshima', 'Takashi Yoshimura', 'Japan', 'JPN'),
        seat('hir-2', 'hiroshima', 'Volker Weidemann', 'Germany', 'GER'),
        seat('wei-1', 'weissach', 'Hans-Peter Steinbrecher', 'Germany', 'GER'),
        seat('wei-2', 'weissach', 'Robert Wolfhart', 'France', 'FRA'),
        seat('lau-1', 'lausanne', 'Walter Brunnenmeister', 'Switzerland', 'SUI'),
        seat('lau-2', 'lausanne', 'Oscar Larrea', 'Argentina', 'ARG'),
        seat('kre-1', 'kremer', 'Manfred Krebsbach', 'Germany', 'GER'),
        seat('kre-2', 'kremer', 'Tomas Salmberg', 'Sweden', 'SWE'),
        seat('fuj-1', 'fuji-racing', 'Kenji Hoshikawa', 'Japan', 'JPN'),
        seat('fuj-2', 'fuji-racing', 'Masaru Nakayama', 'Japan', 'JPN'),
        seat('spi-1', 'spice', 'Tim Harrowby', 'Great Britain', 'GBR'),
        seat('spi-2', 'spice', 'Fermín Ortega', 'Spain', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GROUP_C, minModels: 1 },
    },
  ],
  weekendFormats: [
    weekend('monza', 83),
    weekend('silverstone', 82),
    weekend('spa', 69),
    weekend('nurburgring', 94),
    weekend('montreal', 110),
  ],
  defaultWeekendFormat: 'monza',
  rounds: [
    {
      id: 'monza', name: '480 km of Monza', track: { id: 'monza' }, weekendFormat: 'monza',
    },
    {
      id: 'silverstone',
      name: '480 km of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      weekendFormat: 'silverstone',
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '480 km of Spa',
      track: { id: 'spa' },
      weekendFormat: 'spa',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: '480 km of the Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      weekendFormat: 'nurburgring',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'montreal',
      name: '480 km of Montreal',
      track: { id: 'canada_2021', layout: 'lfm' },
      weekendFormat: 'montreal',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
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
    positions: [60000, 40000, 28000, 20000, 15000, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 240000, 160000, 105000, 65000],
  },
};
