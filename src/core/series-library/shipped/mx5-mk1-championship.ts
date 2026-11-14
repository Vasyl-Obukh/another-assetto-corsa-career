import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Mk1 MX-5 Championship - British club racing's one-make series for the
 * original Miata, on the base game's Mazda Miata NA.
 *
 * The BRSCC runs it as a twenty-minute qualifying and three twenty-minute
 * races a meeting, and that is the event here, with the third race lined up
 * on the second's result. Its circuits are the British club tracks it races
 * at: Silverstone in two of its layouts, Brands Hatch Indy, Oulton Park, Croft,
 * Knockhill, Cadwell Park and Thruxton. Snetterton and Donington are not in
 * Assetto Corsa. The points are a common club scale over fifteen places: the
 * BRSCC's own table was not found, nor a single season's calendar, so the
 * rounds are the championship's usual circuits rather than one year's.
 *
 * Source: https://brscc.co.uk/formulae/mazda-mx-5-championship/
 */
export const MX5_MK1_CHAMPIONSHIP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'mx5-mk1-championship',
  name: 'Mk1 MX-5 Championship',
  description: {
    en: 'British club racing\'s one-make series for the original Miata: three 35 km races '
      + 'a meeting, around the British club circuits it races at.',
    uk: 'Британський клубний монокубок для першої Miata: три гонки по 35 км за етап на британських '
      + 'клубних трасах, де він проходить.',
  },
  teams: [
    team('roadster', 'Roadster Workshop', 'GBR', TeamBudget.INDEPENDENT),
    team('eunos', 'Eunos Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('fenland', 'Fenland Racing', 'GBR', TeamBudget.PRIVATEER),
    team('pennine', 'Pennine Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('severn', 'Severn Valley Racing', 'GBR', TeamBudget.PRIVATEER),
    team('ulster', 'Ulster Roadsters', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'mk1',
      name: 'Mk1',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('roa-1', 'roadster', 'Callum Birtwistle', 'GBR'),
        seat('roa-2', 'roadster', 'Hannah Pengelly', 'GBR'),
        seat('roa-3', 'roadster', 'Dominic Ashworth', 'GBR'),
        seat('eun-1', 'eunos', 'Kieran Moyles', 'IRL'),
        seat('eun-2', 'eunos', 'Tom Lightfoot', 'GBR'),
        seat('eun-3', 'eunos', 'Josh Heseltine', 'GBR'),
        seat('fen-1', 'fenland', 'Ellis Scarrow', 'GBR'),
        seat('fen-2', 'fenland', 'Mark Dunmore', 'GBR'),
        seat('fen-3', 'fenland', 'Priti Mistry', 'GBR'),
        seat('pen-1', 'pennine', 'Gary Holroyd', 'GBR'),
        seat('pen-2', 'pennine', 'Sean Crowther', 'GBR'),
        seat('pen-3', 'pennine', 'Beth Ackroyd', 'GBR'),
        seat('sev-1', 'severn', 'Rhys Pritchard', 'GBR'),
        seat('sev-2', 'severn', 'Aled Gwynne', 'GBR'),
        seat('sev-3', 'severn', 'Nia Treharne', 'GBR'),
        seat('uls-1', 'ulster', 'Conor McAleese', 'GBR'),
        seat('uls-2', 'ulster', 'Ryan Maginness', 'GBR'),
        seat('uls-3', 'ulster', 'Aoife Quigley', 'IRL'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mazda_miata'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          type: 'race', name: 'Race 1', distance: 35, day: 0, inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 35,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Race 3', distance: 35, day: 1, inherit: { from: 'race-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'silverstone-national',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch Indy',
      track: { id: 'ks_brands_hatch', layout: 'indy' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: { id: 'rt_oulton_park', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'croft',
      name: 'Croft',
      track: { id: 'zw_croft', layout: 'full' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-international',
      name: 'Silverstone International',
      track: { id: 'ks_silverstone', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'knockhill',
      name: 'Knockhill',
      track: { id: 'knockhill2017', layout: 'knockhill' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'cadwell-park',
      name: 'Cadwell Park',
      track: { id: 'cadwell', layout: 'gpzfr' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: { id: 'js_thruxton', layout: 'lfm' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-gp',
      name: 'Silverstone GP',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -7, aggression: 20 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 500,
  prizes: {
    positions: [1500, 1050, 750, 550, 400, 300, 220, 150, 100, 75],
    standings: [12000, 7000, 4500, 3000, 2000],
  },
};
