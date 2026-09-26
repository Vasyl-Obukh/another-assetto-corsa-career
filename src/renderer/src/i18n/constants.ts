import type { Language } from '../../../shared/types';

/**
 * BCP 47 locale used for each language's dates, numbers and money.
 */
export const LOCALES: Record<Language, string> = { en: 'en-GB', uk: 'uk-UA' };

/**
 * Currency shown when nothing else is specified. Display only, never converted.
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Language every missing translation falls back to.
 */
export const FALLBACK_LANGUAGE: Language = 'en';

/**
 * What each language calls the four home nations AC flags apart from the United
 * Kingdom. Intl names regions and not subdivisions, so these are the only
 * nation names the app translates itself; a language missing here falls back
 * to the English ones.
 */
export const HOME_NATION_NAMES: Partial<Record<Language, Readonly<Record<string, string>>>> = {
  uk: {
    ENG: 'Англія',
    NIR: 'Північна Ірландія',
    SCT: 'Шотландія',
    WLS: 'Уельс',
  },
};
