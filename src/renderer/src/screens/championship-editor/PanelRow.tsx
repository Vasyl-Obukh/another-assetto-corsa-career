import type { ReactNode } from 'react';

import { RowActions } from './RowActions.tsx';
import type { RowMenuItem } from './types.ts';

interface PanelRowProps {
  /**
   * What the panel holds, which is also what opens it for editing.
   */
  name: string;
  /**
   * What the row's menu is announced as - usually the name, and separate from
   * it for the same reason `ListRow` keeps the two apart.
   */
  label: string;
  /**
   * Whether this is the first panel, which greys out Move earlier.
   */
  first?: boolean;
  /**
   * Whether this is the last panel, which greys out Move later.
   */
  last?: boolean;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the panel may be dropped at all. Defaults to true.
   */
  removable?: boolean;
  /**
   * Whether the panel may be opened for editing. False while any row in the
   * editor already has its form open.
   */
  editable: boolean;
  /**
   * Anything else this panel's menu offers, between Edit and Remove.
   */
  extra?: readonly RowMenuItem[];
  /**
   * Called to open the panel's own form.
   */
  onEdit: () => void;
  /**
   * Called to make this row the one used when nothing names another. Left out
   * on the row that already is, which then offers no such item.
   */
  onMakeDefault?: () => void;
  /**
   * Called to move the panel along its list.
   * @param by How far, positive being later
   */
  onMove?: (by: number) => void;
  /**
   * Called to drop the panel from its list.
   */
  onRemove: () => void;
  /**
   * The chips that say what the panel is, after the name.
   */
  children: ReactNode;
}

/**
 * The heading of a panel: its name, its chips and its menu, on a tinted strip.
 *
 * What `ListRow` is to a list, this is to a container - a class entry or a
 * weekend format - and the tint is what makes what hangs below read as its
 * contents.
 *
 * `relative` belongs on this strip and **not** on the panel around it: the
 * name's stretched `after:inset-0` is measured against the nearest positioned
 * ancestor, so on the panel it would cover everything inside and none of it
 * would be clickable.
 */
export const PanelRow = ({
  name, label, first, last, locked, removable, editable, extra,
  onEdit, onMakeDefault, onMove, onRemove, children,
}: PanelRowProps) => {
  const quiet = locked || !editable;

  return (
    <div className="relative flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2">
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left font-medium after:absolute after:inset-0 focus-visible:outline-none disabled:cursor-not-allowed"
        disabled={quiet}
        onClick={onEdit}
      >
        {name}
      </button>

      {children}

      <div className="relative z-10 -my-1">
        <RowActions
          label={label}
          first={first}
          last={last}
          locked={locked}
          removable={removable}
          editable={editable}
          extra={extra}
          onEdit={onEdit}
          onMakeDefault={onMakeDefault}
          onMove={onMove}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};
