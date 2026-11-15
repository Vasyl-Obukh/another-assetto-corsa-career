import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Classic GT Invitational - invented, for First Studio Race's sports racers of
 * the 1970s and 1980s.
 *
 * Five cars from different rulebooks that never met in one season, so this is
 * made up and says so, in three classes by the rules each was built to. Group
 * 5 is the silhouettes: the Dekon Monza of IMSA's Camel GT and Nissan's Super
 * Silvia of Japan's Super Silhouette series. The Dekon's 788 horsepower is
 * its brochure's; as installed it makes about 540 against the Silvia's 505,
 * at a little less weight, so it carries ballast and a restrictor. GTX is the
 * Ferrari 512 BB LM and the F40 LM: FSR's F40 LM runs the BB LM's engine,
 * gearbox, tyres and aero at the same weight, so the two race as equals. Group
 * 4 is the Porsche 934 RSR alone, a road car's homologation special well
 * behind both, which no balance would bring level.
 *
 * Eight rounds at circuits cars like these raced - IMSA's Daytona, Road
 * Atlanta, Laguna Seca and Watkins Glen, Le Mans before its chicanes, the
 * World Championship for Makes' Nordschleife and Silverstone, and Fuji, the
 * Super Silhouettes' home - each a 200 km sprint. Which car raced where was
 * not checked round by round. The Nordschleife's and Silverstone's
 * twenty-four boxes cap the grid. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/Group_5_(racing)
 */
export const CLASSIC_GT_INVITATIONAL_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'classic-gt-invitational-fsr',
  name: 'Classic GT Invitational (FSR)',
  description: {
    en: 'Invented: First Studio Race\'s Group 5 silhouettes, GTX Ferraris and the Porsche 934 in three '
      + 'classes, at the circuits of IMSA, Le Mans and the World Championship for Makes.',
    uk: 'Вигаданий: силуети Групи 5, Ferrari класу GTX і Porsche 934 від First Studio Race у трьох '
      + 'класах на трасах IMSA, Ле-Мана та чемпіонату світу серед марок.',
  },
  teams: [
    team('peachtree', 'Peachtree Racing', 'USA', TeamBudget.WORKS),
    team('rosso-corsa', 'Scuderia Rosso Antico', 'ITA', TeamBudget.WORKS),
    team('fujinomiya', 'Fujinomiya Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('rheinland', 'Rheinland Rennsport', 'DEU', TeamBudget.INDEPENDENT),
    team('sarthe', 'Écurie de la Sarthe', 'FRA', TeamBudget.PRIVATEER),
    team('finger-lakes', 'Finger Lakes Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-5',
      name: 'Group 5',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('g5-pea-1', 'peachtree', 'Dwayne Holloman', 'USA'),
        seat('g5-pea-2', 'peachtree', 'Curtis Brannigan', 'USA'),
        seat('g5-fuj-1', 'fujinomiya', 'Hideo Kanazawa', 'JPN'),
        seat('g5-fuj-2', 'fujinomiya', 'Masaru Ichinose', 'JPN'),
        seat('g5-rhe-1', 'rheinland', 'Gerd Brückmann', 'DEU'),
        seat('g5-sar-1', 'sarthe', 'Jean-Marc Vauquelin', 'FRA'),
        seat('g5-fin-1', 'finger-lakes', 'Russell Pettibone', 'USA'),
        seat('g5-fin-2', 'finger-lakes', 'Lyle Hammond', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['chevrolet_dekon', 'nis_23_supersilvia_83'] },
      // Brought towards the Super Silvia's about 1.9 kg per horsepower.
      bop: [
        { car: 'chevrolet_dekon', ballast: 60, restrictor: 5 },
      ],
    },
    {
      id: 'gtx',
      name: 'GTX',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gtx-ros-1', 'rosso-corsa', 'Giancarlo Ferrabosco', 'ITA'),
        seat('gtx-ros-2', 'rosso-corsa', 'Mauro Pellegatti', 'ITA'),
        seat('gtx-ros-3', 'rosso-corsa', 'Sergio Tamborini', 'ITA'),
        seat('gtx-sar-1', 'sarthe', 'Philippe Chauvigny', 'FRA'),
        seat('gtx-sar-2', 'sarthe', 'Alain Lemercier', 'FRA'),
        seat('gtx-pea-1', 'peachtree', 'Wade Ellerbee', 'USA'),
        seat('gtx-fuj-1', 'fujinomiya', 'Takeshi Oyamada', 'JPN'),
        seat('gtx-rhe-1', 'rheinland', 'Ulrich Weidenfeld', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_512bb_lm', 'f40_lm_ace'] },
      entryFee: 7200,
      prizes: {
        positions: [27000, 18900, 13500, 10250, 7850, 5950, 4300, 3250, 2150, 1350],
        standings: [216000, 135000, 86500, 56500, 35000],
      },
    },
    {
      id: 'group-4',
      name: 'Group 4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('g4-rhe-1', 'rheinland', 'Helmut Ostendorf', 'DEU'),
        seat('g4-rhe-2', 'rheinland', 'Jürgen Kaltwasser', 'DEU'),
        seat('g4-sar-1', 'sarthe', 'Bernard Lacombe', 'FRA'),
        seat('g4-fin-1', 'finger-lakes', 'Dale Witherspoon', 'USA'),
        seat('g4-ros-1', 'rosso-corsa', 'Corrado Bellandi', 'ITA'),
        seat('g4-fuj-1', 'fujinomiya', 'Kenji Morikawa', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_porsche_934t_rsr_rr'] },
      entryFee: 7200,
      prizes: {
        positions: [27000, 18900, 13500, 10250, 7850, 5950, 4300, 3250, 2150, 1350],
        standings: [216000, 135000, 86500, 56500, 35000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 200, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'daytona',
      name: 'Daytona',
      track: recommendedTrack('daytona/road'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: recommendedTrack('road-atlanta/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'nordschleife',
      name: 'Nurburgring Nordschleife',
      track: recommendedTrack('nordschleife/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'le-mans',
      name: 'Le Mans',
      track: recommendedTrack('le-mans/no-chicanes'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: recommendedTrack('watkins-glen/boot-classic'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: 'Fuji',
      track: recommendedTrack('fuji/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'laguna-seca',
      name: 'Laguna Seca',
      track: recommendedTrack('laguna-seca/full'),
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Class points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
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
