import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT World Challenge Europe Endurance Cup, 2024 - the GT3 endurance series, on
 * LFM's GT3 cars.
 *
 * Three of five rounds at their real lengths, on LFM's large-box layouts:
 * three hours at Monza and the Nurburgring, and the Spa 24 Hours with its
 * Superpole of the fastest twenty. Paul Ricard and Jeddah are not in Assetto
 * Corsa. The Nurburgring's thirty-six boxes cap a grid that ran fifty at Spa.
 * The Pro, Gold, Silver and Bronze cups share one grid and one class here;
 * qualifying is one session where the real one averages three drivers'.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The Spa 24 Hours
 * paid points at six and twelve hours as well as at the finish, which a points
 * system cannot say yet. The field is invented: the GT-M Championship's
 * paddock and six more teams.
 *
 * Source: https://en.wikipedia.org/wiki/2024_GT_World_Challenge_Europe_Endurance_Cup
 */
export const GT_WORLD_CHALLENGE_ENDURANCE_2024: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt-world-challenge-endurance-2024',
  name: 'GT World Challenge Europe Endurance Cup 2024',
  description: 'Europe\'s GT3 endurance series of 2024 on LFM\'s GT3 cars: three hours at Monza and the '
    + 'Nurburgring, and the Spa 24 Hours.',
  teams: [
    team('ironbridge', 'Ironbridge Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('valcorte', 'Valcorte Motorsport', 'Italy', 'ITA', TeamBudget.WORKS),
    team('lindenhof', 'Lindenhof Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('blanc-nez', 'Team Blanc-Nez', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('kobalt', 'Kobalt Motorsport', 'Austria', 'AUT', TeamBudget.INDEPENDENT),
    team('marisol', 'Marisol Racing', 'Spain', 'ESP', TeamBudget.INDEPENDENT),
    team('polder', 'Polder GT', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('odin', 'Odin Racing', 'Denmark', 'DEN', TeamBudget.PRIVATEER),
    team('cedar', 'Cedar Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('jade-dragon', 'Jade Dragon Racing', 'Hong Kong', 'HKG', TeamBudget.PRIVATEER),
    team('wallonie', 'Wallonie GT', 'Belgium', 'BEL', TeamBudget.PRIVATEER),
    team('vltava', 'Vltava Racing', 'Czech Republic', 'CZE', TeamBudget.PRIVATEER),
    team('ravenstein', 'Ravenstein Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lagoa', 'Lagoa Motorsport', 'Portugal', 'POR', TeamBudget.PRIVATEER),
    team('saint-omer', 'Team Saint-Omer', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('toscana', 'Toscana GT', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('norrland', 'Norrland Racing', 'Sweden', 'SWE', TeamBudget.PRIVATEER),
    team('aotearoa', 'Aotearoa GT', 'New Zealand', 'NZL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('iro-1', 'ironbridge', 'Dominic Farrant', 'Great Britain', 'GBR'),
        seat('iro-2', 'ironbridge', 'Luke Chesterfield', 'Great Britain', 'GBR'),
        seat('val-1', 'valcorte', 'Andrea Bellomi', 'Italy', 'ITA'),
        seat('val-2', 'valcorte', 'Marco Pellegatta', 'Italy', 'ITA'),
        seat('lin-1', 'lindenhof', 'Tobias Brennecke', 'Germany', 'GER'),
        seat('lin-2', 'lindenhof', 'Fabian Sturmfels', 'Germany', 'GER'),
        seat('bla-1', 'blanc-nez', 'Mathieu Lévêque', 'France', 'FRA'),
        seat('bla-2', 'blanc-nez', 'Julien Castagnède', 'France', 'FRA'),
        seat('kob-1', 'kobalt', 'Raphael Hinterleitner', 'Austria', 'AUT'),
        seat('kob-2', 'kobalt', 'Florian Moosbrugger', 'Austria', 'AUT'),
        seat('mar-1', 'marisol', 'Carlos Montesinos', 'Spain', 'ESP'),
        seat('mar-2', 'marisol', 'Iker Garaizar', 'Spain', 'ESP'),
        seat('pol-1', 'polder', 'Rens Hoogeveen', 'Netherlands', 'NED'),
        seat('pol-2', 'polder', 'Mees Westerhof', 'Netherlands', 'NED'),
        seat('odi-1', 'odin', 'Mads Kirkegaard', 'Denmark', 'DEN'),
        seat('odi-2', 'odin', 'Frederik Aagaard', 'Denmark', 'DEN'),
        seat('ced-1', 'cedar', 'Brandon Oakridge', 'United States', 'USA'),
        seat('ced-2', 'cedar', 'Tyler McKinnon', 'United States', 'USA'),
        seat('jad-1', 'jade-dragon', 'Marcus Leung', 'Hong Kong', 'HKG'),
        seat('jad-2', 'jade-dragon', 'Darren Siu', 'Hong Kong', 'HKG'),
        seat('wal-1', 'wallonie', 'Maxime Goffinet', 'Belgium', 'BEL'),
        seat('wal-2', 'wallonie', 'Cédric Lambotte', 'Belgium', 'BEL'),
        seat('vlt-1', 'vltava', 'Jakub Hrubeš', 'Czech Republic', 'CZE'),
        seat('vlt-2', 'vltava', 'Ondřej Pokorný', 'Czech Republic', 'CZE'),
        seat('rav-1', 'ravenstein', 'Stefan Hollwedel', 'Germany', 'GER'),
        seat('rav-2', 'ravenstein', 'Daniel Fehrenbach', 'Germany', 'GER'),
        seat('lag-1', 'lagoa', 'Tiago Figueiró', 'Portugal', 'POR'),
        seat('lag-2', 'lagoa', 'André Casqueiro', 'Portugal', 'POR'),
        seat('som-1', 'saint-omer', 'Loïc Martinache', 'France', 'FRA'),
        seat('som-2', 'saint-omer', 'Antoine Ducrocq', 'France', 'FRA'),
        seat('tos-1', 'toscana', 'Matteo Rossignoli', 'Italy', 'ITA'),
        seat('tos-2', 'toscana', 'Pietro Guarnacci', 'Italy', 'ITA'),
        seat('nrl-1', 'norrland', 'Viktor Engqvist', 'Sweden', 'SWE'),
        seat('nrl-2', 'norrland', 'Johan Rydström', 'Sweden', 'SWE'),
        seat('aot-1', 'aotearoa', 'Blair McKellar', 'New Zealand', 'NZL'),
        seat('aot-2', 'aotearoa', 'Ethan Waitoa', 'New Zealand', 'NZL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'three-hours',
      name: 'Three hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 45, day: 1 },
        { type: 'race', name: '3 Hours', distance: 480, day: 2 },
      ],
    },
    {
      id: 'spa-24',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 180, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        {
          id: 'superpole',
          type: 'qualify',
          name: 'Superpole',
          minutes: 20,
          day: 1,
          inherit: { from: 'qualifying', top: 20 },
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 478,
          day: 2,
          inherit: { from: 'superpole' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'three-hours',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza', layout: 'lfm' } },
    {
      id: 'spa',
      name: 'Spa 24 Hours',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      weekendFormat: 'spa-24',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b_osrw_lfm_tracklimits' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 1, aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
