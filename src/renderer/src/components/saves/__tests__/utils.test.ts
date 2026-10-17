import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type { SaveMoment, SaveSummary } from '../../../../../shared/types';
import {
  filterSaves, loadedTitle, saveStatusLine, saveTitle, suggestedName,
} from '../utils.ts';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';

/**
 * A translator that writes back the key it was asked for, and whatever it was
 * handed to fill it.
 */
const t = ((key: string, options?: Record<string, unknown>) => (
  options === undefined ? key : `${key}${JSON.stringify(options)}`
)) as unknown as TFunction;

/**
 * What an autosave taken after a sprint race at Spa says.
 */
const SPRINT: SaveMoment = {
  kind: 'session', seriesName: 'Cup', roundName: 'Spa', session: { name: 'Sprint', type: 'race' },
};

/**
 * One save.
 * @param over What the test wants it to say
 * @returns The save
 */
const save = (over: Partial<SaveSummary> = {}): SaveSummary => ({
  id: 'autosave-1',
  kind: 'auto',
  name: null,
  savedAt: '2027-03-01T10:00:00.000Z',
  date: '2027-03-01',
  moment: null,
  ...over,
});

describe('renderer/components/saves/utils', () => {
  describe('saveTitle', () => {
    it('calls a named save by its name and the quick save by its kind', () => {
      expect(saveTitle(save({ kind: 'named', name: 'Before Spa' }), t)).toBe('Before Spa');
      expect(saveTitle(save({ kind: 'quick' }), t)).toBe('saves.kind.quick');
    });

    it('calls an autosave after the session it followed, by its own name', () => {
      expect(saveTitle(save({ moment: SPRINT }), t)).toBe('saves.after{"session":"Sprint","round":"Spa"}');
    });

    it("names a session with no name of its own by its kind's", () => {
      const moment: SaveMoment = { ...SPRINT, session: { name: null, type: 'qualify' } };

      expect(saveTitle(save({ moment }), t)).toBe(`saves.after{"session":"${SESSION_TYPE_LABEL.qualify}","round":"Spa"}`);
    });

    it('calls an autosave after the season it opened, or by its kind when it says nothing', () => {
      expect(saveTitle(save({ moment: { kind: 'season', year: 2028 } }), t)).toBe('saves.newSeason{"year":2028}');
      expect(saveTitle(save(), t)).toBe('saves.kind.auto');
    });
  });

  describe('saveStatusLine', () => {
    it('says what each kind of save was and how long ago', () => {
      expect(saveStatusLine(save({ kind: 'named', name: 'Before Spa' }), 'now', t))
        .toBe('saves.status.named{"name":"Before Spa","ago":"now"}');
      expect(saveStatusLine(save({ kind: 'quick' }), 'now', t)).toBe('saves.status.quick{"ago":"now"}');
      expect(saveStatusLine(save({ moment: SPRINT }), 'now', t))
        .toBe('saves.status.session{"session":"Sprint","ago":"now"}');
      expect(saveStatusLine(save({ moment: { kind: 'season', year: 2028 } }), 'now', t))
        .toBe('saves.status.season{"year":2028,"ago":"now"}');
      expect(saveStatusLine(save(), 'now', t)).toBe('saves.status.auto{"ago":"now"}');
    });
  });

  describe('loadedTitle', () => {
    it('heads a load with the save it was', () => {
      expect(loadedTitle(save({ kind: 'named', name: 'Before Spa' }), t)).toBe('saves.toast.named{"name":"Before Spa"}');
      expect(loadedTitle(save({ kind: 'quick' }), t)).toBe('saves.toast.quick');
      expect(loadedTitle(save({ moment: { kind: 'season', year: 2028 } }), t))
        .toBe('saves.toast.auto{"title":"saves.newSeason{\\"year\\":2028}"}');
    });
  });

  describe('suggestedName', () => {
    it('names a save after what the newest autosave followed', () => {
      const saves = [
        save({ id: 'quicksave', kind: 'quick' }),
        save({ moment: SPRINT }),
        save({ id: 'autosave-2', moment: { kind: 'season', year: 2027 } }),
      ];

      expect(suggestedName(saves, t)).toBe('saves.suggested{"round":"Spa","session":"Sprint"}');
    });

    it('names one after a season opening', () => {
      expect(suggestedName([save({ moment: { kind: 'season', year: 2028 } })], t)).toBe('saves.newSeason{"year":2028}');
    });

    it('suggests nothing before anything has happened', () => {
      expect(suggestedName([], t)).toBeNull();
      expect(suggestedName([save({ id: 'quicksave', kind: 'quick' })], t)).toBeNull();
    });
  });

  describe('filterSaves', () => {
    const saves = [save({ id: 'quicksave', kind: 'quick' }), save(), save({ id: 'x', kind: 'named', name: 'Mine' })];

    it('shows every save, or one kind of them, in the order given', () => {
      expect(filterSaves(saves, 'all')).toBe(saves);
      expect(filterSaves(saves, 'auto').map((one) => one.id)).toEqual(['autosave-1']);
      expect(filterSaves(saves, 'named').map((one) => one.id)).toEqual(['x']);
    });
  });
});
