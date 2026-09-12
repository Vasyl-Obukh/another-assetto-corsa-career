/**
 * What separates a row's scope from its id in the key they are held under.
 *
 * Compared whole and never parsed back apart. Every id the editor mints is
 * `[a-z0-9-]`, so only a hand-written id holding it could collide.
 */
export const SCOPE_SEPARATOR = '/';

/**
 * The id a row that does not exist yet is held under, for the same reason.
 */
export const ADDING = '+';
