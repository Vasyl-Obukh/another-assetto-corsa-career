// Shapes for AC's flat, unquoted flavour of INI. Core-internal: nothing outside
// the INI reader and writer deals in these.

/**
 * One section's keys and their raw string values.
 */
export type IniSection = Record<string, string>;

/**
 * A parsed INI file, keyed by section name.
 */
export type IniData = Record<string, IniSection>;

/**
 * A value that can be written to an INI file.
 */
export type IniValue = string | number | boolean;

/**
 * An INI file ready to be serialised. A null section is skipped entirely, as is
 * any key whose value is null or undefined.
 */
export type IniWritable = Record<string, Record<string, IniValue | null | undefined> | null>;
