import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MIN_POINTS, POINTS_SHOWN } from './constants.ts';
import { withPlace } from './utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { POINTS_ACCENT, resultAccent, SESSION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { fromNumber, toNumber } from '@/screens/race';

interface PlaceStripProps {
  /**
   * Prefix for the cells' ids.
   */
  idPrefix: string;
  /**
   * Which places these are: finishing places, or qualifying places, pole first.
   */
  kind: 'finish' | 'qualifying';
  /**
   * What each place scores, the first first.
   */
  values: readonly number[];
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * A line beside the buttons under the strip, already translated.
   */
  summary: string;
  /**
   * Called with the whole table whenever a place changes.
   * @param next What each place scores
   */
  onChange: (next: number[]) => void;
}

/**
 * A table of places as a strip that wraps: each place a labelled box, and a
 * + after the last one for another. Long tables fold after fifteen places.
 * Each label is coloured as a results table colours that place - the podium's
 * metals, then green for any place that scores - with pole in qualifying's own
 * colour, so the table reads as what it will pay.
 */
export const PlaceStrip = ({
  idPrefix, kind, values, disabled, summary, onChange,
}: PlaceStripProps) => {
  const { t } = useTranslation();
  const [all, setAll] = useState(false);
  const shown = all ? values.length : Math.min(values.length, POINTS_SHOWN);
  const folded = values.length > POINTS_SHOWN && !all;

  /**
   * Labels one place.
   * @param place Which place, counting from zero
   * @returns Its label, already translated
   */
  const labelOf = (place: number): string => {
    if (kind === 'finish') return t('championships.detail.position', { number: place + 1 });

    return place === 0 ? t('editor.points.pole') : t('editor.points.qualifyingPlace', { number: place + 1 });
  };

  /**
   * Colours one place's label.
   * @param place Which place, counting from zero
   * @param value What it scores
   * @returns Its classes, or undefined for a place that stays plain
   */
  const accentOf = (place: number, value: number): string | undefined => {
    if (kind === 'finish') return resultAccent(place + 1, value > 0);
    if (place === 0) return SESSION_ACCENT.qualify;

    return value > 0 ? POINTS_ACCENT : undefined;
  };

  return (
    <div className="flex flex-col gap-2">
      <ol className="flex flex-wrap gap-1.5">
        {values.slice(0, shown).map((value, place) => (
          // By place: a table is never reordered.
          // eslint-disable-next-line react/no-array-index-key
          <li key={place} className="flex w-16 flex-col items-center gap-1">
            <Badge
              variant="outline"
              className={cn('min-w-9 justify-center tabular-nums', accentOf(place, value))}
            >
              {labelOf(place)}
            </Badge>
            <Input
              id={`${idPrefix}-${place}`}
              type="number"
              min={MIN_POINTS}
              aria-label={labelOf(place)}
              className="h-8 px-1 text-center tabular-nums"
              value={fromNumber(value)}
              disabled={disabled}
              onChange={(event) => onChange(withPlace(values, place, toNumber(event.target.value) ?? 0))}
            />
          </li>
        ))}
        {folded ? null : (
          <li className="flex w-16 flex-col justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-8 border-dashed text-muted-foreground"
              aria-label={t('editor.points.addPlace')}
              disabled={disabled}
              onClick={() => onChange([...values, 0])}
            >
              <PlusIcon />
            </Button>
          </li>
        )}
      </ol>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="-ml-2"
          disabled={disabled || values.length === 0}
          onClick={() => onChange(values.slice(0, -1))}
        >
          <MinusIcon />
          {t('editor.points.dropPlace')}
        </Button>
        <span className="text-xs text-muted-foreground">{summary}</span>
        {values.length > POINTS_SHOWN ? (
          <Button type="button" size="sm" variant="link" className="h-auto px-0" onClick={() => setAll(!all)}>
            {all ? t('championships.detail.showFewer') : t('championships.detail.showAll', { count: values.length })}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
