import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * IMSA WeatherTech SportsCar Championship, 2017 - the first season of DPi and
 * the new LMP2s.
 *
 * Three classes. Prototype is the LMP2 (2017) spec - Yezhrod's Oreca 07, the
 * IMSA version among them, and LFM's Ligier - standing for the prototype class
 * of LMP2s and DPis; GTLM the GTE (2017) spec, Dream Pack 1's Corvette and the
 * 911 RSRs and 488s; GTD the GT3 (2010s) spec of the base game and its packs.
 * Ten of twelve rounds at their real lengths - the Rolex 24 at Daytona, the
 * Sebring 12 Hours, Long Beach's hundred minutes, the Circuit of the Americas,
 * the Watkins Glen 6 Hours, Lime Rock, Road America, VIR, Laguna Seca and Petit
 * Le Mans. Detroit and Canadian Tire Motorsport Park have no recommended track.
 * Every class races every round, where Lime Rock and VIR were GT only. Long
 * Beach's and the Circuit of the Americas' thirty boxes cap the grid.
 *
 * Points are 35-32-30-28-26 and down to 1 in each class, the table as
 * understood rather than checked. The field is invented: five prototype teams
 * and the EGT Championship's paddock.
 *
 * Source: https://en.wikipedia.org/wiki/2017_WeatherTech_SportsCar_Championship
 */
