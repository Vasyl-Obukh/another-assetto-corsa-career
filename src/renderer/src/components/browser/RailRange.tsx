import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RangeValue } from './types.ts';
import type { Spread } from '../../../../shared/types';
import { Slider } from '@/components/ui/slider.tsx';
import { cn } from '@/lib/utils.ts';

interface RailRangeProps {
  /**
   * How the library is spread over this figure, or null when nothing states it.
   */
  spread: Spread | null;
  /**
   * The range picked; an unset end is open.
   */
  value: RangeValue;
  /**
   * The slider's step, in the figure's own unit.
   */
  step: number;
  /**
   * What the range's name is, already translated, for the slider's thumbs.
   */
  label: string;
  /**
   * Writes a value the way the rail shows it.
   * @param value The figure
   * @returns The figure, formatted
   */
  format(value: number): string;
  /**
   * Replaces the range.
   * @param next The range; an end at the library's own edge is left open
   */
  onChange(next: RangeValue): void;
}

/**
 * A range filter drawn over the library's own spread, so where the entries
 * actually sit is visible before anything is dragged.
 */
export const RailRange = ({
  spread, value, step, label, format, onChange,
}: RailRangeProps) => {
  const { t } = useTranslation();
  const min = spread === null ? 0 : Math.floor(spread.min / step) * step;
  const max = spread === null ? 0 : Math.ceil(spread.max / step) * step;
  const picked: [number, number] = [value.from ?? min, value.to ?? max];

  // Held while dragging, so the bars follow the thumbs without a query per pixel.
  const [dragged, setDragged] = useState<[number, number] | null>(null);
  const [from, to] = dragged ?? picked;

  if (spread === null || max <= min) {
    return <p className="text-xs text-muted-foreground">{t('browse.rangeNone')}</p>;
  }

  const tallest = Math.max(1, ...spread.counts);
  const width = (spread.max - spread.min) / spread.counts.length;

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="flex h-8 items-end gap-px">
        {spread.counts.map((count, index) => {
          const start = spread.min + index * width;
          const inside = start + width > from && start < to;

          return (
            <i
              // The bins are positions, not entities.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={cn('flex-1 rounded-t-[2px] bg-muted', inside && count > 0 && 'bg-primary/55')}
              style={{ height: `${Math.max(6, (count / tallest) * 100)}%` }}
            />
          );
        })}
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[from, to]}
        aria-label={label}
        onValueChange={(next) => setDragged([next[0] ?? min, next[1] ?? max])}
        onValueCommit={(next) => {
          setDragged(null);
          const [low = min, high = max] = next;
          onChange({ from: low > min ? low : undefined, to: high < max ? high : undefined });
        }}
      />

      <div className="flex items-center gap-2 text-xs tabular-nums">
        <span className="flex-1 rounded-md border bg-background px-2 py-1">{format(from)}</span>
        <span className="text-muted-foreground">{t('common.dash')}</span>
        <span className="flex-1 rounded-md border bg-background px-2 py-1 text-right">{format(to)}</span>
      </div>
    </div>
  );
};
