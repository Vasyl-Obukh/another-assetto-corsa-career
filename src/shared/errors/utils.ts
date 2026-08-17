import type { ErrorParams } from './types.ts';

/**
 * Fills {{param}} placeholders in a template.
 *
 * A placeholder with no matching param is left as it stands, so a missing value
 * shows up in the message rather than silently becoming an empty string.
 * @param template The template to fill
 * @param params Values to interpolate
 * @returns The rendered string
 */
export const formatMessage = (template: string, params: ErrorParams = {}): string => (
  template.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  })
);
