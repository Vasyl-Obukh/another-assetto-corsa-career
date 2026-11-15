import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * 24 Hours of Le Mans 1962, as a historic event of its own.
 */
export const LE_MANS_1962: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'le-mans-1962',
  name: '24 Hours of Le Mans 1962',
  description: {
    en: 'The GT cars of the early sixties at the Sarthe, in the year the Ferrari 250 GTO arrived.',
    uk: 'GT-машини початку шістдесятих на Сарті - у рік, коли з\'явився Ferrari 250 GTO.',
  },
  teams: [
    team('maranello-gt', 'Scuderia Serenissima Veneta', 'ITA', TeamBudget.WORKS),
    team('ecurie-francorchamps', 'Écurie des Hautes Fagnes', 'BEL', TeamBudget.INDEPENDENT),
    team('uk-gto', 'Chelsea Racing Stable', 'GBR', TeamBudget.INDEPENDENT),
    team('nart-gt', 'Hudson Valley Racing', 'USA', TeamBudget.INDEPENDENT),
    team('ecurie-lorraine', 'Écurie Lorraine', 'FRA', TeamBudget.PRIVATEER),
    team('scuderia-sant-ambroeus', 'Scuderia Brianza', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt',
      name: 'GT over 2 litres',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
      seats: [
        seat('ser-1', 'maranello-gt', 'Giorgio Scapinelli', 'ITA'),
        seat('ser-2', 'maranello-gt', 'Ludovico Bertazzi', 'ITA'),
        seat('ser-3', 'maranello-gt', 'Nino Rasella', 'ITA'),
        seat('fag-1', 'ecurie-francorchamps', 'Olivier Delhasse', 'BEL'),
        seat('fag-2', 'ecurie-francorchamps', 'Paul Frédéricq', 'BEL'),
        seat('che-1', 'uk-gto', 'Rupert Blandford', 'GBR'),
        seat('che-2', 'uk-gto', 'Michael Ashbrook', 'GBR'),
        seat('che-3', 'uk-gto', 'Colin Fairlie', 'GBR'),
        seat('hud-1', 'nart-gt', 'Ed Kessler', 'USA'),
        seat('hud-2', 'nart-gt', 'Bob Gattling', 'USA'),
        seat('lor-1', 'ecurie-lorraine', 'Jacques Vauthier', 'FRA'),
        seat('lor-2', 'ecurie-lorraine', 'Pierre Marmande', 'FRA'),
        seat('bri-1', 'scuderia-sant-ambroeus', 'Carlo Mezzanotte', 'ITA'),
        seat('bri-2', 'scuderia-sant-ambroeus', 'Franco Villani', 'ITA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_ferrari_250_gto'],
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
          name: 'Practice',
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
          laps: 340,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'twenty-four-hours',
  rounds: [
    {
      id: 'event',
      name: '24 Hours of Le Mans 1962',
      track: recommendedTrack('le-mans/no-chicanes'),
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
    aggression: -5,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
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
  entryFee: 2800,
  prizes: {
    positions: [28000, 19600, 14000, 10650, 8100, 6150, 4500, 3350, 2250, 1400],
  },
};
