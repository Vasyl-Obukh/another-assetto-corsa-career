import { describe, expect, it } from '@jest/globals';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { isNationCode } from '../../../shared/utils/nations/index.ts';
import { SPONSOR_BOOK } from '../sponsor-book.ts';

/**
 * Every sponsor in the book, whatever its trade.
 */
const EVERY = Object.values(SPONSOR_BOOK).flat();

/**
 * The logo files the renderer ships, by name without their extension.
 * @returns Their names
 */
const logoFiles = async (): Promise<string[]> => (
  (await readdir(join(__dirname, '../../../renderer/src/assets/sponsors')))
    .map((file) => file.slice(0, file.lastIndexOf('.')))
);

describe('core/sponsor-offers/sponsor-book', () => {
  describe('SPONSOR_BOOK', () => {
    it('lists each company once, in one trade', () => {
      const names = EVERY.map((one) => one.name);

      expect(new Set(names).size).toBe(names.length);
    });

    it('gives every sponsor a nation Assetto Corsa has a flag for', () => {
      expect(EVERY.filter((one) => !isNationCode(one.nation))).toEqual([]);
    });

    it('names a logo file the renderer ships, and ships none nobody names', async () => {
      const files = await logoFiles();
      const logos = EVERY.flatMap((one) => (one.logo ? [one.logo] : []));

      expect(logos.filter((logo) => !files.includes(logo))).toEqual([]);
      expect(files.filter((file) => !logos.includes(file))).toEqual([]);
      expect(new Set(files).size).toBe(files.length);
    });
  });
});
