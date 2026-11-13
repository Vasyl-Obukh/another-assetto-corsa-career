import { describe, expect, it } from '@jest/globals';

import {
  localizedText, missingLanguages, textLanguages, tidyText, withLanguage, withoutLanguage, withText,
} from '../index.ts';

describe('shared/utils/localized-text', () => {
  describe('localizedText', () => {
    it('reads a plain string the same in every language', () => {
      expect(localizedText('Club racing', 'en')).toBe('Club racing');
      expect(localizedText('Club racing', 'uk')).toBe('Club racing');
    });

    it("reads the reader's own language where the text holds it", () => {
      expect(localizedText({ en: 'Club racing', uk: 'Клубні перегони' }, 'uk')).toBe('Клубні перегони');
    });

    it('falls back to English where it holds nothing in theirs', () => {
      expect(localizedText({ en: 'Club racing' }, 'uk')).toBe('Club racing');
    });

    it('falls back to English past a translation left empty', () => {
      expect(localizedText({ en: 'Club racing', uk: '' }, 'uk')).toBe('Club racing');
    });

    it('shows nothing in English for a text written only in another language', () => {
      expect(localizedText({ uk: 'Клубні перегони' }, 'en')).toBe('');
    });

    it('reads no text at all as nothing', () => {
      expect(localizedText(undefined, 'en')).toBe('');
      expect(localizedText(null, 'en')).toBe('');
    });
  });

  describe('textLanguages', () => {
    it('lists the languages in the order the text holds them', () => {
      expect(textLanguages({ uk: 'Клубні перегони', en: 'Club racing' })).toEqual(['uk', 'en']);
    });

    it('holds none for a plain string or no text', () => {
      expect(textLanguages('Club racing')).toEqual([]);
      expect(textLanguages(undefined)).toEqual([]);
    });

    it('leaves out a key that is not an app language', () => {
      expect(textLanguages({ en: 'Club racing', fr: 'Course de club' } as never)).toEqual(['en']);
    });
  });

  describe('missingLanguages', () => {
    it('takes a plain string to be written in the base language', () => {
      expect(missingLanguages('Club racing', 'en')).toEqual(['uk']);
      expect(missingLanguages('Клубні перегони', 'uk')).toEqual(['en']);
    });

    it('counts no text as written in the base language too', () => {
      expect(missingLanguages(undefined, 'uk')).toEqual(['en']);
    });

    it('lists every language a translated text does not hold', () => {
      expect(missingLanguages({ uk: 'Клубні перегони' }, 'uk')).toEqual(['en']);
      expect(missingLanguages({ en: 'Club racing', uk: 'Клубні перегони' }, 'en')).toEqual([]);
    });
  });

  describe('withLanguage', () => {
    it('turns a plain string into the base language with an empty translation after it', () => {
      expect(withLanguage('Club racing', 'en', 'uk')).toEqual({ en: 'Club racing', uk: '' });
    });

    it('writes no text as an empty base language', () => {
      expect(withLanguage(undefined, 'uk', 'en')).toEqual({ uk: '', en: '' });
    });

    it('adds an empty translation to a translated text, keeping its order', () => {
      expect(Object.keys(withLanguage({ uk: 'Клубні перегони' }, 'en', 'en'))).toEqual(['uk', 'en']);
    });
  });

  describe('withText', () => {
    it('writes one language and leaves the others', () => {
      expect(withText({ en: 'Club racing', uk: '' }, 'uk', 'Клубні перегони'))
        .toEqual({ en: 'Club racing', uk: 'Клубні перегони' });
    });

    it('writes a plain string over whole', () => {
      expect(withText('Club racing', null, 'Club racing series')).toBe('Club racing series');
      expect(withText(undefined, null, 'Club racing')).toBe('Club racing');
    });

    // An emptied box used to stay '', which differs from a championship with no
    // description and so marked the Overview tab unsaved with nothing changed.
    it('reads a plain string emptied as no text at all', () => {
      expect(withText('Club racing', null, '')).toBeUndefined();
    });

    it('keeps a translation emptied, so its tab stays open to be written', () => {
      expect(withText({ en: 'Club racing', uk: 'Клубні' }, 'uk', '')).toEqual({ en: 'Club racing', uk: '' });
    });
  });

  describe('withoutLanguage', () => {
    it('leaves the one language left as a plain string', () => {
      expect(withoutLanguage({ en: 'Club racing', uk: 'Клубні перегони' }, 'en')).toBe('Клубні перегони');
    });

    // Taking the only language out used to delete the whole description.
    it('keeps the text of the only language as a plain string rather than losing it', () => {
      expect(withoutLanguage({ uk: 'Клубні перегони' }, 'uk')).toBe('Клубні перегони');
    });

    it('leaves a plain string as it is', () => {
      expect(withoutLanguage('Club racing', 'en')).toBe('Club racing');
    });
  });

  describe('tidyText', () => {
    it('drops a translation left empty, leaving English alone a plain string', () => {
      expect(tidyText({ en: 'Club racing', uk: '' })).toBe('Club racing');
    });

    // Collapsing a text left only in Ukrainian used to show it to English
    // readers as well, just for opening and saving the championship.
    it('keeps a text left in a language other than English keyed by it', () => {
      expect(tidyText({ uk: 'Клубні перегони', en: '' })).toEqual({ uk: 'Клубні перегони' });
      expect(tidyText({ uk: 'Клубні перегони' })).toEqual({ uk: 'Клубні перегони' });
    });

    it('keeps several written languages as they are', () => {
      expect(tidyText({ en: 'Club racing', uk: 'Клубні перегони' }))
        .toEqual({ en: 'Club racing', uk: 'Клубні перегони' });
    });

    it('saves an empty text as nothing at all', () => {
      expect(tidyText({ en: '', uk: '' })).toBeUndefined();
      expect(tidyText('')).toBeUndefined();
    });

    it('keeps a plain string with something in it', () => {
      expect(tidyText('Club racing')).toBe('Club racing');
      expect(tidyText(undefined)).toBeUndefined();
    });
  });
});
