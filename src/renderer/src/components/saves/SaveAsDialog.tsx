import { SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SAVE_ICON } from './constants.ts';
import { suggestedName } from './utils.ts';
import type { Career, SaveSummary } from '../../../../shared/types';
import { ErrorCard } from '@/components/ErrorCard.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFormat } from '@/i18n';
import { SAVE_KIND_ACCENT } from '@/lib/accents';
import type { DisplayableError } from '@/lib/ipc';
import { cn } from '@/lib/utils.ts';

interface SaveAsDialogProps {
  /**
   * The career being saved. The name starts afresh each time the dialog
   * mounts, so mount it only while it is open.
   */
  career: Career;
  /**
   * Its saves, newest first, or null while they are read.
   */
  saves: readonly SaveSummary[] | null;
  /**
   * Whether a save is being written.
   */
  busy: boolean;
  /**
   * Why the last save was refused.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  onDismissError(): void;
  /**
   * Saves under a name.
   * @param name The name
   * @param over The named save to write over, or absent for a save of its own
   */
  onSave(name: string, over?: string): void;
  /**
   * Closes the dialog without saving.
   */
  onClose(): void;
}

/**
 * Save as, over whatever page is open: a name suggested from what just
 * happened, or one of the named saves to write over. Autosaves and the quick
 * save are never offered.
 */
export const SaveAsDialog = ({
  career, saves, busy, error, onDismissError, onSave, onClose,
}: SaveAsDialogProps) => {
  const { t } = useTranslation();
  const { formatDay, formatAgo } = useFormat();
  // Null until the player types, so a suggestion still follows the saves in
  // if they arrive after the dialog opened.
  const [typed, setTyped] = useState<string | null>(null);
  const suggested = saves && suggestedName(saves, t);
  const draft = typed ?? suggested ?? formatDay(career.date);
  const trimmed = draft.trim();
  const named = saves?.filter((one) => one.kind === 'named') ?? [];
  const Icon = SAVE_ICON.named;

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('saves.saveAsTitle')}</DialogTitle>
          <DialogDescription>{t('saves.saveAsLine', { driver: career.driver.name, date: formatDay(career.date) })}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed !== '') onSave(trimmed);
          }}
        >
          {error ? <ErrorCard error={error} onDismiss={onDismissError} /> : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="save-as-name" className="text-sm font-medium">{t('saves.name')}</label>
            <Input id="save-as-name" value={draft} disabled={busy} onChange={(event) => setTyped(event.target.value)} />
            <span className="text-xs text-muted-foreground">
              {t(suggested ? 'saves.nameHint' : 'saves.nameHintDate')}
            </span>
          </div>

          {named.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('saves.over')}</span>
              <div className="flex max-h-56 flex-col overflow-y-auto rounded-lg border p-1">
                {named.map((one) => (
                  <div key={one.id} className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <span className={cn('grid size-7 shrink-0 place-items-center rounded-md [&_svg]:size-3.5', SAVE_KIND_ACCENT.named)}>
                      <Icon />
                    </span>
                    <div className="flex min-w-0 grow flex-col">
                      <span className="truncate text-sm font-medium">{one.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t('saves.line', { date: formatDay(one.date), ago: formatAgo(one.savedAt) })}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                      disabled={busy}
                      onClick={() => onSave(one.name ?? trimmed, one.id)}
                    >
                      {t('saves.overwrite')}
                    </Button>
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{t('saves.overHint')}</span>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{t('confirm.cancel')}</Button>
            <Button type="submit" disabled={busy || trimmed === ''}>
              <SaveIcon />
              {t('saves.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
