import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Lamborghini Super Trofeo Europe, 2023 - the Huracan Super Trofeo EVO2's own
 * one-make championship.
 *
 * First Studio Race's Huracan Super Trofeo EVO2 is the car the whole field
 * raced. Five double-header rounds of 50-minute races, each race with its own
 * qualifying - Paul Ricard, Spa, the Nurburgring, Valencia and Vallelunga -
 * and the World Final at Vallelunga the week after, counted as a sixth round.
 * The Imola opener was cancelled. Vallelunga's twenty-four boxes cap a grid of
 * nearly fifty.
 *
 * The Pro, Pro-Am, Am and Lamborghini Cup classes shared one grid and are one
 * class entry here: they were scored against the same car. The real races run
 * 50 minutes, which Assetto Corsa cannot time offline, so each is the 135 km
 * that covers at Super Trofeo pace. The points are the common
 * 15-12-10-8-6-5-4-3-2-1 one-make scale; the Super Trofeo's own table was not
 * found. The field is invented, the 2016 season's paddock with two teams more.
 *
 * Source: https://en.wikipedia.org/wiki/2023_Lamborghini_Super_Trofeo_Europe
 */
export const LAMBORGHINI_SUPER_TROFEO_EUROPE_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'lamborghini-super-trofeo-europe-2023-fsr',
  name: 'Lamborghini Super Trofeo Europe 2023 (FSR)',
  description: {
    en: 'The Huracan Super Trofeo EVO2\'s one-make championship on First Studio Race\'s car: double '
      + 'headers of 50-minute races, closing with the World Final at Vallelunga.',
    uk: 'Монокубок Huracan Super Trofeo EVO2 на машині від First Studio Race: по дві 50-хвилинні гонки '
      + 'за етап і фінал світу у Валлелунзі наприкінці.',
  },
  teams: [
    team('baldoni', 'Scuderia Baldoni', 'ITA', TeamBudget.WORKS),
    team('imperatore', 'Imperatore Racing', 'ITA', TeamBudget.INDEPENDENT),
    team('lawson', 'Lawson Squadra', 'GBR', TeamBudget.INDEPENDENT),
    team('leitner', 'Leitner Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('taurus', 'Taurus Racing', 'ESP', TeamBudget.PRIVATEER),
    team('duindorp', 'Duindorp Racing', 'NLD', TeamBudget.PRIVATEER),
    team('vosges', 'Écurie des Vosges', 'FRA', TeamBudget.PRIVATEER),
    team('silesia', 'Silesia Motorsport', 'POL', TeamBudget.PRIVATEER),
    team('taunus', 'Taunus Sportwagen', 'DEU', TeamBudget.PRIVATEER),
    team('alpine-lake', 'Alpsee Racing', 'AUT', TeamBudget.PRIVATEER),
    team('lemano', 'Lemano Corse', 'CHE', TeamBudget.PRIVATEER),
    team('scheldt', 'Scheldt Racing', 'BEL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-trofeo',
      name: 'Super Trofeo',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('bon-1', 'baldoni', 'Edoardo Piscitelli', 'ITA'),
        seat('bon-2', 'baldoni', 'Kiko Galbusera', 'ITA'),
        seat('imp-1', 'imperatore', 'Giacomo Barri', 'ITA'),
        seat('imp-2', 'imperatore', 'Vito Scalabrini', 'ITA'),
        seat('law-1', 'lawson', 'Oliver Rushworth', 'GBR'),
        seat('law-2', 'lawson', 'Ciaran Doyle', 'IRL'),
        seat('lei-1', 'leitner', 'Dennis Marschner', 'DEU'),
        seat('lei-2', 'leitner', 'Kai Brandauer', 'DEU'),
        seat('tau-1', 'taurus', 'Álvaro Quintana', 'ESP'),
        seat('tau-2', 'taurus', 'Lucía Ferrándiz', 'ESP'),
        seat('dui-1', 'duindorp', 'Stijn Vermeer', 'NLD'),
        seat('dui-2', 'duindorp', 'Roel Hagedoorn', 'NLD'),
        seat('vos-1', 'vosges', 'Adrien Keller', 'FRA'),
        seat('vos-2', 'vosges', 'Hugo Marchetti', 'FRA'),
        seat('sil-1', 'silesia', 'Jakub Wrona', 'POL'),
        seat('sil-2', 'silesia', 'Karol Mazur', 'POL'),
        seat('tns-1', 'taunus', 'Henrik Albers', 'DEU'),
        seat('tns-2', 'taunus', 'Ulrike Dahm', 'DEU'),
        seat('alp-1', 'alpine-lake', 'Florian Gaisberger', 'AUT'),
        seat('alp-2', 'alpine-lake', 'Raphael Moosbrugger', 'AUT'),
        seat('lem-1', 'lemano', 'Fabio Cereghetti', 'CHE'),
        seat('lem-2', 'lemano', 'Nils Ammann', 'CHE'),
        seat('sch-1', 'scheldt', 'Wout Callebaut', 'BEL'),
        seat('sch-2', 'scheldt', 'Lander Peeraer', 'BEL'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_huracan_st_evo_2'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Double header',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 15, day: 1 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 15, day: 1 },
        {
          type: 'race', name: 'Race 1', distance: 135, day: 1, inherit: { from: 'qualifying-1' },
        },
        {
          type: 'race', name: 'Race 2', distance: 135, day: 2, inherit: { from: 'qualifying-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'paul-ricard',
      name: 'Paul Ricard',
      track: recommendedTrack('paul-ricard/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    { id: 'valencia', name: 'Valencia', track: recommendedTrack('valencia/gp') },
    { id: 'vallelunga', name: 'Vallelunga', track: recommendedTrack('vallelunga/full') },
    { id: 'world-final', name: 'World Final, Vallelunga', track: recommendedTrack('vallelunga/full') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 3500,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
