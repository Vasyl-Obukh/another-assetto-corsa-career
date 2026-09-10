import { describe, expect, it, jest } from '@jest/globals';

import { isAppError } from '../../../shared/errors/index.ts';
import {
  assertSafeSeriesId,
  freeSeriesFileName,
  isSafeSeriesId,
  nextSeriesId,
  seriesFileName,
  takenSeriesIds,
} from '../utils.ts';

jest.mock('node:fs/promises');

const { readdir } = jest.requireMock<typeof import('node:fs/promises')>('node:fs/promises');

/**
 * Runs a call and hands back the error code it raised.
 * @param run The call to make
 * @returns The code, or null when nothing was thrown
 */
const codeFrom = (run: () => void): string | null => {
  try {
    run();

    return null;
  } catch (error) {
    return isAppError(error) ? error.code : 'not-an-app-error';
  }
};

describe('core/series-library/utils', () => {
  describe('seriesFileName', () => {
    it('names the file after the id', () => {
      expect(seriesFileName('lotus-cup')).toBe('lotus-cup.json');
    });
  });

  describe('isSafeSeriesId', () => {
    it.each([
      'lotus-cup',
      'formula-1-2023',
      'gt3-sprint-series',
      'a',
      'a1',
    ])('accepts %s', (id) => {
      expect(isSafeSeriesId(id)).toBe(true);
    });

    it.each([
      ['a traversal', '../evil'],
      ['a separator', 'a/b'],
      ['a backslash', 'a\\b'],
      ['a drive letter', 'c:evil'],
      ['a space', 'lotus cup'],
      ['upper case', 'Lotus-Cup'],
      ['a leading hyphen', '-lotus'],
      ['a trailing hyphen', 'lotus-'],
      ['a double hyphen', 'lotus--cup'],
      ['a trailing dot', 'lotus.'],
      ['nothing at all', ''],
      ['an alternate data stream', 'a:b'],
    ])('refuses %s', (unused, id) => {
      expect(isSafeSeriesId(id)).toBe(false);
    });

    // Lower case is doing two jobs: Windows folds a file name's case, and
    // loadSeriesLibrary keys its map on the id case-sensitively, so a mixed-case
    // id would fight its own file without ever being recognised as an override.
    it('refuses a name Windows reserves for a device, which the pattern allows', () => {
      expect(isSafeSeriesId('nul')).toBe(false);
      expect(isSafeSeriesId('com1')).toBe(false);
      expect(isSafeSeriesId('nula')).toBe(true);
    });

    it('refuses an id too long to be a file name', () => {
      expect(isSafeSeriesId('a'.repeat(64))).toBe(true);
      expect(isSafeSeriesId('a'.repeat(65))).toBe(false);
    });
  });

  describe('assertSafeSeriesId', () => {
    it('says nothing about an id that is fine', () => {
      expect(codeFrom(() => assertSafeSeriesId('lotus-cup'))).toBeNull();
    });

    it('refuses rather than repairs, so the file and the document cannot disagree', () => {
      expect(codeFrom(() => assertSafeSeriesId('../evil'))).toBe('seriesFile.idUnsafe');
    });

    // A reserved name passes the pattern, so it needs its own sentence: telling
    // someone who wrote `nul` to use lower-case letters is no help.
    it('tells a reserved device name apart from an unusable one', () => {
      expect(codeFrom(() => assertSafeSeriesId('nul'))).toBe('seriesFile.idReserved');
    });
  });

  describe('nextSeriesId', () => {
    it('adds a copy suffix when nothing holds one', () => {
      expect(nextSeriesId('lotus-cup', new Set())).toBe('lotus-cup-copy');
    });

    it('counts on when the copy itself is taken', () => {
      expect(nextSeriesId('lotus-cup', new Set(['lotus-cup-copy']))).toBe('lotus-cup-copy-2');
      expect(nextSeriesId('lotus-cup', new Set(['lotus-cup-copy', 'lotus-cup-copy-2'])))
        .toBe('lotus-cup-copy-3');
    });

    it('counts on from a copy rather than stacking suffixes', () => {
      expect(nextSeriesId('lotus-cup-copy', new Set(['lotus-cup-copy'])))
        .toBe('lotus-cup-copy-2');
    });

    // Guards a bug: the suffix pattern was built with `\d` inside a template
    // literal, where it collapses to a literal `d`, so a numbered suffix was
    // never stripped and duplicating a copy gave `lotus-cup-copy-2-copy`.
    it('counts on from a numbered copy rather than stacking suffixes', () => {
      expect(nextSeriesId('lotus-cup-copy-2', new Set(['lotus-cup-copy', 'lotus-cup-copy-2'])))
        .toBe('lotus-cup-copy-3');
    });

    // The taken set arrives lower-cased - takenSeriesIds folds it and the store
    // folds the loaded ids - so it is the candidate this has to fold, or an id
    // differing only in case would collide on a filesystem that ignores case.
    it('folds the candidate, so a differently-cased id does not collide silently', () => {
      expect(nextSeriesId('LOTUS-CUP', new Set(['lotus-cup-copy']))).toBe('LOTUS-CUP-copy-2');
    });
  });

  describe('freeSeriesFileName', () => {
    it('names the file after the id when nothing has spent that name', () => {
      expect(freeSeriesFileName('lotus-cup', new Set())).toBe('lotus-cup.json');
    });

    // A name and the id inside it may disagree, so `lotus-cup.json` can hold
    // something else entirely - writing a new championship over it would
    // destroy a file of the user's.
    it('moves the name rather than the id when that name is already spent', () => {
      expect(freeSeriesFileName('lotus-cup', new Set(['lotus-cup']))).toBe('lotus-cup-2.json');
      expect(freeSeriesFileName('lotus-cup', new Set(['lotus-cup', 'lotus-cup-2'])))
        .toBe('lotus-cup-3.json');
    });
  });

  describe('takenSeriesIds', () => {
    it('reads the file stems, lower-cased', async () => {
      jest.mocked(readdir).mockResolvedValue(['Lotus-Cup.json', 'weird.json'] as never);

      expect(await takenSeriesIds('user-dir')).toEqual(new Set(['lotus-cup', 'weird']));
    });

    it('ignores anything that is not a championship file', async () => {
      jest.mocked(readdir).mockResolvedValue(['notes.txt', 'lotus-cup.json'] as never);

      expect(await takenSeriesIds('user-dir')).toEqual(new Set(['lotus-cup']));
    });

    // A folder that is not there has spent no names, which is the same answer
    // as one that is empty.
    it('answers with nothing when there is no folder', async () => {
      jest.mocked(readdir).mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
      );

      expect(await takenSeriesIds('user-dir')).toEqual(new Set());
    });

    // Deliberately read off the directory rather than off the loaded library: a
    // file that failed to parse is in neither the library nor safe to overwrite.
    it('counts a file that would not parse, since it still owns its name', async () => {
      jest.mocked(readdir).mockResolvedValue(['broken.json'] as never);

      expect(await takenSeriesIds('user-dir')).toEqual(new Set(['broken']));
    });
  });
});
