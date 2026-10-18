import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';

interface ConfirmDialogProps {
  /**
   * Whether the dialog is showing.
   */
  open: boolean;
  /**
   * The question, as a sentence.
   */
  title: string;
  /**
   * What confirming actually does, including what cannot be undone.
   */
  description: string;
  /**
   * The wording on the confirming button, which names the action rather than
   * saying "OK" - a dialog that has to be read to know what "OK" means is one
   * people stop reading.
   */
  confirmLabel: string;
  /**
   * Whether the action is already running, which disables both buttons.
   */
  busy?: boolean;
  /**
   * Something else to do instead, at the far end of the footer from the two
   * buttons - backing a career up before deleting it.
   */
  aside?: ReactNode;
  /**
   * Called when the user confirms.
   */
  onConfirm: () => void;
  /**
   * Called when the dialog closes without confirming.
   */
  onClose: () => void;
}

export const ConfirmDialog = ({
  open, title, description, confirmLabel, busy, aside, onConfirm, onClose,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {aside ? <div className="sm:mr-auto">{aside}</div> : null}
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            {t('confirm.cancel')}
          </Button>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
