import { seat, team } from './utils.ts';
import {
  Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * International V8 Supercars Championship, 2011 - the last season before the
 * Car of the Future, on First Studio Race's FG Falcon and VE Commodore.
 *
 * FSR's 2011 Falcon and Commodore are the two makes that raced the season; its
 * 2013 Falcon belongs to the next generation and is left out. Four of the
 * fourteen events have their circuits in Assetto Corsa, raced in the real
 * order: the Yas V8 400, the Adelaide 500, the Phillip Island 500 and the
 * Bathurst 1000. The Albert Park races supporting the Australian Grand Prix
 * scored nothing that year. Yas Marina is raced on its Grand Prix circuit,
 * not the shortened 4.7 km layout of 2010 and 2011, at the real 200 km.
 *
 * Each event runs its own format. Yas: two 200 km races, each from its own
 * qualifying. Adelaide: two 250 km races, the first from a top ten shootout
 * behind its qualifying, the second from its own qualifying. Phillip Island:
 * a 14-lap qualifying race sets the grid for the 113-lap 500 km, where the
 * real event ran two, one for each of a car's two drivers, and added their
 * results. Bathurst: qualifying and a top ten shootout, then 161 laps. The
 * endurance races are co-driven in reality and driven alone here.
 *
 * Points are the season's: 150-138-129 for the sprints, 300-276-258 at
 * Bathurst, 200-184-172 for Phillip Island's race and 50-46-43 for its
 * qualifying race, down to 28th. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2011_International_V8_Supercars_Championship
 */
export const V8_SUPERCARS_2011_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'v8-supercars-2011-fsr',
  name: 'V8 Supercars 2011 (FSR)',
  description: {
    en: 'Australia\'s V8 Supercars of 2011 on First Studio Race\'s Falcon and Commodore: Yas Marina '
      + 'and the Adelaide street circuit, then the Phillip Island 500 and the Bathurst 1000.',
    uk: 'Австралійські V8 Supercars 2011 року на Falcon і Commodore від First Studio Race: Яс-Марина '
      + 'та вулична траса Аделаїди, потім Phillip Island 500 і Bathurst 1000.',
  },
  teams: [
    team('southern-cross', 'Southern Cross Racing', 'AUS', TeamBudget.WORKS),
    team('blue-oval', 'Geelong Performance', 'AUS', TeamBudget.WORKS),
    team('lion', 'Elizabeth Motorsport', 'AUS', TeamBudget.WORKS),
    team('hunter', 'Hunter Valley Racing', 'AUS', TeamBudget.INDEPENDENT),
    team('swan', 'Swan River Racing', 'AUS', TeamBudget.INDEPENDENT),
    team('murray', 'Murray Motorsport', 'AUS', TeamBudget.INDEPENDENT),
    team('tasman', 'Tasman Racing', 'NZL', TeamBudget.INDEPENDENT),
    team('gippsland', 'Gippsland Motorsport', 'AUS', TeamBudget.INDEPENDENT),
    team('barossa', 'Barossa Racing', 'AUS', TeamBudget.PRIVATEER),
    team('darling', 'Darling Downs Racing', 'AUS', TeamBudget.PRIVATEER),
    team('pilbara', 'Pilbara Motorsport', 'AUS', TeamBudget.PRIVATEER),
    team('derwent', 'Derwent Racing', 'AUS', TeamBudget.PRIVATEER),
    team('riverina', 'Riverina Motorsport', 'AUS', TeamBudget.PRIVATEER),
    team('waikato', 'Waikato Racing', 'NZL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'v8-supercars',
      name: 'V8 Supercars',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('sxr-1', 'southern-cross', 'Brad Kurrajong', 'AUS'),
        seat('sxr-2', 'southern-cross', 'Lachlan Penrith', 'AUS'),
        seat('gee-1', 'blue-oval', 'Mitch Torquay', 'AUS'),
        seat('gee-2', 'blue-oval', 'Dale Corio', 'AUS'),
        seat('eli-1', 'lion', 'Shane Salisbury', 'AUS'),
        seat('eli-2', 'lion', 'Todd Gawler', 'AUS'),
        seat('hun-1', 'hunter', 'Jason Cessnock', 'AUS'),
        seat('hun-2', 'hunter', 'Nathan Pokolbin', 'AUS'),
        seat('swa-1', 'swan', 'Ryan Fremantle', 'AUS'),
        seat('swa-2', 'swan', 'Scott Mandurah', 'AUS'),
        seat('mur-1', 'murray', 'Corey Mildura', 'AUS'),
        seat('mur-2', 'murray', 'Luke Echuca', 'AUS'),
        seat('tas-1', 'tasman', 'Hamish Taupo', 'NZL'),
        seat('tas-2', 'tasman', 'Blake Rotorua', 'NZL'),
        seat('gip-1', 'gippsland', 'Wayne Traralgon', 'AUS'),
        seat('gip-2', 'gippsland', 'Jarrod Sale', 'AUS'),
        seat('bar-1', 'barossa', 'Kane Tanunda', 'AUS'),
        seat('bar-2', 'barossa', 'Dean Angaston', 'AUS'),
        seat('dar-1', 'darling', 'Glenn Toowoomba', 'AUS'),
        seat('dar-2', 'darling', 'Rhys Dalby', 'AUS'),
        seat('pil-1', 'pilbara', 'Grant Karratha', 'AUS'),
        seat('pil-2', 'pilbara', 'Troy Hedland', 'AUS'),
        seat('der-1', 'derwent', 'Craig Hobart', 'AUS'),
        seat('der-2', 'derwent', 'Jamie Bothwell', 'AUS'),
        seat('riv-1', 'riverina', 'Andrew Wagga', 'AUS'),
        seat('riv-2', 'riverina', 'Matt Griffith', 'AUS'),
        seat('wai-1', 'waikato', 'Cameron Hamilton', 'NZL'),
        seat('wai-2', 'waikato', 'Liam Cambridge', 'NZL'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_ford_falcon_11', 'fsr_hol_commodore_11'] },
    },
  ],
  eventFormats: [
    {
      id: 'yas',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 40, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 1 },
        {
          type: 'race', name: 'Race 1', distance: 200, day: 1, inherit: { from: 'qualifying-1' },
        },
        {
          type: 'race', name: 'Race 2', distance: 200, day: 2, inherit: { from: 'qualifying-2' },
        },
      ],
    },
    {
      id: 'adelaide',
      name: 'Street races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 40, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        {
          id: 'shootout',
          type: 'qualify',
          name: 'Top ten shootout',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying-1', top: 10 },
        },
        {
          type: 'race', name: 'Race 1', distance: 250, day: 1, inherit: { from: 'shootout' },
        },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 2 },
        {
          type: 'race', name: 'Race 2', distance: 250, day: 2, inherit: { from: 'qualifying-2' },
        },
      ],
    },
    {
      id: 'phillip-island',
      name: 'Phillip Island 500',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          id: 'qualifying-race',
          type: 'race',
          name: 'Qualifying race',
          laps: 14,
          day: 1,
          inherit: { from: 'qualifying' },
          pointsSystem: 'pi-qualifying',
        },
        {
          type: 'race',
          name: 'Phillip Island 500',
          laps: 113,
          day: 2,
          inherit: { from: 'qualifying-race' },
          pointsSystem: 'pi-feature',
        },
      ],
    },
    {
      id: 'bathurst',
      name: 'Bathurst 1000',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 40, day: 0 },
        {
          id: 'shootout',
          type: 'qualify',
          name: 'Top ten shootout',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying', top: 10 },
        },
        {
          type: 'race',
          name: 'Bathurst 1000',
          laps: 161,
          day: 2,
          inherit: { from: 'shootout' },
          pointsSystem: 'bathurst',
        },
      ],
    },
  ],
  defaultEventFormat: 'yas',
  rounds: [
    {
      id: 'yas-marina',
      name: 'Yas V8 400',
      track: recommendedTrack('yas-marina/gp-2009'),
      climate: Climate.ARID,
    },
    {
      id: 'adelaide',
      name: 'Adelaide 500',
      track: recommendedTrack('adelaide/street'),
      eventFormat: 'adelaide',
      climate: Climate.MEDITERRANEAN,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'phillip-island',
      name: 'Phillip Island 500',
      track: recommendedTrack('phillip-island/gp'),
      eventFormat: 'phillip-island',
      climate: Climate.OCEANIC,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'bathurst',
      name: 'Bathurst 1000',
      track: recommendedTrack('bathurst/full'),
      eventFormat: 'bathurst',
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [
        150, 138, 129, 120, 111, 102, 96, 90, 84, 78, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45,
        42, 39, 36, 33, 30, 27, 24, 21,
      ],
    },
    {
      id: 'pi-qualifying',
      name: 'Qualifying race points',
      positions: [
        50, 46, 43, 40, 37, 34, 32, 30, 28, 26, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15,
        14, 13, 12, 11, 10, 9, 8, 7,
      ],
    },
    {
      id: 'pi-feature',
      name: 'Phillip Island 500 points',
      positions: [
        200, 184, 172, 160, 148, 136, 128, 120, 112, 104, 96, 92, 88, 84, 80, 76, 72, 68, 64, 60,
        56, 52, 48, 44, 40, 36, 32, 28,
      ],
    },
    {
      id: 'bathurst',
      name: 'Bathurst 1000 points',
      positions: [
        300, 276, 258, 240, 222, 204, 192, 180, 168, 156, 144, 138, 132, 126, 120, 114, 108, 102, 96, 90,
        84, 78, 72, 66, 60, 54, 48, 42,
      ],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 30 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
