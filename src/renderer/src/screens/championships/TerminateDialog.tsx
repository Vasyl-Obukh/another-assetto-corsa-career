import { InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Contract, SeasonEntry } from '../../../../shared/types';
import { termination } from '../../../../shared/utils/contracts';
import { MoneyAmount } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';

interface TerminateDialogProps {
  /**
   * Whether it is open.
   */
  open: boolean;
  /**
   * The edition raced under the contract.
   */
  entry: SeasonEntry;
  /**
   * The contract.
   */
  contract: Contract;
  /**
   * Whether the command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to terminate it.
   */
  onConfirm: () => void;
  /**
   * Called to keep it.
   */
  onClose: () => void;
}

// What terminating a contract costs, asked before it is done: the release fee,
// or for a paid seat what it gives back, and the salary given up.
export const TerminateDialog = ({
  open, entry, contract, busy, onConfirm, onClose,
}: TerminateDialogProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const ending = termination(entry);
  const paid = contract.pay === 'seat';

  let action = t('championships.contract.terminate');
  if (ending.refund > 0) action = t('championships.contract.refundTerminate', { amount: formatMoney(ending.refund) });
  else if (ending.release > 0) action = t('championships.contract.payTerminate', { amount: formatMoney(ending.release) });

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('championships.contract.terminateTitle', { team: contract.teamName })}</DialogTitle>
          <DialogDescription>
            {t('championships.contract.terminateBody', { count: ending.left, rounds: entry.events.length })}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-lg border p-3 text-sm">
          {paid ? (
            <>
              <dt className="text-muted-foreground">{t('championships.contract.noRelease')}</dt>
              <dd className="text-right font-medium">{t('championships.contract.noReleaseValue')}</dd>
              <dt className="text-muted-foreground">{t('championships.contract.refund')}</dt>
              <dd className="text-right"><MoneyAmount amount={ending.refund} /></dd>
            </>
          ) : (
            <>
              <dt className="text-muted-foreground">{t('championships.contract.release')}</dt>
              <dd className="text-right"><MoneyAmount amount={-ending.release} /></dd>
            </>
          )}
          {ending.salaryLeft > 0 ? (
            <>
              <dt className="text-muted-foreground">{t('championships.contract.salaryLeft')}</dt>
              <dd className="text-right text-muted-foreground">
                {t('championships.contract.salaryLeftValue', { amount: formatMoney(ending.salaryLeft) })}
              </dd>
            </>
          ) : null}
        </dl>

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          {t('championships.contract.after')}
        </p>

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>{t('championships.contract.keep')}</Button>
          <Button variant="destructive" disabled={busy} onClick={onConfirm}>{action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
