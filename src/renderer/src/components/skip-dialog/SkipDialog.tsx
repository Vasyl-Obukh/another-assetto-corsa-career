import { InfoIcon, TriangleAlertIcon, WalletIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SkipRow } from './SkipRow.tsx';
import { skipGroups } from './utils.ts';
import type { SkippedRound } from '../../../../shared/types';
import { useSlot } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';

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
   * Anything else about the move worth saying before it is confirmed, such as
   * a race about to run shortened.
   */
  note?: string;
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
  open, title, description, rounds, note, confirmLabel, busy, onConfirm, onClose,
}: SkipDialogProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  // Only a career has money that skipping might be thought to cost - and under
  // a contract it does.
  const inCareer = useSlot().mode === 'career';
  const fines = rounds.reduce((sum, round) => sum + (round.fine ?? 0), 0);

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

        {note ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoIcon className="size-4 shrink-0" />
            {note}
          </p>
        ) : null}
        {inCareer ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <WalletIcon className="size-4 shrink-0" />
            {fines > 0 ? t('skip.fines', { amount: formatMoney(fines) }) : t('skip.free')}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>{t('confirm.cancel')}</Button>
          <Button disabled={busy} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
