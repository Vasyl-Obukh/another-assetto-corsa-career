import type { ReactNode } from 'react';

import { ConfirmActions } from './ConfirmActions.tsx';
import {
  ROW_FORM_COLUMNS, ROW_GAP, ROW_GRIP, ROW_NUMBER,
} from './constants.ts';
import { cn } from '@/lib/utils.ts';

interface RowFormProps {
  /**
   * Whether the rows around this one carry a grip and a position number, whose
   * columns the fields then start after. Defaults to true.
   *
   * False for a list that has neither - a balance-of-performance table is keyed
   * by car, so its order means nothing and its rows are numbered by nothing.
   */
  inset?: boolean;
  /**
   * How many fields sit on one line once the window is wide. Defaults to 3.
   *
   * 4 for a form whose fields are all short enough to share a line - a team,
   * a round - so it opens as one line rather than two.
   */
  columns?: keyof typeof ROW_FORM_COLUMNS;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called to commit the form's draft into the championship.
   */
  onConfirm: () => void;
  /**
   * Called to throw the draft away and leave the row as it was.
   */
  onCancel: () => void;
  /**
   * The fields, which lay themselves out in the grid this provides.
   */
  children: ReactNode;
}

/**
 * One row of a list, opened for editing.
 *
 * Separate from `ListRow` on purpose: React swaps one for the other at the same
 * key, which is what makes the form's `useState(value)` seed itself on every
 * open. One component with a flag would keep the draft from the first open.
 *
 * A real `<form>`, so Enter confirms. The vendored Button leaves `type` alone
 * and an untyped button in a form submits it, so every button in `children`
 * needs `type="button"`.
 */
export const RowForm = ({
  inset = true, columns = 3, locked, onConfirm, onCancel, children,
}: RowFormProps) => (
  <form
    className="flex flex-col gap-4 border-b py-3 last:border-b-0"
    onSubmit={(event) => {
      event.preventDefault();
      onConfirm();
    }}
  >
    <div className={cn('flex items-start', ROW_GAP)}>
      {/* The read row's grip and number columns, empty, so the first field
          lines up with the name. */}
      {inset ? (
        <>
          <span className={ROW_GRIP} aria-hidden />
          <span className={ROW_NUMBER} aria-hidden />
        </>
      ) : null}

      <div className={cn('grid min-w-0 flex-1 gap-4 sm:grid-cols-2', ROW_FORM_COLUMNS[columns])}>
        {children}
      </div>
    </div>

    <ConfirmActions locked={locked} onCancel={onCancel} />
  </form>
);
