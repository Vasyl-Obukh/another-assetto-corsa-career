import { useCallback } from 'react';

import { useLanguage } from './use-language.ts';
import type { LocalizedText } from '../../../shared/types';
import { localizedText } from '../../../shared/utils/localized-text';

/**
 * Reads a reader for text a document's author wrote, bound to the language
 * currently in force.
 * @returns A function turning a text into what to show, empty when it holds
 * nothing for this language
 */
export const useLocalizedText = (): (text: LocalizedText | null | undefined) => string => {
  const language = useLanguage();

  return useCallback((text) => localizedText(text, language), [language]);
};
