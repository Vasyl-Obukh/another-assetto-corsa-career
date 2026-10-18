import { describe, expect, it } from '@jest/globals';

import { fileNameOf } from '../file-name.ts';

describe('renderer/lib/file-name', () => {
  describe('fileNameOf', () => {
    it('takes the last part of a path, whichever slash it is written with', () => {
      expect(fileNameOf('D:\\backups\\eterry-career-2027-06-14.zip')).toBe('eterry-career-2027-06-14.zip');
      expect(fileNameOf('/home/eterry/career.zip')).toBe('career.zip');
    });

    it('answers a bare name as it is', () => {
      expect(fileNameOf('career.zip')).toBe('career.zip');
    });
  });
});
