// The country Windows says the user lives in, which decides the units a fresh
// install reads in. Not the regional format: plenty of people outside the US
// keep Windows' en-US format and still read kilometres.

import { REG_GEO, REG_GEO_NAME } from './constants.ts';
import { regQuery } from '../paths/index.ts';

/**
 * Reads the country or region Windows is set to.
 * @returns Its ISO 3166 code, or null when it cannot be read
 */
export const homeRegion = async (): Promise<string | null> => {
  const region = await regQuery(REG_GEO, REG_GEO_NAME);

  return region && /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null;
};
