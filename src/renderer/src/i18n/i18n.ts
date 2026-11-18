import i18next from 'i18next';
import { useContext, useMemo } from 'react';
import { initReactI18next } from 'react-i18next';

import { MoneyCurrency } from './constants.ts';
import en from './en.json';
import type { Formatters } from './types.ts';
import uk from './uk.json';
import { useLanguage } from './use-language.ts';
import { formattersFor } from './utils.ts';
import { CONTENT_ISSUE_REASONS, FALLBACK_LANGUAGE } from '../../../shared/constants';
import { ERROR_MESSAGES } from '../../../shared/errors';
import type { Language } from '../../../shared/types';

export type { Formatters } from './types.ts';
export {
  formatAppError, formatContentIssueReason, formatDayRange, formattersFor,
} from './utils.ts';
export { MoneyCurrency, WordingKind } from './constants.ts';
export { useAppError } from './use-app-error.ts';
export { useContentIssueReason } from './use-content-issue-reason.ts';
export { useKindTranslation } from './use-kind-translation.ts';
export { useLanguage } from './use-language.ts';
export { useLocalizedText } from './use-localized-text.ts';

/**
 * Every catalogue, keyed by language.
 *
 * English error copy is merged in from ERROR_MESSAGES rather than duplicated in
 * en.json - AppError already needs that table for its message, and one English
 * string per error is enough. Content issue reasons are merged the same way.
 * uk.json carries its own `errors` and `issueReasons` subtrees.
 */
export const resources = {
  en: {
    translation: { ...en, errors: ERROR_MESSAGES, issueReasons: CONTENT_ISSUE_REASONS },
  },
  uk: { translation: uk },
} as const;

/**
 * Starts i18next before the first render, so nothing paints in the wrong
 * language and then corrects itself.
 * @param language The language to start in
 * @returns Resolves once translations are ready
 */
export const initI18n = async (language: Language): Promise<void> => {
  await i18next.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: FALLBACK_LANGUAGE,
    // React escapes for us; doing it twice mangles apostrophes in the catalogues.
    interpolation: { escapeValue: false },
    returnNull: false,
  });
};

/**
 * Switches language at runtime.
 * @param language The language to switch to
 * @returns Resolves once the change has been applied
 */
export const setLanguage = async (language: Language): Promise<void> => {
  if (i18next.language !== language) await i18next.changeLanguage(language);
};

/**
 * Reads formatters bound to the language currently in force, money shown in
 * the currency in force where a caller names none.
 * @returns Formatters for dates, numbers, money and durations
 */
export const useFormat = (): Formatters => {
  const currency = useContext(MoneyCurrency);
  const language = useLanguage();

  return useMemo<Formatters>(() => {
    const formatters = formattersFor(language);

    return { ...formatters, formatMoney: (value, code = currency) => formatters.formatMoney(value, code) };
  }, [language, currency]);
};
