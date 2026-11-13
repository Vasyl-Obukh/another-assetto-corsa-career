import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the era: a day of practice, a day of timed
 * practice setting the grid, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 318, day: 2 },
  ],
};

/**
 * Formula 1, 1979 - Jody Scheckter's title, and the ground-effect cars at their height.
 *
 * The real entry list on RSS's Formula 1979, cut to eighteen by Zandvoort's
 * pit boxes: the drivers who started most of the season. Eight of fifteen
 * rounds at their real distances. Silverstone and Watkins Glen's long circuit
 * are the period ones and run their real laps; Interlagos, Zolder, the
 * Osterreichring, Zandvoort, Monza and Montreal have changed since, so their
 * laps cover the real distance. Buenos Aires, Kyalami, Long Beach, Jarama,
 * Monaco, Dijon and Hockenheim are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1; the season counted a driver's best four of each
 * half, which a points system cannot say yet.
 *
 * Source: https://en.wikipedia.org/wiki/1979_Formula_One_World_Championship
 */
export const FORMULA_1_1979: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1979',
  name: 'Formula 1 1979',
  description: 'Jody Scheckter\'s title season, with the real entry list on RSS\'s Formula 1979 and eight of'
    + ' its grands prix at their real distances.',
  teams: [
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('williams', 'Albilad-Saudia Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('ligier', 'Équipe Ligier Gitanes', 'FRA', TeamBudget.WORKS),
    team('lotus', 'Martini Racing Team Lotus', 'GBR', TeamBudget.WORKS),
    team('renault', 'Équipe Renault Elf', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'Löwenbräu Team McLaren', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Team Tyrrell', 'GBR', TeamBudget.INDEPENDENT),
    team('arrows', 'Warsteiner Arrows Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('brabham', 'Parmalat Racing Team', 'GBR', TeamBudget.WORKS),
    team('fittipaldi', 'Fittipaldi Automotive', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('ferrari-scheckter', 'ferrari', 'Jody Scheckter', 'ZAF'),
        seat('ferrari-villeneuve', 'ferrari', 'Gilles Villeneuve', 'CAN'),
        seat('williams-jones', 'williams', 'Alan Jones', 'AUS'),
        seat('ligier-laffite', 'ligier', 'Jacques Laffite', 'FRA'),
        seat('williams-regazzoni', 'williams', 'Clay Regazzoni', 'CHE'),
        seat('ligier-depailler', 'ligier', 'Patrick Depailler', 'FRA'),
        seat('lotus-reutemann', 'lotus', 'Carlos Reutemann', 'ARG'),
        seat('renault-arnoux', 'renault', 'René Arnoux', 'FRA'),
        seat('mclaren-watson', 'mclaren', 'John Watson', 'GBR'),
        seat('tyrrell-pironi', 'tyrrell', 'Didier Pironi', 'FRA'),
        seat('tyrrell-jarier', 'tyrrell', 'Jean-Pierre Jarier', 'FRA'),
        seat('lotus-andretti', 'lotus', 'Mario Andretti', 'USA'),
        seat('renault-jabouille', 'renault', 'Jean-Pierre Jabouille', 'FRA'),
        seat('arrows-patrese', 'arrows', 'Riccardo Patrese', 'ITA'),
        seat('fittipaldi-fittipaldi', 'fittipaldi', 'Emerson Fittipaldi', 'BRA'),
        seat('brabham-lauda', 'brabham', 'Niki Lauda', 'AUT'),
        seat('brabham-piquet', 'brabham', 'Nelson Piquet', 'BRA'),
        seat('mclaren-tambay', 'mclaren', 'Patrick Tambay', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1979 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 73 }],
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'rt_zolder' },
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'netherlands', name: 'Dutch Grand Prix', track: { id: 'ks_zandvoort' }, climate: Climate.OCEANIC },
    {
      id: 'italy',
      name: 'Italian Grand Prix',
      track: { id: 'monza' },
      sessionLengths: [{ session: 'grand-prix', laps: 50 }],
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'lilski_watkins_glen', layout: 'boot_classic' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
