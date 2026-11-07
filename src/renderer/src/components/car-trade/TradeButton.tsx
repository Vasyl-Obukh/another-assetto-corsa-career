import { PaletteIcon, TagIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { TRADE_BUTTON } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface TradeButtonProps {
  /**
   * Which of the two it is: a repaint, in paint, or a sale, in amber.
   */
  kind: 'repaint' | 'sell';
  /**
   * What it costs or pays, on the button - left out where the dialog it sits
   * in already says.
   */
  amount?: number;
  /**
   * The button's size.
   */
  size?: 'sm' | 'default';
  /**
   * Whether it is held, while a command is in flight or the action refused.
   */
  disabled?: boolean;
  /**
   * Anything the caller adds, such as its width.
   */
  className?: string;
  /**
   * Called when it is pressed.
   */
  onClick: () => void;
}

/**
 * Repaint or Sell, each the same solid fill wherever it appears, with what it
 * costs or pays on it.
 */
export const TradeButton = ({
  kind, amount, size = 'default', disabled = false, className, onClick,
}: TradeButtonProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const label = kind === 'repaint' ? t('trade.repaint') : t('trade.sell');

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      className={cn(TRADE_BUTTON[kind], className)}
      onClick={onClick}
    >
      {kind === 'repaint' ? <PaletteIcon /> : <TagIcon />}
      {amount === undefined ? label : t('trade.withAmount', {
        label, amount: amount === 0 && kind === 'repaint' ? t('trade.free') : formatMoney(amount),
      })}
    </Button>
  );
};
