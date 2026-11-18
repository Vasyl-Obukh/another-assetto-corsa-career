import { describe, expect, it } from '@jest/globals';

import { buildRaceUri } from '../launch.ts';
import { fromCutBase64 } from '../utils.ts';

/**
 * Reads a query parameter back out of an acmanager URI.
 * @param uri The URI to read
 * @param key The parameter name
 * @returns The decoded value, or null when the parameter is absent
 */
const param = (uri: string, key: string): string | null => (
  new URL(uri).searchParams.get(key)
);

describe('core/launch', () => {
  describe('buildRaceUri', () => {
    it('targets race/config', () => {
      expect(buildRaceUri('[RACE]\r\n').startsWith('acmanager://race/config?')).toBe(true);
    });

    it('sends the INI as configData, which CM reads as base64', () => {
      const ini = '[RACE]\r\nTRACK=spa\r\n';
      const encoded = param(buildRaceUri(ini), 'configData');

      expect(encoded).not.toBeNull();
      expect(fromCutBase64(encoded as string)).toBe(ini);
    });

    it('percent-encodes the + and / that survive cut base64', () => {
      // Those characters are legal in standard base64 but would break the query.
      const ini = String.fromCharCode(0xff, 0xef, 0xbf).repeat(4);
      const uri = buildRaceUri(ini);

      expect(uri.split('?')[1]).not.toMatch(/[+/]/);
      expect(fromCutBase64(param(uri, 'configData') as string)).toBe(ini);
    });

    it('omits assistsData when no preset is given', () => {
      expect(buildRaceUri('[RACE]')).not.toContain('assistsData');
    });

    it('includes assistsData when a preset is given', () => {
      const uri = buildRaceUri('[RACE]', { assistsPreset: 'preset-blob' });
      expect(fromCutBase64(param(uri, 'assistsData') as string)).toBe('preset-blob');
    });
  });
});
