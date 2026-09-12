import {
  ChevronDownIcon, ChevronUpIcon, MoreVerticalIcon, PencilIcon, StarIcon, Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RowMenuItem } from './types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface RowActionsProps {
  /**
   * What the row holds, so a screen reader hears which row "Move later" moves.
   */
  label: string;
  /**
   * Whether this is the first row, which is what greys out Move earlier.
   */
  first?: boolean;
  /**
   * Whether this is the last row, which is what greys out Move later.
   */
  last?: boolean;
  /**
   * Whether the championship is locked, in which case none of them work.
   */
  locked: boolean;
  /**
   * Whether the row may be dropped at all. Defaults to true.
   *
   * False for the last of something validateSeries requires one of. Disabled
   * rather than hidden, so the menu does not change shape as rows come and go.
   */
  removable?: boolean;
  /**
   * Whether a row may be acted on at all. Defaults to true.
   *
   * False while any row in the editor has its form open, since reordering or
   * removing rows underneath an open form changes what it is editing. Every
   * control here goes quiet with it, the menu included.
   */
  editable?: boolean;
  /**
   * Called to open the row's own form. Left out by a row that is edited in
   * place, which then gets no Edit item.
   */
  onEdit?: () => void;
  /**
   * Anything else this row's menu offers, between Edit and Remove.
   */
  extra?: readonly RowMenuItem[];
  /**
   * Called to make this row the one used when nothing names another. Left out
   * on the row that already is, which then offers no such item.
   */
  onMakeDefault?: () => void;
  /**
   * Called to move the row along its list. Left out by a list whose order means
   * nothing - a balance-of-performance table is keyed by car - which then gets
   * no reorder buttons.
   * @param by How far, positive being later
   */
  onMove?: (by: number) => void;
  /**
   * Called to drop the row from its list.
   */
  onRemove: () => void;
}

/**
 * Reorder inline, everything else behind a menu.
 *
 * Reordering stays one click because it is the action a user repeats, and the
 * buttons are the keyboard's only way to reorder, since a row cannot be dragged
 * from one.
 */
export const RowActions = ({
  label, first, last, locked, removable = true, editable = true,
  onEdit, extra, onMakeDefault, onMove, onRemove,
}: RowActionsProps) => {
  const { t } = useTranslation();
  const quiet = locked || !editable;

  return (
    <div className="ml-auto flex shrink-0 items-center">
      {onMove === undefined ? null : (
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('editor.rows.moveUp', { label })}
            disabled={quiet || first}
            onClick={() => onMove(-1)}
          >
            <ChevronUpIcon />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('editor.rows.moveDown', { label })}
            disabled={quiet || last}
            onClick={() => onMove(1)}
          >
            <ChevronDownIcon />
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('editor.rows.menu', { label })}
            disabled={quiet}
          >
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {onEdit === undefined ? null : (
            <DropdownMenuItem disabled={quiet} onSelect={onEdit}>
              <PencilIcon />
              {t('editor.rows.edit')}
            </DropdownMenuItem>
          )}

          {extra?.map((item) => (
            <DropdownMenuItem key={item.label} disabled={quiet} onSelect={item.onSelect}>
              {item.icon}
              {item.label}
              {item.badge === undefined ? null : (
                <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>
              )}
            </DropdownMenuItem>
          ))}

          {onMakeDefault === undefined ? null : (
            <DropdownMenuItem disabled={quiet} onSelect={onMakeDefault}>
              <StarIcon />
              {t('editor.rows.makeDefault')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            disabled={quiet || !removable}
            onSelect={onRemove}
          >
            <Trash2Icon />
            {t('editor.rows.remove')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
