import {
  CopyIcon, MoreVerticalIcon, PencilIcon, Trash2Icon, UndoIcon, UploadIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface ChampionshipMenuProps {
  /**
   * The championship the menu acts on.
   */
  listing: SeriesListing;
  /**
   * Whether a command is already running, which disables every item.
   */
  busy: boolean;
  /**
   * Called to open this championship in the editor. A shipped one is copied
   * first, which is what the caller confirms before calling.
   */
  onEdit: () => void;
  /**
   * Called to copy this championship into a separate one.
   */
  onDuplicate: () => void;
  /**
   * Called to delete the user's version and put the app's own back.
   */
  onRevert: () => void;
  /**
   * Called to delete one of the user's own championships.
   */
  onDelete: () => void;
  /**
   * Called to write this championship out as a file.
   */
  onExport: () => void;
}

export const ChampionshipMenu = ({
  listing, busy, onEdit, onDuplicate, onRevert, onDelete, onExport,
}: ChampionshipMenuProps) => {
  const { t } = useTranslation();
  const { origin, weekend } = listing;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          aria-label={t('championships.actions.menu', { name: listing.series.name })}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Whatever the origin - a shipped one is copied first. Only a weekend
            under way stops it. */}
        <DropdownMenuItem disabled={weekend !== null} onSelect={onEdit}>
          <PencilIcon />
          {t('championships.actions.edit')}
        </DropdownMenuItem>

        {weekend ? (
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t('championships.actions.editLocked')}
          </DropdownMenuLabel>
        ) : null}

        <DropdownMenuItem onSelect={onDuplicate}>
          <CopyIcon />
          {t('championships.actions.duplicate')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={onExport}>
          <UploadIcon />
          {t('championships.actions.export')}
        </DropdownMenuItem>

        {origin === 'shipped' ? null : <DropdownMenuSeparator />}

        {origin === 'adjusted' ? (
          <DropdownMenuItem variant="destructive" onSelect={onRevert}>
            <UndoIcon />
            {t('championships.actions.revert')}
          </DropdownMenuItem>
        ) : null}

        {origin === 'user' ? (
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2Icon />
            {t('championships.actions.delete')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
