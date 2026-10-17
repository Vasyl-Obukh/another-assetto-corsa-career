import { FolderOpenIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SaveFilters } from './SaveFilters.tsx';
import { SaveList } from './SaveList.tsx';
import type { SaveFilter } from './types.ts';
import type { SaveSummary } from '../../../../shared/types';
import { ErrorCard } from '@/components/ErrorCard.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import type { SavesState } from '@/hooks';

interface LoadDialogProps {
  /**
   * The open career's saves and their commands.
   */
  saves: SavesState;
  /**
   * Whether a load is in flight.
   */
  loading: boolean;
  /**
   * Loads a save.
   * @param save The save
   */
  onLoad(save: SaveSummary): void;
  /**
   * Closes the dialog.
   */
  onClose(): void;
}

/**
 * Load, over whatever page is open: every save the career has, filtered by
 * kind. Loading is one click and asks nothing.
 */
export const LoadDialog = ({
  saves, loading, onLoad, onClose,
}: LoadDialogProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SaveFilter>('all');

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex-row flex-wrap items-center gap-3">
          <DialogTitle>{t('saves.loadTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('saves.loadTitle')}</DialogDescription>
          <div className="ml-auto mr-6">
            <SaveFilters saves={saves.saves} value={filter} onChange={setFilter} />
          </div>
        </DialogHeader>

        {saves.error ? <ErrorCard error={saves.error} onDismiss={saves.dismissError} /> : null}

        <div className="max-h-[60vh] overflow-y-auto rounded-lg border p-1">
          <SaveList
            saves={saves.saves}
            filter={filter}
            busy={saves.busy || loading}
            onLoad={onLoad}
            onRename={saves.rename}
            onDelete={saves.remove}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => { void saves.showFolder(); }}>
            <FolderOpenIcon />
            {t('saves.openFolder')}
          </Button>
          <Button variant="outline" onClick={onClose}>{t('saves.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
