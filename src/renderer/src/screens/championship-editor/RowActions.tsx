import {
  ChevronDownIcon, ChevronUpIcon, MoreVerticalIcon, PencilIcon, Trash2Icon,
} from 'lucide-react';


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
import { useKindTranslation } from '@/i18n';

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
   * Anything else this row's menu offers, between Edit and moving it.
   */
  extra?: readonly RowMenuItem[];
  /**
   * Called to move the row along its list. Left out by a list whose order means
   * nothing, which then gets no Move items.
   * @param by How far, positive being later
   */
  onMove?: (by: number) => void;
  /**
   * Called to drop the row from its list.
   */
  onRemove: () => void;
}

/**
 * A row's menu: Edit, whatever else the row offers, moving it along its list
 * - the keyboard's way to reorder, since a row drags only by pointer - and
 * Remove.
 */
export const RowActions = ({
  label, first, last, locked, removable = true, editable = true,
  onEdit, extra, onMove, onRemove,
}: RowActionsProps) => {
  const { t } = useKindTranslation();
  const quiet = locked || !editable;

  return (
    <div className="ml-auto flex shrink-0 items-center">
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

          {onMove === undefined ? null : (
            <>
              <DropdownMenuItem disabled={quiet || first} onSelect={() => onMove(-1)}>
                <ChevronUpIcon />
                {t('editor.rows.moveEarlier')}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={quiet || last} onSelect={() => onMove(1)}>
                <ChevronDownIcon />
                {t('editor.rows.moveLater')}
              </DropdownMenuItem>
            </>
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
