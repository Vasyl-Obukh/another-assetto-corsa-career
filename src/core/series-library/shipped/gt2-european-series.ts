import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT2 European Series - SRO's class for the new wave of track-only GT2s, on
 * Guerilla's GT2 cars.
 *
 * Guerilla's GT2s are the real ones - the Audi R8, the 911 GT2 RS Clubsport,
 * the 935, the Brabham BT63, the KTM X-Bow, the Maserati MC20, the Huracan ST
 * EVO2 and the AMG - and a few of its own imagining, the BMW M2 GT2, the 488
 * GT2 and the Liana; its Cayman RSR has no series of its own and races here
 * too. The class names all twelve. Two 50-minute races a round, each from a
 * qualifying of its own. The calendar is the circuits the series races - Monza,
 * Spa, Valencia, Portimao, Paul Ricard, Misano and Hockenheim - rather than one
 * season's, which was not checked.
 *
 * The 25-18-15 scale scores each race, a stand-in: the series' own table was
 * not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/GT2_European_Series
 */
export const GT2_EUROPEAN_SERIES: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt2-european-series',
  name: 'GT2 European Series',
  description: {
    en: 'SRO\'s track-only GT2 class on Guerilla\'s GT2 cars, real and imagined: two 50-minute '
      + 'races a round at Monza, Spa, Valencia, Portimao, Paul Ricard, Misano and Hockenheim.',
    uk: 'Трековий клас GT2 від SRO на машинах GT2 від Guerilla, реальних і вигаданих: дві 50-хвилинні '
      + 'гонки за етап у Монці, Спа, Валенсії, Портімау, Поль-Рікарі, Мізано та Гоккенгаймі.',
  },
  teams: [
    team('lugano', 'Lugano GT', 'CHE', TeamBudget.INDEPENDENT),
    team('riviera', 'Riviera GT', 'MCO', TeamBudget.INDEPENDENT),
    team('isartal', 'Isartal GT', 'DEU', TeamBudget.INDEPENDENT),
    team('leie', 'Leie Racing', 'BEL', TeamBudget.INDEPENDENT),
    team('adige', 'Scuderia Adige', 'ITA', TeamBudget.INDEPENDENT),
    team('costa-sol', 'Costa del Sol GT', 'ESP', TeamBudget.PRIVATEER),
    team('weald', 'Weald GT', 'GBR', TeamBudget.PRIVATEER),
    team('mazury', 'Mazury GT', 'POL', TeamBudget.PRIVATEER),
    team('hatta', 'Hatta Racing', 'ARE', TeamBudget.PRIVATEER),
    team('rio-grande', 'Rio Grande GT', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt2',
      name: 'GT2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('lug-1', 'lugano', 'Marco Albisetti', 'CHE'),
        seat('lug-2', 'lugano', 'Sandro Pedrazzini', 'CHE'),
        seat('riv-1', 'riviera', 'Louis Aureglia', 'MCO'),
        seat('riv-2', 'riviera', 'Pierre Lanteri', 'MCO'),
        seat('isa-1', 'isartal', 'Christoph Bruckmayer', 'DEU'),
        seat('isa-2', 'isartal', 'Stefan Loibl', 'DEU'),
        seat('lei-1', 'leie', 'Dries Moerman', 'BEL'),
        seat('lei-2', 'leie', 'Pieter Goossens', 'BEL'),
        seat('adi-1', 'adige', 'Lorenzo Zanettin', 'ITA'),
        seat('adi-2', 'adige', 'Mauro Pellizzari', 'ITA'),
        seat('cos-1', 'costa-sol', 'Javier Aranzabal', 'ESP'),
        seat('cos-2', 'costa-sol', 'Ignacio Barbastro', 'ESP'),
        seat('wea-1', 'weald', 'Hugo Bramwell', 'GBR'),
        seat('wea-2', 'weald', 'Rupert Fane', 'GBR'),
        seat('maz-1', 'mazury', 'Jan Ostrowicz', 'POL'),
        seat('maz-2', 'mazury', 'Michał Zadrożny', 'POL'),
        seat('hat-1', 'hatta', 'Ahmed Al Zaabi', 'ARE'),
        seat('hat-2', 'hatta', 'Mohammed Al Hosani', 'ARE'),
        seat('rio-1', 'rio-grande', 'Wyatt Holcomb', 'USA'),
        seat('rio-2', 'rio-grande', 'Jesse Pruneda', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'gue_audi_r8_lms_gt2',
          'gue_bmw_m2_gt2',
          'gue_gt2_rs_clubsport',
          'gue_ferrari_488_challange_gt2',
          'gue_brabham_bt63_gt2',
          'gue_ktm_xbow_gt2',
          'gue_liana_gt2',
          'gue_935_gt2',
          'gue_maserati_mc20_gt2',
          'gue_lamborghini_huracan_st_evo2',
          'gue_amg_gt2',
          'gue_porsche_cayman_rsr',
        ],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        { type: 'race', name: 'Race 1', distance: 140, day: 1, inherit: { from: 'qualifying-1' } },
        { type: 'race', name: 'Race 2', distance: 140, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    { id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    { id: 'valencia', name: 'Valencia', track: recommendedTrack('valencia/gp') },
    {
      id: 'portimao',
      name: 'Portimao',
      track: recommendedTrack('portimao/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'paul-ricard',
      name: 'Paul Ricard',
      track: recommendedTrack('paul-ricard/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'misano',
      name: 'Misano',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
