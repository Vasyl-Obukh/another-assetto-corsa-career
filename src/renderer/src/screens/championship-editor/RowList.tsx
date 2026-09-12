import { PlusIcon } from 'lucide-react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { ROW_LIST } from './constants.ts';
import type { RowControls } from './types.ts';
import { Button } from '@/components/ui/button.tsx';
import type { RowEditState } from '@/hooks';
import { useRowDrag } from '@/hooks';
import { moveAt, moveTo } from '@/screens/race';

interface RowListProps<T> {
  /**
   * The items, in the order they are shown.
   */
  items: readonly T[];
  /**
   * Which list this is in the editor's row state, so its rows and its add form
   * answer only for themselves.
   */
  scope: string;
  /**
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * What one row is keyed and opened by.
   * @param item The item
   * @param index Where it sits
   * @returns Its key - its id, or its position for a list with no ids
   */
  idOf: (item: T, index: number) => string;
  /**
   * What to say when the list is empty and nothing is being added, or
   * undefined for a list that can never be empty.
   */
  empty?: string;
  /**
   * The add button's label, already translated.
   */
  addLabel: string;
  /**
   * Called with the items in their new order after a drag or a move.
   * @param next The reordered items
   */
  onReorder: (next: readonly T[]) => void;
  /**
   * Renders one item's read-only row.
   * @param item The item
   * @param controls What every row takes, to spread into it
   * @returns The row
   */
  renderRow: (item: T, controls: RowControls) => ReactNode;
  /**
   * Renders the form for one item, or for the item being added.
   * @param item The item, or null when adding one
   * @param index Where it sits, or the list's length when adding
   * @returns The form
   */
  renderForm: (item: T | null, index: number) => ReactNode;
}

/**
 * A reorderable list whose rows open into forms, with an add button under it.
 *
 * The scaffold every list in the editor shares - the drag, the move buttons,
 * swapping a row for its form, the add form and its button - so each card says
 * only what its rows and forms are.
 */
export const RowList = <T,>({
  items, scope, rows, locked, idOf, empty, addLabel, onReorder, renderRow, renderForm,
}: RowListProps<T>) => {
  const adding = rows.adding(scope);

  const drag = useRowDrag({
    count: items.length,
    // Reordering under a visible form renumbers the list the user is reading.
    locked: locked || !rows.editable,
    onMove: (from, to) => onReorder(moveTo([...items], from, to)),
  });

  return (
    <>
      {empty !== undefined && items.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : null}

      <div className={ROW_LIST}>
        {items.map((item, index) => {
          const id = idOf(item, index);

          return (
            <Fragment key={id}>
              {rows.editing(scope, id) ? renderForm(item, index) : renderRow(item, {
                index,
                count: items.length,
                locked,
                editable: rows.editable,
                drag,
                onEdit: () => rows.edit(scope, id),
                onMove: (by) => onReorder(moveAt([...items], index, by)),
              })}
            </Fragment>
          );
        })}

        {adding ? renderForm(null, items.length) : null}
      </div>

      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(scope)}
        >
          <PlusIcon />
          {addLabel}
        </Button>
      </div>
    </>
  );
};
