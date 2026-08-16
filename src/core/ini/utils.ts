import type { IniValue } from './types.ts';

/**
 * Renders a value the way AC expects to read it back.
 * @param value The value to render
 * @returns The value as a string, with booleans written as 1 or 0
 */
export const formatValue = (value: IniValue): string => {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
};
