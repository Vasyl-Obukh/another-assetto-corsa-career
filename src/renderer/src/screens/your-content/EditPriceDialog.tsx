import { CarIcon, Undo2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KIN_SLOTS } from './constants.ts';
import type { Car, CarAppraisal } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import {
  carPrice, isCarPrice, MAX_CAR_PRICE, MIN_CAR_PRICE, rentOf, repaintOf, withCarPrice,
} from '../../../../shared/utils/car-prices';
import { useClasses, useSettings } from '@/app';
import {
  carPictureSources, ContentImage, Loading, PriceOriginBadge, Shimmer,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFormat } from '@/i18n';
import { invoke } from '@/lib/ipc';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';

interface EditPriceDialogProps {
  /**
   * The car being priced, which the user added, or null while none is.
   */
  car: Car | null;
  /**
   * Called once the dialog is done with, saved or not.
   */
  onClose(): void;
}

/**
 * Pricing a car the user added: the price typed, the rent and the repaint it
 * comes to, the suggestion and what it rests on, and the priced cars nearest
 * it to compare against, any of which can be taken as it is.
 */
export const EditPriceDialog = ({ car, onClose }: EditPriceDialogProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber, formatYear } = useFormat();
  const { catalogue } = useClasses();
  const { settings, patch } = useSettings();
  const [appraisal, setAppraisal] = useState<CarAppraisal | null>(null);
  const [typed, setTyped] = useState('');
  const [shownFor, setShownFor] = useState<Car | null>(null);
  if (shownFor !== car) {
    setShownFor(car);
    setAppraisal(null);
    setTyped('');
  }

  useEffect(() => {
    if (!car) return undefined;
    let live = true;
    invoke('content:appraisal', { id: car.id }).then((next) => {
      if (!live || !next) return;
      setAppraisal(next);
      setTyped(formatNumber(next.price));
    }, () => { /* the dialog stays on its placeholders, and Save stays off */ });

    return () => { live = false; };
  }, [car, formatNumber]);

  if (!car) return null;

  const digits = typed.replace(/\D/g, '');
  const value = digits === '' ? null : Number(digits);
  const valid = isCarPrice(value);
  // Where the price would come from once saved: a price equal to the
  // suggestion is no price of the user's.
  const origin = appraisal !== null && value === appraisal.suggested ? 'suggested' : 'yours';
  // The symbol the money is written with, to lead the field.
  const symbol = formatMoney(0).replace(/[\d\s.,]/g, '');
  const take = (price: number): void => setTyped(formatNumber(price));
  // Under a comparison car's name: its power to weight where that is what
  // brought it here, and its year where it states one.
  const kinLine = (other: Car): string | null => {
    const power = other.performance.powerToWeight;
    const year = other.year === null ? null : formatYear(other.year);
    if (appraisal?.basis !== 'curve' || power === null) return year;
    const figure = formatNumber(Math.round(power));

    return year === null ? t('prices.kinPower', { power: figure }) : t('prices.kinFigures', { power: figure, year });
  };
  const save = (): void => {
    if (!appraisal || !valid) return;
    patch({ carPrices: withCarPrice(settings.carPrices, car.id, value, appraisal.suggested) });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[calc(100vh-4rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('prices.title', { car: car.name })}</DialogTitle>
          <DialogDescription>{t('prices.hint')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border p-2.5">
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-scrim">
            <ContentImage
              sources={carPictureSources(car.id, car.skins[0]?.id)}
              alt=""
              className="object-cover"
              fallback={<CarIcon className="absolute inset-0 m-auto size-5 text-muted-foreground/40" />}
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{car.name}</span>
            <span className="text-xs text-muted-foreground">
              {[car.brand, car.year === null ? null : formatYear(car.year)].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="car-price" className="text-sm font-medium">{t('prices.label')}</label>
          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="car-price"
                inputMode="numeric"
                autoComplete="off"
                className="pl-7 font-semibold tabular-nums"
                value={typed}
                disabled={appraisal === null}
                aria-invalid={appraisal !== null && !valid}
                onChange={(event) => {
                  const next = event.target.value.replace(/\D/g, '');
                  setTyped(next === '' ? '' : formatNumber(Number(next)));
                }}
                onKeyDown={(event) => { if (event.key === 'Enter') save(); }}
              />
            </div>
            {appraisal !== null && valid ? <PriceOriginBadge origin={origin} /> : null}
          </div>
          {appraisal !== null && !valid ? (
            <span className="text-xs font-medium text-destructive">
              {t('prices.range', { min: formatMoney(MIN_CAR_PRICE), max: formatMoney(MAX_CAR_PRICE) })}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('prices.costs', {
                rent: formatMoney(rentOf(value ?? 0)),
                repaint: formatMoney(repaintOf(value ?? 0)),
              })}
            </span>
          )}
        </div>

        {appraisal === null ? (
          <Loading className="flex flex-col gap-3">
            <Shimmer className="h-12 w-full rounded-xl" />
            <Shimmer className="h-3 w-48" />
            <div className="flex flex-col gap-px overflow-hidden rounded-xl border">
              {slots(KIN_SLOTS).map((at) => <Shimmer key={at} className="h-12 w-full rounded-none" />)}
            </div>
          </Loading>
        ) : (
          <>
            <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm">
              <PriceOriginBadge origin="suggested" />
              <span className="font-semibold tabular-nums">{formatMoney(appraisal.suggested)}</span>
              <span className="min-w-0 grow text-xs text-muted-foreground">
                {appraisal.basis === 'spec' && appraisal.spec !== null
                  ? t('prices.fromSpec', { spec: carSpecName(appraisal.spec, catalogue) })
                  : t('prices.fromCurve')}
              </span>
              {value === appraisal.suggested ? null : (
                <Button variant="outline" size="sm" onClick={() => take(appraisal.suggested)}>
                  <Undo2Icon />
                  {t('prices.useIt')}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {appraisal.basis === 'spec' && appraisal.spec !== null
                  ? t('prices.kinSpec', { spec: carSpecName(appraisal.spec, catalogue) })
                  : t('prices.kinCurve')}
              </span>
              {appraisal.kin.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('prices.noKin')}</p>
              ) : (
                <ul className="overflow-hidden rounded-xl border">
                  {appraisal.kin.map((other) => {
                    const price = carPrice(other, catalogue);

                    return (
                      <li key={other.id} className="flex items-center gap-2.5 border-t px-3 py-1.5 first:border-t-0">
                        <div className="relative h-8 w-14 shrink-0 overflow-hidden rounded bg-muted">
                          <ContentImage
                            sources={carPictureSources(other.id, other.skins[0]?.id)}
                            alt=""
                            className="object-cover"
                            fallback={null}
                          />
                        </div>
                        <div className="flex min-w-0 grow flex-col">
                          <span className="truncate text-sm font-semibold">{other.name}</span>
                          <span className="text-xs text-muted-foreground empty:hidden">
                            {kinLine(other)}
                          </span>
                        </div>
                        <span className={cn('text-sm font-semibold tabular-nums', price === value && 'text-primary')}>
                          {formatMoney(price)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t('prices.useFor', { car: other.name })}
                          onClick={() => take(price)}
                        >
                          {t('prices.use')}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        <p className="rounded-r-lg border-l-[3px] border-primary bg-primary/7 px-3 py-2 text-xs text-muted-foreground">
          {t('prices.note')}
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t('confirm.cancel')}</Button>
          <Button disabled={appraisal === null || !valid} onClick={save}>{t('prices.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
