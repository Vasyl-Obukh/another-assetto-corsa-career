import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * BMW M2 CS Racing Cup Italy - BMW's one-make series on the Italian
 * championship weekends, on Guerilla's M2 CS Racing.
 *
 * Two races a weekend. The calendar is the Italian circuits the series races
 * that Assetto Corsa has - Vallelunga, Imola, Mugello and Monza - rather than
 * one season's, which was not checked; Misano is not in Assetto Corsa. Both
 * races line up on qualifying, and the 25-minute length and the 25-18-15 scale
 * are stand-ins: the series' own format and table were not checked. The field
 * is invented.
 *
 * Source: https://www.bmw-motorsport.com/
 */
export const BMW_M2_CS_RACING_CUP_ITALY: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'bmw-m2-cs-racing-cup-italy',
  name: 'BMW M2 CS Racing Cup Italy',
  description: 'BMW\'s Italian one-make series on Guerilla\'s M2 CS Racing: two races a weekend at '
    + 'Vallelunga, Imola, Mugello and Monza.',
  teams: [
    team('brianza', 'Brianza Motorsport', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('langhe', 'Langhe Racing', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('garda', 'Garda Corse', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('etna', 'Etna Racing', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('marche', 'Marche Motorsport', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('salento', 'Salento Racing', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('friuli', 'Friuli Corse', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('cilento', 'Cilento Racing', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('valtellina', 'Valtellina Motorsport', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('maremma', 'Maremma Corse', 'Italy', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'm2-cs',
      name: 'M2 CS Racing',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('bri-1', 'brianza', 'Davide Brambillasca', 'Italy', 'ITA'),
        seat('bri-2', 'brianza', 'Federico Cazzaniga', 'Italy', 'ITA'),
        seat('lan-1', 'langhe', 'Matteo Borgogno', 'Italy', 'ITA'),
        seat('lan-2', 'langhe', 'Luca Vigliano', 'Italy', 'ITA'),
        seat('gar-1', 'garda', 'Andrea Bonomini', 'Italy', 'ITA'),
        seat('gar-2', 'garda', 'Nicolò Tonoli', 'Italy', 'ITA'),
        seat('etn-1', 'etna', 'Salvatore Messineo', 'Italy', 'ITA'),
        seat('etn-2', 'etna', 'Gaetano Distefano', 'Italy', 'ITA'),
        seat('mar-1', 'marche', 'Alessandro Paoloni', 'Italy', 'ITA'),
        seat('mar-2', 'marche', 'Simone Giampieri', 'Italy', 'ITA'),
        seat('sal-1', 'salento', 'Cosimo De Pascalis', 'Italy', 'ITA'),
        seat('sal-2', 'salento', 'Antonio Quarta', 'Italy', 'ITA'),
        seat('fri-1', 'friuli', 'Elia Tomadini', 'Italy', 'ITA'),
        seat('fri-2', 'friuli', 'Manuel Cudicio', 'Italy', 'ITA'),
        seat('cil-1', 'cilento', 'Vincenzo Scarpato', 'Italy', 'ITA'),
        seat('cil-2', 'cilento', 'Gennaro Iannuzzi', 'Italy', 'ITA'),
        seat('val-1', 'valtellina', 'Mattia Gianoli', 'Italy', 'ITA'),
        seat('val-2', 'valtellina', 'Denis Bormolini', 'Italy', 'ITA'),
        seat('mrm-1', 'maremma', 'Tommaso Guidotti', 'Italy', 'ITA'),
        seat('mrm-2', 'maremma', 'Leonardo Morganti', 'Italy', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['gue_bmw_m2_cs'] },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race 1', distance: 55, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 55, day: 2, inherit: { from: 'qualifying' } },
      ],
    },
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'vallelunga', name: 'Vallelunga', track: { id: 'ks_vallelunga', layout: 'extended_circuit' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 89, aiLevelMin: 81, aiAggression: 55 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 3000,
  prizes: {
    positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
    standings: [96000, 60000, 38500, 25000, 15500],
  },
};
