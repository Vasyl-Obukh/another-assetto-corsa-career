import { seat, team } from './utils.ts';
import { Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * World Touring Car Championship, 1987 - Group A's one world season, in the
 * division the BMW M3 won.
 *
 * The 1987 championship ran Group A cars in three divisions by engine size,
 * each scored on its own, and the M3 was the 2.5-litre Division 2's car. That
 * division is what the base game can field: the M3 E30 Group A, which is also
 * all of it that is here. Six rounds at their real lengths - the Monza 500 km,
 * the Spa 24 Hours, 500 km at the Nurburgring and at Silverstone for the
 * Tourist Trophy, the Bathurst 1000 and 500 km at Fuji. Jarama, Dijon, Brno,
 * Calder and Wellington are not in Assetto Corsa. Points are the division's
 * 20-15-12-10-8-6-4-3-2-1.
 *
 * The field is invented: the season's entry list crews two or three drivers a
 * car, which a one-driver grid cannot hold, and the M3 teams' pairings were not
 * found in a source that could be checked.
 *
 * Source: https://en.wikipedia.org/wiki/1987_World_Touring_Car_Championship
 */
export const GROUP_A_1987: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'group-a-1987',
  name: 'World Touring Car Championship 1987',
  description: {
    en: 'Group A\'s one world season, in the BMW M3\'s own division, at its real lengths: the '
      + 'Monza 500 km, the Spa 24 Hours, the Bathurst 1000 and 500 km at the Nurburgring, Silverstone '
      + 'and Fuji.',
    uk: 'Єдиний сезон чемпіонату світу в Групі A, у власному дивізіоні BMW M3, на справжніх дистанціях: '
      + '500 км Монци, 24 години Спа, Батерст 1000 і по 500 км на Нюрбургринзі, у Сільверстоуні та Фудзі.',
  },
  teams: [
    team('schwaben', 'Schwaben Tourenwagen', 'DEU', TeamBudget.WORKS),
    team('bologna', 'Squadra Petronio', 'ITA', TeamBudget.WORKS),
    team('linz', 'Donau Motorsport', 'AUT', TeamBudget.INDEPENDENT),
    team('ardennes', 'Écurie Francorchamps', 'BEL', TeamBudget.INDEPENDENT),
    team('castilla', 'Castilla Competición', 'ESP', TeamBudget.PRIVATEER),
    team('brands', 'Kentish Saloon Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'division-2',
      name: 'Division 2',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('sch-1', 'schwaben', 'Albrecht Heigl', 'DEU'),
        seat('sch-2', 'schwaben', 'Wolfgang Kutscher', 'DEU'),
        seat('sch-3', 'schwaben', 'Rainer Lüttgens', 'DEU'),
        seat('bol-1', 'bologna', 'Roberto Castagnoli', 'ITA'),
        seat('bol-2', 'bologna', 'Emanuele Bottazzi', 'ITA'),
        seat('bol-3', 'bologna', 'Gianfranco Brancaleoni', 'ITA'),
        seat('lin-1', 'linz', 'Franz Haslinger', 'AUT'),
        seat('lin-2', 'linz', 'Gerold Pichlmayr', 'AUT'),
        seat('ard-1', 'ardennes', 'Eric Van Damme', 'BEL'),
        seat('ard-2', 'ardennes', 'Didier Lambrechts', 'BEL'),
        seat('cas-1', 'castilla', 'Luis Pérez-Sanz', 'ESP'),
        seat('cas-2', 'castilla', 'Carlos Villalobos', 'ESP'),
        seat('bra-1', 'brands', 'Gordon Pettifer', 'GBR'),
        seat('bra-2', 'brands', 'Ian Kilbride', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['bmw_m3_e30_gra'] },
    },
  ],
  eventFormats: [
    {
      id: 'monza-500',
      name: '500 km (Monza)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '500 km', laps: 87, day: 1 },
      ],
    },
    {
      id: 'nurburgring-500',
      name: '500 km (Nurburgring)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '500 km', laps: 98, day: 1 },
      ],
    },
    {
      id: 'silverstone-500',
      name: '500 km (Silverstone)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Tourist Trophy', laps: 85, day: 1 },
      ],
    },
    {
      id: 'bathurst-1000',
      name: '1000 km (Bathurst)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { type: 'race', name: 'Bathurst 1000', laps: 161, day: 2 },
      ],
    },
    {
      id: 'fuji-500',
      name: '500 km (Fuji)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '500 km', laps: 110, day: 1 },
      ],
    },
    {
      id: 'spa-24',
      name: '24 Hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 481, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'monza-500',
  rounds: [
    {
      id: 'monza',
      name: 'Monza 500 km',
      track: { id: 'monza' },
      eventFormat: 'monza-500',
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring 500 km',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      eventFormat: 'nurburgring-500',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa 24 Hours',
      track: { id: 'spa' },
      eventFormat: 'spa-24',
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'RAC Tourist Trophy',
      track: { id: 'ks_silverstone', layout: 'gp' },
      eventFormat: 'silverstone-500',
      climate: Climate.OCEANIC,
    },
    {
      id: 'bathurst',
      name: 'Bathurst 1000',
      track: { id: 'rt_bathurst' },
      eventFormat: 'bathurst-1000',
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'fuji',
      name: 'Fuji 500 km',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      eventFormat: 'fuji-500',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Division points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4000,
  prizes: {
    positions: [14000, 9500, 7000, 5200, 4000, 3000, 2200, 1600, 1100, 600],
    standings: [95000, 58000, 38000, 25000, 16000],
  },
};
