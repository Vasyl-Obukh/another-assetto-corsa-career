import type { ReactNode } from 'react';

import type { EnterHint } from './types.ts';
import type { CareerEventView } from '../../../../shared/types';
import { useCarDetail } from '@/hooks';
import { EnterPanel, EnterPanelSkeleton } from '@/screens/event';

interface EnterWithHintProps {
  /**
   * The round the career would be entering at.
   */
  view: CareerEventView;
  /**
   * The class and car to start from.
   */
  hint: EnterHint;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * What the page says about entering before Enter is pressed.
   */
  note?: ReactNode;
  /**
   * Called with the class, car and livery chosen.
   * @param entry The class entry's id
   * @param car The car and livery to race all season
   */
  onEnter: (entry: string, car: { model: string; skin?: string }) => void;
}

/**
 * The Enter panel started from an earlier edition's class and car: the car is
 * read first, so the panel opens on it rather than switching to it. A car the
 * class no longer takes, or that is no longer installed, is left for the
 * player to pick again.
 */
export const EnterWithHint = ({
  view, hint, busy, note, onEnter,
}: EnterWithHintProps) => {
  const detail = useCarDetail(hint.car.model);

  if (detail.loading) return <EnterPanelSkeleton showFirstRound />;

  const fits = view.classes.find((one) => one.id === hint.entry)?.cars.includes(hint.car.model) ?? false;
  const car = fits ? detail.car : null;

  return (
    <EnterPanel
      view={view}
      busy={busy}
      showFirstRound
      initial={{
        entry: hint.entry,
        car,
        skin: car?.skins.find((one) => one.id === hint.car.skin) ?? null,
      }}
      note={note}
      onEnter={onEnter}
    />
  );
};
