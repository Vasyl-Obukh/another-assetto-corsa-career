import type { Garage } from '@/hooks';
import { useAppError } from '@/i18n';

interface TradeErrorProps {
  /**
   * The garage whose last command may have been refused.
   */
  garage: Garage;
}

/**
 * Why the garage refused the last command, inside the dialog that asked -
 * nothing while it has not.
 */
export const TradeError = ({ garage }: TradeErrorProps) => {
  const describeError = useAppError();

  return garage.error ? (
    <p className="text-sm text-destructive" role="alert" data-selectable>{describeError(garage.error)}</p>
  ) : null;
};
