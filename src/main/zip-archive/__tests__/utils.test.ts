import { describe, expect, it } from '@jest/globals';

import { END_SIGNATURE } from '../constants.ts';
import { dosStamp, findEndRecord } from '../utils.ts';

/**
 * An end of central directory record and nothing else, with a comment of a
 * given length after it.
 * @param comment How long its comment is
 * @param before How many bytes of anything come before it
 * @returns The bytes
 */
const endRecord = (comment: number, before = 0): Buffer => {
  const record = Buffer.alloc(before + 22 + comment);
  record.writeUInt32LE(END_SIGNATURE, before);
  record.writeUInt16LE(comment, before + 20);

  return record;
};

describe('main/zip-archive/utils', () => {
  describe('dosStamp', () => {
    it('packs a local time into the two DOS fields, seconds halved', () => {
      // 14:37:59 on 3 March 2027.
      expect(dosStamp(new Date(2027, 2, 3, 14, 37, 59))).toEqual({
        time: 14 * 2048 + 37 * 32 + 29,
        date: 47 * 512 + 3 * 32 + 3,
      });
    });

    it('holds a moment before 1980 at the first year DOS can say', () => {
      expect(dosStamp(new Date(1975, 0, 1)).date).toBe(0 * 512 + 32 + 1);
    });
  });

  describe('findEndRecord', () => {
    it('finds the record at the very end of an archive', () => {
      expect(findEndRecord(endRecord(0, 40))).toBe(40);
    });

    it('looks back past a comment', () => {
      expect(findEndRecord(endRecord(300, 10))).toBe(10);
    });

    it('is not fooled by a comment holding the same four bytes', () => {
      const record = endRecord(40, 10);
      record.writeUInt32LE(END_SIGNATURE, 10 + 22 + 8);

      expect(findEndRecord(record)).toBe(10);
    });

    it('answers -1 for bytes that hold none', () => {
      expect(findEndRecord(Buffer.alloc(64))).toBe(-1);
    });
  });
});
