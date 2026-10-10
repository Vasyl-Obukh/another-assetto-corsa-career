import { EnterWithHint } from './EnterWithHint.tsx';
import type { EnterHint } from './types.ts';
import { ErrorCard } from '@/components';
import { useCareerEvent } from '@/hooks';
import { EnterPanel, EnterPanelSkeleton } from '@/screens/event';

interface EnterChampionshipProps {
  /**
   * The championship, by its id.
   */
  series: string;
  /**
   * The round entering would start from, by its id.
   */
  round: string;
  /**
   * Which of the season's editions it would enter, where the page shows one.
   */
  edition?: number;
  /**
   * A class and car a link asked the panel to start from, or null.
   */
  hint?: EnterHint | null;
}

/**
 * The round page's Enter panel on the championship's own page, read off that
 * round's view - so the classes, the cars and what entering now costs are the
 * same answer on both pages.
 */
export const EnterChampionship = ({
  series, round, edition, hint = null,
}: EnterChampionshipProps) => {
  const event = useCareerEvent(series, round, { edition });

  if (event.error) return <ErrorCard error={event.error} onDismiss={event.dismissError} />;
  if (!event.view) return <EnterPanelSkeleton showFirstRound />;

  return hint ? (
    <EnterWithHint
      view={event.view}
      hint={hint}
      busy={event.busy}
      onEnter={(entry, car) => { void event.enter(entry, car); }}
    />
  ) : (
    <EnterPanel
      view={event.view}
      busy={event.busy}
      showFirstRound
      onEnter={(entry, car) => { void event.enter(entry, car); }}
    />
  );
};
