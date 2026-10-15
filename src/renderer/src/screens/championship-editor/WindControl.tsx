
import { MAX_WIND } from './constants.ts';
import type { Conditions } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import { useKindTranslation } from '@/i18n';
import { Field, fromNumber, toNumber } from '@/screens/race';

/**
 * A full turn, in degrees.
 */
const FULL_TURN = 360;

interface WindControlProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * The conditions whose wind this is.
   */
  conditions: Conditions;
  /**
   * Whether nothing may change just now.
   */
  disabled?: boolean;
  /**
   * Called with the conditions whenever the wind changes.
   * @param next The conditions
   */
  onChange: (next: Conditions) => void;
}

/**
 * The wind: how strong, as the range it gusts between, and where from, with
 * a compass that points the way it blows.
 */
export const WindControl = ({
  idPrefix, conditions, disabled, onChange,
}: WindControlProps) => {
  const { t } = useKindTranslation();
  const direction = conditions.windDirection ?? 0;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field id={`${idPrefix}-wind-min`} label={t('editor.wind.from')}>
          <Input
            id={`${idPrefix}-wind-min`}
            type="number"
            min={0}
            max={MAX_WIND}
            className="w-24 text-right tabular-nums"
            value={fromNumber(conditions.windMin)}
            disabled={disabled}
            onChange={(event) => onChange({ ...conditions, windMin: toNumber(event.target.value) })}
          />
        </Field>
        <Field id={`${idPrefix}-wind-max`} label={t('editor.wind.to')}>
          <Input
            id={`${idPrefix}-wind-max`}
            type="number"
            min={0}
            max={MAX_WIND}
            className="w-24 text-right tabular-nums"
            value={fromNumber(conditions.windMax)}
            disabled={disabled}
            onChange={(event) => onChange({ ...conditions, windMax: toNumber(event.target.value) })}
          />
        </Field>
      </div>
      <div className="flex items-end gap-3">
        <Field id={`${idPrefix}-wind-direction`} label={t('race.conditions.windDirection')}>
          <Input
            id={`${idPrefix}-wind-direction`}
            type="number"
            min={0}
            max={FULL_TURN - 1}
            className="w-24 text-right tabular-nums"
            value={fromNumber(conditions.windDirection)}
            disabled={disabled}
            onChange={(event) => onChange({ ...conditions, windDirection: toNumber(event.target.value) })}
          />
        </Field>
        {/* Drawn in the text colour, north up. */}
        <svg viewBox="0 0 40 40" className="size-12 shrink-0 text-muted-foreground" aria-hidden>
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <text x="20" y="9" textAnchor="middle" fontSize="6" fill="currentColor">{t('editor.wind.north')}</text>
          <g transform={`rotate(${direction} 20 20)`} className="text-primary">
            <line x1="20" y1="30" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 10 L16 16 L24 16 Z" fill="currentColor" />
          </g>
        </svg>
      </div>
    </div>
  );
};
