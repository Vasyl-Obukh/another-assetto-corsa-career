import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MAX_PURSE_PLACES, PURSE_ROUNDING, PURSE_SHAPE_BARS, PURSE_SHAPES,
} from './constants.ts';
import { OffsetStepper } from './OffsetStepper.tsx';
import type { PurseRecipe } from './types.ts';
import {
  generatePurse, paysInAll, recipeOf, withPlace,
} from './utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { PlaceBadge } from '@/screens/championships';
import { Field, fromNumber, toNumber } from '@/screens/race';

/**
 * The bar each podium place is drawn in, the metal of its chip.
 */
const PODIUM_BAR: readonly string[] = [
  'bg-podium-gold-foreground',
  'bg-podium-silver-foreground',
  'bg-podium-bronze-foreground',
];

interface PurseEditorProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * What the purse is, already translated: each race, or the season.
   */
  title: string;
  /**
   * A line beside it, already translated.
   */
  hint: string;
  /**
   * What each place pays, the winner first.
   */
  values: readonly number[];
  /**
   * Whether nothing may change just now - a weekend under way, or a purse
   * shown only to say what a class shares.
   */
  disabled: boolean;
  /**
   * Called with the whole table whenever it changes.
   * @param next What each place pays
   */
  onChange: (next: number[]) => void;
}

/**
 * A purse, generated from what it pays in all, how many places it pays and
 * the shape of the curve - then adjusted by hand wherever the curve is not
 * quite it. Changing the pot, the places or the shape generates it again.
 */
export const PurseEditor = ({
  idPrefix, title, hint, values, disabled, onChange,
}: PurseEditorProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const [recipe, setRecipe] = useState<PurseRecipe>(() => recipeOf(values));
  // Places typed over since the table was last generated, and whether it has
  // been generated here at all - a table read off the document says neither.
  const [hand, setHand] = useState<ReadonlySet<number>>(new Set());
  const [generated, setGenerated] = useState(false);
  const total = paysInAll(values);
  const max = Math.max(1, ...values);

  /**
   * Generates the table again from a changed recipe.
   * @param next The recipe
   */
  const regenerate = (next: PurseRecipe): void => {
    setRecipe(next);
    setHand(new Set());
    setGenerated(true);
    onChange(generatePurse(next));
  };

  /**
   * Sets one place by hand.
   * @param place Which place, counting from zero
   * @param value What it pays
   */
  const adjust = (place: number, value: number): void => {
    const next = withPlace(values, place, value);
    setHand(new Set([...hand, place]));
    setRecipe({ ...recipe, pot: paysInAll(next) });
    onChange(next);
  };

  let status = null;
  if (hand.size > 0) status = <Badge variant="warning">{t('editor.purse.adjusted', { count: hand.size })}</Badge>;
  else if (generated) status = <Badge variant="success">{t('editor.purse.generated')}</Badge>;

  return (
    <div className="flex min-w-0 flex-col rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
        <span className="ml-auto flex items-center gap-2">
          {status}
          <span className="text-xs">
            {t('editor.purse.total')}
            {' '}
            <b className="text-sm tabular-nums">{formatMoney(total)}</b>
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_8rem]">
          <Field id={`${idPrefix}-pot`} label={t('editor.purse.pot')}>
            <Input
              id={`${idPrefix}-pot`}
              type="number"
              min={0}
              className="text-right tabular-nums"
              value={fromNumber(recipe.pot)}
              disabled={disabled}
              onChange={(event) => regenerate({ ...recipe, pot: toNumber(event.target.value) ?? 0 })}
            />
          </Field>
          <Field id={`${idPrefix}-places`} label={t('editor.purse.places')}>
            <OffsetStepper
              id={`${idPrefix}-places`}
              label={t('editor.purse.places')}
              value={recipe.places}
              min={1}
              limit={MAX_PURSE_PLACES}
              signed={false}
              disabled={disabled}
              onChange={(places) => regenerate({ ...recipe, places: places ?? 1 })}
            />
          </Field>
          <Field id={`${idPrefix}-round`} label={t('editor.purse.round')}>
            <Select
              value={String(recipe.round)}
              disabled={disabled}
              onValueChange={(value) => regenerate({ ...recipe, round: Number(value) })}
            >
              <SelectTrigger id={`${idPrefix}-round`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURSE_ROUNDING.map((step) => (
                  <SelectItem key={step} value={String(step)}>{formatMoney(step)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.purse.shape')}</span>
          <div role="radiogroup" aria-label={t('editor.purse.shape')} className="flex flex-wrap gap-1.5">
            {PURSE_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                role="radio"
                aria-checked={recipe.shape === shape}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border bg-card py-1 pr-2.5 pl-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60',
                  recipe.shape === shape ? 'border-primary text-primary ring-1 ring-primary' : 'hover:bg-accent',
                )}
                onClick={() => regenerate({ ...recipe, shape })}
              >
                <svg viewBox="0 0 26 18" className="h-4 w-6" aria-hidden>
                  {PURSE_SHAPE_BARS[shape].map((height, at) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <rect key={at} x={at * 5.2} y={18 - height * 1.7} width="4" height={height * 1.7} rx="1" fill="currentColor" opacity="0.55" />
                  ))}
                </svg>
                {t(`editor.purse.shapes.${shape}`)}
              </button>
            ))}
          </div>
        </div>

        {hand.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-warning/60 bg-podium-gold px-3 py-2 text-xs text-podium-gold-foreground">
            <span className="min-w-0 flex-1">{t('editor.purse.replaces')}</span>
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => regenerate(recipe)}>
              {t('editor.purse.regenerate')}
            </Button>
          </div>
        ) : null}

        {values.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('editor.purse.nothing')}</p>
        ) : (
          // One line whatever its length, so the curve reads across unbroken; a
          // purse too long for the card scrolls rather than wrapping.
          <ol
            className="grid gap-x-1.5 overflow-x-auto pb-2"
            style={{ gridTemplateColumns: `repeat(${values.length}, minmax(3.5rem, 1fr))` }}
          >
            {values.map((value, place) => (
              // By place: a purse is never reordered.
              // eslint-disable-next-line react/no-array-index-key
              <li key={place} className="flex flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-sm',
                      PODIUM_BAR[place] ?? 'bg-primary/45',
                      hand.has(place) && 'outline-2 outline-offset-1 outline-warning outline-dashed',
                    )}
                    style={{ height: `${Math.max(3, (value / max) * 100)}%` }}
                  />
                </div>
                <PlaceBadge place={place + 1} />
                <Input
                  type="number"
                  min={0}
                  aria-label={t('editor.purse.place', { number: place + 1 })}
                  className={cn('h-8 px-0.5 text-center text-xs tabular-nums', hand.has(place) && 'border-warning bg-warning/10')}
                  value={fromNumber(value)}
                  disabled={disabled}
                  onChange={(event) => adjust(place, toNumber(event.target.value) ?? 0)}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
