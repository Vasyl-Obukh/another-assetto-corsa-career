import type { AppErrorInfo, ErrorCode, ErrorParams } from '../../../../shared/errors';
import type { IpcError } from '../../../../shared/types';

/**
 * Anything that can be shown to the user as a failure.
 *
 * The message is always there; the code is only present when we raised the error
 * ourselves rather than receiving it from the OS.
 */
export type DisplayableError = Partial<AppErrorInfo> & { message: string };

/**
 * A failure that came back from a main-process handler.
 *
 * Handlers deliberately never throw across the boundary, so this is where a
 * failure becomes an ordinary rejected promise again - with its code intact, so
 * the UI can translate it rather than showing main's English.
 */
export class IpcCallError extends Error {
  /**
   * Which error this is, absent when it came from the OS rather than from us.
   */
  readonly code?: ErrorCode;

  /**
   * Values to interpolate into the translated template.
   */
  readonly params?: ErrorParams;

  /**
   * The original stack from the main process, when there was one.
   */
  readonly detail?: string;

  /**
   * @param channel Which channel failed
   * @param error The flattened failure main sent back
   */
  constructor(channel: string, error: IpcError) {
    super(error.message);
    this.name = 'IpcCallError';
    this.code = error.code;
    this.params = error.params;
    this.detail = error.detail;
    // Keeps the channel visible in the console without polluting the message
    // the UI shows the user.
    this.stack = error.detail
      ? `${channel}: ${error.message}\n${error.detail}`
      : `${channel}: ${error.message}`;
  }
}

/**
 * Turns anything caught into something the UI can show.
 * @param thrown Whatever was caught
 * @returns The message, plus a code when the failure carried one
 */
export const toDisplayableError = (thrown: unknown): DisplayableError => {
  if (thrown instanceof IpcCallError) {
    return { code: thrown.code, params: thrown.params, message: thrown.message };
  }
  if (thrown instanceof Error) return { message: thrown.message };

  return { message: String(thrown) };
};
