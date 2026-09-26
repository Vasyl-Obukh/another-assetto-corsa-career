/**
 * Where Back leads when the window has been nowhere before this page - right
 * after launch - and what it says then.
 */
export interface BackFallback {
  /**
   * The screen's fixed parent, as a URL.
   */
  to: string;
  /**
   * Its name, already translated.
   */
  label: string;
}

/**
 * Back, resolved for the page it sits on.
 */
export interface Back {
  /**
   * What Back says: the page it returns to.
   */
  label: string;
  /**
   * Goes there.
   */
  go: () => void;
}
