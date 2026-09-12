import { GripVerticalIcon } from 'lucide-react';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ROW_GAP, ROW_GRIP, ROW_NUMBER } from './constants.ts';
import { RowActions } from './RowActions.tsx';
import type { RowMenuItem } from './types.ts';
import { Button } from '@/components/ui/button.tsx';
import type { RowDrag } from '@/hooks';
import { cn } from '@/lib/utils.ts';

interface ListRowProps {
  /**
   * Where the row sits in its list, counting from zero, which is what the drag
   * handlers move.
   */
  index: number;
  /**
   * The position shown, counting from one. Left out by a list whose order means
   * nothing.
   */
  number?: number;
  /**
   * The row's primary text, which is also what opens it for editing.
   */
  name: string;
  /**
   * Whether the name is a placeholder rather than something the author wrote -
   * a seat nobody is named in - and so reads grey rather than medium.
   */
  muted?: boolean;
  /**
   * What the row's menu is announced as. Distinct from `name`, because an
   * unnamed seat's name is a placeholder.
   */
  label: string;
  /**
   * Whether this is the first row, which greys out Move earlier.
   */
  first?: boolean;
  /**
   * Whether this is the last row, which greys out Move later.
   */
  last?: boolean;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be dropped at all. Defaults to true.
   */
  removable?: boolean;
  /**
   * Whether the row may be opened for editing. False while any row in the
   * editor already has its form open.
   */
  editable: boolean;
  /**
   * Anything else this row's menu offers.
   */
  extra?: readonly RowMenuItem[];
  /**
   * Called to make this row the one used when nothing names another. Left out
   * on the row that already is, which then offers no such item.
   */
  onMakeDefault?: () => void;
  /**
   * The list's drag state, or undefined for a list that does not reorder.
   */
  drag?: RowDrag;
  /**
   * Called to open the row's form.
   */
  onEdit: () => void;
  /**
   * Called to move the row along its list. Left out by a list whose order means
   * nothing.
   * @param by How far, positive being later
   */
  onMove?: (by: number) => void;
  /**
   * Called to drop the row from its list.
   */
  onRemove: () => void;
  /**
   * What follows the name: the badges, then the fixed columns, in the order
   * ROW_LIST states.
   */
  children: ReactNode;
}

/**
 * One read-only row of a list, with its grip, its menu, and the click that
 * opens it for editing.
 *
 * Not also the chrome for edit mode - `RowForm` is that, rendered at the same
 * key. The name is a stretched trigger whose `after:inset-0` covers this whole
 * row, so a form rendered in here would sit under that overlay; the grip and
 * the menu are lifted above it with `z-10`.
 */
export const ListRow = ({
  index, number, name, muted, label, first, last, locked, removable, editable,
  extra, drag, onEdit, onMakeDefault, onMove, onRemove, children,
}: ListRowProps) => {
  const { t } = useTranslation();
  // The drag ghost would otherwise be a snapshot of the grip alone.
  const row = useRef<HTMLDivElement>(null);
  const edge = drag?.edgeOf(index) ?? null;
  const openable = editable && !locked;

  return (
    <div
      ref={row}
      className={cn(
        'relative -mx-2 flex items-center rounded-md border-b px-2 py-1 last:border-b-0',
        ROW_GAP,
        openable && 'hover:bg-accent/50 focus-within:bg-accent/50',
        drag?.dragging === index && 'opacity-50',
      )}
      onDragOver={drag && ((event) => drag.onRowDragOver(index, event))}
      onDrop={drag && ((event) => drag.onRowDrop(index, event))}
    >
      {/* A bar rather than a thicker border, which `last:border-b-0` would
          take back off the last row. */}
      {edge === null ? null : (
        <span
          className={cn(
            'pointer-events-none absolute inset-x-0 h-0.5 bg-primary',
            edge === 'before' ? 'top-0' : 'bottom-0',
          )}
        />
      )}

      {/* The slot stays while the grip goes, so the row's contents do not jump
          sideways when a form opens. */}
      {drag === undefined ? null : (
        <div className={ROW_GRIP}>
          {drag.enabled ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="relative z-10 text-muted-foreground"
              aria-label={t('editor.rows.drag', { label })}
              draggable
              disabled={locked}
              onDragStart={(event) => {
                if (row.current !== null) {
                  event.dataTransfer.setDragImage(row.current, 0, row.current.offsetHeight / 2);
                }
                drag.onRowDragStart(index, event);
              }}
              onDragEnd={drag.onRowDragEnd}
            >
              <GripVerticalIcon />
            </Button>
          ) : null}
        </div>
      )}

      {number === undefined ? null : (
        <span className={ROW_NUMBER}>{number}</span>
      )}

      <button
        type="button"
        className={cn(
          'min-w-0 flex-1 truncate text-left after:absolute after:inset-0 after:rounded-md',
          'focus-visible:outline-none disabled:cursor-not-allowed',
          muted ? 'text-muted-foreground' : 'font-medium',
        )}
        disabled={!openable}
        onClick={onEdit}
      >
        {name}
      </button>

      {children}

      <div className="relative z-10">
        <RowActions
          label={label}
          first={first}
          last={last}
          locked={locked}
          removable={removable}
          editable={editable}
          onEdit={onEdit}
          extra={extra}
          onMakeDefault={onMakeDefault}
          onMove={onMove}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};
