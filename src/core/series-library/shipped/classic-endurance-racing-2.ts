import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Classic Endurance Racing 2 - today's historic series for the endurance cars
 * of 1966 to 1981.
 *
 * Peter Auto's CER 2 races the three-litre prototypes and the Group 5 and GT
 * cars of the seventies over an hour with a stop. Porsche Pack 1 carries two
 * of its cars: the 935/78 in Group 5 and the Carrera RSR 3.0 in GT, which race
 * as classes. Three of its 2026 circuits are raced: Spa, Imola and Estoril;
 * Paul Ricard and Montjuic are not in Assetto Corsa. The points are the
 * 25-18-15 scale: the series' own table was not found. The field is invented.
 *
 * Source: https://www.peterauto.fr/en/competition/classic-endurance-racing-2/
 */
export const CLASSIC_ENDURANCE_RACING_2: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'classic-endurance-racing-2',
  name: 'Classic Endurance Racing 2',
  description: 'Today\'s historic series for seventies endurance cars: the 935/78 in Group 5 and the '
    + 'Carrera RSR in GT, over an hour at Spa, Imola and Estoril.',
  teams: [
    team('cer-kremer', 'Rennstall Rheinland', 'DEU', TeamBudget.INDEPENDENT),
    team('cer-fr', 'Écurie Francorchamps Historique', 'BEL', TeamBudget.PRIVATEER),
    team('cer-it', 'Scuderia Endurance Storica', 'ITA', TeamBudget.PRIVATEER),
    team('cer-uk', 'Silverline Historic', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-5',
      name: 'Group 5',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('g5-rhe-1', 'cer-kremer', 'Heiner Brüggemann', 'DEU'),
        seat('g5-rhe-2', 'cer-kremer', 'Axel Tennstedt', 'DEU'),
        seat('g5-fra-1', 'cer-fr', 'Thierry Moureau', 'BEL'),
        seat('g5-ita-1', 'cer-it', 'Paolo Ceriani', 'ITA'),
        seat('g5-uk-1', 'cer-uk', 'Graham Bevington', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_935_78_moby_dick'] },
    },
    {
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-rhe-1', 'cer-kremer', 'Wolfgang Ahlers', 'DEU'),
        seat('gt-fra-1', 'cer-fr', 'Luc Verhaegen', 'BEL'),
        seat('gt-fra-2', 'cer-fr', 'Marc Dewandre', 'BEL'),
        seat('gt-ita-1', 'cer-it', 'Gianni Merlotti', 'ITA'),
        seat('gt-ita-2', 'cer-it', 'Roberto Salvioni', 'ITA'),
        seat('gt-uk-1', 'cer-uk', 'Oliver Stanhope', 'GBR'),
        seat('gt-uk-2', 'cer-uk', 'James Wetherby', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_911_carrera_rsr'] },
      grid: { strength: -3 },
      prizes: {
        positions: [15600, 10900, 7800, 5950, 4550, 3400, 2500, 1850, 1250, 800],
        standings: [125000, 78000, 50000, 32500, 20500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 45, day: 0 },
        { type: 'race', name: 'One hour', distance: 165, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    {
      id: 'estoril',
      name: 'Estoril',
      track: { id: 'estoril_2021', layout: 'estoril_gp' },
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -1 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 7000,
  prizes: {
    positions: [26000, 18200, 13000, 9900, 7550, 5700, 4150, 3100, 2100, 1300],
    standings: [208000, 130000, 83000, 54500, 34000],
  },
};
