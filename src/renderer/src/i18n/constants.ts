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