export const IMSA_2017: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'imsa-2017',
  name: 'IMSA SportsCar Championship 2017',
  description: {
    en: 'America\'s sports car championship of 2017 on Yezhrod\'s Oreca 07, the GTEs and the base '
      + 'game\'s GT3s: ten rounds from the Rolex 24 to Petit Le Mans.',
    uk: 'Американський чемпіонат спортивних машин 2017 року на Oreca 07 від Yezhrod, машинах GTE і GT3 '
      + 'базової гри: десять етапів від Rolex 24 до Petit Le Mans.',
  },
  teams: [
    team('dixie', 'Dixie Prototypes', 'USA', TeamBudget.WORKS),
    team('sunshine', 'Sunshine State Racing', 'USA', TeamBudget.WORKS),
    team('hudson', 'Hudson Valley Racing', 'USA', TeamBudget.INDEPENDENT),
    team('saint-laurent', 'Saint-Laurent Racing', 'CAN', TeamBudget.INDEPENDENT),
    team('baja', 'Baja Endurance', 'MEX', TeamBudget.PRIVATEER),
    team('arrowhead', 'Arrowhead Endurance', 'GBR', TeamBudget.WORKS),
    team('donau', 'Donau Racing', 'DEU', TeamBudget.WORKS),
    team('rubicone', 'Scuderia Rubicone', 'ITA', TeamBudget.WORKS),
    team('route-66', 'Route Sixty-Six Racing', 'USA', TeamBudget.WORKS),
    team('neckar', 'Neckar Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('loire', 'Loire Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('pacific-rim', 'Pacific Rim Racing', 'USA', TeamBudget.INDEPENDENT),
    team('laurentian', 'Laurentian Racing', 'CAN', TeamBudget.PRIVATEER),
    team('shizen', 'Shizen Racing', 'JPN', TeamBudget.PRIVATEER),
    team('rioplatense', 'Rioplatense Racing', 'ARG', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'prototype',
      name: 'Prototype',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('pr-dix-1', 'dixie', 'Beau Ledbetter', 'USA'),
        seat('pr-dix-2', 'dixie', 'Travis Oakhurst', 'USA'),
        seat('pr-sun-1', 'sunshine', 'Marco Villafane', 'USA'),
        seat('pr-sun-2', 'sunshine', 'Derek Hollings', 'USA'),
        seat('pr-hud-1', 'hudson', 'Ryan Voorhees', 'USA'),
        seat('pr-hud-2', 'hudson', 'Evan Tappan', 'USA'),
        seat('pr-stl-1', 'saint-laurent', 'Mathis Gendreau', 'CAN'),
        seat('pr-stl-2', 'saint-laurent', 'Félix Rioux', 'CAN'),
        seat('pr-baj-1', 'baja', 'Rodrigo Villaseñor', 'MEX'),
        seat('pr-baj-2', 'baja', 'Emilio Treviño', 'MEX'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2017 },
    },
    {
      id: 'gtlm',
      name: 'GTLM',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('arr-1', 'arrowhead', 'Edward Halsbury', 'GBR'),
        seat('arr-2', 'arrowhead', 'Samuel Crowther', 'GBR'),
        seat('don-1', 'donau', 'Maximilian Straubinger', 'DEU'),
        seat('don-2', 'donau', 'Leonhard Irlbacher', 'DEU'),
        seat('rub-1', 'rubicone', 'Giulio Santarcangeli', 'ITA'),
        seat('rub-2', 'rubicone', 'Nicola Verucchi', 'ITA'),
        seat('rou-1', 'route-66', 'Hunter Blankenship', 'USA'),
        seat('rou-2', 'route-66', 'Mason Tedrick', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017 },
      entryFee: 9000,
      prizes: {
        positions: [36000, 25200, 18000, 13700, 10450, 7900, 5750, 4300, 2900, 1800],
        standings: [288000, 180000, 115000, 75500, 47000],
      },
    },
    {
      id: 'gtd',
      name: 'GTD',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('nec-1', 'neckar', 'Jonas Eisenlohr', 'DEU'),
        seat('nec-2', 'neckar', 'Pascal Wohlfahrt', 'DEU'),
        seat('loi-1', 'loire', 'Victor Aubineau', 'FRA'),
        seat('loi-2', 'loire', 'Rémi Pelletan', 'FRA'),
        seat('pac-1', 'pacific-rim', 'Kai Ashford', 'USA'),
        seat('pac-2', 'pacific-rim', 'Dylan Ybarra', 'USA'),
        seat('lau-1', 'laurentian', 'Olivier Bergevin', 'CAN'),
        seat('lau-2', 'laurentian', 'Samuel Pouliot', 'CAN'),
        seat('shi-1', 'shizen', 'Ryota Kanemoto', 'JPN'),
        seat('shi-2', 'shizen', 'Yamato Seki', 'JPN'),
        seat('rio-1', 'rioplatense', 'Tomás Albarracín', 'ARG'),
        seat('rio-2', 'rioplatense', 'Joaquín Laprida', 'ARG'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_2010S },
      entryFee: 5400,
      prizes: {
        positions: [21600, 15100, 10800, 8200, 6250, 4750, 3450, 2600, 1750, 1100],
        standings: [173000, 108000, 69000, 45500, 28000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Two hours forty',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: '2 Hours 40', distance: 470, day: 2 },
      ],
    },
    {
      id: 'hundred-minutes',
      name: 'Hundred minutes',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        // The winner's laps of the real race
        { type: 'race', name: '100 Minutes', laps: 63, day: 2 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 200, day: 2 },
      ],
    },
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Petit Le Mans', laps: 402, day: 2 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 348, day: 2 },
      ],
    },
    {
      id: 'daytona',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Rolex 24', laps: 659, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'sprint',
  rounds: [
    {
      id: 'daytona',
      name: 'Rolex 24 at Daytona',
      track: recommendedTrack('daytona/road'),
      eventFormat: 'daytona',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: recommendedTrack('sebring/full'),
      eventFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'long-beach',
      name: 'Long Beach',
      track: recommendedTrack('long-beach/street'),
      eventFormat: 'hundred-minutes',
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen 6 Hours',
      track: recommendedTrack('watkins-glen/boot'),
      eventFormat: 'six-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'lime-rock',
      name: 'Lime Rock Park',
      track: recommendedTrack('lime-rock/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: recommendedTrack('road-america/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: recommendedTrack('vir/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: recommendedTrack('laguna-seca/full') },
    {
      id: 'petit-le-mans',
      name: 'Petit Le Mans',
      track: recommendedTrack('road-atlanta/gp'),
      eventFormat: 'ten-hours',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [
        35, 32, 30, 28, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16,
        15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [60000, 42000, 30000, 22800, 17400, 13200, 9600, 7200, 4800, 3000],
    standings: [480000, 300000, 192000, 126000, 78000],
  },
};
