import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * EGT Championship - invented, for URD's EGT cars.
 *
 * URD's EGT cars are the GTE era under made-up names - the Valor, the 8, the
 * 9SR, the Detroit GT, the 448T and the Clipper - and no real series races
 * them, so this one is made up and says so. It mixes hour-long sprints and
 * endurance races, the way the GTE classes of IMSA and the WEC did between
 * them. The Darche 9SR races its S versions, the only ones catalogued.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole, at every round.
 */
export const EGT_CHAMPIONSHIP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'egt-championship',
  name: 'EGT Championship',
  description: {
    en: 'Invented: URD\'s EGT cars in a season of 170 km sprints and races of 1000 and 1700 km.',
    uk: 'Вигаданий чемпіонат: машини EGT від URD у сезоні зі спринтів на 170 км і гонок на 1000 '
      + 'та 1700 км.',
  },
  teams: [
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
      id: 'egt',
      name: 'EGT',
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
      eligibility: {
        kind: 'cars',
        cars: [
          'urd_amr_egt_2019_v2',
          'urd_bayro_egt_2018',
          'urd_detroit_egt_2019',
          'urd_ferrucci_448t_egt',
          'urd_michigan_egt',
          'urd_darche_egt_2020_sprint',
          'urd_darche_egt_2021_sprint',
        ],
      },
    },
  ],
  eventFormats: [
    {
      id: 'sprint',
      name: 'Sprint',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', name: 'Race', distance: 170, day: 1 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 165, day: 2 },
      ],
    },
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 1 },
        { id: 'race', type: 'race', name: '10 Hours', laps: 434, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'sprint',
  rounds: [
    {
      id: 'sebring',
      name: '6 Hours of Sebring',
      track: recommendedTrack('sebring/full'),
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
      id: 'watkins-glen',
      name: '6 Hours of Watkins Glen',
      track: recommendedTrack('watkins-glen/boot'),
      sessionLengths: [{ session: 'race', laps: 196 }],
      eventFormat: 'six-hours',
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
      id: 'spa',
      name: '6 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 145 }],
      eventFormat: 'six-hours',
      climate: Climate.OCEANIC,
    },
    {
      id: 'monza',
      name: 'Monza',
      track: recommendedTrack('monza/gp'),
    },
    {
      id: 'road-atlanta',
      name: '10 Hours of Road Atlanta',
      track: recommendedTrack('road-atlanta/gp'),
      eventFormat: 'ten-hours',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
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
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
