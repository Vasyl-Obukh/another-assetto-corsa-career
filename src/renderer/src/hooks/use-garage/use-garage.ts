import {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import type { Garage } from './types.ts';
import type {
  Car, CarBacking, CarSource, OwnedCar,
} from '../../../../shared/types';
import { carPrice, repaintOf, resaleValue } from '../../../../shared/utils/car-prices';
import { ownedCar, racingIn } from '../../../../shared/utils/garage';
import { percentOf, repaintDeal } from '../../../../shared/utils/sponsors';
import { useClasses, useSettings, useSlot } from '@/app';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { CarBackingOffer, Garage } from './types.ts';

/**
 * The open career's garage, read off the career the slot holds - which comes
 * back through its own push after every command, so nothing here is copied.
 * @returns The garage, or null outside a career
 */
export const useGarage = (): Garage | null => {
  const { mode, career } = useSlot();
  const { catalogue } = useClasses();
  const { settings: { carPrices } } = useSettings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DisplayableError | null>(null);
  const [backing, setBacking] = useState<CarBacking | null>(null);

  // Read again whenever the career changes, since a purchase may have spent it.
  useEffect(() => {
    if (mode !== 'career' || !career) return undefined;
    let live = true;
    invoke('career:carBacking', undefined).then(
      (found) => { if (live) setBacking(found); },
      () => { if (live) setBacking(null); },
    );

    return () => { live = false; };
  }, [mode, career]);

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param send What to run
   * @returns Whether it went through
   */
  const run = useCallback(async (send: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    try {
      await send();
      setError(null);

      return true;
    } catch (thrown) {
      setError(toDisplayableError(thrown));

      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return useMemo(() => {
    if (mode !== 'career' || !career) return null;
    const season = career.seasons[career.seasons.length - 1];
    const priceOf = (car: Car): number => carPrice(car, catalogue, carPrices);
    const backingOf = (car: Car) => (backing?.models.includes(car.id) && !ownedCar(career, car.id) ? {
      sponsor: backing.sponsor,
      amount: percentOf(priceOf(car), backing.share),
      until: backing.until,
    } : null);

    return {
      balance: career.money,
      today: career.date,
      cars: career.garage,
      owned: (model: string) => ownedCar(career, model),
      priceOf,
      backingOf,
      backing: backing && {
        share: backing.share, models: backing.models.filter((model) => !ownedCar(career, model)),
      },
      payableFor: (car: Car) => priceOf(car) - (backingOf(car)?.amount ?? 0),
      repaintCost: (owned: OwnedCar) => (repaintDeal(career) ? 0 : repaintOf(owned.paid)),
      repaintSponsor: repaintDeal(career)?.sponsor.name ?? null,
      valueOf: (owned: OwnedCar) => resaleValue(owned.paid, owned.bought, career.date),
      racingIn: (model: string, source?: CarSource) => (season ? racingIn(season, model, source) : []),
      busy,
      error,
      dismissError: () => setError(null),
      buy: (model: string, skin?: string, backed = false) => run(() => invoke('career:buyCar', {
        model, ...(skin ? { skin } : {}), ...(backed ? { backed } : {}),
      })),
      sell: (model: string) => run(() => invoke('career:sellCar', { model })),
      repaint: (model: string, skin: string) => run(() => invoke('career:repaintCar', { model, skin })),
    };
  }, [mode, career, catalogue, carPrices, backing, busy, error, run]);
};
