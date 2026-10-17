import { describe, expect, it } from '@jest/globals';

import type { CareerSummary } from '../../../../../shared/types';
import { isReadable, pickOf } from '../utils.ts';

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
});
