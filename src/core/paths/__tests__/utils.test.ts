import { describe, expect, it } from '@jest/globals';

import type { PathCandidate } from '../../../shared/types/index.ts';
import { listCandidates, pick } from '../utils.ts';

/**
 * A check that passes only for the paths named.
 * @param passing Paths that should be treated as valid
 * @returns A check function for pick
 */
const accepts = (...passing: string[]) => async (value: string) => passing.includes(value);

const failed = (tried: PathCandidate[]) => `not found: ${listCandidates(tried)}`;

describe('core/paths/utils', () => {
  describe('listCandidates', () => {
    it('joins the paths that were tried', () => {
      expect(listCandidates([
        { value: 'a', origin: 'env' },
        { value: 'b', origin: 'steam' },
      ])).toBe('a, b');
    });

    it('handles an empty list', () => {
      expect(listCandidates([])).toBe('');
    });
  });

  describe('pick', () => {
    it('takes the first candidate that passes', async () => {
      const tried: PathCandidate[] = [
        { value: 'a', origin: 'env' },
        { value: 'b', origin: 'registry' },
      ];

      await expect(pick(tried, accepts('b'), 'empty', failed)).resolves.toMatchObject({
        value: 'b', origin: 'registry', exists: true,
      });
    });

    it('records every candidate it considered', async () => {
      const tried: PathCandidate[] = [
        { value: 'a', origin: 'env' },
        { value: 'b', origin: 'registry' },
      ];

      const probe = await pick(tried, accepts('b'), 'empty', failed);
      expect(probe.tried).toEqual(tried);
    });

    it('reports the empty error when there were no candidates', async () => {
      const probe = await pick([], accepts(), 'nothing registered', failed);

      expect(probe).toMatchObject({ value: null, origin: null, exists: false });
      expect(probe.error).toBe('nothing registered');
    });

    it('reports the first candidate when every one fails', async () => {
      const tried: PathCandidate[] = [
        { value: 'a', origin: 'env' },
        { value: 'b', origin: 'steam' },
      ];

      const probe = await pick(tried, accepts(), 'empty', failed);
      expect(probe).toMatchObject({ value: 'a', origin: 'env', exists: false });
      expect(probe.error).toBe('not found: a, b');
    });

    // The bug this guards: falling through to auto-detection after a bad
    // override would report a path the user never chose as "found".
    it('stops at a failing override rather than falling back', async () => {
      const tried: PathCandidate[] = [
        { value: 'D:\\wrong', origin: 'override' },
        { value: 'D:\\real', origin: 'registry' },
      ];

      const probe = await pick(tried, accepts('D:\\real'), 'empty', failed);

      expect(probe).toMatchObject({ value: 'D:\\wrong', origin: 'override', exists: false });
      expect(probe.error).toBe('not found: D:\\wrong');
    });

    it('accepts an override that passes', async () => {
      const tried: PathCandidate[] = [{ value: 'D:\\ac', origin: 'override' }];

      await expect(pick(tried, accepts('D:\\ac'), 'empty', failed)).resolves.toMatchObject({
        value: 'D:\\ac', origin: 'override', exists: true,
      });
    });
  });
});
