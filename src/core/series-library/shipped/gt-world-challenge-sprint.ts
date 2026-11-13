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
 * An event of two one-hour races, each from a qualifying of its own, with a
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
  description: {
    en: 'Europe\'s GT3 sprint series on LFM\'s GT3 cars: two one-hour races a round at Brands '
      + 'Hatch, Magny-Cours, Zandvoort and Valencia.',
    uk: 'Європейська спринтерська серія GT3 на машинах GT3 від LFM: дві годинні гонки за етап у '
      + 'Брендс-Хетчі, Магні-Курі, Зандворті та Валенсії.',
  },
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
      id: 'gt3',
      name: 'GT3',
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
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Sprint',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
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
  grid: { strength: 1, aggression: 10 },
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
