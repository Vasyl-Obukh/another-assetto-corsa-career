import { describe, expect, it, jest } from '@jest/globals';

import { regQuery } from '../../paths/index.ts';
import { REG_GEO, REG_GEO_NAME } from '../constants.ts';
import { homeRegion } from '../home-region.ts';

jest.mock('../../paths/index.ts', () => ({ regQuery: jest.fn() }));

const regQueryMock = jest.mocked(regQuery);

describe('core/home-region', () => {
  describe('homeRegion', () => {
    it('reads the country Windows is set to', async () => {
      regQueryMock.mockResolvedValue('UA');

      await expect(homeRegion()).resolves.toBe('UA');
      expect(regQueryMock).toHaveBeenCalledWith(REG_GEO, REG_GEO_NAME);
    });

    it('writes the code in capitals', async () => {
      regQueryMock.mockResolvedValue('gb');

      await expect(homeRegion()).resolves.toBe('GB');
    });

    it('is null when the value cannot be read', async () => {
      regQueryMock.mockResolvedValue(null);

      await expect(homeRegion()).resolves.toBeNull();
    });

    // Older Windows builds keep a numeric GeoID beside the name; that is not a code.
    it('is null for anything that is not a two-letter code', async () => {
      regQueryMock.mockResolvedValue('244');

      await expect(homeRegion()).resolves.toBeNull();
    });
  });
});
