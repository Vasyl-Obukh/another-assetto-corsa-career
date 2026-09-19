import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT-M Championship - invented, for RSS's GT-M cars.
 *
 * RSS's GT-M cars are their own GT3s under made-up names, so no real series
 * races them; this one borrows GT World Challenge's sprint weekend - two
 * qualifying sessions and two hour-long races, each from its own session - and
 * a European calendar, and says it is made up. The class is the GT3 (RSS)
 * spec, any three of its models to a grid.
 */
export const GT_M_CHAMPIONSHIP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt-m-championship',
  name: 'GT-M Championship',
  description: 'Invented: RSS\'s GT-M cars in a GT3 sprint series, two one-hour races a weekend at '
    + 'European circuits.',
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
      id: 'gt-m',
      name: 'GT-M',
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
      eligibility: { kind: 'spec', spec: CarSpec.GT3_RSS, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'sprint',
      name: 'Sprint weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 15, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 15, day: 0 },
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
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'magny-cours', name: 'Magny-Cours', track: { id: 'magnycours22' }, climate: Climate.TEMPERATE },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    { id: 'valencia', name: 'Valencia', track: { id: 'fn_valencia', layout: 'gp' } },
    { id: 'barcelona', name: 'Barcelona', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 92, aiLevelMin: 84, aiAggression: 40 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 8000,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
    standings: [240000, 150000, 96000, 63000, 39000],
  },
};
