import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * 480 km of Silverstone 1990, as a historic event of its own.
 */
export const SILVERSTONE_480_1990: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'silverstone-480-1990',
  name: '480 km of Silverstone 1990',
  description: 'Jaguar\'s home race, and a full field of Group C cars at Silverstone.',
  teams: [
    team('silberpfeil', 'Silberpfeil Sportwagen', 'CHE', TeamBudget.WORKS),
    team('coventry', 'Coventry Prototypes', 'GBR', TeamBudget.WORKS),
    team('hiroshima', 'Rotary Racing Hiroshima', 'JPN', TeamBudget.WORKS),
    team('weissach', 'Weissach Kundensport', 'DEU', TeamBudget.INDEPENDENT),
    team('lausanne', 'Écurie Léman', 'CHE', TeamBudget.INDEPENDENT),
    team('kremer', 'Rheinbrücke Racing', 'DEU', TeamBudget.PRIVATEER),
    team('fuji-racing', 'Fujimi Motorsport', 'JPN', TeamBudget.PRIVATEER),
    team('spice', 'Thames Valley Prototypes', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-c',
      name: 'Group C',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 1,
      },
      seats: [
        seat('sil-1', 'silberpfeil', 'Markus Ebersold', 'DEU'),
        seat('sil-2', 'silberpfeil', 'Christophe Delarue', 'FRA'),
        seat('cov-1', 'coventry', 'Duncan McAllister', 'GBR'),
        seat('cov-2', 'coventry', 'Jan-Willem Terpstra', 'NLD'),
        seat('hir-1', 'hiroshima', 'Takashi Yoshimura', 'JPN'),
        seat('hir-2', 'hiroshima', 'Volker Weidemann', 'DEU'),
        seat('wei-1', 'weissach', 'Hans-Peter Steinbrecher', 'DEU'),
        seat('wei-2', 'weissach', 'Robert Wolfhart', 'FRA'),
        seat('lau-1', 'lausanne', 'Walter Brunnenmeister', 'CHE'),
        seat('lau-2', 'lausanne', 'Oscar Larrea', 'ARG'),
        seat('kre-1', 'kremer', 'Manfred Krebsbach', 'DEU'),
        seat('kre-2', 'kremer', 'Tomas Salmberg', 'SWE'),
        seat('fuj-1', 'fuji-racing', 'Kenji Hoshikawa', 'JPN'),
        seat('fuj-2', 'fuji-racing', 'Masaru Nakayama', 'JPN'),
        seat('spi-1', 'spice', 'Tim Harrowby', 'GBR'),
        seat('spi-2', 'spice', 'Fermín Ortega', 'ESP'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.GROUP_C,
        minModels: 1,
      },
    },
  ],
  eventFormats: [
    {
      id: 'silverstone',
      name: '480 km',
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
          type: 'race',
          name: '480 km',
          laps: 82,
          day: 1,
        },
      ],
    },
  ],
  defaultEventFormat: 'silverstone',
  rounds: [
    {
      id: 'event',
      name: '480 km of Silverstone 1990',
      track: {
        id: 'ks_silverstone',
        layout: 'gp',
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
  entryFee: 6000,
  prizes: {
    positions: [60000, 40000, 28000, 20000, 15000, 11000, 8000, 6000, 4000, 2500],
  },
};
