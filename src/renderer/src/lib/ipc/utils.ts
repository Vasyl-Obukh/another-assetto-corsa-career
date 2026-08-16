/**
 * A failure that came back from a main-process handler.
 *
 * Handlers deliberately never throw across the boundary, so this is where a
 * failure becomes an ordinary rejected promise again with its message intact.
 */
export class IpcCallError extends Error {
  /**
   * The original stack from the main process, when there was one.
   */
  readonly detail?: string;

  /**
   * @param channel Which channel failed
   * @param message What went wrong, suitable for showing to the user
   * @param detail The original stack from the main process
   */
  constructor(channel: string, message: string, detail?: string) {
    super(message);
    this.name = 'IpcCallError';
    this.detail = detail;
    // Keeps the channel visible in the console without polluting the message
    // the UI shows the user.
    this.stack = detail ? `${channel}: ${message}\n${detail}` : `${channel}: ${message}`;
  }
}
