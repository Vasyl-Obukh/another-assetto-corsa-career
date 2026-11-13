import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Nürburgring 24 Hours 2004, as a historic event of its own.
 */
export const NURBURGRING_24_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'nurburgring-24-2004',
  name: 'Nürburgring 24 Hours 2004',
  description: 'Twenty-four hours round the Nordschleife and the Grand Prix circuit together.',
  teams: [
    team('eifel-gt', 'Eifelwind Racing', 'DEU', TeamBudget.WORKS),
    team('hohe-acht', 'Hohe Acht Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('brunnchen', 'Brünnchen Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('pflanzgarten', 'Team Pflanzgarten', 'DEU', TeamBudget.PRIVATEER),
    team('karussell', 'Karussell Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('adenau', 'Adenau Racing', 'DEU', TeamBudget.PRIVATEER),
    team('flemish-ring', 'Vlaamse Ring Racing', 'BEL', TeamBudget.PRIVATEER),
    team('ring-nl', 'Groene Hel Racing', 'NLD', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sp8',
      name: 'SP8',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
      seats: [
        seat('sp8-eif-1', 'eifel-gt', 'Sven Mertesacker', 'DEU'),
        seat('sp8-eif-2', 'eifel-gt', 'Jan Kowalewski', 'DEU'),
        seat('sp8-hoh-1', 'hohe-acht', 'Patrick Welzbacher', 'DEU'),
        seat('sp8-hoh-2', 'hohe-acht', 'Robin Assmann', 'DEU'),
        seat('sp8-bru-1', 'brunnchen', 'Tobias Leiendecker', 'DEU'),
        seat('sp8-vla-1', 'flemish-ring', 'Kobe Verstraeten', 'BEL'),
        seat('sp8-eif-b-1', 'eifel-gt', 'Benno Rathmann', 'DEU'),
        seat('sp8-hoh-b-1', 'hohe-acht', 'Christoph Linnartz', 'DEU'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.GT1_2000S,
      },
    },
    {
      id: 'sp7',
      name: 'SP7',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 3,
      },
      seats: [
        seat('sp7-pfl-1', 'pflanzgarten', 'Marcel Lüthje', 'DEU'),
        seat('sp7-pfl-2', 'pflanzgarten', 'Kevin Dreesen', 'DEU'),
        seat('sp7-kar-1', 'karussell', 'Dennis Olbrich', 'DEU'),
        seat('sp7-kar-2', 'karussell', 'Philipp Koenen', 'DEU'),
        seat('sp7-ade-1', 'adenau', 'Jens Bleidorn', 'DEU'),
        seat('sp7-ade-2', 'adenau', 'Anika Schroers', 'DEU'),
        seat('sp7-grn-1', 'ring-nl', 'Wessel Ruijters', 'NLD'),
        seat('sp7-grn-2', 'ring-nl', 'Bart Hendriksen', 'NLD'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'gue_bmw_m3_e46_gtr',
          'rss_gtn_protech_96',
          'rss_gtn_ferruccio_36',
          'rss_gtn_furiano_36',
        ],
      },
      grid: {
        strength: -1,
      },
      entryFee: 1500,
      prizes: {
        positions: [15000, 10500, 7500, 5700, 4350, 3300, 2400, 1800, 1200, 750],
      },
    },
    {
      id: 'skyline',
      name: 'Skyline R34',
      ladder: {
        discipline: Discipline.TOURING,
        tier: 4,
      },
      seats: [
        seat('sky-kar-1', 'karussell', 'Lennart Dahmen', 'DEU'),
        seat('sky-kar-2', 'karussell', 'Yannik Stöckl', 'DEU'),
        seat('sky-ade-1', 'adenau', 'Rolf Heinen', 'DEU'),
        seat('sky-ade-2', 'adenau', 'Tim Schwadorf', 'DEU'),
        seat('sky-vla-1', 'flemish-ring', 'Jens De Wulf', 'BEL'),
        seat('sky-pfl-1', 'pflanzgarten', 'Ralf Bleckmann', 'DEU'),
        seat('sky-grn-1', 'ring-nl', 'Stijn Molenaar', 'NLD'),
        seat('sky-bru-1', 'brunnchen', 'Heiko Gehlen', 'DEU'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['gue_nissan_skyline_r34_24h'],
      },
      grid: {
        strength: -4,
      },
      entryFee: 900,
      prizes: {
        positions: [9000, 6300, 4500, 3400, 2600, 2000, 1450, 1100, 700, 450],
      },
    },
  ],
  eventFormats: [
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 180,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 120,
          day: 1,
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 137,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'twenty-four-hours',
  rounds: [
    {
      id: 'event',
      name: 'Nürburgring 24 Hours 2004',
      track: {
        id: 'ks_nordschleife',
        layout: 'endurance',
      },
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
    aggression: 10,
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
  entryFee: 2500,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
  },
};
