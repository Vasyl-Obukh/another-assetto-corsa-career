import { GT4_EUROPEAN_SERIES } from './gt4-european-series.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * GT4 European Series - the GT4 championship that supports GT World Challenge
 * Europe, on First Studio Race's GT4 cars.
 *
 * The same series as GT4_EUROPEAN_SERIES, its calendar, format and field, on
 * the GT4 (FSR) spec - FSR's fourteen GT4s, any three to a grid - instead of
 * Guerilla's. A copy rather than more cars in the original, because FSR's cars
 * never share a class with another maker's and the original keeps racing
 * without them. Two hour-long races a round, each from a qualifying of its
 * own, with a compulsory stop and driver change that cannot be said yet. The
 * calendar is the circuits the series races - Brands Hatch, Monza, Spa, the
 * Nurburgring, Zandvoort, Barcelona, Paul Ricard, Misano and Hockenheim -
 * rather than one season's, which was not checked. The Silver, Pro-Am and Am
 * cups share one grid and one class here; Brands Hatch's thirty-two boxes cap
 * a grid that runs past forty.
 *
 * The 25-18-15 scale scores each race, a stand-in: the series' own table was
 * not checked. The field is invented, the original's.
 *
 * Source: https://en.wikipedia.org/wiki/GT4_European_Series
 */
export const GT4_EUROPEAN_SERIES_FSR: Championship = {
  ...GT4_EUROPEAN_SERIES,
  id: 'gt4-european-series-fsr',
  name: 'GT4 European Series (FSR)',
  description: {
    en: 'Europe\'s GT4 championship on First Studio Race\'s GT4 cars: two one-hour races a round at '
      + 'nine of the GT World Challenge circuits.',
    uk: 'Європейський чемпіонат GT4 на машинах GT4 від First Studio Race: дві годинні гонки за етап на '
      + 'дев\'яти трасах GT World Challenge.',
  },
  entries: reclassed(GT4_EUROPEAN_SERIES, { kind: 'spec', spec: CarSpec.GT4_FSR }),
};
