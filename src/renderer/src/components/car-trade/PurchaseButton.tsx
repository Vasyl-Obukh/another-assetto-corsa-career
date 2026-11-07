import { LockIcon, StoreIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { TRADE_BUTTON } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface PurchaseButtonProps {
  /**
   * What the car costs.
   */
  price: number;
  /**
   * What the career holds.
   */
  balance: number;
  /**
   * Whether the button says the price, which it does only where nothing beside
   * it already does.
   */
  withPrice?: boolean;
  /**
   * The button's size.
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Whether a command is in flight.
   */
  busy?: boolean;
  /**
   * The least the career could pay for it, a sponsor's backing taken off, which
   * is what decides whether it is out of reach.
   */
  payable?: number;
  /**
   * Anything the caller adds, such as its width.
   */
  className?: string;
  /**
   * Called to buy the car, which only an affordable one offers.
   */
  onPurchase: () => void;
}

/**
 * Purchase, in the green money turning into a car takes - or, where the career
 * cannot pay, the same button in a refusal's soft red saying so.
 */
export const PurchaseButton = ({
  price, payable = price, balance, withPrice = false, size = 'default', busy = false, className, onPurchase,
}: PurchaseButtonProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const affordable = payable <= balance;
  const amount = formatMoney(price);

  if (!affordable) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        aria-disabled
        title={t('trade.short', { amount: formatMoney(payable - balance) })}
        className={cn(TRADE_BUTTON.cantAfford, className)}
      >
        <LockIcon />
        {withPrice ? t('trade.cantAffordAt', { price: amount }) : t('trade.cantAfford')}
      </Button>
    );
  }

  return (
    <Button type="button" size={size} disabled={busy} className={cn(TRADE_BUTTON.purchase, className)} onClick={onPurchase}>
      <StoreIcon />
      {withPrice ? t('trade.purchaseAt', { price: amount }) : t('trade.purchase')}
    </Button>
  );
};
