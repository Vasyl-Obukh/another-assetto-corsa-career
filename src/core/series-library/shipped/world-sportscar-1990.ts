import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Group C event: practice, qualifying and a 480-kilometre race.
 * @param id The format's id
 * @param laps How many laps 480 kilometres takes on the round's circuit
 * @returns The format
 */
const event = (id: string, laps: number): EventFormat => ({
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
    team('silberpfeil', 'Silberpfeil Sportwagen', 'CHE', TeamBudget.WORKS),
    team('coventry', 'Coventry Prototypes', 'GBR', TeamBudget.WORKS),
    team('hiroshima', 'Rotary Racing Hiroshima', 'JPN', TeamBudget.WORKS),
    team('weissach', 'Weissach Kundensport', 'DEU', TeamBudget.INDEPENDENT),
    team('lausanne', 'Écurie Léman', 'CHE', TeamBudget.INDEPENDENT),
    team('kremer', 'Rheinbrücke Racing', 'DEU', TeamBudget.PRIVATEER),
    team('fuji-racing', 'Fujimi Motorsport', 'JPN', TeamBudget.PRIVATEER),
    team('spice', 'Thames Valley Prototypes', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-c',
      name: 'Group C',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('sil-1', 'silberpfeil', 'Markus Ebersold', 'DEU'),
        seat('sil-2', 'silberpfeil', 'Christophe Delarue', 'FRA'),
        seat('cov-1', 'coventry', 'Duncan McAllister', 'GBR'),
        seat('cov-2', 'coventry', 'Jan-Willem Terpstra', 'NLD'),
        seat('hir-1', 'hiroshima', 'Takashi Yoshimura', 'JPN'),
        seat('hir-2', 'hiroshima', 'Volker Weidemann', 'DEU'),
        seat('wei-1', 'weissach', 'Hans-Peter Steinbrecher', 'DEU'),
        seat('wei-2', 'weissach', 'Robert Wolfhart', 'FRA'),
        seat('lau-1', 'lausanne', 'Walter Brunnenmeister', 'CHE'),
        seat('lau-2', 'lausanne', 'Oscar Larrea', 'ARG'),
        seat('kre-1', 'kremer', 'Manfred Krebsbach', 'DEU'),
        seat('kre-2', 'kremer', 'Tomas Salmberg', 'SWE'),
        seat('fuj-1', 'fuji-racing', 'Kenji Hoshikawa', 'JPN'),
        seat('fuj-2', 'fuji-racing', 'Masaru Nakayama', 'JPN'),
        seat('spi-1', 'spice', 'Tim Harrowby', 'GBR'),
        seat('spi-2', 'spice', 'Fermín Ortega', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GROUP_C, minModels: 1 },
    },
  ],
  eventFormats: [
    event('monza', 83),
    event('silverstone', 82),
    event('spa', 69),
    event('nurburgring', 94),
    event('montreal', 110),
  ],
  defaultEventFormat: 'monza',
  rounds: [
    {
      id: 'monza', name: '480 km of Monza', track: { id: 'monza' }, eventFormat: 'monza',
    },
    {
      id: 'silverstone',
      name: '480 km of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      eventFormat: 'silverstone',
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '480 km of Spa',
      track: { id: 'spa' },
      eventFormat: 'spa',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: '480 km of the Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      eventFormat: 'nurburgring',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'montreal',
      name: '480 km of Montreal',
      track: { id: 'canada_2021', layout: 'lfm' },
      eventFormat: 'montreal',
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
