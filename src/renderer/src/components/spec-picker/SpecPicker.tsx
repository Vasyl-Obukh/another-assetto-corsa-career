import { SpecPickerBody } from './SpecPickerBody.tsx';
import type { SpecId } from '../../../../shared/types';
import { Dialog, DialogContent } from '@/components/ui/dialog.tsx';

interface SpecPickerProps {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * The spec the field holds now, if any.
   */
  selected?: SpecId;
  /**
   * Called when the dialog opens or closes.
   * @param open Whether it is open
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the spec picked, which also closes the dialog.
   * @param spec The spec
   */
  onPick: (spec: SpecId) => void;
}

/**
 * Picking a spec out of the whole catalogue: a search that matches specs and
 * the cars in them, the classes down the side, and the specs as tiles saying
 * how much of each is installed - in place of one select holding a hundred of
 * them.
 */
export const SpecPicker = ({
  open, selected, onOpenChange, onPick,
}: SpecPickerProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex h-[80vh] max-w-[min(64rem,calc(100vw-4rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(64rem,calc(100vw-4rem))]">
      <SpecPickerBody selected={selected} onPick={onPick} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
