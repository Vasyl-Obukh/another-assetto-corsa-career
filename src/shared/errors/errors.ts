// Errors the app raises deliberately, carrying a stable code so the UI can
// translate them and the CLI can still print a readable English sentence.

import { ERROR_MESSAGES } from './constants.ts';
import type { AppErrorInfo, ErrorCode, ErrorParams } from './types.ts';
import { formatMessage } from './utils.ts';

export type { AppErrorInfo, ErrorCode, ErrorParams } from './types.ts';
export { AC_ROOT_MARKER, ERROR_MESSAGES, SCAN_HINT } from './constants.ts';
export { formatMessage } from './utils.ts';

/**
 * An error with a translatable identity.
 *
 * `message` is the English rendering, so anything that only knows how to print
 * an Error - the CLI, a log, a stack trace - keeps working unchanged.
 */
export class AppError extends Error {
  /**
   * Which error this is, for looking up a translation.
   */
  readonly code: ErrorCode;

  /**
   * Values interpolated into the message.
   */
  readonly params: ErrorParams;

  /**
   * @param code Which error this is
   * @param params Values to interpolate into its template
   */
  constructor(code: ErrorCode, params: ErrorParams = {}) {
    super(formatMessage(ERROR_MESSAGES[code], params));
    this.name = 'AppError';
    this.code = code;
    this.params = params;
  }

  /**
   * Flattens the error into something that survives being sent between
   * processes.
   * @returns The code, params and English message
   */
  toInfo(): AppErrorInfo {
    return { code: this.code, params: this.params, message: this.message };
  }
}

/**
 * Narrows an unknown value to an AppError.
 * @param value Whatever was thrown
 * @returns True when it carries a code
 */
export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

/**
 * Builds the flattened form directly, for the places that report a failure
 * without throwing.
 * @param code Which error this is
 * @param params Values to interpolate into its template
 * @returns The code, params and English message
 */
export const appErrorInfo = (code: ErrorCode, params: ErrorParams = {}): AppErrorInfo => ({
  code,
  params,
  message: formatMessage(ERROR_MESSAGES[code], params),
});
