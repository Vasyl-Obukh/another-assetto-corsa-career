import { describe, expect, it } from '@jest/globals';

import { matchesTerms, normalise, searchTerms } from '../search.ts';

describe('shared/utils/search', () => {
  describe('normalise', () => {
    it('folds case', () => {
      expect(normalise('Ferrari')).toBe('ferrari');
    });

    // Nobody types the diaeresis, and refusing to match without it would hide
    // every Citroen in the library.
    it('strips diacritics', () => {
      expect(normalise('Citroën')).toBe('citroen');
      expect(normalise('Competición')).toBe('competicion');
    });
  });

  describe('searchTerms', () => {
    it('splits on whitespace and folds each term', () => {
      expect(searchTerms('  Ferrari   GT3 ')).toEqual(['ferrari', 'gt3']);
    });

    it('is empty when there is nothing to search for', () => {
      expect(searchTerms(undefined)).toEqual([]);
      expect(searchTerms('   ')).toEqual([]);
    });
  });

  describe('matchesTerms', () => {
    it('matches everything when no terms were given', () => {
      expect(matchesTerms([], ['anything'])).toBe(true);
    });

    // "porsche gt3" means both words; matching either would bury the answer
    // under every Porsche ever made.
    it('requires every term, though not all in the same place', () => {
      expect(matchesTerms(['porsche', 'gt3'], ['Porsche 911', 'gt3'])).toBe(true);
      expect(matchesTerms(['porsche', 'gt3'], ['Porsche 911', 'street'])).toBe(false);
    });

    it('matches a substring, not just a whole word', () => {
      expect(matchesTerms(['fer'], ['Ferrari'])).toBe(true);
    });

    it('ignores haystacks the mod left empty', () => {
      expect(matchesTerms(['ferrari'], [null, 'Ferrari F40'])).toBe(true);
      expect(matchesTerms(['ferrari'], [null])).toBe(false);
    });
  });
});
