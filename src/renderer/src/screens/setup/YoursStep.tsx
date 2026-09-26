import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { LanguagePicker, ThemePicker } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';

/**
 * The settings people otherwise go looking for after their first race - who
 * they are, how hard the field is and how the app looks - each written as it
 * changes, like the settings tab they live in afterwards.
 */
export const YoursStep = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const [name, setName] = useState(settings.driverName ?? '');
  // Held while dragging and written once the thumb is let go.
  const [dragged, setDragged] = useState<number | null>(null);
  const strength = dragged ?? settings.opponents.strength;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="setup-driver" className="text-sm font-medium">{t('settings.driverName')}</label>
          <Input
            id="setup-driver"
            value={name}
            placeholder={t('settings.driverNamePlaceholder')}
            onChange={(event) => {
              setName(event.target.value);
              patch({ driverName: event.target.value });
            }}
          />
          <p className="text-xs text-muted-foreground">{t('settings.driverNameHint')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-sm font-medium">
            {t('settings.opponentsStrength')}
            <span className="text-2xl font-semibold tabular-nums">{formatNumber(strength)}</span>
          </span>
          <Slider
            min={AI_RANGE.min}
            max={AI_RANGE.max}
            step={1}
            value={[strength]}
            aria-label={t('settings.opponentsStrength')}
            onValueChange={([next]) => setDragged(next)}
            onValueCommit={([next]) => {
              setDragged(null);
              patch({ opponents: { ...settings.opponents, strength: next } });
            }}
          />
          <p className="text-xs text-muted-foreground">{t('setup.strengthHint')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('settings.theme')}</span>
          <ThemePicker />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('settings.language')}</span>
          <LanguagePicker />
        </div>
      </div>
    </div>
  );
};
