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
}

/**
 * The round page's Enter panel on the championship's own page, read off that
 * round's view - so the classes, the cars and what entering now costs are the
 * same answer on both pages.
 */
export const EnterChampionship = ({ series, round }: EnterChampionshipProps) => {
  const event = useCareerEvent(series, round);

  if (event.error) return <ErrorCard error={event.error} onDismiss={event.dismissError} />;
  if (!event.view) return <EnterPanelSkeleton showFirstRound />;

  return (
    <EnterPanel
      view={event.view}
      busy={event.busy}
      showFirstRound
      onEnter={(entry, car) => { void event.enter(entry, car); }}
    />
  );
};
