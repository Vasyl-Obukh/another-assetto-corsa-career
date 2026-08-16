import { BASE64_GROUP } from './constants.ts';

/**
 * Encodes text as Content Manager's "cut base64": standard base64 with '='
 * stripped.
 *
 * Not the URL-safe alphabet - FromCutBase64() re-pads and calls
 * Convert.FromBase64String(), which rejects '-' and '_'. So '+' and '/' survive
 * and must be percent-encoded in the query string.
 * @param text The text to encode
 * @returns Base64 without padding
 */
export const toCutBase64 = (text: string): string => (
  Buffer.from(text, 'utf8').toString('base64').replace(/=+$/, '')
);

/**
 * Decodes Content Manager's cut base64 back to text.
 * @param encoded Base64 without padding
 * @returns The decoded text
 */
export const fromCutBase64 = (encoded: string): string => {
  const padding = encoded.length % BASE64_GROUP;
  const padded = padding ? encoded + '='.repeat(BASE64_GROUP - padding) : encoded;
  return Buffer.from(padded, 'base64').toString('utf8');
};

/**
 * Renders an optional boolean assist as AC's 1 or 0.
 * @param value The assist setting, or undefined when the race omits it
 * @param fallback Used when the value is undefined
 * @returns 1 when enabled, 0 when not
 */
export const assistFlag = (value: boolean | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  return value ? 1 : 0;
};
