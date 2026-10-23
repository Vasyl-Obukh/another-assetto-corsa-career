import { useCallback, useMemo, useState } from 'react';

import type { Garage } from './types.ts';
import type { Car, CarSource, OwnedCar } from '../../../../shared/types';
import { carPrice, resaleValue } from '../../../../shared/utils/car-prices';
import { ownedCar, racingIn } from '../../../../shared/utils/garage';
import { useClasses, useSettings, useSlot } from '@/app';
import type { DisplayableError } from '@/lib/ipc';
import { invoke, toDisplayableError } from '@/lib/ipc';

export type { Garage } from './types.ts';

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

    return {
      balance: career.money,
      today: career.date,
      cars: career.garage,
      owned: (model: string) => ownedCar(career, model),
      priceOf: (car: Car) => carPrice(car, catalogue, carPrices),
      valueOf: (owned: OwnedCar) => resaleValue(owned.paid, owned.bought, career.date),
      racingIn: (model: string, source?: CarSource) => (season ? racingIn(season, model, source) : []),
      busy,
      error,
      dismissError: () => setError(null),
      buy: (model: string, skin?: string) => run(() => invoke('career:buyCar', { model, ...(skin ? { skin } : {}) })),
      sell: (model: string) => run(() => invoke('career:sellCar', { model })),
      repaint: (model: string, skin: string) => run(() => invoke('career:repaintCar', { model, skin })),
    };
  }, [mode, career, catalogue, carPrices, busy, error, run]);
};
