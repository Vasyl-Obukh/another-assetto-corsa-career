import {
  ArchiveRestoreIcon, InfoIcon, SaveIcon, TrophyIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CareerRow } from './CareerRow.tsx';
import type { CareerBackup } from '../../../../shared/types';
import { Segments } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';
import { fileNameOf } from '@/lib/file-name';

interface RestoreDialogProps {
  /**
   * The backup read, or null while none is.
   */
  backup: CareerBackup | null;
  /**
   * Whether the restore is running, which holds the buttons.
   */
  busy: boolean;
  /**
   * Restores it.
   * @param replace Whether the copy of the career already here is replaced
   */
  onRestore(replace: boolean): void;
  /**
   * Closes the dialog, restoring nothing.
   */
  onClose(): void;
}

/**
 * What a backup holds, read before anything of it is restored, and - only
 * when that career is here already - whether to keep both or replace it.
 */
export const RestoreDialog = ({
  backup, busy, onRestore, onClose,
}: RestoreDialogProps) => {
  const { t } = useTranslation();
  const { formatAgo, formatDateTime } = useFormat();
  const [mode, setMode] = useState<'keep' | 'replace'>('keep');

  return (
    <Dialog open={backup !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      {backup ? (
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('careers.restore.title')}</DialogTitle>
            <DialogDescription className="truncate">{fileNameOf(backup.file)}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border bg-card">
              <CareerRow career={backup.career} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <SaveIcon className="size-4 text-muted-foreground" />
                {t('careers.restore.saves', { count: backup.saves })}
              </span>
              <span className="flex items-center gap-1.5">
                <TrophyIcon className="size-4 text-muted-foreground" />
                {t('careers.restore.results', { count: backup.results })}
              </span>
              {backup.backedUpAt ? (
                <span className="text-muted-foreground">
                  {t('careers.restore.backedUp', { when: formatDateTime(backup.backedUpAt) })}
                </span>
              ) : null}
            </div>

            {backup.here ? (
              <>
                <div className="flex items-start gap-2 rounded-md bg-warning/20 px-3 py-2 text-sm">
                  <InfoIcon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {backup.here.playedAt
                      ? t('careers.restore.here', { ago: formatAgo(backup.here.playedAt) })
                      : t('careers.restore.hereUnread')}
                  </span>
                </div>
                <div className="self-start">
                  <Segments
                    label={t('careers.restore.mode')}
                    items={[
                      { id: 'keep', label: t('careers.restore.keep') },
                      { id: 'replace', label: t('careers.restore.replace') },
                    ]}
                    value={mode}
                    onChange={setMode}
                  />
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" disabled={busy} onClick={onClose}>{t('confirm.cancel')}</Button>
            <Button
              variant={backup.here && mode === 'replace' ? 'destructive' : 'default'}
              disabled={busy}
              onClick={() => onRestore(backup.here !== null && mode === 'replace')}
            >
              <ArchiveRestoreIcon />
              {t('careers.restore.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};
