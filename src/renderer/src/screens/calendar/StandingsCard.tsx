import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { driverRows, StandingsTable, teamRows } from './StandingsTable.tsx';
import type { SeasonEntry } from '../../../../shared/types';
import { useSettings } from '@/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';

interface StandingsCardProps {
  /**
   * The championship this career has entered, and where it stands.
   */
  entry: SeasonEntry;
  /**
   * The championship's display name.
   */
  seriesName: string;
}

export const StandingsCard = ({ entry, seriesName }: StandingsCardProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // The table carries the name the championship's document gave the seat the
  // player took, so it is replaced here rather than when the table was built -
  // which is what makes renaming yourself in settings rename every season at
  // once rather than only the rounds scored afterwards.
  const you = settings.driverName?.trim() || t('calendar.standings.you');

  const raced = entry.events.some((event) => event.status === 'raced');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="size-4" />
          {seriesName}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {!raced ? (
          <p className="text-sm text-muted-foreground">{t('calendar.standings.none')}</p>
        ) : null}

        {/* One block per class, and only labelled by class when there is more
            than one: a single-class championship has one table and naming it
            after itself says nothing. */}
        {entry.standings.classes.map((held) => (
          <div key={held.entry} className="flex flex-col gap-3">
            {entry.standings.classes.length > 1 ? (
              <h3 className="text-sm font-medium">{held.name}</h3>
            ) : null}

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">
                {t('calendar.standings.drivers')}
              </h4>
              <StandingsTable
                rows={driverRows(held.drivers, entry.playerSeat, you)}
                playerKey={entry.playerSeat}
              />
            </div>

            {held.teams.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">
                  {t('calendar.standings.teams')}
                </h4>
                <StandingsTable rows={teamRows(held.teams)} />
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
