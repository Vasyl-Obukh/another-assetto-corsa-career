import { useTranslation } from 'react-i18next';

import { FALLBACK_LANGUAGE, LANGUAGES } from '../../../shared/constants';
import type { Language } from '../../../shared/types';
import { memberOf } from '../../../shared/utils/coerce';

/**
 * Reads the language currently in force.
 * @returns The app language the UI is shown in, English for any other code
 */
export const useLanguage = (): Language => {
  const { i18n } = useTranslation();

  return memberOf(i18n.language.split('-')[0], LANGUAGES) ?? FALLBACK_LANGUAGE;
};
