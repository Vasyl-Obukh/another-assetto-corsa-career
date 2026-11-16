import { describe, expect, it } from '@jest/globals';

import { NO_SWITCHES } from '../constants.ts';
import { readStoreSwitches, storeSwitchesKey } from '../utils.ts';

describe('renderer/screens/store/utils', () => {
  describe('readStoreSwitches', () => {
    it('reads back switches saved whole', () => {
      expect(readStoreSwitches({ owned: true, affordable: false, onSale: true }))
        .toEqual({ owned: true, affordable: false, onSale: true });
    });

    it('reads each switch it cannot read as off', () => {
      expect(readStoreSwitches({ owned: 'yes', affordable: true })).toEqual({ ...NO_SWITCHES, affordable: true });
    });

    it('opens with every switch off when nothing usable was saved', () => {
      [undefined, null, true, ['owned']].forEach((stored) => {
        expect(readStoreSwitches(stored)).toEqual(NO_SWITCHES);
      });
    });
  });

  describe('storeSwitchesKey', () => {
    it('keeps each career to its own switches', () => {
      expect(storeSwitchesKey('a')).not.toBe(storeSwitchesKey('b'));
    });
  });
});
