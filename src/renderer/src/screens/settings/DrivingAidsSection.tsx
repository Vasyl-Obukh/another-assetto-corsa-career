import { GaugeIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AID_MODES, AID_TILES, MAX_STABILITY_CONTROL } from './constants.ts';
import { ModeSegments } from './ModeSegments.tsx';
import { SubHeading } from './SubHeading.tsx';
import { DEFAULT_ASSISTS, DRIVING_AID_FLAGS } from '../../../../shared/constants';
import type { DrivingAids } from '../../../../shared/types';
import { useSettings } from '@/app';
import { SettingsSection, SwitchTile } from '@/components';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';

export const DrivingAidsSection = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const aids = settings.drivingAids;
  // Held while dragging and written once the thumb is let go, so a drag is one
  // settings write rather than one per step.
  const [dragged, setDragged] = useState<number | null>(null);

  const set = (change: DrivingAids) => patch({ drivingAids: { ...aids, ...change } });
  const stability = dragged ?? aids.stabilityControl ?? DEFAULT_ASSISTS.stabilityControl;

  return (
    <SettingsSection
      id="aids"
      icon={GaugeIcon}
      tone="you"
      title={t('settings.drivingAids')}
      hint={t('settings.drivingAidsHint')}
    >
      <SubHeading>{t('settings.aidsElectronics')}</SubHeading>
      <div className={AID_TILES}>
        {AID_MODES.map((key) => (
          <div key={key} className="flex flex-col gap-2 rounded-lg border p-3">
            <span className="text-sm font-medium">{t(`assist.${key}`)}</span>
            <ModeSegments
              label={t(`assist.${key}`)}
              value={aids[key] ?? DEFAULT_ASSISTS[key]}
              onChange={(mode) => set({ [key]: mode })}
            />
          </div>
        ))}

        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
            {t('assist.stabilityControl')}
            <span className="text-xs font-normal text-muted-foreground">{t('settings.stabilityOff')}</span>
          </span>
          <div className="flex h-8 items-center gap-3">
            <Slider
              min={0}
              max={MAX_STABILITY_CONTROL}
              step={1}
              value={[stability]}
              aria-label={t('assist.stabilityControl')}
              onValueChange={([next]) => setDragged(next)}
              onValueCommit={([next]) => {
                setDragged(null);
                set({ stabilityControl: next });
              }}
            />
            <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums">
              {t('settings.percent', { value: formatNumber(stability) })}
            </span>
          </div>
        </div>
      </div>

      <SubHeading className="mt-5">{t('settings.aidsHelpers')}</SubHeading>
      <div className={AID_TILES}>
        {DRIVING_AID_FLAGS.map((key) => {
          const on = aids[key] ?? DEFAULT_ASSISTS[key];

          return (
            <SwitchTile
              key={key}
              label={t(`assist.${key}`)}
              checked={on}
              tinted
              onChange={(next) => set({ [key]: next })}
            />
          );
        })}
      </div>
    </SettingsSection>
  );
};
