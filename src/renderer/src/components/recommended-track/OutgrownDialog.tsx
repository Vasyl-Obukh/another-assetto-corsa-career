import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';
import { disciplineDot } from '@/lib/accents';
import type { OutgrownChampionship } from '@/lib/circuit-usage';
import { cn } from '@/lib/utils.ts';

interface OutgrownDialogProps {
  /**
   * The question, naming the layout and the track.
   */
  title: string;
  /**
   * The track's pit boxes.
   */
  pitboxes: number;
  /**
   * Every championship the track is too small for, or null while closed.
   */
  championships: readonly OutgrownChampionship[] | null;
  /**
   * Called to race the layout on the track anyway.
   */
  onConfirm: () => void;
  /**
   * Called when the dialog closes without confirming.
   */
  onClose: () => void;
}

/**
 * Asks before a track chosen for a recommended layout leaves championships
 * unable to race their rounds there: each listed with its rounds and its field,
 * laid out as the skip dialog lists rounds. Track choices are the app's, shared
 * by every career, so it lists championships rather than anyone's season.
 */
export const OutgrownDialog = ({
  title, pitboxes, championships, onConfirm, onClose,
}: OutgrownDialogProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <Dialog open={championships !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/25 text-warning-foreground">
              <TriangleAlertIcon className="size-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>{t('recommendedTracks.outgrown.body', { count: pitboxes })}</DialogDescription>
        </DialogHeader>

        <ul className="max-h-[50vh] overflow-y-auto rounded-lg border">
          {championships?.map(({ series, rounds, field }) => (
            <li
              key={series.id}
              className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 border-t py-2 pr-3 first:border-t-0"
            >
              <span aria-hidden className={cn('self-stretch', disciplineDot(series.entries[0]?.ladder))} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{series.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {rounds.map((round) => t('recommendedTracks.outgrown.round', {
                    number: series.rounds.indexOf(round) + 1, name: round.name,
                  })).join(t('recommendedTracks.outgrown.separator'))}
                </span>
              </span>
              {/* Neutral on purpose: a count, under a question that says what is wrong. */}
              <span className="text-xs text-muted-foreground tabular-nums">
                {t('recommendedTracks.outgrown.field', { count: field, shown: formatNumber(field) })}
              </span>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t('confirm.cancel')}</Button>
          <Button onClick={onConfirm}>{t('recommendedTracks.outgrown.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
