import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula Abarth, 2010 - the championship the Tatuus FA01 exists for.
 *
 * A real junior ladder rung, and a single-chassis one with a single car
 * installed, so the series names the car rather than a class or a spec.
 *
 * The 2010 season as it ran: 30-minute qualifying, then two races a round of
 * 28 minutes, the second starting from the first's result with its top eight
 * turned round. Race 1 pays 20-15-12-10-8-6-4-3-2-1 and race 2
 * 13-11-9-8-6-5-4-3-2-1, each with a point for fastest lap, and pole takes a
 * point of its own. The real races ran 28 minutes and one lap, which Assetto
 * Corsa cannot say at all - it times a race on a server alone - so each race is
 * the 65 km those 28 minutes cover at the FA01's pace.
 *
 * Five of its seven championship rounds are base circuits, in the season's own
 * order; Misano and Varano are not in Assetto Corsa, and the Spa round did not
 * count. The field is invented: fourteen seats, under Magione's eighteen boxes.
 *
 * Source: https://en.wikipedia.org/wiki/2010_Formula_Abarth_season
 */
export const FORMULA_ABARTH: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-abarth',
  name: 'Formula Abarth',
  description: {
    en: 'The 2010 season of the Italian single-chassis junior formula: two 28-minute races a '
      + 'event, the second from the first\'s result with the top eight reversed. Misano and Varano '
      + 'are not in Assetto Corsa, so five of its rounds are raced.',
    uk: 'Сезон 2010 року італійської юніорської формули з єдиним шасі: дві 28-хвилинні гонки за етап, '
      + 'друга стартує за результатами першої з переверненою першою вісімкою. Мізано й Варано в Assetto '
      + 'Corsa немає, тож розігруються п\'ять етапів.',
  },
  teams: [
    team('arcadia', 'Scuderia Arcadia', 'ITA', TeamBudget.INDEPENDENT),
    team('vento', 'Vento Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('aurelia', 'Aurelia Motorsport', 'ITA', TeamBudget.INDEPENDENT),
    team('nordkap', 'Nordkap Racing', 'SWE', TeamBudget.PRIVATEER),
    team('bluewave', 'Bluewave Racing', 'GBR', TeamBudget.PRIVATEER),
    team('castellana', 'Castellana Sport', 'ESP', TeamBudget.PRIVATEER),
    team('helio', 'Helio Racing', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'main',
      name: 'Formula Abarth',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      // Seven two-car teams, ordered so the class ramp from 88 down to 80 puts
      // the funded Italian squads at the front and the privateers behind them,
      // which is what a junior formula's pecking order actually is.
      seats: [
        seat('arc-1', 'arcadia', 'Matteo Brugnara', 'ITA'),
        seat('arc-2', 'arcadia', 'Sofia Renzetti', 'ITA'),
        seat('ven-1', 'vento', 'Luca Pellegatti', 'ITA'),
        seat('ven-2', 'vento', 'Andrea Sartori', 'ITA'),
        seat('aur-1', 'aurelia', 'Nikolas Weiss', 'AUT'),
        seat('aur-2', 'aurelia', 'Tommaso Gallo', 'ITA'),
        seat('nor-1', 'nordkap', 'Elias Hedlund', 'SWE'),
        seat('nor-2', 'nordkap', 'Aino Vartia', 'FIN'),
        seat('blu-1', 'bluewave', 'Callum Reeve', 'GBR'),
        seat('blu-2', 'bluewave', 'Priya Nandakumar', 'GBR'),
        seat('cas-1', 'castellana', 'Ivan Berrocal', 'ESP'),
        seat('cas-2', 'castellana', 'Marc Fontcuberta', 'ESP'),
        seat('hel-1', 'helio', 'Rafael Peixoto', 'BRA'),
        seat('hel-2', 'helio', 'Diego Arriaga', 'MEX'),
      ],
      eligibility: { kind: 'cars', cars: ['tatuusfa1'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 65,
          day: 0,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race',
          name: 'Race 2',
          distance: 65,
          day: 1,
          inherit: { from: 'race-1', reverse: 8 },
          pointsSystem: 'race-2',
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    {
      id: 'vallelunga',
      name: 'Vallelunga',
      track: { id: 'ks_vallelunga', layout: 'extended_circuit' },
    },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    {
      id: 'race-1',
      name: 'Race 1',
      positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1],
      fastestLap: 1,
      qualifying: [1],
    },
    {
      id: 'race-2',
      name: 'Race 2',
      positions: [13, 11, 9, 8, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race-1',
  grid: { strength: -4 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1200,
  prizes: {
    positions: [4000, 2800, 2000, 1500, 1100, 800, 600, 400, 250, 150],
    standings: [30000, 18000, 12000, 8000, 5000],
  },
};
