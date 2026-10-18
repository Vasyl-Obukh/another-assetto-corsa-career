import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import type { AiBase } from '../../../../shared/types';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface OpponentsFieldsProps {
  /**
   * The strength and aggression shown.
   */
  value: AiBase;
  /**
   * The app's own, for a career's figures to say where they part from it.
   */
  app?: AiBase;
  /**
   * Whether they cannot be moved, because a career is following the app's.
   */
  disabled?: boolean;
  /**
   * Moves one of them, once the thumb is let go.
   * @param next Both figures as they now stand
   */
  onChange(next: AiBase): void;
}

/**
 * The AI's strength and aggression as two sliders - the app's, or a career's
 * own.
 */
export const OpponentsFields = ({
  value, app, disabled = false, onChange,
}: OpponentsFieldsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  // Held while dragging and written once the thumb is let go, so a drag is one
  // write rather than one per step.
  const [dragged, setDragged] = useState<Partial<AiBase>>({});

  const figures = [
    {
      key: 'strength', label: t('settings.opponentsStrength'), low: formatNumber(AI_RANGE.min), high: formatNumber(AI_RANGE.max),
    },
    {
      key: 'aggression', label: t('settings.opponentsAggression'), low: t('settings.aggressionLow'), high: t('settings.aggressionHigh'),
    },
  ] as const;

  return (
    <div className={cn('grid gap-x-10 gap-y-5 md:grid-cols-2', disabled && 'opacity-55')}>
      {figures.map(({
        key, label, low, high,
      }) => {
        const shown = dragged[key] ?? value[key];

        return (
          <div key={key} className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
              {label}
              <span className="flex items-baseline gap-2">
                {app && app[key] !== shown ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    {t('settings.follow.app', { value: formatNumber(app[key]) })}
                  </span>
                ) : null}
                <span className="text-2xl font-semibold tabular-nums">{formatNumber(shown)}</span>
              </span>
            </span>
            <Slider
              min={AI_RANGE.min}
              max={AI_RANGE.max}
              step={1}
              value={[shown]}
              disabled={disabled}
              aria-label={label}
              onValueChange={([next]) => setDragged({ ...dragged, [key]: next })}
              onValueCommit={([next]) => {
                setDragged({});
                onChange({ ...value, [key]: next });
              }}
            />
            <span className="flex justify-between text-xs text-muted-foreground">
              <span>{low}</span>
              <span>{high}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};
