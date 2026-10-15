import { useTranslation } from 'react-i18next';

import { HistoricClasses } from './HistoricClasses.tsx';
import { HistoricOverview } from './HistoricOverview.tsx';
import { HistoricPrizes } from './HistoricPrizes.tsx';
import { RulesSheet } from './RulesSheet.tsx';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { WordingKind } from '@/i18n';

interface HistoricAboutProps {
  /**
   * The historic event.
   */
  event: Championship;
  /**
   * What the install can race of it, which says the cars each class fields.
   */
  availability: SeriesAvailability;
  /**
   * The seat the player was given, when a career races it - which outlines the
   * class it is in and names the player in it.
   */
  playerSeat?: string;
}

/**
 * The heading over each part of the panel.
 */
const PART_HEADING = 'text-xs font-semibold tracking-wide text-muted-foreground uppercase';

// The whole of a historic event in one panel, as a career's event page shows
// it; its settings page shows the same parts a tab each.
export const HistoricAbout = ({ event, availability, playerSeat }: HistoricAboutProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <HistoricOverview event={event} availability={availability} />

      <div className="flex flex-col gap-3">
        <h3 className={PART_HEADING}>{t('historic.about.classes')}</h3>
        <HistoricClasses event={event} availability={availability} playerSeat={playerSeat} />
      </div>

      {/* Side by side once the panel itself is wide enough for both, which is
          its own width rather than the window's: it sits beside a sidebar on
          the event page. */}
      <div className="@container">
        <div className="grid items-start gap-4 @5xl:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className={PART_HEADING}>{t('historic.about.prizes')}</h3>
            <HistoricPrizes event={event} />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className={PART_HEADING}>{t('historic.about.rules')}</h3>
            {/* Worded for an event wherever the panel is shown, the career's
                own event page included. */}
            <WordingKind.Provider value="historic">
              <RulesSheet regulations={event.regulations ?? {}} titled={false} />
            </WordingKind.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};
