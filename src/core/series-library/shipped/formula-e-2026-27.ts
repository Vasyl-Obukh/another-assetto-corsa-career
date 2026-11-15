import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget, Weekday,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula E, season thirteen - the first on the Gen4 car.
 *
 * RSS's Formula E GEN4 is the Gen4 car. Fourteen of twenty-one races: Mexico
 * City on the layout VRC made for it, the Circuit of the Americas, and the
 * double headers at Jeddah, Monaco, Brands Hatch, Zandvoort, Madrid and on
 * Shanghai's Formula E layout. Austin, Jeddah, Brands Hatch, Zandvoort and
 * Madrid race their Grand Prix circuits, since the layouts Formula E will use
 * there are not known yet. Miami, Sao Paulo, Sanya, Berlin and Tokyo have no
 * recommended track. The calendar is the one published for 2027, its order as
 * understood rather than checked.
 *
 * Qualifying is the group stage and the knockout duels, run here as a knockout
 * of the fastest eight, four and two. The E-Prix is 95 km, Gen3's 85 km
 * stand-in raised by the tenth Gen4 is said to gain a lap; the season's new
 * race format and its lap counts were not checked, and energy management and
 * attack mode cannot be said. Points are 25-18-15-12-10-8-6-4-2-1, three for
 * pole and one for the fastest lap, as in season ten. The field is invented,
 * season ten's.
 *
 * Source: https://racingnews365.com/2027-formula-e-calendar-season-13
 */
export const FORMULA_E_2026_27: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-e-2026-27',
  name: 'Formula E 2026-27',
  description: {
    en: 'Formula E\'s first Gen4 season on RSS\'s Formula E GEN4: Mexico City, Austin and six double '
      + 'headers from Jeddah to Shanghai.',
    uk: 'Перший сезон Formula E на машині Gen4, Formula E GEN4 від RSS: Мехіко, Остін і шість здвоєних '
      + 'етапів від Джидди до Шанхая.',
  },
  teams: [
    team('lumen-e', 'Lumen E-Racing', 'FRA', TeamBudget.WORKS),
    team('voltaic', 'Voltaic Racing', 'GBR', TeamBudget.WORKS),
    team('kinetica', 'Kinetica Formula E', 'DEU', TeamBudget.WORKS),
    team('ampere', 'Ampère Motorsport', 'FRA', TeamBudget.WORKS),
    team('fjordvolt', 'Fjordvolt Racing', 'NOR', TeamBudget.INDEPENDENT),
    team('sparkline', 'Sparkline Racing', 'USA', TeamBudget.INDEPENDENT),
    team('shenzhou', 'Shenzhou E-Racing', 'CHN', TeamBudget.INDEPENDENT),
    team('arabian-sea', 'Arabian Sea E-Racing', 'IND', TeamBudget.INDEPENDENT),
    team('galvani', 'Scuderia Galvani', 'ITA', TeamBudget.INDEPENDENT),
    team('ohm', 'Ohm Racing', 'CHE', TeamBudget.PRIVATEER),
    team('kaizen', 'Kaizen E-Racing', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-e',
      name: 'Formula E',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('lum-1', 'lumen-e', 'Hector Vauclair', 'FRA'),
        seat('lum-2', 'lumen-e', 'Léo Mazerolles', 'FRA'),
        seat('vol-1', 'voltaic', 'Nathan Cheverell', 'GBR'),
        seat('vol-2', 'voltaic', 'Sam Pettifer', 'GBR'),
        seat('kin-1', 'kinetica', 'Jonas Rehbein', 'DEU'),
        seat('kin-2', 'kinetica', 'Tim Klostermann', 'DEU'),
        seat('amp-1', 'ampere', 'Arthur Denoyelle', 'FRA'),
        seat('amp-2', 'ampere', 'Baptiste Oudinot', 'FRA'),
        seat('fjo-1', 'fjordvolt', 'Henrik Solbakken', 'NOR'),
        seat('fjo-2', 'fjordvolt', 'Even Brekkestø', 'NOR'),
        seat('spa-1', 'sparkline', 'Cole Ridgeway', 'USA'),
        seat('spa-2', 'sparkline', 'Austin Pembrook', 'USA'),
        seat('she-1', 'shenzhou', 'Li Haoran', 'CHN'),
        seat('she-2', 'shenzhou', 'Zhang Weiqi', 'CHN'),
        seat('ara-1', 'arabian-sea', 'Kabir Saxena', 'IND'),
        seat('ara-2', 'arabian-sea', 'Rohan Mehtani', 'IND'),
        seat('gal-1', 'galvani', 'Samuele Arrighetti', 'ITA'),
        seat('gal-2', 'galvani', 'Edoardo Lucchesi', 'ITA'),
        seat('ohm-1', 'ohm', 'Yannick Bürki', 'CHE'),
        seat('ohm-2', 'ohm', 'Loris Gisler', 'CHE'),
        seat('kai-1', 'kaizen', 'Kazuto Hirayama', 'JPN'),
        seat('kai-2', 'kaizen', 'Sho Kawaguchi', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_E_GEN_4 },
    },
  ],
  eventFormats: [
    {
      id: 'e-prix',
      name: 'E-Prix',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'groups', type: 'qualify', name: 'Group stage', minutes: 12, day: 0 },
        {
          id: 'quarter-finals',
          type: 'qualify',
          name: 'Quarter-finals',
          minutes: 6,
          day: 0,
          inherit: { from: 'groups', top: 8 },
        },
        {
          id: 'semi-finals',
          type: 'qualify',
          name: 'Semi-finals',
          minutes: 6,
          day: 0,
          inherit: { from: 'quarter-finals', top: 4 },
        },
        {
          id: 'final',
          type: 'qualify',
          name: 'Final',
          minutes: 6,
          day: 0,
          inherit: { from: 'semi-finals', top: 2 },
        },
        { id: 'race', type: 'race', name: 'E-Prix', distance: 95, day: 0, inherit: { from: 'final' } },
      ],
    },
  ],
  defaultEventFormat: 'e-prix',
  // Raced on a Saturday, as the real series is.
  raceWeekday: Weekday.SATURDAY,
  rounds: [
    {
      id: 'mexico-city',
      name: 'Mexico City E-Prix',
      track: recommendedTrack('mexico-city/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'austin',
      name: 'Austin E-Prix',
      track: recommendedTrack('cota/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'jeddah-1',
      name: 'Jeddah E-Prix, race 1',
      track: recommendedTrack('jeddah/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'jeddah-2',
      name: 'Jeddah E-Prix, race 2',
      track: recommendedTrack('jeddah/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'monaco-1',
      name: 'Monaco E-Prix, race 1',
      track: recommendedTrack('monaco/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'monaco-2',
      name: 'Monaco E-Prix, race 2',
      track: recommendedTrack('monaco/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'brands-hatch-1',
      name: 'London E-Prix, race 1',
      track: recommendedTrack('brands-hatch/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-2',
      name: 'London E-Prix, race 2',
      track: recommendedTrack('brands-hatch/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'zandvoort-1',
      name: 'Zandvoort E-Prix, race 1',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'zandvoort-2',
      name: 'Zandvoort E-Prix, race 2',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'madrid-1',
      name: 'Madrid E-Prix, race 1',
      track: recommendedTrack('madring/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'madrid-2',
      name: 'Madrid E-Prix, race 2',
      track: recommendedTrack('madring/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'shanghai-1',
      name: 'Shanghai E-Prix, race 1',
      track: recommendedTrack('shanghai/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai-2',
      name: 'Shanghai E-Prix, race 2',
      track: recommendedTrack('shanghai/fe'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [3],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
