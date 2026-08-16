// Defaults matching the layout AC writes to cfg/assists.ini, so an omitted
// assist means "as AC ships it" rather than "off".

/**
 * Bytes of output buffered from Content Manager before execFile gives up.
 */
export const LAUNCH_MAX_BUFFER = 1024 * 1024;

/**
 * How many base64 characters make up one padding group.
 */
export const BASE64_GROUP = 4;

/**
 * ABS mode when the race does not specify one: 1 is factory.
 */
export const DEFAULT_ABS = 1;

/**
 * Traction control mode when the race does not specify one: 1 is factory.
 */
export const DEFAULT_TRACTION_CONTROL = 1;

/**
 * Mechanical damage percentage when the race does not specify one.
 */
export const DEFAULT_DAMAGE = 100;

/**
 * Fuel consumption multiplier when the race does not specify one.
 */
export const DEFAULT_FUEL_RATE = 1;

/**
 * Tyre wear multiplier when the race does not specify one.
 */
export const DEFAULT_TYRE_WEAR = 1;

/**
 * Slipstream multiplier when the race does not specify one.
 */
export const DEFAULT_SLIPSTREAM = 1;

/**
 * Stability control percentage when the race does not specify one.
 */
export const DEFAULT_STABILITY_CONTROL = 0;
