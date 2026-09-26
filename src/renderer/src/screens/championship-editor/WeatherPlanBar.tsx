import { useTranslation } from 'react-i18next';

import type { WeatherStep } from '../../../../shared/types';
import { WEATHER_ICON, WEATHER_TYPE_LABEL, weatherKindOf } from '@/components';
import { cn } from '@/lib/utils.ts';

interface WeatherPlanBarProps {
  /**
   * The plan's slots, in the order they run.
   */
  steps: readonly WeatherStep[];
}

/**
 * A weather plan against the race: each stretch as wide as its minutes and in
 * its weather's colour from the picker beside it, the last one - which holds
 * until the flag - striped and open-ended.
 */
export const WeatherPlanBar = ({ steps }: WeatherPlanBarProps) => {
  const { t } = useTranslation();
  const timed = steps.slice(0, -1).reduce((total, step) => total + (step.minutes ?? 0), 0);
  // The open-ended stretch is drawn as a third of the bar, whatever the rest is.
  const whole = Math.max(1, timed * 1.5);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-9 overflow-hidden rounded-md border">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const type = typeof step.weather === 'number' ? step.weather : undefined;
          const Icon = type === undefined ? null : WEATHER_ICON[type];
          const length = last ? t('editor.weather.toEnd') : t('editor.weather.forMinutes', { count: step.minutes ?? 0 });
          const said = type === undefined ? length : `${t(WEATHER_TYPE_LABEL[type])} · ${length}`;

          return (
            <div
              // Slots carry no identity of their own, so their position is their key.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={cn(
                'flex min-w-0 items-center gap-1.5 overflow-hidden border-r-2 border-card px-2 text-xs font-semibold whitespace-nowrap last:border-r-0',
                (type === undefined ? undefined : weatherKindOf(type)?.accent) ?? 'bg-muted',
                last && 'flex-1 bg-[repeating-linear-gradient(135deg,transparent_0_8px,color-mix(in_oklch,var(--card)_35%,transparent)_8px_16px)]',
              )}
              style={last ? undefined : { width: `${((step.minutes ?? 0) / whole) * 100}%` }}
            >
              {Icon === null ? null : <Icon className="size-3.5 shrink-0" />}
              <span className="truncate">{said}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{t('editor.weather.green')}</span>
        <span>{t('editor.weather.forMinutes', { count: timed })}</span>
        <span>{t('editor.weather.chequered')}</span>
      </div>
    </div>
  );
};
