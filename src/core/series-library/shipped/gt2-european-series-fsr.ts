import { GT2_EUROPEAN_SERIES } from './gt2-european-series.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * GT2 European Series - SRO's class for the new wave of track-only GT2s, on
 * First Studio Race's GT2 cars.
 *
 * The same series as GT2_EUROPEAN_SERIES, its calendar, format and field, on
 * the GT2 (FSR) spec instead of Guerilla's cars: the Audi R8 LMS GT2, the 911
 * GT2 RS Clubsport Evo, the 935, the KTM X-Bow, the Maserati MC20 and the AMG,
 * the X-Bow and the AMG in their sprint versions. A copy rather than more cars
 * in the original, because FSR's cars never share a class with another
 * maker's and the original keeps racing without them. Two 50-minute races a
 * round, each from a qualifying of its own. The calendar is the circuits the
 * series races - Monza, Spa, Valencia, Portimao, Paul Ricard, Misano and
 * Hockenheim - rather than one season's, which was not checked.
 *
 * The 25-18-15 scale scores each race, a stand-in: the series' own table was
 * not checked. The field is invented, the original's.
 *
 * Source: https://en.wikipedia.org/wiki/GT2_European_Series
 */
export const GT2_EUROPEAN_SERIES_FSR: Championship = {
  ...GT2_EUROPEAN_SERIES,
  id: 'gt2-european-series-fsr',
  name: 'GT2 European Series (FSR)',
  description: {
    en: 'SRO\'s track-only GT2 class on First Studio Race\'s GT2 cars: two 50-minute races a round '
      + 'at seven of the series\' circuits.',
    uk: 'Трековий клас GT2 від SRO на машинах GT2 від First Studio Race: дві 50-хвилинні гонки за етап '
      + 'на семи трасах серії.',
  },
  entries: reclassed(GT2_EUROPEAN_SERIES, { kind: 'spec', spec: CarSpec.GT2_FSR }),
};
