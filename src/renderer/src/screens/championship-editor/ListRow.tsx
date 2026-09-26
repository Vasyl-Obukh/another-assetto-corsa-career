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
   * The row's primary text, which is also what opens it for editing.
   */
  name: string;
  /**
   * A second line under the name, such as the circuit a round runs at.
   */
  detail?: string;
  /**
   * What sits between the number and the name, such as a round's map.
   */
  lead?: ReactNode;
  /**
   * What the row's menu is announced as.
   */
  label: string;
  /**
   * How many rows the list holds, which greys out the last Move later.
   */
  count: number;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Anything else this row's menu offers.
   */
  extra?: readonly RowMenuItem[];
  /**
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the row for editing.
   */
  onEdit: () => void;
  /**
   * Called to move the row along its list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the row from its list.
   */
  onRemove: () => void;
  /**
   * What follows the name: the badges, then the fixed columns.
   */
  children: ReactNode;
}

/**
 * One read-only row of a list, numbered, with its grip, its menu, and the
 * click that opens it for editing. The name is a stretched trigger whose
 * `after:inset-0` covers the whole row, so the grip and the menu are lifted
 * above it with `z-10`.
 */
export const ListRow = ({
  index, name, detail, lead, label, count, locked, extra, drag, onEdit, onMove, onRemove, children,
}: ListRowProps) => {
  const { t } = useTranslation();
  // The drag ghost would otherwise be a snapshot of the grip alone.
  const row = useRef<HTMLDivElement>(null);
  const edge = drag.edgeOf(index);

  return (
    <div
      ref={row}
      className={cn(
        'relative -mx-2 flex items-center rounded-md border-b px-2 py-1 last:border-b-0',
        ROW_GAP,
        !locked && 'hover:bg-accent/50 focus-within:bg-accent/50',
        drag.dragging === index && 'opacity-50',
      )}
      onDragOver={(event) => drag.onRowDragOver(index, event)}
      onDrop={(event) => drag.onRowDrop(index, event)}
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

      <span className={ROW_NUMBER}>{index + 1}</span>

      {lead}

      <button
        type="button"
        className={cn(
          'flex min-w-0 flex-1 flex-col text-left after:absolute after:inset-0 after:rounded-md',
          'font-medium focus-visible:outline-none disabled:cursor-not-allowed',
        )}
        disabled={locked}
        onClick={onEdit}
      >
        <span className="truncate">{name}</span>
        {detail === undefined ? null : (
          <span className="truncate text-xs font-normal text-muted-foreground">{detail}</span>
        )}
      </button>

      {children}

      <div className="relative z-10">
        <RowActions
          label={label}
          first={index === 0}
          last={index === count - 1}
          locked={locked}
          onEdit={onEdit}
          extra={extra}
          onMove={onMove}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};
