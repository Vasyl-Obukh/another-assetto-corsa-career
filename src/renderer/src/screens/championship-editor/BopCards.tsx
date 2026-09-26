import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  BALLAST_STEP, MAX_BALLAST, MAX_RESTRICTOR, MIN_BOP,
} from './constants.ts';
import { OffsetStepper } from './OffsetStepper.tsx';
import { withBop } from './utils.ts';
import type { BopEntry } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { useCars } from '@/hooks';
import { cn } from '@/lib/utils.ts';
import { carImageSources } from '@/screens/car-browser';

interface BopCardsProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * The class's balance of performance.
   */
  bop: readonly BopEntry[];
  /**
   * Every car the class may field, each of which gets a card.
   */
  fieldable: readonly string[];
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car the library could not resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the whole list whenever a car's balance changes.
   * @param next The balance of performance
   */
  onChange: (next: BopEntry[]) => void;
}

/**
 * Every car the class may field, as a card with its ballast and its intake
 * restriction. Typing into a card balances the car; bringing both back to
 * nothing takes it off. A balanced car is outlined in amber.
 */
export const BopCards = ({
  idPrefix, bop, fieldable, locked, nameOf, onChange,
}: BopCardsProps) => {
  const { t } = useTranslation();
  const installed = useCars(fieldable);

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-2.5">
      {fieldable.map((model) => {
        const car = installed.get(model);
        const own = bop.find((one) => one.car === model);
        const name = car?.name ?? nameOf(model);
        const id = `${idPrefix}-bop-${model}`;

        return (
          <li
            key={model}
            className={cn(
              'flex flex-col overflow-hidden rounded-lg border bg-card',
              own && 'border-warning ring-1 ring-warning/60',
            )}
          >
            <div className="relative aspect-[16/8] w-full overflow-hidden bg-muted">
              {car === undefined ? null : (
                <ContentImage
                  sources={carImageSources(car)}
                  alt={name}
                  className="object-cover"
                  fallback={(
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CarIcon className="size-6 text-muted-foreground/40" />
                    </div>
                  )}
                />
              )}
            </div>
            <div className="flex flex-col gap-2 p-2.5">
              <span className="truncate text-sm font-medium" title={name}>{name}</span>
              <div className="grid grid-cols-2 gap-2">
                <label htmlFor={`${id}-ballast`} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t('editor.bop.ballastShort')}</span>
                  <OffsetStepper
                    id={`${id}-ballast`}
                    label={t('editor.bop.ballastFor', { car: name })}
                    value={own?.ballast}
                    min={MIN_BOP}
                    limit={MAX_BALLAST}
                    step={BALLAST_STEP}
                    signed={false}
                    small
                    disabled={locked}
                    onChange={(ballast) => onChange(withBop(bop, model, { ballast }))}
                  />
                </label>
                <label htmlFor={`${id}-restrictor`} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t('editor.bop.restrictorShort')}</span>
                  <OffsetStepper
                    id={`${id}-restrictor`}
                    label={t('editor.bop.restrictorFor', { car: name })}
                    value={own?.restrictor}
                    min={MIN_BOP}
                    limit={MAX_RESTRICTOR}
                    signed={false}
                    small
                    disabled={locked}
                    onChange={(restrictor) => onChange(withBop(bop, model, { restrictor }))}
                  />
                </label>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
