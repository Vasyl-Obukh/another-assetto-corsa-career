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
 * races them; this one borrows GT World Challenge's sprint event - two
 * qualifying sessions and two hour-long races, each from its own session - and
 * a European calendar, and says it is made up. The class is the GT3 (RSS)
 * spec, any three of its models to a grid.
 */
export const GT_M_CHAMPIONSHIP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt-m-championship',
  name: 'GT-M Championship',
  description: 'Invented: RSS\'s GT-M cars in a GT3 sprint series, two one-hour races a round at '
    + 'European circuits.',
  teams: [
    team('ironbridge', 'Ironbridge Racing', 'GBR', TeamBudget.WORKS),
    team('valcorte', 'Valcorte Motorsport', 'ITA', TeamBudget.WORKS),
    team('lindenhof', 'Lindenhof Racing', 'DEU', TeamBudget.WORKS),
    team('blanc-nez', 'Team Blanc-Nez', 'FRA', TeamBudget.INDEPENDENT),
    team('kobalt', 'Kobalt Motorsport', 'AUT', TeamBudget.INDEPENDENT),
    team('marisol', 'Marisol Racing', 'ESP', TeamBudget.INDEPENDENT),
    team('polder', 'Polder GT', 'NLD', TeamBudget.INDEPENDENT),
    team('odin', 'Odin Racing', 'DNK', TeamBudget.PRIVATEER),
    team('cedar', 'Cedar Racing', 'USA', TeamBudget.PRIVATEER),
    team('jade-dragon', 'Jade Dragon Racing', 'HKG', TeamBudget.PRIVATEER),
    team('wallonie', 'Wallonie GT', 'BEL', TeamBudget.PRIVATEER),
    team('vltava', 'Vltava Racing', 'CZE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt-m',
      name: 'GT-M',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('iro-1', 'ironbridge', 'Dominic Farrant', 'GBR'),
        seat('iro-2', 'ironbridge', 'Luke Chesterfield', 'GBR'),
        seat('val-1', 'valcorte', 'Andrea Bellomi', 'ITA'),
        seat('val-2', 'valcorte', 'Marco Pellegatta', 'ITA'),
        seat('lin-1', 'lindenhof', 'Tobias Brennecke', 'DEU'),
        seat('lin-2', 'lindenhof', 'Fabian Sturmfels', 'DEU'),
        seat('bla-1', 'blanc-nez', 'Mathieu Lévêque', 'FRA'),
        seat('bla-2', 'blanc-nez', 'Julien Castagnède', 'FRA'),
        seat('kob-1', 'kobalt', 'Raphael Hinterleitner', 'AUT'),
        seat('kob-2', 'kobalt', 'Florian Moosbrugger', 'AUT'),
        seat('mar-1', 'marisol', 'Carlos Montesinos', 'ESP'),
        seat('mar-2', 'marisol', 'Iker Garaizar', 'ESP'),
        seat('pol-1', 'polder', 'Rens Hoogeveen', 'NLD'),
        seat('pol-2', 'polder', 'Mees Westerhof', 'NLD'),
        seat('odi-1', 'odin', 'Mads Kirkegaard', 'DNK'),
        seat('odi-2', 'odin', 'Frederik Aagaard', 'DNK'),
        seat('ced-1', 'cedar', 'Brandon Oakridge', 'USA'),
        seat('ced-2', 'cedar', 'Tyler McKinnon', 'USA'),
        seat('jad-1', 'jade-dragon', 'Marcus Leung', 'HKG'),
        seat('jad-2', 'jade-dragon', 'Darren Siu', 'HKG'),
        seat('wal-1', 'wallonie', 'Maxime Goffinet', 'BEL'),
        seat('wal-2', 'wallonie', 'Cédric Lambotte', 'BEL'),
        seat('vlt-1', 'vltava', 'Jakub Hrubeš', 'CZE'),
        seat('vlt-2', 'vltava', 'Ondřej Pokorný', 'CZE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_RSS, minModels: 3 },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Sprint',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 15, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 15, day: 0 },
        { type: 'race', name: 'Race 1', distance: 165, day: 1, inherit: { from: 'qualifying-1' } },
        { type: 'race', name: 'Race 2', distance: 165, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultEventFormat: 'sprint',
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
  grid: { aggression: 10 },
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
