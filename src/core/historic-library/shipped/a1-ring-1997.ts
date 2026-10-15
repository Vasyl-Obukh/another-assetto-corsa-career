import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * A1-Ring 1997, as a historic event of its own.
 */
export const A1_RING_1997: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'a1-ring-1997',
  name: 'A1-Ring 1997',
  description: 'FIA GT\'s purpose-built GT1 cars in the Styrian hills.',
  teams: [
    team('stuttgart-gt', 'Neckar GT Racing', 'DEU', TeamBudget.WORKS),
    team('weissach-gt', 'Schwarzwald Motorsport', 'DEU', TeamBudget.WORKS),
    team('woking-97', 'Surrey GT Team', 'GBR', TeamBudget.WORKS),
    team('roock', 'Leverkusen Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('dams-gt', 'Écurie Vexin', 'FRA', TeamBudget.INDEPENDENT),
    team('gtc', 'Grampian Racing', 'GBR', TeamBudget.PRIVATEER),
    team('konrad', 'Tirol Motorsport', 'AUT', TeamBudget.PRIVATEER),
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
        seat('nec-1', 'stuttgart-gt', 'Rainer Fessler', 'DEU'),
        seat('nec-2', 'stuttgart-gt', 'Jochen Albrecht', 'DEU'),
        seat('nec-3', 'stuttgart-gt', 'Matthias Tanner', 'DEU'),
        seat('sch-1', 'weissach-gt', 'Hartmut Seebach', 'DEU'),
        seat('sch-2', 'weissach-gt', 'Leonhard Rieger', 'DEU'),
        seat('sur-1', 'woking-97', 'Gavin Pettigrew', 'GBR'),
        seat('sur-2', 'woking-97', 'Neil Chamberlayne', 'GBR'),
        seat('sur-3', 'woking-97', 'Owen Dymock', 'GBR'),
        seat('lev-1', 'roock', 'Dirk Hollmann', 'DEU'),
        seat('lev-2', 'roock', 'Sascha Wernicke', 'DEU'),
        seat('vex-1', 'dams-gt', 'Olivier Lamarque', 'FRA'),
        seat('vex-2', 'dams-gt', 'Fabien Rostand', 'FRA'),
        seat('gra-1', 'gtc', 'Kenneth Arbuthnot', 'GBR'),
        seat('gra-2', 'gtc', 'Duncan Macrae', 'GBR'),
        seat('tir-1', 'konrad', 'Franz Obermoser', 'AUT'),
        seat('tir-2', 'konrad', 'Walter Kostner', 'AUT'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.GT1_1990S,
        minModels: 1,
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
          laps: 130,
          day: 1,
        },
      ],
    },
  ],
  defaultEventFormat: 'four-hours',
  rounds: [
    {
      id: 'event',
      name: 'A1-Ring 1997',
      track: {
        id: 'ks_red_bull_ring',
        layout: 'layout_gp',
      },
      sessionLengths: [
        {
          session: 'race',
          laps: 161,
        },
      ],
      climate: Climate.TEMPERATE,
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
    climate: Climate.MEDITERRANEAN,
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
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
  },
};
