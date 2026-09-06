// Constants of the Park-Miller generator and the string hash that seeds it.

/**
 * Modulus of the Park-Miller generator, which is 2^31 - 1.
 */
export const SEED_MODULUS = 2147483647;

/**
 * Multiplier of the Park-Miller generator. Chosen with the modulus above so
 * every product stays inside the range a double represents exactly.
 */
export const SEED_MULTIPLIER = 16807;

/**
 * Multiplier of the string hash that turns a label into a seed.
 */
export const HASH_MULTIPLIER = 31;
