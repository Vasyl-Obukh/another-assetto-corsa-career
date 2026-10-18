import { describe, expect, it } from '@jest/globals';

import type { CareerSummary } from '../../../../../shared/types';
import { continuePath, isReadable, pickOf } from '../utils.ts';

describe('renderer/screens/careers/utils', () => {
  describe('isReadable', () => {
    it('tells a career that reads from one that cannot be read', () => {
      expect(isReadable({ id: 'c1', driver: { name: 'A', nation: null } } as CareerSummary)).toBe(true);
      expect(isReadable({
        id: 'c2', unreadable: true, driver: null, playedAt: null,
      })).toBe(false);
    });
  });

  describe('pickOf', () => {
    it('reads the career a link asks to arrive on', () => {
      expect(pickOf({ pick: 'c1' })).toBe('c1');
    });

    it('reads nothing from state that names no career', () => {
      expect(pickOf({ section: 'home' })).toBeNull();
      expect(pickOf(null)).toBeNull();
      expect(pickOf(undefined)).toBeNull();
      expect(pickOf('c1')).toBeNull();
    });

    it('reads nothing from a pick that is not an id', () => {
      expect(pickOf({ pick: 7 })).toBeNull();
      expect(pickOf({ pick: undefined })).toBeNull();
    });
  });

  describe('continuePath', () => {
    /**
     * A career of a kind, entered in one championship.
     * @param kind Which kind of career
     * @param over Whether its standing says it is over, for a standalone one
     * @returns The career
     */
    const summary = (kind: CareerSummary['kind'], over?: boolean): CareerSummary => ({
      kind,
      championships: [{ series: 'lotus-cup' }],
      standing: over === undefined ? null : { over },
    } as unknown as CareerSummary);

    it('carries a career on at its Home', () => {
      expect(continuePath(summary('career'))).toBe('/home');
    });

    it('carries a standalone championship on at its own page while it runs', () => {
      expect(continuePath(summary('championship', false))).toBe('/championship');
    });

    it('opens a standalone championship that is over on its review', () => {
      expect(continuePath(summary('championship', true))).toBe('/home/history/0/lotus-cup/0');
    });
  });
});
