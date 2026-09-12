import type { ReactNode } from 'react';

import { ConditionsBody } from './ConditionsBody.tsx';
import type {
  Conditions, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';

interface ConditionsDialogProps {
  /**
   * Whether the dialog is showing. Owned by the caller, as the car and track
   * pickers are - nothing here uses DialogTrigger.
   */
  open: boolean;
  /**
   * What the dialog is headed with: the session's name, or the weekend's.
   */
  title: string;
  /**
   * A line under it saying what these conditions govern.
   */
  description: string;
  /**
   * The conditions being edited.
   */
  conditions: Conditions;
  /**
   * What a session runs in once the weekend's defaults apply, for placeholders.
   */
  resolved?: Conditions;
  /**
   * What "take the weekend's" reads as, for a session.
   */
  inheritLabel?: string;
  /**
   * Whether to offer a start time.
   */
  showTimeOfDay: boolean;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather.
   */
  system: WeatherSystem;
  /**
   * Whether RainFX will draw rain.
   */
  rainFx: boolean;
  /**
   * Whether weather that changes over the session can be asked for here.
   */
  allowSlots: boolean;
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * Whether the weekend has started, in which case nothing here can change.
   */
  locked: boolean;
  /**
   * Anything the dialog should end with - the series editor's Confirm and
   * Cancel. The race screen passes none, since a race is edited live.
   */
  footer?: ReactNode;
  /**
   * Called when the dialog opens or closes.
   * @param open Whether it should be showing
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param conditions The conditions to apply
   */
  onChange: (conditions: Conditions) => void;
}

export const ConditionsDialog = ({
  open, title, description, conditions, resolved, inheritLabel, showTimeOfDay, weather,
  controllers, system, rainFx, allowSlots, idPrefix, locked, footer, onOpenChange, onChange,
}: ConditionsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/*
      Both max widths, because DialogContent hardcodes sm:max-w-lg and
      overriding only the unprefixed one does nothing. 4xl sits inside the width
      a card occupies on the race screen behind it. Height is left to the
      content, unlike the browsers' fixed 85vh.
    */}
    <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col gap-4 overflow-y-auto sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <ConditionsBody
        conditions={conditions}
        resolved={resolved}
        inheritLabel={inheritLabel}
        showTimeOfDay={showTimeOfDay}
        weather={weather}
        controllers={controllers}
        system={system}
        rainFx={rainFx}
        allowSlots={allowSlots}
        idPrefix={idPrefix}
        locked={locked}
        onChange={onChange}
      />

      {footer}
    </DialogContent>
  </Dialog>
);
