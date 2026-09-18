import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ChampionshipMenu } from './ChampionshipMenu.tsx';
import type { SeriesListing } from '../../../../shared/types';
import { ConfirmDialog, NameDialog } from '@/components';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';

/**
 * Which destructive action is being confirmed, or null for none.
 */
type Confirming = 'revert' | 'delete' | null;

interface ChampionshipActionsProps {
  /**
   * The championship the actions act on.
   */
  listing: SeriesListing;
  /**
   * The screen's commands. Passed in rather than held here, so a list of
   * twenty cards shares one busy flag and one error surface instead of twenty.
   */
  commands: SeriesCommandsState;
}

export const ChampionshipActions = ({ listing, commands }: ChampionshipActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [duplicating, setDuplicating] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const { id, name } = listing.series;

  return (
    <>
      <ChampionshipMenu
        listing={listing}
        busy={commands.busy}
        onDuplicate={() => setDuplicating(true)}
        onRevert={() => setConfirming('revert')}
        onDelete={() => setConfirming('delete')}
        onExport={() => { void commands.exportSeries(id); }}
      />

      {/* The name and nothing else. The copy's id is main's to pick, because
          only main knows what is taken - a file that failed to parse owns its
          name without appearing in the library at all. */}
      <NameDialog
        key={duplicating ? 'duplicating' : 'idle'}
        open={duplicating}
        title={t('championships.duplicate.title', { name })}
        description={t('championships.duplicate.hint')}
        label={t('championships.duplicate.name')}
        initial={t('championships.actions.copyName', { name })}
        confirmLabel={t('championships.duplicate.confirm')}
        busy={commands.busy}
        onClose={() => setDuplicating(false)}
        onConfirm={(copyName) => {
          commands.duplicate(id, copyName).then((copied) => {
            setDuplicating(false);
            // Off the returned id rather than off the pushed library: the push
            // lands while this call is still resolving, so local state may not
            // hold the copy yet.
            if (copied) navigate(path.championshipEdit({ id: copied }));
          }, () => setDuplicating(false));
        }}
      />

      <ConfirmDialog
        open={confirming !== null}
        busy={commands.busy}
        title={t(`championships.${confirming ?? 'revert'}.title`)}
        description={t(`championships.${confirming ?? 'revert'}.body`, { name })}
        confirmLabel={t(`championships.actions.${confirming ?? 'revert'}`)}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          const done = confirming === 'delete' ? commands.remove(id) : commands.revert(id);
          // The card simply goes, or comes back as the app's own - either way
          // there is nowhere to navigate to.
          done.then(() => setConfirming(null), () => setConfirming(null));
        }}
      />
    </>
  );
};
