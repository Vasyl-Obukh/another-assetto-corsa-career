import { TCR_EUROPE } from './tcr-europe.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * TCR Europe - the European series for TCR touring cars, on First Studio
 * Race's TCR cars.
 *
 * The same series as TCR_EUROPE, its calendar, format and field, on the TCR
 * (FSR) spec instead of LFM's 2024 cars: the Opel Astra of 2016, the Renault
 * Megane RS of 2020 and the Hyundai Elantra N of 2024, three cars from three
 * stages of the class raced as one. A copy rather than more cars in the
 * original, because FSR's cars never share a class with another maker's and
 * the original keeps racing without them. Two races a round: the first from
 * qualifying, the second with qualifying's top ten reversed. The calendar is
 * the circuits the series races - Portimao, Spa, Zandvoort, Monza, Barcelona,
 * the Hungaroring, the Salzburgring and Misano - rather than one season's,
 * which was not checked.
 *
 * Races run half an hour and the 25-18-15 scale scores them, both stand-ins
 * for the series' own, which were not checked. The field is invented, the
 * original's.
 *
 * Source: https://en.wikipedia.org/wiki/TCR_Europe_Touring_Car_Series
 */
export const TCR_EUROPE_FSR: Championship = {
  ...TCR_EUROPE,
  id: 'tcr-europe-fsr',
  name: 'TCR Europe (FSR)',
  description: {
    en: 'Europe\'s TCR touring car series on First Studio Race\'s Opel, Renault and Hyundai: two races '
      + 'a round, the second from a reversed grid.',
    uk: 'Європейська турингова серія TCR на Opel, Renault і Hyundai від First Studio Race: дві гонки за '
      + 'етап, друга зі зворотної стартової решітки.',
  },
  entries: reclassed(TCR_EUROPE, { kind: 'spec', spec: CarSpec.TCR_FSR }),
};
