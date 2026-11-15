import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * NASCAR Cup Series, 2023 - the second season of the Next Gen car, on First
 * Studio Race's Camaro ZL1, Mustang and Camry.
 *
 * The three FSR Next Gen bodies of 2022-23 make up the field, mixed as the
 * season draws them. Six of thirty-six points races, the ones whose venue has
 * a recommended track: the Daytona 500, COTA, Sonoma, the Indianapolis road
 * course, Watkins Glen and the August race at Daytona. Every other oval, the
 * Chicago street course and the Charlotte Roval have none. Sonoma's 1.99-mile
 * NASCAR course has no recommended layout, so the IndyCar layout, the closest
 * in length, runs the real 352 km; Indianapolis runs the real 200 miles on the
 * recommended road course. COTA, the Glen's short course and Daytona keep
 * their real laps.
 *
 * Stages, playoff points and the playoffs themselves cannot be expressed, so
 * each race is scored straight through and the title goes on points.
 * COTA's thirty boxes cap a field of thirty-six chartered cars. Ovals are
 * never raced wet, so no round is. Points are 40 to the winner, then 35-34-33
 * and down by one. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023_NASCAR_Cup_Series
 */
export const NASCAR_CUP_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'nascar-cup-2023-fsr',
  name: 'NASCAR Cup Series 2023 (FSR)',
  description: {
    en: 'The second Next Gen season on First Studio Race\'s Camaro, Mustang and Camry: both Daytona '
      + 'races and the road courses, from COTA and Sonoma to Indianapolis and the Glen.',
    uk: 'Другий сезон Next Gen на Camaro, Mustang і Camry від First Studio Race: обидві гонки в Дайтоні '
      + 'та дорожні траси, від COTA і Сономи до Індіанаполіса та Воткінс-Глен.',
  },
  teams: [
    team('piedmont', 'Piedmont Motorsports', 'USA', TeamBudget.WORKS),
    team('catawba', 'Catawba Racing', 'USA', TeamBudget.WORKS),
    team('blue-ridge', 'Blue Ridge Racing', 'USA', TeamBudget.WORKS),
    team('lowcountry', 'Lowcountry Racing', 'USA', TeamBudget.INDEPENDENT),
    team('tar-heel', 'Tar Heel Motorsports', 'USA', TeamBudget.INDEPENDENT),
    team('shenandoah', 'Shenandoah Racing', 'USA', TeamBudget.INDEPENDENT),
    team('ozark', 'Ozark Mountain Racing', 'USA', TeamBudget.INDEPENDENT),
    team('cumberland', 'Cumberland Motorsports', 'USA', TeamBudget.PRIVATEER),
    team('bayou', 'Bayou Racing', 'USA', TeamBudget.PRIVATEER),
    team('panhandle', 'Panhandle Racing', 'USA', TeamBudget.PRIVATEER),
    team('chesapeake', 'Chesapeake Racing', 'USA', TeamBudget.PRIVATEER),
    team('high-desert', 'High Desert Motorsports', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'cup',
      name: 'Cup Series',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('pie-1', 'piedmont', 'Garrett Ashworth', 'USA'),
        seat('pie-2', 'piedmont', 'Tucker Pendleton', 'USA'),
        seat('pie-3', 'piedmont', 'Brayden Holcomb', 'USA'),
        seat('pie-4', 'piedmont', 'Clint Mabry', 'USA'),
        seat('cat-1', 'catawba', 'Jaxon Rutledge', 'USA'),
        seat('cat-2', 'catawba', 'Wyatt Cornelison', 'USA'),
        seat('cat-3', 'catawba', 'Landon Treadway', 'USA'),
        seat('cat-4', 'catawba', 'Lachlan Pettigrew', 'AUS'),
        seat('blu-1', 'blue-ridge', 'Ross Faircloth', 'USA'),
        seat('blu-2', 'blue-ridge', 'Brent Woodfin', 'USA'),
        seat('blu-3', 'blue-ridge', 'Corey Spainhour', 'USA'),
        seat('blu-4', 'blue-ridge', 'Dawson Littlejohn', 'USA'),
        seat('low-1', 'lowcountry', 'Mitchell Varnadore', 'USA'),
        seat('low-2', 'lowcountry', 'Trey Honeycutt', 'USA'),
        seat('low-3', 'lowcountry', 'Emilio Saucedo', 'MEX'),
        seat('tar-1', 'tar-heel', 'Gavin Plemmons', 'USA'),
        seat('tar-2', 'tar-heel', 'Jared Lunsford', 'USA'),
        seat('tar-3', 'tar-heel', 'Hunter Blalock', 'USA'),
        seat('she-1', 'shenandoah', 'Bryce Teague', 'USA'),
        seat('she-2', 'shenandoah', 'Wesley Overcash', 'USA'),
        seat('oza-1', 'ozark', 'Zane Kimbrell', 'USA'),
        seat('oza-2', 'ozark', 'Mack Dellinger', 'USA'),
        seat('cum-1', 'cumberland', 'Kurt Weatherly', 'USA'),
        seat('cum-2', 'cumberland', 'Brett Lafrenière', 'CAN'),
        seat('bay-1', 'bayou', 'Darian Coble', 'USA'),
        seat('bay-2', 'bayou', 'Colby Mauldin', 'USA'),
        seat('pan-1', 'panhandle', 'Travis Buckner', 'USA'),
        seat('pan-2', 'panhandle', 'Jace Pinnix', 'USA'),
        seat('che-1', 'chesapeake', 'Rhett Sizemore', 'USA'),
        seat('hig-1', 'high-desert', 'Hamish Pryde', 'NZL'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['fsr_chevrolet_camaro_2022', 'fsr_ford_mustang_2022', 'fsr_toyota_camry_2022'],
      },
    },
  ],
  eventFormats: [
    {
      id: 'road-course',
      name: 'Road course',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 50, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race', type: 'race', name: 'Race', laps: 90, day: 1 },
      ],
    },
    {
      id: 'superspeedway',
      name: 'Superspeedway',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 50, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race', type: 'race', name: 'Race', laps: 160, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'road-course',
  rounds: [
    {
      id: 'daytona-500',
      name: 'Daytona 500',
      track: recommendedTrack('daytona/oval'),
      eventFormat: 'superspeedway',
      sessionLengths: [{ session: 'race', laps: 200 }],
    },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      sessionLengths: [{ session: 'race', laps: 68 }],
    },
    {
      id: 'sonoma',
      name: 'Sonoma',
      track: recommendedTrack('sonoma/indycar'),
      sessionLengths: [{ session: 'race', distance: 352 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'indianapolis',
      name: 'Indianapolis road course',
      track: recommendedTrack('indianapolis/road'),
      sessionLengths: [{ session: 'race', distance: 322 }],
    },
    { id: 'watkins-glen', name: 'Watkins Glen', track: recommendedTrack('watkins-glen/short-classic') },
    {
      id: 'daytona',
      name: 'Daytona 400',
      track: recommendedTrack('daytona/oval'),
      eventFormat: 'superspeedway',
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [
        40, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22,
        21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7,
      ],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.TEMPERATE },
  rain: false,
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
