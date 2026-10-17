import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useAppError } from '@/i18n';
import type { DisplayableError } from '@/lib/ipc';

interface MenuFailureProps {
  /**
   * Why a command from the slot menu could not run, or null while none failed.
   */
  failure: DisplayableError | null;
  /**
   * Called once the player has read it.
   */
  onClose: () => void;
}

/**
 * Says why something the slot menu was asked for did not happen. A dialog
 * rather than a card, since the menu has closed and the page behind it may be
 * any page at all.
 */
export const MenuFailure = ({ failure, onClose }: MenuFailureProps) => {
  const { t } = useTranslation();
  const describeError = useAppError();

  return (
    <Dialog open={failure !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('slot.failed')}</DialogTitle>
          <DialogDescription data-selectable>{failure ? describeError(failure) : null}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onClose}>{t('slot.understood')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
