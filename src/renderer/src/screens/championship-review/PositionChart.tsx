import { useTranslation } from 'react-i18next';

import { CHART, CHART_TICKS } from './constants.ts';
import type { RoundStanding } from '@/lib/season-review';

interface PositionChartProps {
  /**
   * Where the player stood after each round.
   */
  path: readonly RoundStanding[];
  /**
   * How many drivers the class's table holds, which is the bottom of the chart.
   */
  field: number;
}

/**
 * The player's championship position after each round, first at the top, with
 * the podium places banded in gold so a title fight reads at a glance.
 */
export const PositionChart = ({ path, field }: PositionChartProps) => {
  const { t } = useTranslation();
  const {
    width, height, left, right, top, bottom,
  } = CHART;
  const bottomPlace = Math.max(field, 2);
  const x = (at: number): number => left + (path.length > 1 ? (at * (width - left - right)) / (path.length - 1) : 0);
  const y = (position: number): number => top + ((position - 1) * (height - top - bottom)) / (bottomPlace - 1);
  const ticks = [...new Set([...CHART_TICKS.filter((one) => one < bottomPlace), bottomPlace])];
  const scored = path.flatMap((one, at) => (one.position === null ? [] : [{ at, position: one.position }]));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block h-44 w-full" aria-hidden>
      <rect
        x={left}
        y={y(1) - 4}
        width={width - left - right}
        height={y(Math.min(3, bottomPlace)) - y(1) + 8}
        rx={4}
        className="fill-podium-gold/55"
      />
      {ticks.map((position) => (
        <g key={position}>
          <line x1={left} x2={width - right} y1={y(position)} y2={y(position)} className="stroke-border" />
          <text x={left - 8} y={y(position) + 3.5} textAnchor="end" className="fill-muted-foreground text-[10.5px]">
            {t('championships.detail.position', { number: position })}
          </text>
        </g>
      ))}
      {path.map((one, at) => (
        <text key={one.round} x={x(at)} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
          {t('standings.roundShort', { number: one.number })}
        </text>
      ))}
      <polyline
        fill="none"
        strokeWidth={2.5}
        strokeLinejoin="round"
        className="stroke-primary"
        points={scored.map((one) => `${x(one.at)},${y(one.position)}`).join(' ')}
      />
      {scored.map((one) => (
        <circle key={one.at} cx={x(one.at)} cy={y(one.position)} r={5} strokeWidth={2.5} className="fill-card stroke-primary" />
      ))}
    </svg>
  );
};
