import {
  EllipsisVerticalIcon, FolderInputIcon, PencilIcon, Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SAVE_ICON } from './constants.ts';
import { saveTitle } from './utils.ts';
import type { SaveSummary } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { SAVE_KIND_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SaveRowProps {
  /**
   * The save.
   */
  save: SaveSummary;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Loads it.
   */
  onLoad(): void;
  /**
   * Asks for a new name for it - a named save only.
   */
  onRename(): void;
  /**
   * Asks to delete it - a named save only.
   */
  onDelete(): void;
}

/**
 * One save: its kind, what it is called, when it stands at and was taken, and
 * Load. Every row keeps a column for the menu so the rows line up, and only a
 * named save fills it, since only a named save can be renamed or deleted.
 */
export const SaveRow = ({
  save, busy, onLoad, onRename, onDelete,
}: SaveRowProps) => {
  const { t } = useTranslation();
  const { formatDay, formatAgo } = useFormat();
  const Icon = SAVE_ICON[save.kind];

  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto_auto_2rem] items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/60">
      <span className={cn('grid size-8 place-items-center rounded-lg [&_svg]:size-4', SAVE_KIND_ACCENT[save.kind])}>
        <Icon />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{saveTitle(save, t)}</span>
        <span className="truncate text-xs text-muted-foreground">
          {t('saves.line', { date: formatDay(save.date), ago: formatAgo(save.savedAt) })}
        </span>
      </div>
      <Badge className={SAVE_KIND_ACCENT[save.kind]}>{t(`saves.kind.${save.kind}`)}</Badge>
      <Button size="sm" variant="ghost" className="hover:bg-primary hover:text-primary-foreground" disabled={busy} onClick={onLoad}>
        <FolderInputIcon />
        {t('saves.load')}
      </Button>
      {save.kind === 'named' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-8" disabled={busy} aria-label={t('saves.menu')}>
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onRename}>
              <PencilIcon />
              {t('saves.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              {t('saves.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : <span />}
    </div>
  );
};
