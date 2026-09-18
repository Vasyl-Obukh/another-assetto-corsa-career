import {
  FolderInputIcon, MoreVerticalIcon, PencilIcon, Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CatalogueSpec } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface SpecMenuProps {
  /**
   * The spec the menu acts on.
   */
  spec: CatalogueSpec;
  /**
   * Whether a command is already running, which disables the menu.
   */
  busy: boolean;
  /**
   * Called to rename the spec.
   */
  onRename: () => void;
  /**
   * Called to move the spec to another class.
   */
  onMove: () => void;
  /**
   * Called to ask whether to delete the spec.
   */
  onDelete: () => void;
}

export const SpecMenu = ({
  spec, busy, onRename, onMove, onDelete,
}: SpecMenuProps) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="-mt-1 -mr-1 size-7"
          disabled={busy}
          aria-label={t('carClasses.menu', { name: spec.name })}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onRename}>
          <PencilIcon />
          {t('carClasses.rename')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={onMove}>
          <FolderInputIcon />
          {t('carClasses.moveTo')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon />
          {t('carClasses.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
