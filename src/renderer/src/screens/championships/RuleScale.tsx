import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import type { RegulationSpec } from '@/screens/race';

interface RuleScaleProps {
  /**
   * The regulation, with the editor's own range and named stops.
   */
  spec: RegulationSpec;
  /**
   * What the rules state, or undefined where they leave it to Assetto Corsa.
   */
  value: number | undefined;
  /**
   * Assetto Corsa's own figure, which an unset rule races at.
   */
  real: number;
}

// One measured rule drawn as the editor's slider is, read-only: the same range
// and stops, the value marked and filled to. Left unset, the marker sits on
// Assetto Corsa's own figure, dashed and unfilled, and the figure says Default.
export const RuleScale = ({ spec, value, real }: RuleScaleProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const shown = value ?? real;
  // To the last named stop rather than the editor's own top, which runs well
  // past it, so the stops spread across a narrow card - further only where the
  // rules themselves go past it.
  const top = Math.max(spec.stops.at(-1)?.value ?? spec.max, shown);
  const at = (point: number): string => `calc(0.25rem + (100% - 0.5rem) * ${point / top})`;
  const written = (point: number): string => t('race.regulations.times', { value: formatNumber(point) });

  let figure = written(shown);
  if (value === undefined) figure = t('race.regulations.defaultIs', { value: written(real) });
  else if (value === real) figure = t('race.regulations.isReal', { value: written(value) });

  return (
    <div className="grid grid-cols-[9.5rem_minmax(0,1fr)_8.5rem] items-center gap-3 border-t py-2 text-sm first:border-t-0">
      <span className="font-medium">{t(`race.regulations.${spec.key}`)}</span>
      <div className="relative h-7">
        <span className="absolute inset-x-1 top-1.5 h-1 rounded-full bg-muted" />
        {value === undefined ? null : (
          <span
            className="absolute left-1 top-1.5 h-1 rounded-full bg-primary/70"
            style={{ width: `calc((100% - 0.5rem) * ${shown / top})` }}
          />
        )}
        {spec.stops.map((stop) => (
          <span key={stop.value}>
            <span
              className="absolute top-1 size-1.5 -translate-x-1/2 rounded-full bg-muted-foreground/45"
              style={{ left: at(stop.value) }}
            />
            <span
              className={cn(
                'absolute top-3.5 -translate-x-1/2 text-[0.65rem] whitespace-nowrap text-muted-foreground',
                value === stop.value && 'font-semibold text-primary',
              )}
              style={{ left: at(stop.value) }}
            >
              {stop.label ? t(stop.label) : t('race.regulations.times', { value: formatNumber(stop.value) })}
            </span>
          </span>
        ))}
        <span
          className={cn(
            'absolute top-0.5 size-3 -translate-x-1/2 rounded-full border-2 bg-card',
            value === undefined ? 'border-dashed border-muted-foreground' : 'border-primary',
          )}
          style={{ left: at(shown) }}
        />
      </div>
      <span className={cn('text-right tabular-nums', value === undefined ? 'text-muted-foreground' : 'font-semibold')}>
        {figure}
      </span>
    </div>
  );
};
