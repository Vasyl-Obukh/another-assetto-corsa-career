import { useTranslation } from 'react-i18next';

import { TIME_PRESETS, TIME_STEP_MINUTES } from './constants.ts';
import { minutesOf } from './utils.ts';
import { HOURS_PER_DAY, MINUTES_PER_HOUR } from '../../../../shared/constants';
import { clockOf } from '../../../../shared/utils/road-temperature';

/**
 * The minutes in a day, which the bar spans.
 */
const DAY_MINUTES = HOURS_PER_DAY * MINUTES_PER_HOUR;

/**
 * The hours the bar is marked at.
 */
const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

interface TimeOfDayControlProps {
  /**
   * The slider's id, which a label points at.
   */
  id: string;
  /**
   * The time, as HH:MM or as decimal hours.
   */
  value: string | number | undefined;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Called with the time chosen.
   * @param next The time, as HH:MM
   */
  onChange: (next: string) => void;
}

/**
 * The time of day across the whole of it, midnight to midnight: the sky
 * drawn from night through day and back, a handle on it, and a few places to
 * jump to.
 */
export const TimeOfDayControl = ({
  id, value, disabled, onChange,
}: TimeOfDayControlProps) => {
  const { t } = useTranslation();
  const minutes = minutesOf(value) ?? DAY_MINUTES / 2;
  const at = (minutes / DAY_MINUTES) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative pt-7">
        <div className="h-9 rounded-lg bg-[linear-gradient(90deg,var(--color-sky-night)_0%,var(--color-sky-night)_20%,var(--color-sky-dawn)_27%,var(--color-sky-day)_36%,var(--color-sky-day)_72%,var(--color-sky-dusk)_83%,var(--color-sky-night)_92%,var(--color-sky-night)_100%)]" />
        <div className="pointer-events-none absolute top-5 h-13 w-1 -translate-x-1/2 rounded-full bg-foreground" style={{ left: `${at}%` }}>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-xs font-bold whitespace-nowrap text-background tabular-nums">
            {clockOf(minutes)}
          </span>
        </div>
        {/* The slider itself, laid invisibly over the sky: the keyboard and a
            drag both move it, and the drawing follows. */}
        <input
          id={id}
          type="range"
          min={0}
          max={DAY_MINUTES - TIME_STEP_MINUTES}
          step={TIME_STEP_MINUTES}
          value={minutes}
          disabled={disabled}
          aria-valuetext={clockOf(minutes)}
          className="absolute inset-x-0 top-7 h-9 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => onChange(clockOf(Number(event.target.value)))}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        {TICKS.map((hour) => <span key={hour}>{t('editor.time.hour', { hour: String(hour).padStart(2, '0') })}</span>)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t('editor.time.jump')}</span>
        {(Object.keys(TIME_PRESETS) as (keyof typeof TIME_PRESETS)[]).map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            className="rounded-full border bg-card px-2.5 py-0.5 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onChange(TIME_PRESETS[preset])}
          >
            {t(`editor.time.${preset}`)}
          </button>
        ))}
      </div>
    </div>
  );
};
