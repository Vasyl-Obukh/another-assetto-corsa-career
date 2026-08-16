import { describe, expect, it } from '@jest/globals';

import { parseIni, writeIni } from '../index.ts';

describe('core/ini', () => {
  describe('parseIni', () => {
    it('parses sections and keys', () => {
      expect(parseIni('[RACE]\nTRACK=spa\nCARS=8')).toEqual({
        RACE: { TRACK: 'spa', CARS: '8' },
      });
    });

    it('strips a BOM and tolerates CRLF', () => {
      expect(parseIni('﻿[A]\r\nB=1\r\n')).toEqual({ A: { B: '1' } });
    });

    it('skips comment lines', () => {
      expect(parseIni('[A]\n; c\n// c\n# c\nB=1')).toEqual({ A: { B: '1' } });
    });

    it('keeps the last of a duplicated key', () => {
      expect(parseIni('[A]\nB=1\nB=2')).toEqual({ A: { B: '2' } });
    });

    it('only strips an inline comment preceded by whitespace', () => {
      expect(parseIni('[A]\nB=x ; note\nC=a;b')).toEqual({ A: { B: 'x', C: 'a;b' } });
    });
  });

  describe('writeIni', () => {
    it('writes CRLF and blank-line separated sections', () => {
      expect(writeIni({ A: { B: 1 }, C: { D: 2 } })).toBe('[A]\r\nB=1\r\n\r\n[C]\r\nD=2\r\n');
    });

    it('writes booleans as 1 and 0', () => {
      expect(writeIni({ A: { T: true, F: false } })).toBe('[A]\r\nT=1\r\nF=0\r\n');
    });

    it('skips null sections and null or undefined values', () => {
      expect(writeIni({ A: { B: 1, C: null, D: undefined }, E: null })).toBe('[A]\r\nB=1\r\n');
    });
  });
});
