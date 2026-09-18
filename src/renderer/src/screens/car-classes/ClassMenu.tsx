import {
  CopyIcon, MoreVerticalIcon, PencilIcon, Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CatalogueClass } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface ClassMenuProps {
  /**
   * The class the menu acts on.
   */
  carClass: CatalogueClass;
  /**
   * Whether a command is already running, which disables the menu.
   */
  busy: boolean;
  /**
   * Called to rename the class.
   */
  onRename: () => void;
  /**
   * Called to copy the class into a new one of the user's.
   */
  onCopy: () => void;
  /**
   * Called to ask whether to delete the class.
   */
  onDelete: () => void;
}

export const ClassMenu = ({
  carClass, busy, onRename, onCopy, onDelete,
}: ClassMenuProps) => {
  const { t } = useTranslation();
  // The app's own are referenced by the championships it ships, so only a class
  // of the user's may be renamed or deleted. Any class may be copied.
  const mine = carClass.origin === 'user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={busy}
          aria-label={t('carClasses.menu', { name: carClass.name })}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {mine ? (
          <DropdownMenuItem onSelect={onRename}>
            <PencilIcon />
            {t('carClasses.rename')}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem onSelect={onCopy}>
          <CopyIcon />
          {t('carClasses.copy')}
        </DropdownMenuItem>

        {mine ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              {t('carClasses.delete')}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
