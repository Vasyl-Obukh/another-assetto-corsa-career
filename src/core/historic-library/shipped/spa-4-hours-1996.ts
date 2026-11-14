import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Spa 4 Hours 1996, as a historic event of its own.
 */
export const SPA_4_HOURS_1996: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'spa-4-hours-1996',
  name: 'Spa 4 Hours 1996',
  description: {
    en: 'The BPR\'s GT1 cars at Spa: McLaren F1 GTRs against the Porsches and Ferraris.',
    uk: 'Машини GT1 серії BPR у Спа: McLaren F1 GTR проти Porsche та Ferrari.',
  },
  teams: [
    team('woking-gt', 'Albion GT', 'GBR', TeamBudget.WORKS),
    team('gulf-gt', 'Harrow Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('bigazzi-gt', 'Squadra Toscana', 'ITA', TeamBudget.INDEPENDENT),
    team('west-gt', 'Kölner Sportwagen', 'DEU', TeamBudget.INDEPENDENT),
    team('parabolica', 'Écurie Parabolique', 'FRA', TeamBudget.PRIVATEER),
    team('jacadi', 'Stoke Rochford Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt1',
      name: 'GT1',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 1,
      },
      seats: [
        seat('alb-1', 'woking-gt', 'Nigel Ashcroft', 'GBR'),
        seat('alb-2', 'woking-gt', 'Simon Treloar', 'GBR'),
        seat('har-1', 'gulf-gt', 'Ray Lindholm', 'GBR'),
        seat('har-2', 'gulf-gt', 'Pete Waddington', 'GBR'),
        seat('tos-1', 'bigazzi-gt', 'Gabriele Nesti', 'ITA'),
        seat('tos-2', 'bigazzi-gt', 'Paolo Serafini', 'ITA'),
        seat('kol-1', 'west-gt', 'Thomas Gerlinger', 'DEU'),
        seat('kol-2', 'west-gt', 'Ulf Brenninkmeyer', 'DEU'),
        seat('par-1', 'parabolica', 'Jean-Luc Mauriac', 'FRA'),
        seat('par-2', 'parabolica', 'Yannick Berthollet', 'FRA'),
        seat('sto-1', 'jacadi', 'Andrew Pryor', 'GBR'),
        seat('sto-2', 'jacadi', 'Mark Pennington', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_mclaren_f1_gtr'],
      },
    },
  ],
  eventFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 90,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 60,
          day: 0,
        },
        {
          id: 'race',
          type: 'race',
          name: '4 Hours',
          laps: 122,
          day: 1,
        },
      ],
    },
  ],
  defaultEventFormat: 'four-hours',
  rounds: [
    {
      id: 'event',
      name: 'Spa 4 Hours 1996',
      track: {
        id: 'spa',
      },
      sessionLengths: [
        {
          session: 'race',
          laps: 100,
        },
      ],
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'none',
      name: 'No points',
      positions: [],
    },
  ],
  defaultPointsSystem: 'none',
  grid: {
    strength: 4,
  },
  generatedWeather: {
    climate: Climate.TEMPERATE,
  },
  regulations: {
    assists: {
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
  },
};
