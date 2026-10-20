import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PROGRESSION_SPEEDS } from '../../../../shared/constants';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface ProgressionSliderProps {
  /**
   * The speed picked, one of `PROGRESSION_SPEEDS`.
   */
  value: number;
  /**
   * Picks a speed, once the slider is let go.
   * @param next The speed picked
   */
  onChange: (next: number) => void;
  /**
   * Whether it is held still.
   */
  disabled?: boolean;
}

/**
 * A career's progression speed as a slider over the speeds it may run at,
 * every one named under it - the range is known, so it is never typed.
 */
export const ProgressionSlider = ({ value, onChange, disabled = false }: ProgressionSliderProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  // Held while it is dragged, so a drag across several speeds is one change
  // rather than a ledger line per step.
  const [dragged, setDragged] = useState<number | null>(null);
  const at = dragged ?? Math.max(0, PROGRESSION_SPEEDS.indexOf(value as typeof PROGRESSION_SPEEDS[number]));
  const name = (speed: number): string => t('finances.speed', { speed: formatNumber(speed) });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-2xl font-semibold tabular-nums">{name(PROGRESSION_SPEEDS[at])}</span>
      <Slider
        min={0}
        max={PROGRESSION_SPEEDS.length - 1}
        step={1}
        value={[at]}
        disabled={disabled}
        aria-label={t('finances.progression')}
        onValueChange={([next]) => setDragged(next)}
        onValueCommit={([next]) => {
          setDragged(null);
          onChange(PROGRESSION_SPEEDS[next] ?? value);
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        {PROGRESSION_SPEEDS.map((speed, index) => (
          <span key={speed} className={cn(index === at && 'font-semibold text-foreground')}>{name(speed)}</span>
        ))}
      </div>
    </div>
  );
};
