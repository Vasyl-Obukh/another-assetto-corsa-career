// The one helper every store fake is built with.

/**
 * A stand-in for an interface, holding only the members a test hands it.
 *
 * Anything else throws when called, naming the member - so a store reaching for
 * something its test never thought it would fails loudly rather than reading
 * undefined and carrying on.
 * @param name What the fake stands in for, for the error
 * @param parts The members it has
 * @returns The fake
 */
export const fake = <T extends object>(name: string, parts: Partial<T>): T => new Proxy(parts, {
  get: (target, key) => {
    if (key in target) return target[key as keyof typeof target];
    // Promise resolution probes for a `then`, which a store is not.
    if (key === 'then') return undefined;

    return () => {
      throw new Error(`${name}.${String(key)} is not faked`);
    };
  },
}) as T;
