import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * BMW M2 CS Racing Cup Italy - BMW's one-make series on the Italian
 * championship events, on Guerilla's M2 CS Racing.
 *
 * Two races a round. The calendar is the Italian circuits the series races -
 * Vallelunga, Imola, Mugello, Monza and Misano - rather than one season's,
 * which was not checked. Both races line up on qualifying, and the 25-minute
 * length and the 25-18-15 scale are stand-ins: the series' own format and
 * table were not checked. The field is invented.
 *
 * Source: https://www.bmw-motorsport.com/
 */
export const BMW_M2_CS_RACING_CUP_ITALY: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'bmw-m2-cs-racing-cup-italy',
  name: 'BMW M2 CS Racing Cup Italy',
  description: {
    en: 'BMW\'s Italian one-make series on Guerilla\'s M2 CS Racing: two races a round at '
      + 'Vallelunga, Imola, Mugello, Monza and Misano.',
    uk: 'Італійський монокубок BMW на M2 CS Racing від Guerilla: дві гонки за етап у '
      + 'Валлелунзі, Імолі, Муджелло, Монці та Мізано.',
  },
  teams: [
    team('brianza', 'Brianza Motorsport', 'ITA', TeamBudget.INDEPENDENT),
    team('langhe', 'Langhe Racing', 'ITA', TeamBudget.INDEPENDENT),
    team('garda', 'Garda Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('etna', 'Etna Racing', 'ITA', TeamBudget.PRIVATEER),
    team('marche', 'Marche Motorsport', 'ITA', TeamBudget.PRIVATEER),
    team('salento', 'Salento Racing', 'ITA', TeamBudget.PRIVATEER),
    team('friuli', 'Friuli Corse', 'ITA', TeamBudget.PRIVATEER),
    team('cilento', 'Cilento Racing', 'ITA', TeamBudget.PRIVATEER),
    team('valtellina', 'Valtellina Motorsport', 'ITA', TeamBudget.PRIVATEER),
    team('maremma', 'Maremma Corse', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'm2-cs',
      name: 'M2 CS Racing',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('bri-1', 'brianza', 'Davide Brambillasca', 'ITA'),
        seat('bri-2', 'brianza', 'Federico Cazzaniga', 'ITA'),
        seat('lan-1', 'langhe', 'Matteo Borgogno', 'ITA'),
        seat('lan-2', 'langhe', 'Luca Vigliano', 'ITA'),
        seat('gar-1', 'garda', 'Andrea Bonomini', 'ITA'),
        seat('gar-2', 'garda', 'Nicolò Tonoli', 'ITA'),
        seat('etn-1', 'etna', 'Salvatore Messineo', 'ITA'),
        seat('etn-2', 'etna', 'Gaetano Distefano', 'ITA'),
        seat('mar-1', 'marche', 'Alessandro Paoloni', 'ITA'),
        seat('mar-2', 'marche', 'Simone Giampieri', 'ITA'),
        seat('sal-1', 'salento', 'Cosimo De Pascalis', 'ITA'),
        seat('sal-2', 'salento', 'Antonio Quarta', 'ITA'),
        seat('fri-1', 'friuli', 'Elia Tomadini', 'ITA'),
        seat('fri-2', 'friuli', 'Manuel Cudicio', 'ITA'),
        seat('cil-1', 'cilento', 'Vincenzo Scarpato', 'ITA'),
        seat('cil-2', 'cilento', 'Gennaro Iannuzzi', 'ITA'),
        seat('val-1', 'valtellina', 'Mattia Gianoli', 'ITA'),
        seat('val-2', 'valtellina', 'Denis Bormolini', 'ITA'),
        seat('mrm-1', 'maremma', 'Tommaso Guidotti', 'ITA'),
        seat('mrm-2', 'maremma', 'Leonardo Morganti', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['gue_bmw_m2_cs'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race 1', distance: 55, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 55, day: 2, inherit: { from: 'qualifying' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'vallelunga', name: 'Vallelunga', track: recommendedTrack('vallelunga/full') },
    { id: 'imola', name: 'Imola', track: recommendedTrack('imola/gp') },
    { id: 'mugello', name: 'Mugello', track: recommendedTrack('mugello/gp') },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    {
      id: 'misano',
      name: 'Misano',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 3000,
  prizes: {
    positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
    standings: [96000, 60000, 38500, 25000, 15500],
  },
};
