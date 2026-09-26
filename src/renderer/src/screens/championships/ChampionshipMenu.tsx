import { MoreVerticalIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface ChampionshipMenuProps {
  /**
   * The championship's name, for the button's label.
   */
  name: string;
  /**
   * Whether a command is already running, which disables the button.
   */
  busy: boolean;
  /**
   * Classes for the button, for one sitting on a coloured band.
   */
  triggerClassName?: string;
  /**
   * The items, drawn with the dropdown's own parts.
   */
  children: ReactNode;
}

export const ChampionshipMenu = ({
  name, busy, triggerClassName, children,
}: ChampionshipMenuProps) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          className={triggerClassName}
          aria-label={t('championships.actions.menu', { name })}
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};
