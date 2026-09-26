import { describe, expect, it } from '@jest/globals';

import { isNationCode, nationName, nationOfCountry } from '../nations.ts';

describe('shared/utils/nations', () => {
  describe('isNationCode', () => {
    it('accepts the codes Assetto Corsa ships a flag for, home nations included', () => {
      expect(isNationCode('ITA')).toBe(true);
      expect(isNationCode('SCT')).toBe(true);
    });

    it('refuses anything else, whatever its case', () => {
      expect(isNationCode('ita')).toBe(false);
      expect(isNationCode('IT')).toBe(false);
      expect(isNationCode('XYZ')).toBe(false);
      expect(isNationCode('')).toBe(false);
    });
  });

  describe('nationName', () => {
    it('names a nation in English unless asked otherwise', () => {
      expect(nationName('DEU')).toBe('Germany');
    });

    it('names a nation in the language asked for', () => {
      expect(nationName('DEU', 'fr')).toBe('Allemagne');
    });

    // Intl names regions and not subdivisions, so these four stay English and
    // the renderer translates them itself.
    it('names a home nation in English whatever the language', () => {
      expect(nationName('WLS', 'fr')).toBe('Wales');
    });

    it('answers with the code itself for one AC does not know', () => {
      expect(nationName('XYZ')).toBe('XYZ');
    });
  });

  describe('nationOfCountry', () => {
    it('reads a country however a mod capitalises it', () => {
      expect(nationOfCountry('Germany')).toBe('DEU');
      expect(nationOfCountry('GERMANY')).toBe('DEU');
      expect(nationOfCountry('  germany ')).toBe('DEU');
    });

    it('reads the abbreviations and older names mods use', () => {
      expect(nationOfCountry('U.S.A.')).toBe('USA');
      expect(nationOfCountry('UK')).toBe('GBR');
      expect(nationOfCountry('Holland')).toBe('NLD');
      expect(nationOfCountry('West Germany')).toBe('DEU');
    });

    it('reads a value naming two countries as its first', () => {
      expect(nationOfCountry('Italy /USA')).toBe('ITA');
      expect(nationOfCountry('Japan, USA')).toBe('JPN');
      expect(nationOfCountry('France & Belgium')).toBe('FRA');
    });

    // Guards a bug: the value was split before it was looked up, so a name
    // holding an ampersand of its own never matched.
    it('reads a name with an ampersand of its own whole', () => {
      expect(nationOfCountry('Trinidad & Tobago')).toBe('TTO');
      expect(nationOfCountry('Bosnia & Herzegovina')).toBe('BIH');
    });

    it('answers null for text naming no nation, or for none', () => {
      expect(nationOfCountry('Atlantis')).toBeNull();
      expect(nationOfCountry('')).toBeNull();
      expect(nationOfCountry(null)).toBeNull();
    });
  });
});
