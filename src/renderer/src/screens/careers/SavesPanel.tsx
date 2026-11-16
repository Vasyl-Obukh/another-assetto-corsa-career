import { SaveIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ErrorCard, Shimmer } from '@/components';
import {
  SAVE_FILTER_MEMORY, SAVE_FILTERS, SaveFilters, SaveList,
} from '@/components/saves';
import { Badge } from '@/components/ui/badge.tsx';
import { usePreference } from '@/hooks';
import type { SavesState } from '@/hooks';
import { readOneOf } from '@/lib/stored-preference';

interface SavesPanelProps {
  /**
   * The picked career's saves and their commands.
   */
  saves: SavesState;
  /**
   * Whether a load is in flight.
   */
  loading: boolean;
  /**
   * Loads one of them, which opens the career as it holds it.
   * @param save The save's id
   */
  onLoad(save: string): void;
}

/**
 * The picked career's saves, filtered by kind, each a click from loading.
 */
export const SavesPanel = ({ saves, loading, onLoad }: SavesPanelProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = usePreference(SAVE_FILTER_MEMORY, readOneOf(SAVE_FILTERS, 'all'));

  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <SaveIcon className="size-4 text-muted-foreground" />
          {t('careers.saves')}
        </h3>
        {/* A count, neutral on purpose. */}
        {saves.saves === null
          ? <Shimmer className="h-5 w-7 rounded-md" />
          : <Badge variant="secondary">{saves.saves.length}</Badge>}
        <div className="ml-auto">
          <SaveFilters saves={saves.saves} value={filter} onChange={setFilter} />
        </div>
      </div>

      {saves.error ? <ErrorCard error={saves.error} onDismiss={saves.dismissError} /> : null}

      <SaveList
        saves={saves.saves}
        filter={filter}
        busy={saves.busy || loading}
        onLoad={(save) => onLoad(save.id)}
        onRename={saves.rename}
        onDelete={saves.remove}
      />
    </section>
  );
};
