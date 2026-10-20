import { useTranslation } from 'react-i18next';

import { CURRENCIES } from '../../../../shared/constants';
import type { Currency } from '../../../../shared/types';
import { Segments } from '@/components';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface CurrencyPickerProps {
  /**
   * The currency picked.
   */
  value: Currency;
  /**
   * Picks a currency.
   * @param next The one picked
   */
  onChange: (next: Currency) => void;
  /**
   * Whether it is held still - a career following the app's.
   */
  disabled?: boolean;
}

/**
 * Which currency money is shown in, beside what that makes of an amount.
 */
export const CurrencyPicker = ({ value, onChange, disabled = false }: CurrencyPickerProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <div className={cn(
      'flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3',
      disabled && 'pointer-events-none opacity-50',
    )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{t('settings.currency.label')}</span>
        <span className="text-sm text-muted-foreground">
          {t('settings.currency.hint', { amount: formatMoney(12_000, value) })}
        </span>
      </div>
      <Segments
        label={t('settings.currency.label')}
        items={CURRENCIES.map((code) => ({ id: code, label: t(`settings.currency.${code}`) }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
