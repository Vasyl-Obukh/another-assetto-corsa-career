import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CatalogueSpec, ClassId } from '../../../../shared/types';
import { useClasses } from '@/app';
import { ErrorCard } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import type { DisplayableError } from '@/lib/ipc';
import { Field } from '@/screens/race';

interface MoveSpecDialogProps {
  /**
   * The spec being moved.
   */
  spec: CatalogueSpec;
  /**
   * Whether the move is running.
   */
  busy: boolean;
  /**
   * Why the last move was refused, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  onDismissError: () => void;
  /**
   * Called with the class to move it to.
   * @param carClass The class picked
   */
  onConfirm: (carClass: ClassId) => void;
  /**
   * Called when the dialog closes without moving it.
   */
  onClose: () => void;
}

export const MoveSpecDialog = ({
  spec, busy, error, onDismissError, onConfirm, onClose,
}: MoveSpecDialogProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  // Every class but its own, since moving it where it already is does nothing.
  const targets = catalogue.classes.filter((one) => one.id !== spec.class);
  const [target, setTarget] = useState<ClassId | undefined>(undefined);

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('carClasses.moveSpecTitle', { name: spec.name })}</DialogTitle>
          <DialogDescription>{t('carClasses.moveSpecHint')}</DialogDescription>
        </DialogHeader>

        {error !== null ? <ErrorCard error={error} onDismiss={onDismissError} /> : null}

        <Field id="move-spec-class" label={t('carClasses.specClass')}>
          <Select value={target} disabled={busy} onValueChange={setTarget}>
            <SelectTrigger id="move-spec-class" className="w-full">
              <SelectValue placeholder={t('carClasses.pickClass')} />
            </SelectTrigger>
            <SelectContent>
              {targets.map((one) => (
                <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            {t('confirm.cancel')}
          </Button>
          <Button
            disabled={busy || target === undefined}
            onClick={() => { if (target !== undefined) onConfirm(target); }}
          >
            {t('carClasses.move')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
