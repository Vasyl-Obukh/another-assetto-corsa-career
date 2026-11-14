import { useTranslation } from 'react-i18next';

import { ChoiceTile } from './ChoiceTile.tsx';
import { UNITS_PREVIEW } from './constants.ts';
import { UNIT_SYSTEMS } from '../../../../shared/constants';
import type { UnitSystem } from '../../../../shared/types';
import { useSettings } from '@/app';
import { useUnits } from '@/hooks';

interface UnitsTileProps {
  /**
   * The system the tile picks.
   */
  system: UnitSystem;
}

const UnitsTile = ({ system }: UnitsTileProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const units = useUnits(system);

  return (
    <ChoiceTile
      selected={settings.units === system}
      preview={(
        <span className="flex h-full flex-col justify-center gap-0.5 bg-background px-2.5">
          <span className="truncate text-[13px] font-semibold">{units.format('speed', UNITS_PREVIEW.speed)}</span>
          <span className="truncate text-[11px] text-muted-foreground">
            {t('common.dotted', {
              first: units.format('weight', UNITS_PREVIEW.weight),
              second: units.format('temperature', UNITS_PREVIEW.temperature),
            })}
          </span>
        </span>
      )}
      onSelect={() => patch({ units: system })}
    >
      {t(`units.system.${system}`)}
    </ChoiceTile>
  );
};

export const UnitsPicker = () => {
  const { t } = useTranslation();

  return (
    <div role="radiogroup" aria-label={t('settings.units')} className="flex flex-wrap gap-2.5">
      {UNIT_SYSTEMS.map((system) => <UnitsTile key={system} system={system} />)}
    </div>
  );
};
