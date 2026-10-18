import { useTranslation } from 'react-i18next';

import { SkipDialog } from './SkipDialog.tsx';
import { finishesSeason } from './utils.ts';
import { standaloneEntry } from '../../../../shared/utils/standalone';
import { useSlot } from '@/app';
import type { SkipRound } from '@/hooks';
import { useFormat } from '@/i18n';

interface SkipRoundDialogProps {
  /**
   * The skip, and the one waiting on the player.
   */
  skip: SkipRound;
}

/**
 * Asks before skipping a round the install cannot race - the round page's and
 * the championship page's alike - listing it with every round it costs, and
 * saying so when it ends a standalone championship's season.
 */
export const SkipRoundDialog = ({ skip }: SkipRoundDialogProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { career } = useSlot();
  const rounds = skip.pending?.rounds ?? [];
  const skipped = rounds.at(-1);
  const finishes = skip.pending !== null && finishesSeason(career && standaloneEntry(career), rounds);
  const day = skipped ? formatDayShort(skipped.date) : '';

  return (
    <SkipDialog
      open={skip.pending !== null}
      title={rounds.length > 1
        ? t('skip.launchTitle', { count: rounds.length })
        : t('skip.skipTitle', { round: skipped?.roundName ?? '' })}
      description={t(rounds.length > 1 ? 'skip.skipHintMany' : 'skip.skipHint', { round: skipped?.roundName ?? '', day })}
      rounds={rounds}
      note={finishes ? t('skip.skipFinishNote') : undefined}
      confirmLabel={finishes ? t('skip.skipFinish') : t('skip.skipConfirm', { count: rounds.length })}
      busy={skip.busy}
      onConfirm={skip.confirm}
      onClose={skip.cancel}
    />
  );
};
