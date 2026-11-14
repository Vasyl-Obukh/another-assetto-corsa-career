import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DIGITS } from './constants.ts';
import type { Units } from './types.ts';
import { M_PER_KM } from '../../../../shared/constants';
import type { UnitSystem } from '../../../../shared/types';
import {
  toMetric, toShown, unitOf, usesMph,
} from '../../../../shared/utils/units';
import { useSettings } from '@/app';
import { useFormat } from '@/i18n';

/**
 * Rounds a figure to so many decimal places.
 * @param value The figure
 * @param digits Decimal places
 * @returns The figure rounded
 */
const rounded = (value: number, digits: number): number => {
  const scale = 10 ** digits;

  return Math.round(value * scale) / scale;
};

/**
 * Measurements written in the units the player reads - or in another system,
 * for a picker previewing each.
 * @param override A system to write in rather than the one in settings
 * @returns The unit formatters
 */
export const useUnits = (override?: UnitSystem): Units => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings } = useSettings();
  const system = override ?? settings.units;

  return useMemo<Units>(() => {
    const shown: Units['shown'] = (quantity, metric, digits = DIGITS[quantity]) => (
      rounded(toShown(quantity, metric, system), digits)
    );
    const unit: Units['unit'] = (quantity) => t(`units.${unitOf(quantity, system)}`);
    const figure: Units['figure'] = (quantity, metric, digits) => formatNumber(shown(quantity, metric, digits));
    const format: Units['format'] = (quantity, metric, digits) => t('units.value', {
      value: figure(quantity, metric, digits),
      unit: unit(quantity),
    });

    return {
      unit,
      shown,
      stored: (quantity, typed) => toMetric(quantity, typed, system),
      figure,
      format,
      formatLap: (metres, digits) => (
        metres < M_PER_KM ? format('length', metres) : format('distance', metres / M_PER_KM, digits)
      ),
      formatRange: (quantity, min, max, digits) => t('units.range', {
        min: formatNumber(shown(quantity, min, digits)),
        max: formatNumber(shown(quantity, max, digits)),
        unit: unit(quantity),
      }),
      acceleration: t(usesMph(system) ? 'units.acceleration.mph' : 'units.acceleration.kph'),
    };
  }, [t, formatNumber, system]);
};
