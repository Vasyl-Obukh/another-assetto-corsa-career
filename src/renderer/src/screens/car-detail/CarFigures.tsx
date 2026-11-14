import { useTranslation } from 'react-i18next';

import { TENTHS } from './constants.ts';
import type { CarPerformance } from '../../../../shared/types';
import type { Quantity } from '../../../../shared/utils/units';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface CarFiguresProps {
  /**
   * The car's figures, any of which may be missing.
   */
  performance: CarPerformance;
}

/**
 * The six figures a car is compared on, large, in one band - three to a row
 * once the column is too narrow for six. A figure the author never stated
 * shows a dash rather than leaving a gap that reads as a layout fault.
 */
export const CarFigures = ({ performance }: CarFiguresProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const units = useUnits();

  /**
   * A figure no unit system converts, whole.
   * @param value The figure, or null where it is not stated
   * @returns It written out, or null
   */
  const whole = (value: number | null): string | null => (value === null ? null : formatNumber(Math.round(value)));
  /**
   * A metric figure in the player's units, without its unit.
   * @param quantity What is measured
   * @param value The figure, or null where it is not stated
   * @returns It written out, or null
   */
  const shown = (quantity: Quantity, value: number | null): string | null => (
    value === null ? null : units.figure(quantity, value)
  );
  const figures = [
    { label: t('cars.detail.power'), unit: t('cars.unitBhp'), value: whole(performance.bhp) },
    { label: t('cars.detail.torque'), unit: units.unit('torque'), value: shown('torque', performance.torqueNm) },
    { label: t('cars.detail.weight'), unit: units.unit('weight'), value: shown('weight', performance.weightKg) },
    { label: t('cars.detail.powerToWeight'), unit: t('cars.unitBhpPerTonne'), value: whole(performance.powerToWeight) },
    { label: t('cars.detail.topSpeed'), unit: units.unit('speed'), value: shown('speed', performance.topSpeedKph) },
    {
      label: units.acceleration,
      unit: t('cars.unitSeconds'),
      value: performance.accelerationSeconds === null
        ? null
        : formatNumber(Math.round(performance.accelerationSeconds * TENTHS) / TENTHS),
    },
  ];

  return (
    <Card className="@container gap-0 py-0">
      <dl className="grid grid-cols-3 @3xl:grid-cols-6">
        {figures.map((figure, at) => (
          <div
            key={figure.label}
            className={cn(
              'flex flex-col-reverse gap-0.5 px-4 py-3',
              at % 3 !== 0 && 'border-l',
              at >= 3 && 'border-t @3xl:border-t-0',
              at === 3 && '@3xl:border-l',
            )}
          >
            <dt className="text-xs text-muted-foreground">{figure.label}</dt>
            <dd className="text-xl font-semibold tracking-tight tabular-nums">
              {figure.value === null ? (
                <span className="font-medium text-muted-foreground">{t('common.dash')}</span>
              ) : (
                <>
                  {figure.value}
                  <small className="ml-1 text-xs font-medium tracking-normal text-muted-foreground">{figure.unit}</small>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};
