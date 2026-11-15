import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * IMSA WeatherTech SportsCar Championship, 2023 - the first GTP season, on
 * First Studio Race's cars.
 *
 * Four classes of the real five. GTP is FSR's Acura ARX-06, its only GTP car,
 * so the class is one make where the real one was Acura, BMW, Cadillac and
 * Porsche. LMP3 is the LMP3 (2020, FSR) spec: the Ligier JS P320 and Duqueine
 * D08 of the class, with the ADESS-03 Evo and the Ginetta G61-LT-P3, their
 * entries not checked, and the 2025 Ginetta standing in. GTD is the GT3 (FSR)
 * spec, one class where the real season split GTD Pro from GTD, since a split
 * by driver means nothing to AI drivers: the Aston Martin Vantage, Ferrari
 * 296, Lamborghini Huracan Evo 2, McLaren 720S and 992 GT3 R of the season,
 * with the Audi R8 LMS Evo II, its entry not checked, the Mustang GT3, which
 * came in 2024, and the Toyota GR GT3, which never raced. LMP2 is left out, since FSR has no Oreca 07.
 *
 * Ten of eleven rounds at their real lengths - the Rolex 24, the Sebring 12
 * Hours, Long Beach's hundred minutes, Laguna Seca, the Watkins Glen 6 Hours,
 * Lime Rock, Road America, VIR, Indianapolis and Petit Le Mans. Canadian Tire
 * Motorsport Park has no recommended track. Every class races every round,
 * where LMP3 sat out Long Beach, Laguna Seca, Lime Rock and VIR, and GTP Lime
 * Rock and VIR. The endurance races run the overall winner's laps. Long
 * Beach's thirty boxes cap the grid.
 *
 * Points are 350-320-300-280-260 and down to 10 in each class, the table as
 * understood rather than checked. The field is invented: IMSA_2025's teams,
 * its LMP2 teams racing LMP3.
 *
 * Source: https://en.wikipedia.org/wiki/2023_IMSA_SportsCar_Championship
 */
export const IMSA_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'imsa-2023-fsr',
  name: 'IMSA SportsCar Championship 2023 (FSR)',
  description: {
    en: 'America\'s sports car championship of 2023 on First Studio Race\'s cars: the Acura ARX-06 in '
      + 'GTP, LMP3s and GT3s, ten rounds from the Rolex 24 to Petit Le Mans.',
    uk: 'Американський чемпіонат спортивних машин 2023 року на машинах First Studio Race: Acura ARX-06 '
      + 'у GTP, LMP3 і GT3, десять етапів від Rolex 24 до Petit Le Mans.',
  },
  teams: [
    team('dixie', 'Dixie Prototypes', 'USA', TeamBudget.WORKS),
    team('sunshine', 'Sunshine State Racing', 'USA', TeamBudget.WORKS),
    team('hudson', 'Hudson Valley Racing', 'USA', TeamBudget.INDEPENDENT),
    team('saint-laurent', 'Saint-Laurent Racing', 'CAN', TeamBudget.INDEPENDENT),
    team('bluebonnet', 'Bluebonnet Racing', 'USA', TeamBudget.INDEPENDENT),
    team('keys', 'Florida Keys Racing', 'USA', TeamBudget.PRIVATEER),
    team('cascadia', 'Cascadia Endurance', 'CAN', TeamBudget.PRIVATEER),
    team('arrowhead', 'Arrowhead Endurance', 'GBR', TeamBudget.WORKS),
    team('donau', 'Donau Racing', 'DEU', TeamBudget.WORKS),
    team('rubicone', 'Scuderia Rubicone', 'ITA', TeamBudget.WORKS),
    team('neckar', 'Neckar Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('loire', 'Loire Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('pacific-rim', 'Pacific Rim Racing', 'USA', TeamBudget.INDEPENDENT),
    team('laurentian', 'Laurentian Racing', 'CAN', TeamBudget.PRIVATEER),
    team('shizen', 'Shizen Racing', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gtp',
      name: 'GTP',
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
      ],
      eligibility: { kind: 'cars', cars: ['acura_arx06_2023'] },
    },
    {
      id: 'lmp3',
      name: 'LMP3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('p3-blu-1', 'bluebonnet', 'Colby Renner', 'USA'),
        seat('p3-blu-2', 'bluebonnet', 'Shane Delvecchio', 'USA'),
        seat('p3-key-1', 'keys', 'Dalton Merritt', 'USA'),
        seat('p3-key-2', 'keys', 'Kyle Ashburn', 'USA'),
        seat('p3-cas-1', 'cascadia', 'Noah Charbonneau', 'CAN'),
        seat('p3-cas-2', 'cascadia', 'Liam Ouellette', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP3_2020_FSR },
      entryFee: 6500,
      prizes: {
        positions: [25200, 17650, 12600, 9600, 7300, 5550, 4050, 3000, 2000, 1250],
        standings: [201500, 126000, 80500, 53000, 33000],
      },
    },
    {
      id: 'gtd',
      name: 'GTD',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('arr-1', 'arrowhead', 'Edward Halsbury', 'GBR'),
        seat('arr-2', 'arrowhead', 'Samuel Crowther', 'GBR'),
        seat('don-1', 'donau', 'Maximilian Straubinger', 'DEU'),
        seat('don-2', 'donau', 'Leonhard Irlbacher', 'DEU'),
        seat('rub-1', 'rubicone', 'Giulio Santarcangeli', 'ITA'),
        seat('rub-2', 'rubicone', 'Nicola Verucchi', 'ITA'),
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_FSR },
      entryFee: 6500,
      prizes: {
        positions: [25200, 17650, 12600, 9600, 7300, 5550, 4050, 3000, 2000, 1250],
        standings: [201500, 126000, 80500, 53000, 33000],
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
        { type: 'race', name: '2 Hours 40', distance: 480, day: 2 },
      ],
    },
    {
      id: 'hundred-minutes',
      name: 'Hundred minutes',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        // The winner's laps of the real race
        { type: 'race', name: '100 Minutes', laps: 78, day: 2 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 201, day: 2 },
      ],
    },
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Petit Le Mans', laps: 397, day: 2 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 322, day: 2 },
      ],
    },
    {
      id: 'daytona',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Rolex 24', laps: 783, day: 2 },
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
    { id: 'laguna-seca', name: 'Laguna Seca', track: recommendedTrack('laguna-seca/full') },
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
    {
      id: 'indianapolis',
      name: 'Indianapolis',
      track: recommendedTrack('indianapolis/road'),
      climate: Climate.TEMPERATE,
    },
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
        350, 320, 300, 280, 260, 250, 240, 230, 220, 210, 200, 190, 180, 170, 160,
        150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10,
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
  entryFee: 18000,
  prizes: {
    positions: [70000, 49000, 35000, 26600, 20300, 15400, 11200, 8400, 5600, 3500],
    standings: [560000, 350000, 224000, 147000, 91000],
  },
};
