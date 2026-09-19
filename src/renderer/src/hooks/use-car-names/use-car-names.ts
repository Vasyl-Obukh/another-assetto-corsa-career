import { useCallback } from 'react';

import { useCars } from '../use-cars/index.ts';

/**
 * Names every installed car out of a list of folder IDs.
 *
 * An unresolved id falls back to itself, which is also what a car that is not
 * installed comes back as - and the availability badges already say that it is
 * missing.
 * @param ids The cars to name
 * @returns A function naming one car, giving back the id when it cannot
 */
export const useCarNames = (ids: readonly string[]): ((car: string) => string) => {
  const cars = useCars(ids);

  return useCallback((car: string) => cars.get(car)?.name ?? car, [cars]);
};
