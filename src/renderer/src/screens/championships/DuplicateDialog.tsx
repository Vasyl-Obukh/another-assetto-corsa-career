import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';

interface DuplicateDialogProps {
  /**
   * Whether the dialog is showing.
   */
  open: boolean;
  /**
   * The name of the championship being copied.
   */
  name: string;
  /**
   * Whether the copy is being written right now.
   */
  busy: boolean;
  /**
   * Called with the name the user settled on.
   * @param name What to call the copy
   */
  onConfirm: (name: string) => void;
  /**
   * Called when the dialog closes without copying.
   */
  onClose: () => void;
}

export const DuplicateDialog = ({
  open, name, busy, onConfirm, onClose,
}: DuplicateDialogProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(t('championships.actions.copyName', { name }));

  const trimmed = draft.trim();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('championships.duplicate.title', { name })}</DialogTitle>
          <DialogDescription>{t('championships.duplicate.hint')}</DialogDescription>
        </DialogHeader>

        {/* The name and nothing else. The copy's id is main's to pick, because
            only main knows what is taken - a file that failed to parse owns its
            name without appearing in the library at all, so an id chosen here
            could overwrite the very file the user is trying to fix. */}
        <div className="flex flex-col gap-2">
          <label htmlFor="duplicate-name" className="text-sm">
            {t('championships.duplicate.name')}
          </label>
          <Input
            id="duplicate-name"
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            {t('championships.duplicate.cancel')}
          </Button>
          <Button disabled={busy || trimmed === ''} onClick={() => onConfirm(trimmed)}>
            {t('championships.duplicate.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
