import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import type { AiBase } from '../../../../shared/types';
import { useSettings } from '@/app';
import { FieldGrid, FieldRow } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';
import { toNumber } from '@/screens/race';

export const OpponentsField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const { opponents } = settings;

  // Held as typed rather than as a number, so clearing a box to type a new
  // figure does not snap it to zero on the way.
  const [draft, setDraft] = useState<Record<keyof AiBase, string>>({
    strength: String(opponents.strength),
    aggression: String(opponents.aggression),
  });

  /**
   * Takes one box's text, and saves it once it reads as a number.
   * @param key Which figure the box holds
   * @param text What the box now says
   */
  const set = (key: keyof AiBase, text: string) => {
    setDraft({ ...draft, [key]: text });
    const value = toNumber(text);
    if (value !== undefined) patch({ opponents: { ...opponents, [key]: value } });
  };

  return (
    <div className="flex flex-col gap-3">
      <FieldGrid>
        <FieldRow label={t('settings.opponentsStrength')} htmlFor="settings-ai-strength">
          <Input
            id="settings-ai-strength"
            type="number"
            className={CONTROL_WIDTH}
            min={AI_RANGE.min}
            max={AI_RANGE.max}
            value={draft.strength}
            onChange={(event) => set('strength', event.target.value)}
          />
        </FieldRow>

        <FieldRow label={t('settings.opponentsAggression')} htmlFor="settings-ai-aggression">
          <Input
            id="settings-ai-aggression"
            type="number"
            className={CONTROL_WIDTH}
            min={AI_RANGE.min}
            max={AI_RANGE.max}
            value={draft.aggression}
            onChange={(event) => set('aggression', event.target.value)}
          />
        </FieldRow>
      </FieldGrid>

      <p className="text-sm text-muted-foreground">{t('settings.opponentsOffsets')}</p>
    </div>
  );
};
