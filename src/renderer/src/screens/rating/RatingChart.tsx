import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CHART, TIER_BAND } from './constants.ts';
import type { ChartLine, ChartTick } from './types.ts';
import { RATING_FLOORS } from '../../../../shared/constants';
import { ratingFloor, rungWidth } from '../../../../shared/utils/career-eligibility';
import { useElementWidth } from '@/hooks';
import { useFormat } from '@/i18n';
import { tierMetalKey } from '@/screens/championships';

interface RatingChartProps {
  /**
   * The lines to draw, each a value per point.
   */
  lines: readonly ChartLine[];
  /**
   * What each point is, for the tooltip.
   */
  labels: readonly string[];
  /**
   * Where each season begins, along the bottom.
   */
  ticks: readonly ChartTick[];
}

/**
 * Every rating over the career, a point per session: each discipline raced in
 * its own colour and the global rating dashed, over the rungs of the ladder as
 * bands in their metals. Hovering a point says what every rating stood at.
 */
export const RatingChart = ({ lines, labels, ticks }: RatingChartProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const width = useElementWidth(host);
  const {
    height, left, right, top, bottom, pad, labelGap,
  } = CHART;

  const values = lines.flatMap((line) => line.values);
  const count = Math.max(1, ...lines.map((line) => line.values.length));
  const low = Math.max(0, Math.min(...values) - pad);
  const high = Math.max(...values) + pad;
  const plot = Math.max(1, width - left - right);
  const x = (at: number): number => left + (count > 1 ? (at / (count - 1)) * plot : plot / 2);
  const y = (value: number): number => top + (1 - (value - low) / Math.max(1, high - low)) * (height - top - bottom);

  // The rungs the drawing reaches, each its band from its floor to the next.
  const bands = RATING_FLOORS.map((_, index) => index + 1).flatMap((tier) => {
    const from = Math.max(low, ratingFloor(tier));
    const to = Math.min(high, ratingFloor(tier) + rungWidth(tier));
    if (to <= low || from >= high) return [];

    return [{ tier, from, to }];
  });

  // A label at each line's end, nudged apart so none overlap.
  const ends = lines
    .map((line) => ({ line, at: y(line.values.at(-1) ?? 0) }))
    .sort((one, other) => one.at - other.at);
  ends.forEach((end, index) => {
    const before = ends[index - 1];
    if (before && end.at - before.at < labelGap) end.at = before.at + labelGap;
  });

  const pick = (clientX: number, target: SVGRectElement): void => {
    const box = target.getBoundingClientRect();
    const along = (clientX - box.left) / Math.max(1, box.width);
    setHovered(Math.max(0, Math.min(count - 1, Math.round(along * (count - 1)))));
  };

  return (
    <div ref={setHost} className="relative">
      {width > 0 ? (
        <svg width={width} height={height} className="block" role="img" aria-label={t('rating.chart.label')}>
          {bands.map(({ tier, from, to }) => (
            <g key={tier}>
              <rect
                x={left}
                y={y(to)}
                width={plot}
                height={y(from) - y(to)}
                fill={TIER_BAND[Math.min(tier, TIER_BAND.length) - 1]}
                opacity={0.45}
              />
              {ratingFloor(tier) > low ? (
                <>
                  <line x1={left} x2={left + plot} y1={y(ratingFloor(tier))} y2={y(ratingFloor(tier))} className="stroke-border" strokeDasharray="3 3" />
                  <text x={left - 6} y={y(ratingFloor(tier)) + 3.5} textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                    {formatNumber(ratingFloor(tier))}
                  </text>
                </>
              ) : null}
              <text x={left + 6} y={(y(from) + y(to)) / 2 + 3.5} className="fill-muted-foreground text-[10px]">
                {t('rating.chart.rung', { tier, metal: t(tierMetalKey(tier)) })}
              </text>
            </g>
          ))}

          {ticks.map((tick) => (
            <g key={tick.at}>
              <line x1={x(tick.at)} x2={x(tick.at)} y1={top} y2={height - bottom} className="stroke-border" />
              <text x={x(tick.at) + 4} y={height - 6} className="fill-muted-foreground text-[10px]">{tick.label}</text>
            </g>
          ))}
          <line x1={left} x2={left + plot} y1={height - bottom} y2={height - bottom} className="stroke-border" />

          {lines.map((line) => (
            <path
              key={line.key}
              d={line.values.map((value, at) => `${at === 0 ? 'M' : 'L'}${x(at).toFixed(1)},${y(value).toFixed(1)}`).join('')}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeDasharray={line.dashed ? '5 4' : undefined}
            />
          ))}

          {ends.map(({ line, at }) => (
            <text key={line.key} x={left + plot + 8} y={at + 4} className="fill-foreground text-[11px] font-medium">
              {line.label}
              {' '}
              <tspan className="fill-muted-foreground tabular-nums">{formatNumber(line.values.at(-1) ?? 0)}</tspan>
            </text>
          ))}

          {hovered === null ? null : (
            <g>
              <line x1={x(hovered)} x2={x(hovered)} y1={top} y2={height - bottom} className="stroke-muted-foreground" />
              {lines.map((line) => (
                <circle
                  key={line.key}
                  cx={x(hovered)}
                  cy={y(line.values[hovered] ?? 0)}
                  r={4.5}
                  fill={line.color}
                  className="stroke-card"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          <rect
            x={left}
            y={0}
            width={plot}
            height={height}
            fill="transparent"
            onPointerMove={(event) => pick(event.clientX, event.currentTarget)}
            onPointerLeave={() => setHovered(null)}
          />
        </svg>
      ) : <div style={{ height }} />}

      {hovered === null ? null : (
        <div
          className="pointer-events-none absolute top-1.5 z-10 min-w-44 rounded-lg border bg-card px-2.5 py-2 text-xs shadow-lg"
          style={x(hovered) > width * 0.6
            ? { right: width - x(hovered) + 12 }
            : { left: x(hovered) + 12 }}
        >
          <div className="mb-1 font-semibold">{labels[hovered]}</div>
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: line.color }} />
              {line.label}
              <span className="ml-auto font-semibold tabular-nums">{formatNumber(line.values[hovered] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
