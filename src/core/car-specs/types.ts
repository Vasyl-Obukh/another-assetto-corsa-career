/**
 * The specs block of a ui_car.json, as it arrives.
 *
 * Every field is optional and typed loosely: mod authors ship these as numbers
 * as often as strings, and ship the whole block as a string or an array often
 * enough that parseCarSpecs takes unknown rather than this.
 */
export interface UiCarSpecs {
  /**
   * Peak power, as written.
   */
  bhp?: unknown;
  /**
   * Peak torque, as written.
   */
  torque?: unknown;
  /**
   * Kerb weight, as written.
   */
  weight?: unknown;
  /**
   * Top speed, as written.
   */
  topspeed?: unknown;
  /**
   * Nought to hundred, as written.
   */
  acceleration?: unknown;
  /**
   * Power-to-weight ratio, as written.
   */
  pwratio?: unknown;
}
