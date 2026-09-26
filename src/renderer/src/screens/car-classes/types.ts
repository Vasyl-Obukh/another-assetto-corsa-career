import type { CatalogueClass, CatalogueSpec } from '../../../../shared/types';

/**
 * Which dialog the classes tab has open, if any.
 *
 * One at a time for the whole page, and every one of them is a name or a
 * class to pick: small enough that a dialog beats a form opening inline.
 */
export type ClassDialog =
  | {
    /**
     * A new class of the user's.
     */
    kind: 'add-class';
  }
  | {
    /**
     * Renaming a class, or copying one into a new class.
     */
    kind: 'rename-class' | 'copy-class';
    /**
     * The class acted on.
     */
    carClass: CatalogueClass;
  }
  | {
    /**
     * Moving a spec to another class.
     */
    kind: 'move-spec';
    /**
     * The spec acted on.
     */
    spec: CatalogueSpec;
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
   * The class it is or sits in, where a refusal is shown.
   */
  carClass: string;
}

/**
 * What the spec sheet is open on: a spec to edit, or a class to make one in.
 */
export type SpecSheetTarget =
  | {
    /**
     * An existing spec, its name and cars.
     */
    kind: 'edit';
    /**
     * The spec.
     */
    spec: CatalogueSpec;
  }
  | {
    /**
     * A spec not made yet.
     */
    kind: 'new';
    /**
     * The class it goes in.
     */
    carClass: CatalogueClass;
  };
