import { GROUP_A_1987 } from './group-a-1987.ts';
import { seat, team } from './utils.ts';
import { Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * World Touring Car Championship, 1987 - with First Studio Race's Sierra in
 * the division above the M3's.
 *
 * The same season as GROUP_A_1987, its calendar and formats, with Division 3
 * added: the over-2.5-litre cars, which in 1987 were the Ford Sierra RS
 * Cosworths - FSR's Sierra RS500 Group A here - while Division 2 stays the
 * base game's M3 E30. A copy rather than a second class in the original,
 * because FSR's cars never share a championship class with another maker's
 * and the original keeps racing without them. Each division is scored on its
 * own, Division 3 lining up ahead. FSR's Sierra is dated 1989, standing in
 * for the RS Cosworth and the RS500 that took over mid-season; how far apart
 * the two specifications are was not checked.
 *
 * Six rounds at their real lengths - the Monza 500 km, the Spa 24 Hours, 500
 * km at the Nurburgring and at Silverstone for the Tourist Trophy, the
 * Bathurst 1000 and 500 km at Fuji. Jarama, Dijon, Brno, Calder and
 * Wellington are not in Assetto Corsa. Silverstone's twenty-four boxes cap the
 * grid. Points are the division's 20-15-12-10-8-6-4-3-2-1.
 *
 * The field is invented, the original's teams and three more for the Sierras.
 *
 * Source: https://en.wikipedia.org/wiki/1987_World_Touring_Car_Championship
 */
export const GROUP_A_1987_FSR: Championship = {
  ...GROUP_A_1987,
  id: 'group-a-1987-fsr',
  name: 'World Touring Car Championship 1987 (FSR)',
  description: {
    en: 'Group A\'s one world season in two divisions, First Studio Race\'s Sierra RS500 ahead of the '
      + 'BMW M3: the Monza 500 km, the Spa 24 Hours, the Bathurst 1000 and 500 km at the Nurburgring, '
      + 'Silverstone and Fuji.',
    uk: 'Єдиний сезон чемпіонату світу в Групі A у двох дивізіонах, Sierra RS500 від First Studio Race '
      + 'попереду BMW M3: 500 км Монци, 24 години Спа, Батерст 1000 і по 500 км на Нюрбургринзі, у '
      + 'Сільверстоуні та Фудзі.',
  },
  teams: [
    team('zurichsee', 'Zürichsee Tourenwagen', 'CHE', TeamBudget.WORKS),
    team('midlands', 'Midlands Saloon Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('southern-cross', 'Southern Cross Touring', 'AUS', TeamBudget.PRIVATEER),
    team('schwaben', 'Schwaben Tourenwagen', 'DEU', TeamBudget.WORKS),
    team('bologna', 'Squadra Petronio', 'ITA', TeamBudget.WORKS),
    team('linz', 'Donau Motorsport', 'AUT', TeamBudget.INDEPENDENT),
    team('ardennes', 'Écurie Francorchamps', 'BEL', TeamBudget.INDEPENDENT),
    team('castilla', 'Castilla Competición', 'ESP', TeamBudget.PRIVATEER),
    team('brands', 'Kentish Saloon Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'division-3',
      name: 'Division 3',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('zur-1', 'zurichsee', 'Urs Hächler', 'CHE'),
        seat('zur-2', 'zurichsee', 'Beat Zollinger', 'CHE'),
        seat('zur-3', 'zurichsee', 'Reto Ammann', 'CHE'),
        seat('zur-4', 'zurichsee', 'Markus Brändli', 'CHE'),
        seat('mid-1', 'midlands', 'Nigel Ashcombe', 'GBR'),
        seat('mid-2', 'midlands', 'Graham Tewkes', 'GBR'),
        seat('mid-3', 'midlands', 'Derek Halloway', 'GBR'),
        seat('soc-1', 'southern-cross', 'Wayne Dunstall', 'AUS'),
        seat('soc-2', 'southern-cross', 'Barry Kinsella', 'AUS'),
        seat('soc-3', 'southern-cross', 'Glenn Mattock', 'AUS'),
      ],
      eligibility: { kind: 'cars', cars: ['ford_sierra_rs500a'] },
    },
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
      entryFee: 4000,
      prizes: {
        positions: [14000, 9500, 7000, 5200, 4000, 3000, 2200, 1600, 1100, 600],
        standings: [95000, 58000, 38000, 25000, 16000],
      },
    },
  ],
  entryFee: 6500,
  prizes: {
    positions: [23500, 16000, 11500, 8500, 6500, 5000, 3500, 2500, 1800, 1000],
    standings: [158000, 96500, 63500, 41500, 26500],
  },
};
