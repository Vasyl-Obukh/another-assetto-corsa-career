import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NewEventTileProps {
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to make a new race event.
   */
  onCreate: () => void;
}

/**
 * The first tile of the Race tab: a new race event, as a dashed card the
 * size of the events beside it.
 */
export const NewEventTile = ({ busy, onCreate }: NewEventTileProps) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onCreate}
      className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="grid size-11 place-items-center rounded-full bg-muted">
        <PlusIcon className="size-5" />
      </span>
      <span className="font-semibold text-foreground">{t('race.new')}</span>
      <span className="text-xs">{t('race.newHint')}</span>
    </button>
  );
};
