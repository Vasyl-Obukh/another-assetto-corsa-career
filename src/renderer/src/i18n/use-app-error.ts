import { useKindTranslation } from './use-kind-translation.ts';
import { formatAppError } from './utils.ts';
import type { AppErrorInfo } from '../../../shared/errors';

/**
 * Reads a renderer for errors, bound to the language currently in force and
 * worded for the library the screen is about.
 * @returns A function turning a flattened error into a translated message
 */
export const useAppError = (): (error: Partial<AppErrorInfo> & { message: string }) => string => {
  const { t } = useKindTranslation();

  return (error) => formatAppError(t, error);
};
