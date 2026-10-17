import {
  ChevronDownIcon, FlagIcon, FolderInputIcon, LayoutGridIcon, LogOutIcon, SaveIcon, TriangleAlertIcon, Undo2Icon,
  ZapIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { SAVE_SHORTCUT } from './constants.ts';
import { MenuFailure } from './MenuFailure.tsx';
import type { SaveCommand } from './types.ts';
import { isTyping, saveCommandOf } from './utils.ts';
import { useSlot, useToast, useUnsaved } from '@/app';
import { NationFlag } from '@/components/NationFlag.tsx';
import { LoadDialog, SaveAsDialog } from '@/components/saves';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useLoadSave } from '@/hooks';
import type { SavesState } from '@/hooks';
import { useFormat } from '@/i18n';
import { CAUTION_ACCENT, SAVE_KIND_ACCENT } from '@/lib/accents';
import { toDisplayableError } from '@/lib/ipc';
import type { DisplayableError } from '@/lib/ipc';
import { path } from '@/lib/routes';

interface SlotMenuProps {
  /**
   * The open career's saves and their commands, which the header's status
   * reads too.
   */
  saves: SavesState;
}

/**
 * The open career's - or quick race mode's - name in the header, and the menu
 * it opens: saving and loading, each with its shortcut, the way back to the
 * start screen and out of the app. Quick race mode has nothing to save.
 */
export const SlotMenu = ({ saves }: SlotMenuProps) => {
  const { t } = useTranslation();
  const { formatDay, formatDayShort, formatYear, formatAgo } = useFormat();
  const navigate = useNavigate();
  const { career, toMainMenu, quit } = useSlot();
  const { show } = useToast();
  const unsaved = useUnsaved();
  const { load, loading } = useLoadSave();
  const [failure, setFailure] = useState<DisplayableError | null>(null);
  const [dialog, setDialog] = useState<'save' | 'load' | null>(null);

  const quick = saves.saves?.find((one) => one.kind === 'quick') ?? null;

  // Asked before the career closes: the page's own guard would only ask once
  // it had.
  const leave = (): Promise<boolean> => unsaved.leave('menu', async () => {
    try {
      await toMainMenu();
      void navigate(path.start());

      return true;
    } catch (thrown: unknown) {
      // A launch still out is the one thing that keeps a career open.
      setFailure(toDisplayableError(thrown));

      return false;
    }
  });

  const loadAndGo = async (save: string): Promise<void> => {
    if (!career) return;
    // Home, since the page open may be of something the save never had.
    if (await load(career.id, save)) {
      setDialog(null);
      void navigate(path.home());
    }
  };

  const quickSave = async (): Promise<void> => {
    if (!career) return;
    const done = await saves.quickSave();
    show(done
      ? {
        icon: ZapIcon, tone: SAVE_KIND_ACCENT.quick, title: t('saves.toast.quickSaved'), detail: formatDay(career.date),
      }
      : { icon: TriangleAlertIcon, tone: CAUTION_ACCENT, title: t('saves.toast.saveFailed') });
  };

  const quickLoad = (): void => {
    if (quick) {
      void loadAndGo(quick.id);

      return;
    }
    show({
      icon: ZapIcon, tone: SAVE_KIND_ACCENT.quick, title: t('saves.toast.noQuick'), detail: t('saves.toast.noQuickHint'),
    });
  };

  const run = (command: SaveCommand): void => {
    if (loading) return;
    if (command === 'quickSave') void quickSave();
    else if (command === 'quickLoad') quickLoad();
    else setDialog(command === 'saveAs' ? 'save' : 'load');
  };

  // Read through a ref, so the listener is added once rather than on every
  // render that makes a new `run`.
  const latest = useRef(run);
  useEffect(() => {
    latest.current = run;
  });

  useEffect(() => {
    if (!career) return undefined;

    const onKey = (event: KeyboardEvent): void => {
      const command = saveCommandOf(event);
      if (!command || event.repeat || isTyping(event.target)) return;
      event.preventDefault();
      latest.current(command);
    };
    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [career]);

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

        <DropdownMenuContent align="start" className="w-80">
          {career ? (
            <>
              <DropdownMenuItem onSelect={() => run('quickSave')}>
                <ZapIcon />
                {t('slot.quickSave')}
                <DropdownMenuShortcut>{SAVE_SHORTCUT.quickSave}</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => run('saveAs')}>
                <SaveIcon />
                {t('slot.saveAs')}
                <DropdownMenuShortcut>{SAVE_SHORTCUT.saveAs}</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => run('quickLoad')}>
                <Undo2Icon />
                <span className="flex min-w-0 flex-col">
                  {t('slot.quickLoad')}
                  <span className="truncate text-xs text-muted-foreground">
                    {quick
                      ? t('slot.quickLoadLine', { date: formatDay(quick.date), ago: formatAgo(quick.savedAt) })
                      : t('slot.quickLoadNone')}
                  </span>
                </span>
                <DropdownMenuShortcut>{SAVE_SHORTCUT.quickLoad}</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => run('load')}>
                <FolderInputIcon />
                {t('slot.load')}
                <DropdownMenuShortcut>{SAVE_SHORTCUT.load}</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
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

      {career && dialog === 'save' ? (
        <SaveAsDialog
          career={career}
          saves={saves.saves}
          busy={saves.busy}
          error={saves.error}
          onDismissError={saves.dismissError}
          onSave={(name, over) => {
            void saves.save(name, over).then((done) => { if (done) setDialog(null); });
          }}
          onClose={() => {
            saves.dismissError();
            setDialog(null);
          }}
        />
      ) : null}

      {career && dialog === 'load' ? (
        <LoadDialog
          saves={saves}
          loading={loading}
          onLoad={(save) => { void loadAndGo(save.id); }}
          onClose={() => setDialog(null)}
        />
      ) : null}

      <MenuFailure failure={failure} onClose={() => setFailure(null)} />
    </>
  );
};
