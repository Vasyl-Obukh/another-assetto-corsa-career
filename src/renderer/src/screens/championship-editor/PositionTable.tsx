import { MinusIcon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { PODIUM_ACCENT } from '@/lib/accents';
import { toNumber } from '@/screens/race';

interface PositionTableProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * The already-translated heading for the table.
   */
  label: string;
  /**
   * An already-translated line under it, when one is worth having.
   */
  hint?: string;
  /**
   * An already-translated line for a table that pays nothing at all.
   */
  empty: string;
  /**
   * What each position is worth, the winner first.
   */
  values: readonly number[];
  /**
   * The lowest figure a position may be given.
   */
  min: number;
  /**
   * Whether nothing here may change - a weekend under way, or a row open
   * elsewhere in the editor.
   */
  disabled: boolean;
  /**
   * Called with the whole table whenever any part of it changes.
   * @param next What each position is worth
   */
  onChange: (next: readonly number[]) => void;
}

/**
 * A ranked table of figures: points by finishing or qualifying position, or
 * prize money.
 *
 * It grows and shrinks at the end rather than offering a Remove per position:
 * taking a place out of the middle renumbers every place below it, which is not
 * a change anybody means to make while editing a figure.
 */
export const PositionTable = ({
  idPrefix, label, hint, empty, values, min, disabled, onChange,
}: PositionTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint === undefined ? null : (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>

      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <div
              // The position is the only key there is, and a table is never
              // reordered.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex w-24 min-w-0 flex-col gap-1.5"
            >
              {/* PODIUM_ACCENT is three long, so fourth down keeps the outline. */}
              <label htmlFor={`${idPrefix}-${index}`} className="w-fit">
                <Badge variant="outline" className={PODIUM_ACCENT[index]}>
                  {t('championships.points.position', { number: index + 1 })}
                </Badge>
              </label>

              <Input
                id={`${idPrefix}-${index}`}
                type="number"
                min={min}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(values.map((own, at) => (
                  // Zero rather than nothing: a place in the middle of a table
                  // cannot be absent.
                  at === index ? toNumber(event.target.value) ?? 0 : own
                )))}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          id={`${idPrefix}-add`}
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange([...values, 0])}
        >
          <PlusIcon />
          {t('editor.positions.add')}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || values.length === 0}
          onClick={() => onChange(values.slice(0, -1))}
        >
          <MinusIcon />
          {t('editor.positions.remove')}
        </Button>
      </div>
    </div>
  );
};
