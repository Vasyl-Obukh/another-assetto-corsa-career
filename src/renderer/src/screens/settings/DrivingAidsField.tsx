import { useTranslation } from 'react-i18next';

import { AID_MODES, ASSIST_MODES, MAX_STABILITY_CONTROL } from './constants.ts';
import { DEFAULT_ASSISTS, DRIVING_AID_FLAGS } from '../../../../shared/constants';
import type { DrivingAids } from '../../../../shared/types';
import { useSettings } from '@/app';
import { FieldGrid, FieldRow, ToggleRow } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

export const DrivingAidsField = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const aids = settings.drivingAids;

  const set = (change: DrivingAids) => patch({ drivingAids: { ...aids, ...change } });

  return (
    <div className="flex flex-col gap-4">
      <FieldGrid>
        {AID_MODES.map((key) => (
          <FieldRow key={key} label={t(`assist.${key}`)}>
            <Select
              value={String(aids[key] ?? DEFAULT_ASSISTS[key])}
              onValueChange={(value) => set({ [key]: Number(value) })}
            >
              <SelectTrigger size="sm" className={CONTROL_WIDTH} aria-label={t(`assist.${key}`)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIST_MODES.map((mode) => (
                  <SelectItem key={mode} value={String(mode)}>{t(`assistMode.${mode}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        ))}

        <FieldRow label={t('assist.stabilityControl')} htmlFor="settings-stability">
          <Input
            id="settings-stability"
            type="number"
            className={CONTROL_WIDTH}
            min={0}
            max={MAX_STABILITY_CONTROL}
            value={aids.stabilityControl ?? DEFAULT_ASSISTS.stabilityControl}
            onChange={(event) => set({ stabilityControl: Number(event.target.value) })}
          />
        </FieldRow>

        {DRIVING_AID_FLAGS.map((key) => (
          <ToggleRow
            key={key}
            label={t(`assist.${key}`)}
            value={aids[key] ?? DEFAULT_ASSISTS[key]}
            onChange={(next) => set({ [key]: next })}
          />
        ))}
      </FieldGrid>

      <p className="text-sm text-muted-foreground">{t('settings.drivingAidsOverride')}</p>
    </div>
  );
};
