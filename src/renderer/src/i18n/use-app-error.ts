import { useTranslation } from 'react-i18next';

import { formatAppError } from './utils.ts';
import type { AppErrorInfo } from '../../../shared/errors';

/**
 * Reads a renderer for errors, bound to the language currently in force.
 * @returns A function turning a flattened error into a translated message
 */
export const useAppError = (): (error: Partial<AppErrorInfo> & { message: string }) => string => {
  const { t } = useTranslation();

  return (error) => formatAppError(t, error);
};
