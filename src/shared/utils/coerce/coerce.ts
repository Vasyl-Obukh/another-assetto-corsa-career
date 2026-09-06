// Narrowing values that came off disk. Small on purpose: these are the checks
// every reader of an untrusted JSON file needs first, and nothing above them.
//
// They only narrow - what to do about a value that fails is the caller's, and
// the two callers answer differently. Settings coerce silently, because a file
// hand-edited into nonsense must not stop the app opening. A series file
// reports, because a championship that will not race should say why.

/**
 * Narrows a value to a plain object, excluding arrays and null.
 * @param value The value to test
 * @returns True when the value is a plain object
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

/**
 * Reads a value that must be one of a closed set, with nothing to fall back to.
 *
 * The reporting sibling of `oneOf`: it says whether the value was allowed
 * rather than quietly substituting one that is.
 * @param value The value to read
 * @param allowed Every acceptable value
 * @returns The value if allowed, undefined otherwise
 */
export const memberOf = <T extends string | number>(
  value: unknown,
  allowed: readonly T[],
): T | undefined => (allowed.includes(value as T) ? value as T : undefined);

/**
 * Every value of a string enum, for checking membership at runtime.
 *
 * A string enum's values are exactly its members, so this is a plain
 * Object.values. Numeric enums are a different matter - TypeScript gives those
 * a reverse mapping, so their Object.values holds the names as well.
 * @param members The enum object
 * @returns Its values
 */
export const stringEnumValues = <T extends string>(
  members: Record<string, T>,
): readonly T[] => Object.values(members);

/**
 * Every value of a numeric enum, without the reverse mapping.
 *
 * `Object.values(WeatherType)` holds both the numbers and the names, so a bare
 * membership check against it would accept "HAIL" as a weather type.
 * @param members The enum object
 * @returns Its numeric values alone
 */
export const numericEnumValues = (
  members: Record<string, string | number>,
): readonly number[] => Object.values(members).filter((value) => typeof value === 'number');
