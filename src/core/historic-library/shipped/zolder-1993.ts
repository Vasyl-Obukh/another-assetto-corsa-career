import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Zolder 1993, as a historic event of its own.
 */
export const ZOLDER_1993: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'zolder-1993',
  name: 'Zolder 1993',
  description: 'The first round of the Class 1 DTM, where the Mercedes 190E met the Alfa Romeo 155.',
  teams: [
    team('stern', 'Stern Tourenwagen', 'DEU', TeamBudget.WORKS),
    team('biscione', 'Squadra Biscione', 'ITA', TeamBudget.WORKS),
    team('weiss-blau', 'Weiß-Blau Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('rheinland', 'Rheinland Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('wien', 'Team Wienerwald', 'AUT', TeamBudget.PRIVATEER),
    team('limburg', 'Limburg Tourenwagen', 'NLD', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'class-1',
      name: 'Class 1',
      ladder: {
        discipline: Discipline.TOURING,
        tier: 2,
      },
      seats: [
        seat('ste-1', 'stern', 'Joachim Brückmann', 'DEU'),
        seat('ste-2', 'stern', 'Rüdiger Kallenbach', 'DEU'),
        seat('ste-3', 'stern', 'Henning Ostheim', 'DEU'),
        seat('bis-1', 'biscione', 'Nicola Lanzoni', 'ITA'),
        seat('bis-2', 'biscione', 'Sandro Pellizzari', 'ITA'),
        seat('bis-3', 'biscione', 'Giorgio Frassinetti', 'ITA'),
        seat('wbm-1', 'weiss-blau', 'Johannes Ebner', 'DEU'),
        seat('wbm-2', 'weiss-blau', 'Kurt Thalhammer', 'DEU'),
        seat('rhe-1', 'rheinland', 'Ralf Oberdorf', 'DEU'),
        seat('rhe-2', 'rheinland', 'Marco Werninghaus', 'DEU'),
        seat('wie-1', 'wien', 'Harald Gruber', 'AUT'),
        seat('wie-2', 'wien', 'Peter Zellhofer', 'AUT'),
        seat('lim-1', 'limburg', 'Jos Vranken', 'NLD'),
        seat('lim-2', 'limburg', 'Frans Coolsaet', 'BEL'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.DTM_1993,
        minModels: 1,
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 30,
          day: 0,
        },
        {
          id: 'qualifying',
          type: 'qualify',
          name: 'Qualifying',
          minutes: 30,
          day: 0,
        },
        {
          type: 'race',
          name: 'Heat 1',
          distance: 65,
          day: 1,
          inherit: {
            from: 'qualifying',
          },
        },
        {
          type: 'race',
          name: 'Heat 2',
          distance: 65,
          day: 1,
          inherit: {
            from: 'qualifying',
          },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'event',
      name: 'Zolder 1993',
      track: {
        id: 'rt_zolder',
      },
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
    strength: 2,
    aggression: 20,
  },
  generatedWeather: {
    climate: Climate.TEMPERATE,
  },
  regulations: {
    assists: {
      damage: 100,
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  prizes: {
    positions: [20000, 14000, 10000, 7500, 5500, 4000, 3000, 2200, 1500, 800],
  },
};
