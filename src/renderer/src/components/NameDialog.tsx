import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorCard } from './ErrorCard.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import type { DisplayableError } from '@/lib/ipc';

interface NameDialogProps {
  /**
   * Whether the dialog is showing. The field starts from `initial` each time
   * the dialog mounts, so give it a key that changes when it opens.
   */
  open: boolean;
  /**
   * The question, as a heading.
   */
  title: string;
  /**
   * What saving does, where that is not obvious from the title.
   */
  description?: string;
  /**
   * The label over the field.
   */
  label: string;
  /**
   * What the field starts with.
   */
  initial: string;
  /**
   * The wording on the saving button.
   */
  confirmLabel: string;
  /**
   * Whether the save is running.
   */
  busy: boolean;
  /**
   * Why the last save was refused, shown in the dialog so it stays open over
   * the name that was refused.
   */
  error?: DisplayableError | null;
  /**
   * Clears the error.
   */
  onDismissError?: () => void;
  /**
   * Called with the name to save.
   * @param name The name, trimmed
   */
  onConfirm: (name: string) => void;
  /**
   * Called when the dialog closes without saving.
   */
  onClose: () => void;
}

export const NameDialog = ({
  open, title, description, label, initial, confirmLabel, busy, error, onDismissError, onConfirm, onClose,
}: NameDialogProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(initial);
  const trimmed = draft.trim();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* Radix warns without a description, so the title stands in for
              one where there is nothing more to say. */}
          <DialogDescription className={description ? undefined : 'sr-only'}>{description ?? title}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed !== '') onConfirm(trimmed);
          }}
        >
          {error ? <ErrorCard error={error} onDismiss={() => onDismissError?.()} /> : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name-dialog-field" className="text-sm font-medium">{label}</label>
            <Input
              id="name-dialog-field"
              value={draft}
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>
              {t('confirm.cancel')}
            </Button>
            <Button type="submit" disabled={busy || trimmed === ''}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
