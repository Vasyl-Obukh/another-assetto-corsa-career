import type { ReactNode } from 'react';

import { useSettings, useSlot } from './utils.ts';
import { careerCurrency } from '../../../shared/utils/career-settings';
import { MoneyCurrency } from '@/i18n';

interface CurrencyProviderProps {
  /**
   * The tree that shows money.
   */
  children: ReactNode;
}

/**
 * The currency every amount is shown in: the open career's own where it sets
 * one, the app's everywhere else.
 */
export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { settings } = useSettings();
  const { career } = useSlot();

  return (
    <MoneyCurrency.Provider value={careerCurrency(settings, career?.settings ?? null)}>
      {children}
    </MoneyCurrency.Provider>
  );
};
