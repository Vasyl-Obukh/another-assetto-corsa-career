/**
 * Which row of the editor has its form open, and how to open and close one.
 *
 * One for the whole screen rather than one per list. A row is addressed by its
 * scope and its id together, so a list asks about its own rows while `editable`
 * answers for every list at once - which is what quietens a class's seats while
 * the class itself is being edited, and the other way about.
 */
export interface RowEditState {
  /**
   * The row that is open, scope and id together, or null when none is.
   */
  open: string | null;
  /**
   * Whether a row may be opened at all.
   *
   * False while any row anywhere in the editor already is. Opening a second
   * would have to throw the first one's typing away or commit it unasked, and
   * committing would make Cancel's promise untrue.
   */
  editable: boolean;
  /**
   * Whether one particular row is the one open.
   * @param scope Which list the row belongs to
   * @param id The row's id within that list
   * @returns True when that row is being edited
   */
  editing(scope: string, id: string): boolean;
  /**
   * Whether one list is adding a row.
   * @param scope Which list to ask about
   * @returns True when that list has an unconfirmed new row open
   */
  adding(scope: string): boolean;
  /**
   * Opens one existing row's form.
   * @param scope Which list the row belongs to
   * @param id The row's id within that list
   */
  edit(scope: string, id: string): void;
  /**
   * Opens a form for a row that does not exist yet.
   * @param scope Which list is adding
   */
  add(scope: string): void;
  /**
   * Closes whatever is open, confirmed or cancelled.
   */
  close(): void;
}
