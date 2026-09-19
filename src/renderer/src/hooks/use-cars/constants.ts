/**
 * How many cars one lookup may ask for.
 *
 * The handler's own ceiling. A championship naming more cars than this would
 * have to be a spec list several times over, and the ones past it simply go
 * unresolved rather than the call failing.
 */
export const CAR_LIMIT = 500;
