// Rendering assists in Content Manager's own serialized form, which is what
// acmanager://race/config wants rather than an assists.ini.
//
// The shape was read out of a saved Quick Drive preset: a .cmpreset carries
// "AssistsData" as a JSON *string* whose contents are themselves JSON, the same
// double-serialized convention its sibling "TrackPropertiesData" uses. Both
// deserialize into CM's own Game.AssistsProperties, so the URI parameter takes
// the inner object rather than the whole preset.
//
// Two of their key names are traps. Slipstream is spelt "SlipSteam", one 's'
// short - their typo, and reproducing it is the only way it is read - and fuel
// rate is "FuelConsumption".

import { resolveAssists } from './utils.ts';
import type { Assists } from '../../shared/types/index.ts';

/**
 * Renders assists as the JSON blob Content Manager deserializes.
 *
 * Key order follows the preset CM writes itself, which costs nothing and keeps
 * the two diffable by eye.
 * @param assists The assists to render, defaulting to AC's own defaults
 * @returns One line of JSON, ready to be cut-base64'd onto the URI
 */
export const assistsPresetJson = (assists: Assists = {}): string => {
  const a = resolveAssists(assists);

  return JSON.stringify({
    IdealLine: a.idealLine,
    AutoBlip: a.autoBlip,
    StabilityControl: a.stabilityControl,
    AutoBrake: a.autoBrake,
    AutoShifter: a.autoShifter,
    SlipSteam: a.slipstream,
    AutoClutch: a.autoClutch,
    Abs: a.abs,
    TractionControl: a.tractionControl,
    VisualDamage: a.visualDamage,
    Damage: a.damage,
    TyreWear: a.tyreWear,
    FuelConsumption: a.fuelRate,
    TyreBlankets: a.tyreBlankets,
  });
};
