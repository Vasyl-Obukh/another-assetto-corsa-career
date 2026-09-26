import { BotIcon, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import type { AiBase } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';

export const OpponentsSection = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const { opponents } = settings;
  // Held while dragging and written once the thumb is let go, so a drag is one
  // settings write rather than one per step.
  const [dragged, setDragged] = useState<Partial<AiBase>>({});

  const figures = [
    {
      key: 'strength', label: t('settings.opponentsStrength'), low: formatNumber(AI_RANGE.min), high: formatNumber(AI_RANGE.max),
    },
    {
      key: 'aggression', label: t('settings.opponentsAggression'), low: t('settings.aggressionLow'), high: t('settings.aggressionHigh'),
    },
  ] as const;

  return (
    <SettingsSection
      id="opponents"
      icon={BotIcon}
      tone="opponents"
      title={t('settings.opponents')}
      hint={t('settings.opponentsHint')}
      footer={(
        <>
          <InfoIcon className="size-3.5 shrink-0" />
          {t('settings.opponentsOffsets')}
        </>
      )}
    >
      <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        {figures.map(({
          key, label, low, high,
        }) => {
          const value = dragged[key] ?? opponents[key];

          return (
            <div key={key} className="flex flex-col gap-2">
              <span className="flex items-baseline justify-between text-sm font-medium">
                {label}
                <span className="text-2xl font-semibold tabular-nums">{formatNumber(value)}</span>
              </span>
              <Slider
                min={AI_RANGE.min}
                max={AI_RANGE.max}
                step={1}
                value={[value]}
                aria-label={label}
                onValueChange={([next]) => setDragged({ ...dragged, [key]: next })}
                onValueCommit={([next]) => {
                  setDragged({});
                  patch({ opponents: { ...opponents, [key]: next } });
                }}
              />
              <span className="flex justify-between text-xs text-muted-foreground">
                <span>{low}</span>
                <span>{high}</span>
              </span>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
};
