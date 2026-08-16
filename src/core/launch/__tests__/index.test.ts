import { describe, expect, it } from '@jest/globals';

import {
  buildAssistsIni, buildBatchUri, buildRaceUri, buildRaceUriFromFile,
} from '../index.ts';
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

  describe('buildRaceUriFromFile', () => {
    it('sends the path as configFile rather than configData', () => {
      const uri = buildRaceUriFromFile('D:\\out\\race.ini');

      expect(uri).toContain('configFile=');
      expect(uri).not.toContain('configData=');
      expect(param(uri, 'configFile')).toBe('D:\\out\\race.ini');
    });
  });

  describe('buildBatchUri', () => {
    it('joins commands with newlines inside one batch call', () => {
      const uri = buildBatchUri(['acmanager://install?url=a', 'acmanager://race/config?x=1']);

      expect(uri).toContain('acmanager://batch?cmds=');
      expect(fromCutBase64(param(uri, 'cmds') as string))
        .toBe('acmanager://install?url=a\nacmanager://race/config?x=1');
    });
  });

  describe('buildAssistsIni', () => {
    it('writes an [ASSISTS] section with CRLF endings', () => {
      const ini = buildAssistsIni();

      expect(ini.startsWith('[ASSISTS]')).toBe(true);
      expect(ini).toContain('\r\n');
    });

    it('defaults to what AC itself ships rather than everything off', () => {
      const ini = buildAssistsIni();

      expect(ini).toContain('ABS=1');
      expect(ini).toContain('TRACTION_CONTROL=1');
      expect(ini).toContain('DAMAGE=100');
      expect(ini).toContain('TYRE_BLANKETS=1');
    });

    it('defaults the optional aids to off', () => {
      const ini = buildAssistsIni();

      expect(ini).toContain('IDEAL_LINE=0');
      expect(ini).toContain('AUTO_SHIFTER=0');
    });

    it('writes the values the race asked for', () => {
      const ini = buildAssistsIni({
        abs: 0, damage: 50, idealLine: true, tyreWear: 2,
      });

      expect(ini).toContain('ABS=0');
      expect(ini).toContain('DAMAGE=50');
      expect(ini).toContain('IDEAL_LINE=1');
      expect(ini).toContain('TYRE_WEAR=2');
    });
  });
});
