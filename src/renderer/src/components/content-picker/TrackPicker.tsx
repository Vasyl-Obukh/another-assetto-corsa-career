import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutStep } from './LayoutStep.tsx';
import type { Track, TrackGroup } from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { TrackBrowserBody } from '@/screens/track-browser';

interface TrackPickerProps {
  /**
   * Whether the picker is showing.
   */
  open: boolean;
  /**
   * Key of the layout already chosen, when there is one.
   */
  selectedKey?: string;
  /**
   * Called when the dialog opens or closes itself - Escape, the close button,
   * or a click outside.
   * @param open Whether it should now be showing
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the layout that was picked. The dialog closes itself first.
   * @param layout The chosen layout
   */
  onPick: (layout: Track) => void;
}

export const TrackPicker = ({
  open, selectedKey, onOpenChange, onPick,
}: TrackPickerProps) => {
  const { t } = useTranslation();

  // Which circuit's layouts are being chosen between, or null while the list of
  // circuits is showing. A one-layout circuit never sets this: confirming it
  // would be a step with only one answer.
  const [chosen, setChosen] = useState<TrackGroup | null>(null);

  const close = (next: boolean): void => {
    if (!next) setChosen(null);
    onOpenChange(next);
  };

  const pick = (layout: Track): void => {
    close(false);
    onPick(layout);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{chosen ? t('race.pick.layout') : t('race.pick.track')}</DialogTitle>
          <DialogDescription>
            {chosen ? t('race.pick.layoutHint') : t('race.pick.trackHint')}
          </DialogDescription>
        </DialogHeader>

        {/* The browser paints its own scroller, so this only has to give it a
            height to fill and a minimum of zero to shrink into. The second step
            is laid over it rather than swapped for it: unmounting the browser
            would throw away the filters and the scroll offset the user was at,
            and going back would land them at the top of the whole library. It
            needs a z-index of its own: the browser's toolbar is sticky at z-10,
            so being later in the DOM is not enough to cover it. */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full" inert={chosen !== null}>
            <TrackBrowserBody
              selectedKey={selectedKey}
              onSelect={(group) => {
                const [only] = group.layouts;
                if (group.layouts.length === 1 && only) pick(only);
                else setChosen(group);
              }}
            />
          </div>

          {chosen ? (
            <div className="absolute inset-0 z-20 bg-background">
              <LayoutStep
                group={chosen}
                selectedKey={selectedKey}
                onBack={() => setChosen(null)}
                onPick={pick}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
