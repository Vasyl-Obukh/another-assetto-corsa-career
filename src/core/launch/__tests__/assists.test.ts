import { describe, expect, it } from '@jest/globals';

import { DEFAULT_ASSISTS } from '../../../shared/constants/index.ts';
import { assistsPresetJson } from '../assists.ts';

describe('core/launch/assists', () => {
  describe('assistsPresetJson', () => {
    it('writes every key Content Manager deserializes, and only those', () => {
      expect(Object.keys(JSON.parse(assistsPresetJson()))).toEqual([
        'IdealLine',
        'AutoBlip',
        'StabilityControl',
        'AutoBrake',
        'AutoShifter',
        'SlipSteam',
        'AutoClutch',
        'Abs',
        'TractionControl',
        'VisualDamage',
        'Damage',
        'TyreWear',
        'FuelConsumption',
        'TyreBlankets',
      ]);
    });

    // Both spellings are Content Manager's own and neither is guessable, so a
    // rename here is silent: the assist simply stays at AC's default and
    // nothing reports it. Driving races/spikes/assists.json is what proved
    // these two arrive.
    it('spells slipstream SlipSteam and fuel rate FuelConsumption', () => {
      const preset = JSON.parse(assistsPresetJson({ slipstream: 3, fuelRate: 5 }));

      expect(preset.SlipSteam).toBe(3);
      expect(preset.FuelConsumption).toBe(5);
      expect(preset.Slipstream).toBeUndefined();
      expect(preset.FuelRate).toBeUndefined();
    });

    it('fills in what the race omitted with the values AC ships', () => {
      const preset = JSON.parse(assistsPresetJson({ abs: 2 }));

      expect(preset.Abs).toBe(2);
      expect(preset.TractionControl).toBe(DEFAULT_ASSISTS.tractionControl);
      expect(preset.Damage).toBe(DEFAULT_ASSISTS.damage);
    });

    it('renders booleans as booleans rather than as the 1 and 0 the INI uses', () => {
      const preset = JSON.parse(assistsPresetJson({ idealLine: true, tyreBlankets: false }));

      expect(preset.IdealLine).toBe(true);
      expect(preset.TyreBlankets).toBe(false);
    });

    // JSON.stringify omits a key whose value is undefined, and a missing key
    // leaves Content Manager applying whatever its own Quick Drive last held.
    it('never omits a key, even when the race set one to undefined', () => {
      const preset = JSON.parse(assistsPresetJson({ damage: undefined, abs: undefined }));

      expect(preset.Damage).toBe(DEFAULT_ASSISTS.damage);
      expect(preset.Abs).toBe(DEFAULT_ASSISTS.abs);
    });

    it('is one line, since it is cut-base64d onto a URI', () => {
      expect(assistsPresetJson()).not.toContain('\n');
    });
  });
});
