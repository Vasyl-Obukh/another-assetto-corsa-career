import {
  ChevronDownIcon, FlagIcon, LayoutGridIcon, LogOutIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { MenuFailure } from './MenuFailure.tsx';
import { useSlot } from '@/app';
import { NationFlag } from '@/components/NationFlag.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { path } from '@/lib/routes';

/**
 * The open career's - or quick race mode's - name in the header, and the menu
 * it opens: the way back to the start screen and out of the app. Saving and
 * loading join it once a career has saves.
 */
export const SlotMenu = () => {
  const { t } = useTranslation();
  const { formatDayShort, formatYear } = useFormat();
  const navigate = useNavigate();
  const { career, toMainMenu, quit } = useSlot();
  const [failure, setFailure] = useState<DisplayableError | null>(null);

  const leave = async (): Promise<void> => {
    try {
      await toMainMenu();
      void navigate(path.start());
    } catch (thrown: unknown) {
      // A launch still out is the one thing that keeps a career open.
      setFailure(toDisplayableError(thrown));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-auto shrink-0 gap-2.5 py-1.5 pr-2.5 pl-2 text-left">
            {career ? (
              <>
                <NationFlag code={career.driver.nation ?? undefined} className="h-4 w-6" />
                <span className="flex flex-col">
                  <span className="text-sm leading-tight font-semibold">{career.driver.name}</span>
                  <span className="text-xs leading-tight font-normal text-muted-foreground">
                    {t('slot.careerLine', {
                      day: formatDayShort(career.date), year: formatYear(Number(career.date.slice(0, 4))),
                    })}
                  </span>
                </span>
              </>
            ) : (
              <>
                {/* Quick race mode's green, the colour its tile wears on the
                    start screen. */}
                <span className="grid size-7 place-items-center rounded-md bg-mode-quick text-mode-quick-foreground [&_svg]:size-4">
                  <FlagIcon />
                </span>
                <span className="text-sm font-semibold">{t('slot.quick')}</span>
              </>
            )}
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onSelect={() => { void leave(); }}>
            <LayoutGridIcon />
            {t('slot.mainMenu')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={quit}>
            <LogOutIcon />
            {t('slot.exit')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MenuFailure failure={failure} onClose={() => setFailure(null)} />
    </>
  );
};
