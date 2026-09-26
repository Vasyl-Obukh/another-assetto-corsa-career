import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WEATHER_KINDS } from './constants.ts';
import type { WeatherType } from '../../../../shared/constants';
import { WEATHER_ICON, WEATHER_TYPE_LABEL } from '../weather-forecast/index.ts';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface WeatherPickerProps {
  /**
   * The weather picked, if any.
   */
  value: WeatherType | undefined;
  /**
   * The types that may be picked - what the install, the weather system and
   * the settings offer, and whatever is picked already.
   */
  offered: readonly WeatherType[];
  /**
   * Whether a line in the kind's colour says what is picked. Off where the
   * picker sits under something that says so already.
   */
  banner?: boolean;
  /**
   * Whether nothing may change just now.
   */
  disabled?: boolean;
  /**
   * Called with the weather picked.
   * @param type The weather
   */
  onPick: (type: WeatherType) => void;
}

/**
 * Picks a weather in two steps: what kind - skies, rain, snow - and then how
 * much of it, as one strip lightest to heaviest. A type nothing offers stays in
 * its strip struck through, so it is plain why it cannot be picked.
 */
export const WeatherPicker = ({
  value, offered, banner = true, disabled = false, onPick,
}: WeatherPickerProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const holding = value === undefined ? -1 : WEATHER_KINDS.findIndex((kind) => kind.types.includes(value));
  // Opens on the kind of the weather held, or the first anything is offered in.
  const [open, setOpen] = useState(() => {
    if (holding >= 0) return holding;
    return Math.max(0, WEATHER_KINDS.findIndex((kind) => kind.types.some((type) => offered.includes(type))));
  });
  const shown = WEATHER_KINDS[open];
  const held = holding >= 0 ? WEATHER_KINDS[holding] : undefined;
  const HeldIcon = value === undefined ? undefined : WEATHER_ICON[value];

  return (
    <div className="@container flex flex-col gap-3">
      {banner && held && HeldIcon && value !== undefined ? (
        <div aria-live="polite" className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5', held.accent)}>
          <HeldIcon className="size-6 shrink-0" />
          <span className="flex min-w-0 flex-col">
            <b className="truncate text-sm font-semibold">{t(WEATHER_TYPE_LABEL[value])}</b>
            <span className="truncate text-xs opacity-80">{t(held.label)}</span>
          </span>
        </div>
      ) : null}

      <div role="tablist" aria-label={t('weatherPicker.kinds')} className="grid grid-cols-3 gap-2 @xl:grid-cols-6">
        {WEATHER_KINDS.map((kind, index) => {
          const Icon = kind.icon;
          const count = kind.types.filter((type) => offered.includes(type)).length;

          return (
            <button
              key={kind.label}
              type="button"
              role="tab"
              aria-selected={open === index}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 rounded-lg border bg-card px-1.5 py-2 text-center text-xs font-medium',
                open === index ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
                count === 0 && open !== index && 'opacity-60',
              )}
              onClick={() => setOpen(index)}
            >
              <Icon className={cn('size-5', kind.tint)} />
              <span className="w-full leading-tight text-balance">{t(kind.label)}</span>
              <span className="text-[0.7rem] font-normal text-muted-foreground tabular-nums">{formatNumber(count)}</span>
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label={t(shown.label)} className="flex flex-wrap gap-px overflow-hidden rounded-lg border bg-border">
        {shown.types.map((type, index) => {
          const on = value === type;
          const pickable = offered.includes(type);

          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled || !pickable}
              className={cn(
                // A third of the row each when narrow, the last row stretched to
                // fill it; one row when there is room.
                'flex min-w-0 grow basis-[calc(33.333%-1px)] flex-col items-center justify-between gap-1 bg-card px-1.5 py-2',
                'text-center text-xs @xl:basis-0',
                'disabled:cursor-not-allowed',
                on ? cn('font-semibold', shown.accent) : pickable && 'hover:bg-accent/50',
                !pickable && 'text-muted-foreground line-through opacity-60',
              )}
              onClick={() => onPick(type)}
            >
              <span className="w-full leading-tight text-balance">{t(WEATHER_TYPE_LABEL[type])}</span>
              {/* How heavy it is, along the strip. */}
              <span
                aria-hidden
                className="h-1 rounded-full bg-current opacity-50"
                style={{ width: `${((index + 1) / shown.types.length) * 70}%` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
