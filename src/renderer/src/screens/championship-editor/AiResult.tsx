import { useTranslation } from 'react-i18next';

import { OffsetStepper } from './OffsetStepper.tsx';
import type { AiLayer } from './types.ts';
import { offsetBounds } from './utils.ts';
import { AI_RANGE } from '../../../../shared/constants';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { useFormat } from '@/i18n';

interface AiResultProps {
  /**
   * The stepper's id, which the label points at.
   */
  id: string;
  /**
   * What the figure is, already translated.
   */
  label: string;
  /**
   * The player's own difficulty, out of settings.
   */
  base: number;
  /**
   * The offsets laid over it before this one - a championship's, a race's -
   * each named for the sum the box writes out.
   */
  layers: readonly AiLayer[];
  /**
   * What this box's own offset is called in that sum.
   */
  own: string;
  /**
   * This box's offset.
   */
  value: number | undefined;
  /**
   * How far one driver may sit either side of the class.
   */
  spread: number;
  /**
   * What either end of the scale means, already translated.
   */
  ends: readonly [string, string];
  /**
   * Whether nothing may change just now.
   */
  locked: boolean;
  /**
   * Called with the class's new offset.
   * @param next The offset, or undefined once emptied
   */
  onChange: (next: number | undefined) => void;
}

/**
 * Converts a figure to a percentage along the 0-100 scale.
 * @param figure The figure
 * @returns Its position, in percent
 */
const along = (figure: number): number => ((figure - AI_RANGE.min) / (AI_RANGE.max - AI_RANGE.min)) * 100;

/**
 * An AI figure as it will race: this layer's step, the figure it comes to and
 * the sum that makes it - the player's own, then every layer laid over it -
 * and a bar from 0 to 100 marking the band its drivers spread across. The step
 * stops where the figure would leave 0-100, since anything past it would be
 * clamped away unseen.
 */
export const AiResult = ({
  id, label, base, layers, own, value, spread, ends, locked, onChange,
}: AiResultProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const under = base + layers.reduce((sum, layer) => sum + (layer.value ?? 0), 0);
  const figure = aiFigure(under, value ?? 0);
  const low = aiFigure(figure, -spread);
  const high = aiFigure(figure, spread);
  const bounds = offsetBounds(under);

  /**
   * Writes an offset with its sign, so a step reads as one.
   * @param offset The offset
   * @returns The offset, signed
   */
  const signed = (offset: number): string => (offset > 0 ? `+${formatNumber(offset)}` : formatNumber(offset));

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="flex-1 text-sm font-medium">{label}</label>
        <div className="w-28">
          <OffsetStepper
            id={id}
            label={label}
            value={value}
            limit={bounds.max}
            min={bounds.min}
            disabled={locked}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-2xl leading-none font-bold tabular-nums">{formatNumber(figure)}</span>
        {/* The dots between the terms are drawn, so no literal sits in the markup. */}
        <span className="flex flex-wrap gap-x-1.5 text-xs text-muted-foreground [&>span+span]:before:mr-1.5 [&>span+span]:before:content-['·']">
          <span>
            {t('race.ai.yours')}
            {' '}
            <b className="font-semibold text-foreground tabular-nums">{formatNumber(base)}</b>
          </span>
          {layers.map((layer) => (
            <span key={layer.label}>
              {layer.label}
              {' '}
              <b className="font-semibold text-foreground tabular-nums">{signed(layer.value ?? 0)}</b>
            </span>
          ))}
          <span>
            {own}
            {' '}
            <b className="font-semibold text-foreground tabular-nums">{signed(value ?? 0)}</b>
          </span>
        </span>
      </div>

      <div className="relative h-6" aria-hidden>
        <div className="absolute inset-x-0 top-2.5 h-1.5 rounded-full bg-muted" />
        <div
          className="absolute top-2 h-2.5 rounded-full bg-primary/35"
          style={{ left: `${along(low)}%`, width: `${along(high) - along(low)}%` }}
        />
        {/* Where the class would sit with no step of its own. */}
        {aiFigure(under) === figure ? null : (
          <div className="absolute top-1.5 h-3.5 w-0.5 -translate-x-1/2 bg-muted-foreground/60" style={{ left: `${along(aiFigure(under))}%` }} />
        )}
        <div className="absolute top-1 h-4.5 w-[3px] -translate-x-1/2 rounded-sm bg-primary" style={{ left: `${along(figure)}%` }} />
      </div>

      <div className="flex items-center text-xs text-muted-foreground">
        <span className="flex-1">{ends[0]}</span>
        <span className="tabular-nums">{t('race.ai.drivers', { low: formatNumber(low), high: formatNumber(high) })}</span>
        <span className="flex-1 text-right">{ends[1]}</span>
      </div>
    </div>
  );
};
