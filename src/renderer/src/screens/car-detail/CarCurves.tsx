import { useTranslation } from 'react-i18next';

import { CHART_BOX, RPM_PER_K } from './constants.ts';
import { curveAxis, curvePath, rpmTicks } from './utils.ts';
import type { CarCurves as Curves } from '../../../../shared/types';
import { DetailPanel } from '@/components';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';

interface CarCurvesProps {
  /**
   * The curves the author shipped; either may be empty.
   */
  curves: Curves;
}

/**
 * Power and torque across the rev range on one chart, power on the left axis
 * and torque on the right, each rounded up to a figure worth labelling.
 */
export const CarCurves = ({ curves }: CarCurvesProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const units = useUnits();

  // Torque is drawn in the unit the player reads, its axis rounded in that unit.
  const torqueShown: Curves['torque'] = curves.torque.map(([rpm, nm]) => [rpm, units.shown('torque', nm, 1)]);
  const power = curveAxis(curves.power);
  const torque = curveAxis(torqueShown);
  const rpms = [...curves.power, ...curves.torque].map(([rpm]) => rpm);
  const from = Math.min(...rpms);
  const to = Math.max(...rpms);
  if (to <= from) return null;

  const {
    width, height, left, right, top, bottom,
  } = CHART_BOX;
  const x = (rpm: number): number => left + ((rpm - from) / (to - from)) * (width - left - right);
  const y = (max: number) => (value: number): number => top + (1 - value / max) * (height - top - bottom);
  // Whichever axis exists draws the gridlines, so a car with one curve still
  // has a scale to read it against.
  const grid = power ?? torque;
  const peak = (points: Curves['power']): string => formatNumber(Math.round(Math.max(...points.map(([, v]) => v))));

  return (
    <DetailPanel
      title={t('cars.detail.curves')}
      aside={(
        <span className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-xs font-normal text-muted-foreground">
          {power ? (
            <span className="inline-flex items-center gap-1.5">
              <i aria-hidden className="h-0.75 w-3.5 rounded-full bg-curve-power" />
              {t('cars.detail.curvePower', { peak: peak(curves.power), unit: t('cars.unitBhp') })}
            </span>
          ) : null}
          {torque ? (
            <span className="inline-flex items-center gap-1.5">
              <i aria-hidden className="h-0.75 w-3.5 rounded-full bg-curve-torque" />
              {t('cars.detail.curveTorque', { peak: peak(torqueShown), unit: units.unit('torque') })}
            </span>
          ) : null}
        </span>
      )}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full text-[10px]" role="img" aria-label={t('cars.detail.curves')}>
        {grid?.ticks.map((tick) => {
          const at = y(grid.max)(tick);

          return <line key={tick} x1={left} x2={width - right} y1={at} y2={at} className="stroke-border" />;
        })}
        {power?.ticks.map((tick) => (
          <text key={tick} x={left - 6} y={y(power.max)(tick) + 3} textAnchor="end" className="fill-muted-foreground">
            {formatNumber(tick)}
          </text>
        ))}
        {torque?.ticks.map((tick) => (
          <text key={tick} x={width - right + 6} y={y(torque.max)(tick) + 3} className="fill-muted-foreground">
            {formatNumber(tick)}
          </text>
        ))}
        {rpmTicks(from, to).map((rpm) => (
          <text key={rpm} x={x(rpm)} y={height - 6} textAnchor="middle" className="fill-muted-foreground">
            {t('cars.detail.rpmK', { value: formatNumber(rpm / RPM_PER_K) })}
          </text>
        ))}
        {torque ? (
          <path d={curvePath(torqueShown, x, y(torque.max))} fill="none" strokeWidth={2.2} className="stroke-curve-torque" />
        ) : null}
        {power ? (
          <path d={curvePath(curves.power, x, y(power.max))} fill="none" strokeWidth={2.2} className="stroke-curve-power" />
        ) : null}
      </svg>
    </DetailPanel>
  );
};
