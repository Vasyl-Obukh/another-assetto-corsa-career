
import { ChoiceChips } from './ChoiceChips.tsx';
import { AMBIENT_RANGE, ROAD_KINDS, ROAD_RANGE } from './constants.ts';
import type { RoadKind } from './types.ts';
import { DEFAULT_AMBIENT, DEFAULT_TIME_OF_DAY } from '../../../../shared/constants';
import type { Conditions } from '../../../../shared/types';
import { followedRoad } from '../../../../shared/utils/road-temperature';
import { Slider } from '@/components/ui/slider.tsx';
import { useUnits } from '@/hooks';
import { useKindTranslation } from '@/i18n';

interface TemperatureControlProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * The conditions whose temperatures these are.
   */
  conditions: Conditions;
  /**
   * The temperature coefficient of the weather these conditions run, which
   * decides how far the sun warms the road. Left out where nothing says.
   */
  coeff?: number;
  /**
   * Whether nothing may change just now.
   */
  disabled?: boolean;
  /**
   * Called with the conditions whenever a temperature changes.
   * @param next The conditions
   */
  onChange: (next: Conditions) => void;
}

/**
 * Converts a road temperature to a percentage along its slider.
 * @param value The temperature
 * @returns Its position, in percent
 */
const along = (value: number): number => ((value - ROAD_RANGE.min) / (ROAD_RANGE.max - ROAD_RANGE.min)) * 100;

/**
 * The air on a slider across the range a championship races in, and the
 * road, which follows the air and the sun - and says what that comes to -
 * unless it is set on a slider of its own.
 */
export const TemperatureControl = ({
  idPrefix, conditions, coeff, disabled, onChange,
}: TemperatureControlProps) => {
  const { t } = useKindTranslation();
  const units = useUnits();
  const ambient = conditions.ambient ?? DEFAULT_AMBIENT;
  const clock = conditions.timeOfDay ?? DEFAULT_TIME_OF_DAY;
  // Kunos' curve, as race.ini will write it. Approximate where the weather
  // behind it is inherited rather than named here, hence the "about".
  const followed = followedRoad(clock, ambient, coeff);
  const held = Math.min(ROAD_RANGE.max, Math.max(ROAD_RANGE.min, followed));
  const { road } = conditions;

  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-ambient`} className="flex items-baseline justify-between text-sm font-medium">
          {t('race.conditions.ambient')}
          <span className="text-sm font-semibold tabular-nums">{units.format('temperature', ambient)}</span>
        </label>
        <input
          id={`${idPrefix}-ambient`}
          type="range"
          min={AMBIENT_RANGE.min}
          max={AMBIENT_RANGE.max}
          value={ambient}
          disabled={disabled}
          className="w-full accent-primary disabled:cursor-not-allowed"
          onChange={(event) => onChange({ ...conditions, ambient: Number(event.target.value) })}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>{units.format('temperature', AMBIENT_RANGE.min)}</span>
          <span>{units.format('temperature', AMBIENT_RANGE.max)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">{t('editor.temperature.road')}</span>
          {/* Neutral on purpose: two ways of stating one figure. */}
          <ChoiceChips<RoadKind>
            label={t('editor.temperature.road')}
            options={ROAD_KINDS}
            value={road === undefined ? 'follows' : 'set'}
            labelOf={(kind) => t(kind === 'follows' ? 'editor.temperature.roadFollows' : 'editor.temperature.roadSet')}
            disabled={disabled}
            onChange={(kind) => onChange({ ...conditions, road: kind === 'set' ? held : undefined })}
          />
        </div>

        {road === undefined ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-bold tabular-nums">
                {t('editor.temperature.about', { value: units.format('temperature', followed) })}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('editor.temperature.followsAt', { time: clock, ambient: units.format('temperature', ambient) })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{t('editor.temperature.followsHint')}</span>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-bold tabular-nums">{units.format('temperature', road)}</span>
              <span className="text-xs text-muted-foreground">
                {t('editor.temperature.wouldFollow', { value: units.format('temperature', followed) })}
              </span>
            </div>
            <div className="relative py-1.5">
              {/* Where following the air would put it. */}
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted-foreground/70"
                style={{ left: `${along(held)}%` }}
              />
              <Slider
                id={`${idPrefix}-road`}
                min={ROAD_RANGE.min}
                max={ROAD_RANGE.max}
                step={1}
                value={[road]}
                disabled={disabled}
                aria-label={t('editor.temperature.road')}
                onValueChange={([next]) => onChange({ ...conditions, road: next ?? road })}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
              <span>{units.format('temperature', ROAD_RANGE.min)}</span>
              <span>{units.format('temperature', ROAD_RANGE.max)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
