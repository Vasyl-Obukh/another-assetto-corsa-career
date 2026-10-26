import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Brands Hatch 1998, as a historic event of its own.
 */
export const BRANDS_HATCH_1998: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'brands-hatch-1998',
  name: 'Brands Hatch 1998',
  description: 'Super Touring at its height: the Indy circuit, a full grid and door handles into Paddock Hill bend.',
  teams: [
    team('pennine', 'Pennine Motorsport', 'GBR', TeamBudget.WORKS),
    team('wessex', 'Wessex Racing', 'GBR', TeamBudget.WORKS),
    team('humber', 'Humberside Touring', 'GBR', TeamBudget.WORKS),
    team('severn', 'Severn Valley Racing', 'GBR', TeamBudget.WORKS),
    team('fenland', 'Fenland Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('mersey', 'Merseyside Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('highland', 'Highland Touring', 'GBR', TeamBudget.INDEPENDENT),
    team('tyne', 'Tyneside Racing', 'GBR', TeamBudget.PRIVATEER),
    team('chiltern', 'Chiltern Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('solway', 'Solway Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-touring',
      name: 'Super Touring',
      ladder: {
        discipline: Discipline.TOURING,
        tier: 2,
      },
      seats: [
        seat('pen-1', 'pennine', 'Graham Ashworth', 'GBR'),
        seat('pen-2', 'pennine', 'Neil Brathwaite', 'GBR'),
        seat('wes-1', 'wessex', 'Colin Sherborne', 'GBR'),
        seat('wes-2', 'wessex', 'Martin Wareham', 'GBR'),
        seat('hum-1', 'humber', 'Steve Harrowby', 'GBR'),
        seat('hum-2', 'humber', 'Paul Kilburn', 'GBR'),
        seat('sev-1', 'severn', 'Gareth Llewellin', 'GBR'),
        seat('sev-2', 'severn', 'Rhodri Maddocks', 'GBR'),
        seat('fen-1', 'fenland', 'Andy Pickersgill', 'GBR'),
        seat('fen-2', 'fenland', 'Keith Mowbray', 'GBR'),
        seat('mer-1', 'mersey', 'Tony Ackroyd', 'GBR'),
        seat('mer-2', 'mersey', 'Dean Halewood', 'GBR'),
        seat('hig-1', 'highland', 'Iain Strathearn', 'GBR'),
        seat('hig-2', 'highland', 'Fraser Dunnachie', 'GBR'),
        seat('tyn-1', 'tyne', 'Craig Hebburn', 'GBR'),
        seat('tyn-2', 'tyne', 'Lee Fawdon', 'GBR'),
        seat('chi-1', 'chiltern', 'Richard Penfold', 'GBR'),
        seat('chi-2', 'chiltern', 'Julian Tresham', 'GBR'),
        seat('sol-1', 'solway', 'Alan Gatehouse', 'GBR'),
        seat('sol-2', 'solway', 'Rob Annandale', 'GBR'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.SUPER_TOURING_1990S,
        minModels: 3,
      },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Sprint and feature',
      sessions: [
        {
          type: 'practice',
          name: 'Practice',
          minutes: 45,
          day: 0,
        },
        {
          id: 'sprint-qualifying',
          type: 'qualify',
          name: 'Sprint qualifying',
          minutes: 20,
          day: 0,
        },
        {
          id: 'feature-qualifying',
          type: 'qualify',
          name: 'Feature qualifying',
          minutes: 20,
          day: 0,
        },
        {
          id: 'sprint',
          type: 'race',
          name: 'Sprint race',
          distance: 40,
          day: 1,
          inherit: {
            from: 'sprint-qualifying',
          },
        },
        {
          id: 'feature',
          type: 'race',
          name: 'Feature race',
          distance: 80,
          day: 1,
          inherit: {
            from: 'feature-qualifying',
          },
        },
      ],
    },
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'event',
      name: 'Brands Hatch 1998',
      track: {
        id: 'ks_brands_hatch',
        layout: 'indy',
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
    strength: 1,
    aggression: 30,
  },
  generatedWeather: {
    climate: Climate.OCEANIC,
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
  entryFee: 3000,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
  },
};
