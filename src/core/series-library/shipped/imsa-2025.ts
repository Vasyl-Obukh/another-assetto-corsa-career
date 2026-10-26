import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * IMSA WeatherTech SportsCar Championship, 2025 - GTP, LMP2, GTD Pro and GTD.
 *
 * Four classes. GTP is the Hypercar (LFM) spec, LFM's Porsche 963, Cadillac,
 * BMW and Lamborghini among them; LMP2 the LMP2 (2021) spec; GTD Pro and GTD
 * both the GT3 (LFM) spec, the season's GT3 field car for car, raced by
 * professionals in one and amateurs in the other. Seven of eleven rounds at
 * their real lengths - the Rolex 24, the Sebring 12 Hours, Laguna Seca, the
 * Watkins Glen 6 Hours, Road America, VIR and Petit Le Mans. Long Beach,
 * Detroit, Canadian Tire Motorsport Park and Indianapolis are not in Assetto
 * Corsa. VIR's thirty-three boxes cap the grid.
 *
 * Points are 350-320-300-280-260 and down to 10 in each class, the table as
 * understood rather than checked. The field is invented: the 2017 season's
 * prototype teams, three LMP2 teams and the EGT Championship's paddock.
 *
 * Source: https://en.wikipedia.org/wiki/2025_IMSA_SportsCar_Championship
 */
export const IMSA_2025: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'imsa-2025',
  name: 'IMSA SportsCar Championship 2025',
  description: 'America\'s sports car championship of 2025 on LFM\'s GTP cars and GT3s and the Oreca 07: '
    + 'four classes, seven rounds from the Rolex 24 to Petit Le Mans.',
  teams: [
    team('dixie', 'Dixie Prototypes', 'USA', TeamBudget.WORKS),
    team('sunshine', 'Sunshine State Racing', 'USA', TeamBudget.WORKS),
    team('hudson', 'Hudson Valley Racing', 'USA', TeamBudget.INDEPENDENT),
    team('saint-laurent', 'Saint-Laurent Racing', 'CAN', TeamBudget.INDEPENDENT),
    team('baja', 'Baja Endurance', 'MEX', TeamBudget.PRIVATEER),
    team('bluebonnet', 'Bluebonnet Racing', 'USA', TeamBudget.INDEPENDENT),
    team('keys', 'Florida Keys Racing', 'USA', TeamBudget.PRIVATEER),
    team('cascadia', 'Cascadia Endurance', 'CAN', TeamBudget.PRIVATEER),
    team('arrowhead', 'Arrowhead Endurance', 'GBR', TeamBudget.WORKS),
    team('donau', 'Donau Racing', 'DEU', TeamBudget.WORKS),
    team('rubicone', 'Scuderia Rubicone', 'ITA', TeamBudget.WORKS),
    team('route-66', 'Route Sixty-Six Racing', 'USA', TeamBudget.WORKS),
    team('neckar', 'Neckar Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('loire', 'Loire Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('pacific-rim', 'Pacific Rim Racing', 'USA', TeamBudget.INDEPENDENT),
    team('laurentian', 'Laurentian Racing', 'CAN', TeamBudget.PRIVATEER),
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
        seat('pr-baj-1', 'baja', 'Rodrigo Villaseñor', 'MEX'),
        seat('pr-baj-2', 'baja', 'Emilio Treviño', 'MEX'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMH_LFM, minModels: 2 },
    },
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-blu-1', 'bluebonnet', 'Colby Renner', 'USA'),
        seat('p2-blu-2', 'bluebonnet', 'Shane Delvecchio', 'USA'),
        seat('p2-key-1', 'keys', 'Dalton Merritt', 'USA'),
        seat('p2-key-2', 'keys', 'Kyle Ashburn', 'USA'),
        seat('p2-cas-1', 'cascadia', 'Noah Charbonneau', 'CAN'),
        seat('p2-cas-2', 'cascadia', 'Liam Ouellette', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2021, minModels: 1 },
      grid: { strength: -1 },
      entryFee: 10800,
      prizes: {
        positions: [42000, 29400, 21000, 15950, 12200, 9250, 6700, 5050, 3350, 2100],
        standings: [336000, 210000, 134500, 88000, 54500],
      },
    },
    {
      id: 'gtd-pro',
      name: 'GTD Pro',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
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
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
      grid: { strength: -2 },
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
        seat('nec-1', 'neckar', 'Jonas Eisenlohr', 'DEU'),
        seat('nec-2', 'neckar', 'Pascal Wohlfahrt', 'DEU'),
        seat('loi-1', 'loire', 'Victor Aubineau', 'FRA'),
        seat('loi-2', 'loire', 'Rémi Pelletan', 'FRA'),
        seat('pac-1', 'pacific-rim', 'Kai Ashford', 'USA'),
        seat('pac-2', 'pacific-rim', 'Dylan Ybarra', 'USA'),
        seat('lau-1', 'laurentian', 'Olivier Bergevin', 'CAN'),
        seat('lau-2', 'laurentian', 'Samuel Pouliot', 'CAN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
      grid: { strength: -7 },
      entryFee: 4900,
      prizes: {
        positions: [18900, 13250, 9450, 7200, 5500, 4150, 3000, 2250, 1500, 950],
        standings: [151000, 94500, 60500, 39500, 24500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Two hours forty',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { type: 'race', name: '2 Hours 40', distance: 480, day: 2 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 200, day: 2 },
      ],
    },
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Petit Le Mans', laps: 436, day: 2 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 353, day: 2 },
      ],
    },
    {
      id: 'daytona',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Rolex 24', laps: 781, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'sprint',
  rounds: [
    {
      id: 'daytona',
      name: 'Rolex 24 at Daytona',
      track: { id: 'rt_daytona', layout: 'sportscar_m4x' },
      eventFormat: 'daytona',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      eventFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: { id: 'ks_laguna_seca', layout: 'laguna_seca_osrw' } },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen 6 Hours',
      track: { id: 'lilski_watkins_glen', layout: 'boot' },
      eventFormat: 'six-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: { id: 'lilski_road_america' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: { id: 'vir', layout: 'full course' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'petit-le-mans',
      name: 'Petit Le Mans',
      track: { id: 'road_atlanta2018', layout: 'grandprix' },
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
  grid: { strength: 3, aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 18000,
  prizes: {
    positions: [70000, 49000, 35000, 26600, 20300, 15400, 11200, 8400, 5600, 3500],
    standings: [560000, 350000, 224000, 147000, 91000],
  },
};
