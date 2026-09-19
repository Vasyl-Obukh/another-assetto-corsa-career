import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT World Challenge Europe Sprint Cup - the GT3 sprint series, on LFM's GT3
 * cars.
 *
 * A weekend of two one-hour races, each from a qualifying of its own, with a
 * compulsory stop and a driver change that cannot be said yet. The calendar is
 * the circuits of the Sprint Cup's recent seasons that Assetto Corsa has -
 * Brands Hatch, Magny-Cours, Zandvoort and Valencia - rather than one
 * season's, which was not checked; Misano and Hockenheim are not in Assetto
 * Corsa. The Pro, Gold and Silver cups share one grid and one class here.
 *
 * Points are 16.5-12-9.5-7.5-6-4.5-3-2-1-0.5 a race, the table as understood
 * rather than checked. The field is invented, and is the same invented GT
 * paddock as the GT-M Championship's.
 *
 * Source: https://en.wikipedia.org/wiki/GT_World_Challenge_Europe_Sprint_Cup
 */
export const GT_WORLD_CHALLENGE_SPRINT: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt-world-challenge-sprint',
  name: 'GT World Challenge Europe Sprint Cup',
  description: 'Europe\'s GT3 sprint series on LFM\'s GT3 cars: two one-hour races a weekend at Brands '
    + 'Hatch, Magny-Cours, Zandvoort and Valencia.',
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'sprint',
      name: 'Sprint weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        { type: 'race', name: 'Race 1', distance: 165, day: 1, inherit: { from: 'qualifying-1' } },
        { type: 'race', name: 'Race 2', distance: 165, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultWeekendFormat: 'sprint',
  rounds: [
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'gp_osrw' },
      climate: Climate.OCEANIC,
    },
    { id: 'magny-cours', name: 'Magny-Cours', track: { id: 'magnycours22' }, climate: Climate.TEMPERATE },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023_lfm_v2' },
      climate: Climate.OCEANIC,
    },
    { id: 'valencia', name: 'Valencia', track: { id: 'fn_valencia', layout: 'gp_lfm' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [16.5, 12, 9.5, 7.5, 6, 4.5, 3, 2, 1, 0.5] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 93, aiLevelMin: 85, aiAggression: 40 },
  generatedWeather: { climate: Climate.TEMPERATE },
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
