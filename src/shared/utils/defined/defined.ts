/**
 * Drops the keys an object holds explicitly as undefined.
 *
 * A plain spread does not: `{ ...defaults, ...{ abs: undefined } }` overwrites
 * the default with undefined, and TypeScript cannot see it because an optional
 * property and one explicitly set to undefined have the same type. That is a
 * quiet way to send Content Manager an assists blob with a key missing, so
 * every merge of a partial over a default goes through here first.
 * @param value The object to strip, or undefined
 * @returns The same keys, minus any whose value is undefined
 */
export const defined = <T extends object>(value: T | undefined): Partial<T> => (
  Object.fromEntries(
    Object.entries(value ?? {}).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>
);
