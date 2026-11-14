import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { raceLength, sessionName } from '../session-labels.ts';
import type { Units } from '@/hooks';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

/**
 * Unit formatters that mark what they wrote, standing in for the player's.
 */
const units: Pick<Units, 'format'> = {
  format: (quantity, metric) => `${quantity}#${metric}`,
};

describe('renderer/lib/session-labels/session-labels', () => {
  describe('sessionName', () => {
    it('calls a session by the name it was given', () => {
      expect(sessionName({ name: 'Sprint', type: 'race' }, translate)).toBe('Sprint');
    });

    it('calls a session with no name by its kind', () => {
      expect(sessionName({ type: 'qualify' }, translate)).toBe('race.sessionType.qualify');
      expect(sessionName({ name: null, type: 'practice' }, translate)).toBe('race.sessionType.practice');
    });

    it('names every exotic kind as itself rather than as a practice', () => {
      expect(sessionName({ type: 'hotlap' }, translate)).toBe('race.sessionType.hotlap');
    });
  });

  describe('raceLength', () => {
    it('states a race set in laps as its laps', () => {
      expect(raceLength({ laps: 12 }, translate, units)).toBe('championships.format.laps(count=12)');
    });

    it('puts a race set as a distance beside the laps it comes to', () => {
      expect(raceLength({ laps: 44, distance: 305 }, translate, units)).toBe(
        'championships.detail.lengthDistance('
        + 'distance=distance#305,'
        + 'laps=championships.format.laps(count=44))',
      );
    });

    it('counts no laps for a distance the track cannot turn into laps', () => {
      expect(raceLength({ laps: null, distance: 100 }, translate, units)).toContain(
        'laps=championships.format.laps(count=0)',
      );
    });
  });
});
