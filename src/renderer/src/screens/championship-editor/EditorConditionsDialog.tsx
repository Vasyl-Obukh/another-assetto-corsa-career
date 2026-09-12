import { useState } from 'react';

import { ConfirmActions } from './ConfirmActions.tsx';
import type {
  Conditions, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { ConditionsDialog } from '@/screens/race';

interface EditorConditionsDialogProps {
  /**
   * What the dialog is headed with - the round's name, or the session's.
   */
  title: string;
  /**
   * A line under it saying what these conditions govern.
   */
  description: string;
  /**
   * What "take the round's" reads as, for a session.
   */
  inheritLabel?: string;
  /**
   * The conditions as they stand, which seed the draft. Read once, on mount.
   */
  conditions: Conditions;
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
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the conditions to commit.
   * @param next The conditions as edited
   */
  onConfirm: (next: Conditions) => void;
  /**
   * Called to leave the conditions as they were.
   */
  onCancel: () => void;
}

/**
 * The race screen's conditions dialog, committed on Confirm rather than applied
 * as it is typed. Mounted only while open, so the draft seeds on every open.
 *
 * No `resolved` placeholders: a round is the top of its own chain, and a format
 * runs at every round that names it, so there is nothing above either to show.
 */
export const EditorConditionsDialog = ({
  title, description, inheritLabel, conditions, weather, controllers, system, idPrefix, locked,
  onConfirm, onCancel,
}: EditorConditionsDialogProps) => {
  const [draft, setDraft] = useState(conditions);

  return (
    <ConditionsDialog
      open
      title={title}
      description={description}
      conditions={draft}
      inheritLabel={inheritLabel}
      showTimeOfDay
      weather={weather}
      controllers={controllers}
      system={system}
      // Offered whatever this install's CSP is set to: a championship may be
      // raced on another machine, and the race screen checks what is installed.
      rainFx
      allowSlots
      idPrefix={idPrefix}
      locked={locked}
      footer={<ConfirmActions locked={locked} onConfirm={() => onConfirm(draft)} onCancel={onCancel} />}
      onOpenChange={(next) => { if (!next) onCancel(); }}
      onChange={setDraft}
    />
  );
};
