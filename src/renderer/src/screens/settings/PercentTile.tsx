import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PercentStop } from './types.ts';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface PercentTileProps {
  /**
   * What the aid is called.
   */
  label: string;
  /**
   * The line beside the name, if any.
   */
  hint?: string;
  /**
   * The percentage shown.
   */
  value: number;
  /**
   * The most it goes to.
   */
  max: number;
  /**
   * The points worth naming, offered as chips under the slider.
   */
  stops?: readonly PercentStop[];
  /**
   * Whether it cannot be changed, because a career is following the app's.
   */
  disabled: boolean;
  /**
   * Sets the percentage.
   * @param next The percentage
   */
  onChange(next: number): void;
}

/**
 * A driving aid set as a percentage, on a slider that writes once the thumb is
 * let go.
 */
export const PercentTile = ({
  label, hint, value, max, stops = [], disabled, onChange,
}: PercentTileProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  // Held while dragging and written once the thumb is let go, so a drag is one
  // write rather than one per step.
  const [dragged, setDragged] = useState<number | null>(null);
  const shown = dragged ?? value;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {hint === undefined ? null : <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      <div className="flex h-8 items-center gap-3">
        <Slider
          min={0}
          max={max}
          step={1}
          value={[shown]}
          disabled={disabled}
          aria-label={label}
          onValueChange={([next]) => setDragged(next)}
          onValueCommit={([next]) => {
            setDragged(null);
            onChange(next);
          }}
        />
        <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums">
          {t('settings.percent', { value: formatNumber(shown) })}
        </span>
      </div>
      {stops.length === 0 ? null : (
        <div className="flex flex-wrap gap-1">
          {stops.map((stop) => (
            <button
              key={stop.value}
              type="button"
              disabled={disabled}
              aria-pressed={shown === stop.value}
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs',
                shown === stop.value
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
              onClick={() => onChange(stop.value)}
            >
              {t(stop.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
