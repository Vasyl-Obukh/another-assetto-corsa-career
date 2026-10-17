import { describe, expect, it } from '@jest/globals';

import type { SaveSummary } from '../../../shared/types/index.ts';
import {
  autosaveSlot, checkedSaveName, readSaveFile, saveKindOf, summaryOf,
} from '../utils.ts';

/**
 * A named save's id.
 */
const NAMED_ID = '00000000-0000-4000-8000-0000000000aa';

/**
 * Reads a state that is any object, as a slot's own reader would.
 * @param state The value off disk
 * @returns It, or null when it is not an object
 */
const readAny = (state: unknown): { day: number } | null => (
  typeof state === 'object' && state !== null ? state as { day: number } : null
);

/**
 * A save's file as the disk holds it.
 * @param over What the test wants it to say
 * @returns The parsed file
 */
const file = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  version: 1,
  id: 'ignored',
  kind: 'named',
  name: 'Before Spa',
  savedAt: '2027-03-01T10:00:00.000Z',
  date: '2027-03-01',
  moment: null,
  state: { day: 1 },
  ...over,
});

/**
 * One save's summary.
 * @param id Its id
 * @param savedAt When it was taken
 * @returns The summary
 */
const summary = (id: string, savedAt: string): SaveSummary => ({
  id, kind: saveKindOf(id), name: null, savedAt, date: '2027-03-01', moment: null,
});

describe('main/save-files/utils', () => {
  describe('saveKindOf', () => {
    it('reads the quick save, an autosave and a named save off the id alone', () => {
      expect(saveKindOf('quicksave')).toBe('quick');
      expect(saveKindOf('autosave-3')).toBe('auto');
      expect(saveKindOf(NAMED_ID)).toBe('named');
    });
  });

  describe('readSaveFile', () => {
    it('reads a save, taking its id from the file name', () => {
      expect(readSaveFile(file(), NAMED_ID, readAny)).toEqual({
        version: 1,
        id: NAMED_ID,
        kind: 'named',
        name: 'Before Spa',
        savedAt: '2027-03-01T10:00:00.000Z',
        date: '2027-03-01',
        moment: null,
        state: { day: 1 },
      });
    });

    // The kind written inside is never trusted, or an autosave edited to call
    // itself named could be written over and renamed.
    it('takes the kind from the id, not from what the file says', () => {
      expect(readSaveFile(file({ kind: 'named' }), 'autosave-1', readAny)).toMatchObject({ kind: 'auto', name: null });
    });

    it('refuses another revision, a save missing its dates and a named save with no name', () => {
      expect(readSaveFile(file({ version: 2 }), NAMED_ID, readAny)).toBeNull();
      expect(readSaveFile(file({ savedAt: undefined }), NAMED_ID, readAny)).toBeNull();
      expect(readSaveFile(file({ name: '   ' }), NAMED_ID, readAny)).toBeNull();
      expect(readSaveFile('nonsense', NAMED_ID, readAny)).toBeNull();
    });

    it('refuses a save whose state the slot does not read', () => {
      expect(readSaveFile(file({ state: 'nonsense' }), NAMED_ID, readAny)).toBeNull();
    });

    it('reads what an autosave was taken after', () => {
      const moment = {
        kind: 'session', seriesName: 'Cup', roundName: 'Spa', session: { name: 'Sprint', type: 'race' },
      };

      expect(readSaveFile(file({ moment }), 'autosave-1', readAny)?.moment).toEqual(moment);
      expect(readSaveFile(file({ moment: { kind: 'season', year: 2028 } }), 'autosave-1', readAny)?.moment)
        .toEqual({ kind: 'season', year: 2028 });
    });

    it('drops a moment that does not read rather than the whole save', () => {
      const save = readSaveFile(file({ moment: { kind: 'session', roundName: 7 } }), 'autosave-1', readAny);

      expect(save?.moment).toBeNull();
      expect(save?.state).toEqual({ day: 1 });
    });

    it('reads a session with no name of its own as named by its kind', () => {
      const moment = {
        kind: 'session', seriesName: 'Cup', roundName: 'Spa', session: { type: 'qualify' },
      };

      expect(readSaveFile(file({ moment }), 'autosave-1', readAny)?.moment)
        .toEqual({ ...moment, session: { name: null, type: 'qualify' } });
    });
  });

  describe('summaryOf', () => {
    it('leaves the state out', () => {
      const save = readSaveFile(file(), NAMED_ID, readAny);
      if (!save) throw new Error('unread');

      expect(summaryOf(save)).not.toHaveProperty('state');
      expect(summaryOf(save)).toMatchObject({ id: NAMED_ID, name: 'Before Spa' });
    });
  });

  describe('autosaveSlot', () => {
    it('starts at one', () => {
      expect(autosaveSlot([], 3)).toEqual({ id: 'autosave-1', drop: [] });
    });

    it('takes the first number the kept autosaves leave free', () => {
      const saves = [summary('autosave-1', '2027-03-02'), summary('autosave-3', '2027-03-01')];

      expect(autosaveSlot(saves, 5)).toEqual({ id: 'autosave-2', drop: [] });
    });

    it('writes over the oldest once as many are kept as asked for', () => {
      const saves = [
        summary('autosave-2', '2027-03-03'),
        summary('autosave-3', '2027-03-02'),
        summary('autosave-1', '2027-03-01'),
      ];

      expect(autosaveSlot(saves, 3)).toEqual({ id: 'autosave-1', drop: [] });
    });

    it('drops every autosave beyond the number kept when that number shrinks', () => {
      const saves = [
        summary('autosave-4', '2027-03-04'),
        summary('autosave-3', '2027-03-03'),
        summary('autosave-2', '2027-03-02'),
        summary('autosave-1', '2027-03-01'),
      ];

      expect(autosaveSlot(saves, 2)).toEqual({ id: 'autosave-1', drop: ['autosave-3', 'autosave-2'] });
    });

    it('keeps only the new one when one is asked for', () => {
      const saves = [summary('autosave-2', '2027-03-02'), summary('autosave-1', '2027-03-01')];

      expect(autosaveSlot(saves, 1)).toEqual({ id: 'autosave-1', drop: ['autosave-2'] });
    });

    it('never counts or drops the quick save or a named save', () => {
      const saves = [summary('quicksave', '2027-03-05'), summary(NAMED_ID, '2027-03-04'), summary('autosave-1', '2027-03-01')];

      expect(autosaveSlot(saves, 1)).toEqual({ id: 'autosave-1', drop: [] });
    });
  });

  describe('checkedSaveName', () => {
    it('trims a name', () => {
      expect(checkedSaveName('  Before Spa  ')).toBe('Before Spa');
    });

    it('holds a name to eighty characters, trimming what the cut leaves', () => {
      expect(checkedSaveName(`${'a'.repeat(79)} tail`)).toBe('a'.repeat(79));
    });

    it('refuses a name with nothing in it, or none at all', () => {
      expect(() => checkedSaveName('   ')).toThrow(expect.objectContaining({ code: 'save.unnamed' }));
      expect(() => checkedSaveName(undefined)).toThrow(expect.objectContaining({ code: 'save.unnamed' }));
    });
  });
});
