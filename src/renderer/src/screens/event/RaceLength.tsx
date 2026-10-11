import { ClockIcon, FuelIcon, TrophyIcon } from 'lucide-react';
import { useState } from 'react';
import type { PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { SLIDER_THUMB_PX } from './constants.ts';
import { scaleName, shortLaps } from './utils.ts';
import {
  MIN_SCALED_LAPS, RACE_SCALES, scalesFor,
} from '../../../../shared/utils/race-scale';
import { Slider } from '@/components/ui/slider.tsx';
import { useFormat } from '@/i18n';

interface RaceLengthProps {
  /**
   * The race's full length, in laps.
   */
  laps: number;
  /**
   * The factor it is shortened by, one for the full race.
   */
  scale: number;
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * Called with the step picked.
   * @param scale The factor, one for the full race
   */
  onChange: (scale: number) => void;
}

/**
 * Where a step sits along the bar, as a CSS length.
 * @param at Which step, counting from the shortest
 * @param count How many steps there are
 * @returns Its offset from the bar's left edge
 */
const stepLeft = (at: number, count: number): string => (
  `calc(${SLIDER_THUMB_PX / 2}px + (100% - ${SLIDER_THUMB_PX}px) * ${count > 1 ? at / (count - 1) : 1})`
);

/**
 * How long the next race runs: a bar of the steps its length offers, shortest
 * on the left and the full race on the right, so dragging right lengthens it.
 * The bar is the only control - hovering it names the step under the pointer -
 * and what shortening changes is said under it once it does.
 */
export const RaceLength = ({
  laps, scale, disabled, onChange,
}: RaceLengthProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const [hover, setHover] = useState<number | null>(null);

  const steps = scalesFor(laps).toReversed();
  // A step the race does not offer reads as the full race, which is the right
  // end of the bar rather than its left.
  const found = steps.indexOf(scale);
  const at = found < 0 ? steps.length - 1 : found;
  const shortest = steps[0] ?? 1;

  /**
   * Finds the step nearest the pointer.
   * @param event The pointer moving over the bar
   */
  const track = (event: PointerEvent<HTMLDivElement>): void => {
    if (disabled || steps.length < 2) return;
    const box = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - box.left - SLIDER_THUMB_PX / 2) / (box.width - SLIDER_THUMB_PX);
    setHover(Math.round(Math.min(1, Math.max(0, share)) * (steps.length - 1)));
  };
  const hovered = hover === null ? undefined : steps[hover];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium">{t('event.length.title')}</span>
          <span className="text-xs text-muted-foreground">{t('event.length.hint')}</span>
        </div>
        {/* The step in force wears primary, as every regulation slider's does;
            the full race is the resting state and stays plain. */}
        {scale === 1 ? (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {t('event.length.fullValue', { laps: shortLaps(laps, 1, t) })}
          </span>
        ) : (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-primary tabular-nums">
            {t('event.length.step', { share: scaleName(scale, t), laps: shortLaps(laps, scale, t) })}
          </span>
        )}
      </div>

      <div
        className="relative mt-1"
        onPointerMove={track}
        onPointerLeave={() => setHover(null)}
      >
        {/* A dot per step, over the track and under the thumb. */}
        {steps.map((step, index) => (
          <span
            key={step}
            aria-hidden
            className={`pointer-events-none absolute top-1/2 z-[1] size-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${index === hover ? 'bg-primary' : 'bg-muted-foreground/55'}`}
            style={{ left: stepLeft(index, steps.length) }}
          />
        ))}
        <Slider
          min={0}
          max={steps.length - 1}
          step={1}
          value={[at]}
          disabled={disabled || steps.length < 2}
          aria-label={t('event.length.title')}
          // The padding is the slider's own, so the whole band that names a
          // step on hover also takes the click, and says so with the cursor.
          className="cursor-pointer py-1.5 data-[disabled]:cursor-not-allowed [&_[data-slot=slider-thumb]]:relative [&_[data-slot=slider-thumb]]:z-[2]"
          onValueChange={([index]) => onChange(steps[index ?? at] ?? 1)}
        />
        {/* Drawn as ui/tooltip.tsx draws one, since Radix's needs an element
            per step and the bar is one control. */}
        {hovered !== undefined && hover !== null ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full z-[3] mb-1.5 -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs whitespace-nowrap text-background tabular-nums"
            style={{ left: stepLeft(hover, steps.length) }}
          >
            {t('event.length.step', { share: scaleName(hovered, t), laps: shortLaps(laps, hovered, t) })}
            <span aria-hidden className="absolute top-full left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-foreground" />
          </span>
        ) : null}
      </div>

      {/* Said only where the race stops short of the shortest step there is. */}
      {steps.length > 1 && shortest !== RACE_SCALES.at(-1) ? (
        <span className="text-xs text-muted-foreground">
          {t('event.length.floor', {
            share: scaleName(shortest, t),
            laps: t('championships.format.laps', { count: MIN_SCALED_LAPS }),
          })}
        </span>
      ) : null}

      {scale > 1 ? (
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          <li className="flex items-start gap-1.5">
            <ClockIcon className="mt-px size-3.5 shrink-0" />
            {t('event.length.clock', { clock: formatNumber(scale) })}
          </li>
          <li className="flex items-start gap-1.5">
            <FuelIcon className="mt-px size-3.5 shrink-0" />
            {t('event.length.wear')}
          </li>
          <li className="flex items-start gap-1.5">
            <TrophyIcon className="mt-px size-3.5 shrink-0" />
            {t('event.length.points')}
          </li>
        </ul>
      ) : null}
    </div>
  );
};
