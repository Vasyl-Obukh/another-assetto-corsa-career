import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * TCR Europe - the European series for TCR touring cars, on LFM's 2024 TCR
 * cars.
 *
 * LFM's Audi RS3 LMS, Cupra Leon Competicion and Hyundai Elantra N make up the
 * TCR 2024 spec. Two races a round: the first from qualifying, the second
 * with qualifying's top ten reversed. The calendar is the circuits the series
 * races that Assetto Corsa has - Portimao, Spa, Zandvoort, Monza, Barcelona
 * and the Hungaroring - rather than one season's, which was not checked;
 * Salzburgring and Misano are not in Assetto Corsa.
 *
 * Races run half an hour and the 25-18-15 scale scores them, both stand-ins
 * for the series' own, which were not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/TCR_Europe_Touring_Car_Series
 */
export const TCR_EUROPE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'tcr-europe',
  name: 'TCR Europe',
  description: {
    en: 'Europe\'s TCR touring car series on LFM\'s Audi, Cupra and Hyundai: two races a round, '
      + 'the second from a reversed grid.',
    uk: 'Європейська турингова серія TCR на Audi, Cupra і Hyundai від LFM: дві гонки за етап, друга зі '
      + 'зворотної стартової решітки.',
  },
  teams: [
    team('adriatic', 'Adriatic Touring', 'HRV', TeamBudget.INDEPENDENT),
    team('castilla', 'Castilla Touring', 'ESP', TeamBudget.INDEPENDENT),
    team('lusitano', 'Lusitano Racing', 'PRT', TeamBudget.INDEPENDENT),
    team('oresund', 'Øresund Racing', 'DNK', TeamBudget.INDEPENDENT),
    team('magyar', 'Magyar Touring', 'HUN', TeamBudget.PRIVATEER),
    team('neman', 'Neman Racing', 'LTU', TeamBudget.PRIVATEER),
    team('dolomiti', 'Dolomiti Racing', 'ITA', TeamBudget.PRIVATEER),
    team('benelux', 'Benelux Touring', 'BEL', TeamBudget.PRIVATEER),
    team('bohemia', 'Bohemia Racing', 'CZE', TeamBudget.PRIVATEER),
    team('carpathian', 'Carpathian Racing', 'ROU', TeamBudget.PRIVATEER),
    team('aegean', 'Aegean Touring', 'GRC', TeamBudget.PRIVATEER),
    team('helvetic', 'Helvetic Touring', 'CHE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'tcr',
      name: 'TCR',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('adr-1', 'adriatic', 'Luka Marinović', 'HRV'),
        seat('adr-2', 'adriatic', 'Ivan Bašić', 'HRV'),
        seat('cas-1', 'castilla', 'Jorge Valdeolmos', 'ESP'),
        seat('cas-2', 'castilla', 'Raúl Cuadrillero', 'ESP'),
        seat('lus-1', 'lusitano', 'Miguel Barroca', 'PRT'),
        seat('lus-2', 'lusitano', 'Pedro Carmelo', 'PRT'),
        seat('ore-1', 'oresund', 'Mikkel Rosendahl', 'DNK'),
        seat('ore-2', 'oresund', 'Jonas Bundgaard', 'DNK'),
        seat('mag-1', 'magyar', 'Bence Hajdú', 'HUN'),
        seat('mag-2', 'magyar', 'Máté Szalontai', 'HUN'),
        seat('nem-1', 'neman', 'Mantas Jurgaitis', 'LTU'),
        seat('nem-2', 'neman', 'Dovydas Ramanauskas', 'LTU'),
        seat('dol-1', 'dolomiti', 'Alex Pezzei', 'ITA'),
        seat('dol-2', 'dolomiti', 'Manuel Dorigo', 'ITA'),
        seat('ben-1', 'benelux', 'Jens Vandewalle', 'BEL'),
        seat('ben-b-1', 'benelux', 'Sander Timmerman', 'NLD'),
        seat('boh-1', 'bohemia', 'Petr Vondráček', 'CZE'),
        seat('boh-2', 'bohemia', 'Tomáš Hradil', 'CZE'),
        seat('car-1', 'carpathian', 'Andrei Bălănescu', 'ROU'),
        seat('car-2', 'carpathian', 'Radu Ciobotaru', 'ROU'),
        seat('aeg-1', 'aegean', 'Nikos Vassilakis', 'GRC'),
        seat('aeg-2', 'aegean', 'Giorgos Papadellis', 'GRC'),
        seat('hel-1', 'helvetic', 'Kevin Ammeter', 'CHE'),
        seat('hel-2', 'helvetic', 'Dario Zanoli', 'CHE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.TCR_2024 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        { type: 'race', name: 'Race 1', distance: 70, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 70, day: 1, inherit: { from: 'qualifying', reverse: 10 } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'portimao',
      name: 'Portimao',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'barcelona', name: 'Barcelona', track: { id: 'fn_barcelona', layout: 'barcelona_2023' } },
    { id: 'hungaroring', name: 'Hungaroring', track: { id: 'rt_hungaroring' }, climate: Climate.TEMPERATE },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -1, aggression: 30 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [20000, 14000, 10000, 7600, 5800, 4400, 3200, 2400, 1600, 1000],
    standings: [160000, 100000, 64000, 42000, 26000],
  },
};
