import { BASE64_GROUP } from './constants.ts';
import { DEFAULT_ASSISTS } from '../../shared/constants/index.ts';
import type { Assists } from '../../shared/types/index.ts';
import { defined } from '../../shared/utils/defined/index.ts';

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
 * Fills in every assist AC ships a default for.
 *
 * One resolution behind both renderings, so the INI and the JSON can never
 * disagree about what an omitted field meant. Merged through `defined` rather
 * than by a bare spread, so a field explicitly set to undefined - which the
 * race screen writes for every box the user has emptied - falls back to the
 * default instead of overwriting it with nothing.
 * @param assists The assists a race asked for
 * @returns Every assist, with nothing left undefined
 */
export const resolveAssists = (assists: Assists = {}): Required<Assists> => ({
  ...DEFAULT_ASSISTS,
  ...defined(assists),
});
