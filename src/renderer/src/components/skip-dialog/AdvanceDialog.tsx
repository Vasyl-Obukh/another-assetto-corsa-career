import { useTranslation } from 'react-i18next';

import { SkipDialog } from './SkipDialog.tsx';
import type { PendingMove } from '@/hooks';
import { useFormat } from '@/i18n';

interface AdvanceDialogProps {
  /**
   * The move waiting on the player, or null while there is none.
   */
  pending: PendingMove | null;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called when the player confirms the move.
   */
  onConfirm: () => void;
  /**
   * Called when the dialog closes without confirming.
   */
  onClose: () => void;
}

/**
 * Asks before moving the career's clock past rounds it entered - the one
 * dialog every screen that moves the clock shares.
 */
export const AdvanceDialog = ({
  pending, busy, onConfirm, onClose,
}: AdvanceDialogProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const count = pending?.rounds.length ?? 0;
  const partway = pending?.rounds.some((round) => round.reason === 'partway') ?? false;

  return (
    <SkipDialog
      open={pending !== null}
      title={t('skip.advanceTitle', { day: pending ? formatDayShort(pending.date) : '' })}
      description={t(partway ? 'skip.advanceHintPartway' : 'skip.advanceHint', { count })}
      rounds={pending?.rounds ?? []}
      confirmLabel={t('skip.advanceConfirm', { count })}
      busy={busy}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
