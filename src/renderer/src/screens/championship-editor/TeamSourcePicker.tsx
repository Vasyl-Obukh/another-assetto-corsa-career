import { TeamSourceBody } from './TeamSourceBody.tsx';
import type { TeamSource } from './types.ts';
import type { Championship } from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useKindTranslation } from '@/i18n';

interface TeamSourcePickerProps {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * The championship being edited, for the teams it has.
   */
  series: Championship;
  /**
   * Called when the dialog opens or closes.
   * @param open Whether it is open
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the class picked, which also closes the dialog.
   * @param source The class and where it is from
   */
  onPick: (source: TeamSource) => void;
}

/**
 * Picking the class a new class takes its teams from, out of every
 * championship and historic event that fields a team, laid out as the car
 * picker lays out its browser.
 */
export const TeamSourcePicker = ({
  open, series, onOpenChange, onPick,
}: TeamSourcePickerProps) => {
  const { t } = useKindTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{t('editor.teamSource.title')}</DialogTitle>
          <DialogDescription>{t('editor.teamSource.hint')}</DialogDescription>
        </DialogHeader>
        <TeamSourceBody
          series={series}
          onPick={(source) => { onPick(source); onOpenChange(false); }}
        />
      </DialogContent>
    </Dialog>
  );
};
