/**
 * How many cars one naming call may ask for.
 *
 * The handler's own ceiling. A championship naming more cars than this would
 * have to be a spec list several times over, and the ones past it simply read
 * as their folder IDs rather than the call failing.
 */
export const NAME_LIMIT = 500;
