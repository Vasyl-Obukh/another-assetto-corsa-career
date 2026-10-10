import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SkipRow } from './SkipRow.tsx';
import { skipGroups } from './utils.ts';
import type { SkippedRound } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';

interface SkipDialogProps {
  /**
   * Whether the dialog is showing.
   */
  open: boolean;
  /**
   * The question, as a sentence.
   */
  title: string;
  /**
   * What confirming does to the clock and to the rounds listed.
   */
  description: string;
  /**
   * Every round the move costs, clashes included.
   */
  rounds: readonly SkippedRound[];
  /**
   * The wording on the confirming button, which says what is lost.
   */
  confirmLabel: string;
  /**
   * Whether the move is already running, which disables both buttons.
   */
  busy?: boolean;
  /**
   * Called when the player confirms.
   */
  onConfirm: () => void;
  /**
   * Called when the dialog closes without confirming.
   */
  onClose: () => void;
}

/**
 * Asks before moving on costs the career rounds it entered: every one listed
 * under its championship, so the player sees what they are giving up rather
 * than a count.
 */
export const SkipDialog = ({
  open, title, description, rounds, confirmLabel, busy, onConfirm, onClose,
}: SkipDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/25 text-warning-foreground">
              <TriangleAlertIcon className="size-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
          {skipGroups(rounds).map((group) => (
            <section key={group.key}>
              <h3 className="border-t bg-muted px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase first:border-t-0">
                {group.seriesName ?? t('skip.clashHeading')}
              </h3>
              <ul>
                {group.rounds.map((round) => (
                  <SkipRow key={`${round.series}-${round.edition}-${round.round}`} round={round} named={group.seriesName === null} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>{t('confirm.cancel')}</Button>
          <Button disabled={busy} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
