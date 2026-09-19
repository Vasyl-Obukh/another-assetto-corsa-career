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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface ChampionshipMenuProps {
  /**
   * The championship the menu acts on.
   */
  listing: SeriesListing;
  /**
   * Whether the menu offers everything that manages the library, or only Edit.
   * Only the settings tab and the pages it opens manage it.
   */
  manage: boolean;
  /**
   * Whether a command is already running, which disables every item.
   */
  busy: boolean;
  /**
   * Called to open the championship in the editor.
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
  listing, manage, busy, onEdit, onDuplicate, onRevert, onDelete, onExport,
}: ChampionshipMenuProps) => {
  const { t } = useTranslation();
  const { origin } = listing;
  // A weekend under way is raced against the championship as it stood, so it
  // may not change until that weekend is over.
  const locked = listing.weekend !== null;

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
        <DropdownMenuItem
          disabled={locked}
          title={locked ? t('championships.actions.editLocked') : undefined}
          onSelect={onEdit}
        >
          <PencilIcon />
          {t('championships.actions.edit')}
        </DropdownMenuItem>

        {manage ? (
          <>
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
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
