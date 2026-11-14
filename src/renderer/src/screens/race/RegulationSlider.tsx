import { useTranslation } from 'react-i18next';

import type { RegulationSpec } from './types.ts';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface RegulationSliderProps {
  /**
   * Which regulation, and how its slider runs.
   */
  spec: RegulationSpec;
  /**
   * The value stated, or undefined for Assetto Corsa's own.
   */
  value: number | undefined;
  /**
   * Assetto Corsa's own figure, which is also what real means.
   */
  real: number;
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * Called with the new value, or undefined to leave it to Assetto Corsa.
   * @param next The value
   */
  onChange: (next: number | undefined) => void;
}

/**
 * The classes for one of the chips under the slider.
 * @param active Whether it is the value in force
 * @returns The chip's classes
 */
const chipClass = (active: boolean): string => cn(
  'rounded-full border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-50',
  active
    ? 'border-primary bg-primary/10 font-semibold text-primary'
    : 'text-muted-foreground hover:border-foreground/40 hover:text-foreground',
);

/**
 * A measured regulation - fuel, wear, slipstream - as a slider from
 * nothing up to its most, with a tick where real sits, the points worth naming
 * as chips, and a Default chip that hands it back to Assetto Corsa.
 */
export const RegulationSlider = ({
  spec, value, real, disabled, onChange,
}: RegulationSliderProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const shown = value ?? real;

  /**
   * Writes a value the way the regulation reads.
   * @param figure The value
   * @returns It, as a multiple of real
   */
  const written = (figure: number): string => t('race.regulations.times', { value: formatNumber(figure) });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={spec.id} className="flex-1 text-sm font-medium">{t(`race.regulations.${spec.key}`)}</label>
        {value === undefined ? (
          <span className="text-xs text-muted-foreground">{t('race.regulations.defaultIs', { value: written(real) })}</span>
        ) : (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
            {value === real ? t('race.regulations.isReal', { value: written(value) }) : written(value)}
          </span>
        )}
      </div>

      <div className={cn('relative px-1 py-1.5', value === undefined && 'opacity-45')}>
        {/* Where real sits, so a value reads as how far off it is. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50"
          style={{ left: `calc(0.25rem + (100% - 0.5rem) * ${real / spec.max})` }}
        />
        <Slider
          id={spec.id}
          min={0}
          max={spec.max}
          step={spec.step}
          value={[shown]}
          disabled={disabled}
          aria-label={t(`race.regulations.${spec.key}`)}
          // A tenth at a time drifts in floating point; held to the step.
          onValueChange={([next]) => onChange(Number((Math.round((next ?? shown) / spec.step) * spec.step).toFixed(2)))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {spec.stops.map((stop) => (
          <button
            key={stop.value}
            type="button"
            disabled={disabled}
            aria-pressed={value === stop.value}
            className={chipClass(value === stop.value)}
            onClick={() => onChange(stop.value)}
          >
            {stop.label ? t(stop.label) : written(stop.value)}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={value === undefined}
          className={cn('ml-auto', chipClass(value === undefined))}
          onClick={() => onChange(undefined)}
        >
          {t('race.regulations.default')}
        </button>
      </div>
    </div>
  );
};
