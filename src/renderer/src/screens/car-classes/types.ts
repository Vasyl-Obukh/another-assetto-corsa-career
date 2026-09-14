/**
 * Which form the classes tab has open, if any.
 *
 * One at a time for the whole page, the way the championship editor holds a
 * single open row: two forms half-filled at once is two sets of changes nobody
 * is looking at.
 */
export type ClassEditing =
  | {
    /**
     * A class's own form.
     */
    kind: 'class';
    /**
     * The class being renamed, or undefined for a new one.
     */
    id?: string;
  }
  | {
    /**
     * A spec's form.
     */
    kind: 'spec';
    /**
     * The spec being edited, or undefined for a new one.
     */
    id?: string;
    /**
     * The class the form was opened under.
     */
    carClass: string;
  };

/**
 * A class or spec waiting on the delete confirmation.
 */
export interface ClassDeleting {
  /**
   * Which of the two it is.
   */
  kind: 'class' | 'spec';
  /**
   * Its id.
   */
  id: string;
  /**
   * What it is called, for the question.
   */
  name: string;
  /**
   * The class card the confirmation came from, where a refusal is shown.
   */
  carClass: string;
}
