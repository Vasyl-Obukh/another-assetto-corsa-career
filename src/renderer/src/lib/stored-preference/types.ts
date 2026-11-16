/**
 * What a stored field has to be to be read back: any string, a list of
 * strings, a number, a flag, one of a closed set of strings, or a list of
 * picks out of one.
 */
export type FieldKind =
  | 'string'
  | 'strings'
  | 'number'
  | 'boolean'
  | readonly string[]
  | { readonly members: readonly string[] };

/**
 * The kinds a field of type `V` may be read as, so a shape naming the wrong
 * kind for its field does not compile. Wrapped in tuples to keep a union of
 * literals whole rather than distributing over it.
 */
type KindOf<V> = [V] extends [boolean] ? 'boolean'
  : [V] extends [number] ? 'number'
    : [V] extends [readonly (infer E)[]] ? (string extends E ? 'strings' : { readonly members: readonly E[] })
      : [V] extends [string] ? (string extends V ? 'string' : readonly V[])
        : never;

/**
 * The kind of every field a stored object may carry, so a reader keeps those
 * and drops the rest.
 */
export type FieldShape<T> = { readonly [K in keyof T]-?: KindOf<NonNullable<T[K]>> };
