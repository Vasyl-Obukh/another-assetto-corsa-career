import { FALLBACK_LANGUAGE, LANGUAGES } from '../../constants/index.ts';
import type { Language, LocalizedText } from '../../types/index.ts';

/**
 * A text as one reader reads it: their language's, else English, else
 * nothing. A plain string reads the same in every language, and an empty
 * translation counts as none.
 * @param text The text, or nothing
 * @param language The reader's language
 * @returns What to show, empty when it holds nothing for them
 */
export const localizedText = (text: LocalizedText | null | undefined, language: Language): string => {
  if (text === undefined || text === null) return '';
  if (typeof text === 'string') return text;

  return text[language] || text[FALLBACK_LANGUAGE] || '';
};

/**
 * The languages a text is written in, in the order it holds them - the one
 * it was first written in first. A plain string holds none.
 * @param text The text
 * @returns Its languages
 */
export const textLanguages = (text: LocalizedText | undefined): Language[] => (
  text === undefined || typeof text === 'string'
    ? []
    : (Object.keys(text) as Language[]).filter((language) => LANGUAGES.includes(language))
);

/**
 * The languages a text could still be translated into.
 * @param text The text
 * @param base The language a plain string is taken to be written in
 * @returns Every app language it holds no text in yet
 */
export const missingLanguages = (text: LocalizedText | undefined, base: Language): Language[] => {
  const held = typeof text === 'object' ? textLanguages(text) : [base];

  return LANGUAGES.filter((language) => !held.includes(language));
};

/**
 * A text with an empty translation added in a language it does not hold yet.
 * A plain string becomes the text of `base`, the language it is taken to be
 * written in.
 * @param text The text
 * @param base The language a plain string is taken to be written in
 * @param added The language to add
 * @returns The text, translated into one more language
 */
export const withLanguage = (
  text: LocalizedText | undefined,
  base: Language,
  added: Language,
): LocalizedText => (
  typeof text === 'object'
    ? { ...text, [added]: '' }
    : { [base]: text ?? '', [added]: '' }
);

/**
 * A text with one language's text written anew. A plain string is written
 * over whole, whatever language is named, and one emptied is no text at all.
 * @param text The text
 * @param language The language written, or null for a plain string
 * @param value What it now says
 * @returns The text, or undefined for a plain string emptied
 */
export const withText = (
  text: LocalizedText | undefined,
  language: Language | null,
  value: string,
): LocalizedText | undefined => {
  if (language !== null && typeof text === 'object') return { ...text, [language]: value };

  return value === '' ? undefined : value;
};

/**
 * A text cut down to some of its languages: several kept as they are, one
 * alone as a plain string, since a text in one language has nothing to choose
 * between, and none as undefined.
 * @param text The text
 * @param kept The languages to keep
 * @returns The text
 */
const keeping = (
  text: Partial<Record<Language, string>>,
  kept: Language[],
): LocalizedText | undefined => {
  if (kept.length > 1) return Object.fromEntries(kept.map((language) => [language, text[language]]));

  return kept.length === 1 ? text[kept[0]] : undefined;
};

/**
 * A text with one language taken out, whatever is left in one language alone
 * going back to a plain string. Taking out the only language a text holds
 * keeps its text as a plain string rather than losing it.
 * @param text The text
 * @param language The language to take out
 * @returns The text
 */
export const withoutLanguage = (
  text: LocalizedText | undefined,
  language: Language,
): LocalizedText | undefined => {
  if (typeof text !== 'object') return text;
  const held = textLanguages(text);

  return keeping(text, held.length > 1 ? held.filter((one) => one !== language) : held);
};

/**
 * A text as it is saved: every empty language dropped, English left alone as a
 * plain string, and nothing at all as undefined. Any other language left alone
 * stays keyed, since as a plain string it would show to English readers too.
 * @param text The text
 * @returns The text to write
 */
export const tidyText = (text: LocalizedText | undefined): LocalizedText | undefined => {
  if (typeof text !== 'object') return text === '' ? undefined : text;
  const kept = textLanguages(text).filter((language) => text[language] !== '');
  if (kept.length === 1 && kept[0] !== FALLBACK_LANGUAGE) return { [kept[0]]: text[kept[0]] };

  return keeping(text, kept);
};
