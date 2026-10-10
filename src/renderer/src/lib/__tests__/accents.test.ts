import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../../shared/types';
import {
  classAccent, DISCIPLINE_DOT, disciplineDot, PODIUM_ACCENT, POINTS_ACCENT, RACE_CLASS_ACCENT, resultAccent,
} from '../accents.ts';

describe('renderer/lib/accents', () => {
  describe('resultAccent', () => {
    it('gives a podium place its metal, scored or not', () => {
      expect(resultAccent(1, true)).toBe(PODIUM_ACCENT[0]);
      expect(resultAccent(3, false)).toBe(PODIUM_ACCENT[2]);
    });

    it('greens any other finish that scored', () => {
      expect(resultAccent(6, true)).toBe(POINTS_ACCENT);
    });

    it('leaves a finish off the podium that scored nothing plain', () => {
      expect(resultAccent(14, false)).toBeUndefined();
    });
  });

  describe('disciplineDot', () => {
    it('wears the colour of the class\'s discipline', () => {
      expect(disciplineDot({ discipline: Discipline.TOURING, tier: 3 })).toBe(DISCIPLINE_DOT[Discipline.TOURING]);
    });

    it('stays muted for a class the championship no longer has', () => {
      expect(disciplineDot(null)).toBe('bg-muted');
      expect(disciplineDot(undefined)).toBe('bg-muted');
    });
  });

  describe('classAccent', () => {
    it('gives each class of a race its slot\'s colour', () => {
      expect(classAccent(0)).toBe(RACE_CLASS_ACCENT[0]);
      expect(classAccent(1)).toBe(RACE_CLASS_ACCENT[1]);
    });

    it('cycles past the last colour', () => {
      expect(classAccent(RACE_CLASS_ACCENT.length)).toBe(RACE_CLASS_ACCENT[0]);
    });

    it('wraps a negative slot rather than reading past the start', () => {
      expect(classAccent(-1)).toBe(RACE_CLASS_ACCENT[RACE_CLASS_ACCENT.length - 1]);
    });
  });
});
