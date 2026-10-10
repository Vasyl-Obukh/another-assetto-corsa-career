import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Championship } from '../../../../shared/types';
import { Segments, StandingsTable, TeamStandingsTable } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import type { ClassSeason } from '@/lib/season-results';

interface FinalStandingsCardProps {
  /**
   * The player's class's final tables.
   */
  table: ClassSeason;
  /**
   * The championship, as the season holds it.
   */
  series: Championship;
  /**
   * What the player is called, over the name the championship gave their seat.
   */
  playerName: string;
  /**
   * Where Every race leads: the championship's standings for this edition.
   */
  everyRace: string;
}

/**
 * The class's final tables, drivers or teams, and the way to every race of the
 * edition on the championship's own page.
 */
export const FinalStandingsCard = ({
  table, series, playerName, everyRace,
}: FinalStandingsCardProps) => {
  const { t } = useTranslation();
  const [who, setWho] = useState<'drivers' | 'teams'>('drivers');

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <h2 className="mr-auto font-semibold">{t('review.standings')}</h2>
        {table.teams.length > 0 ? (
          <Segments
            label={t('review.standings')}
            items={[{ id: 'drivers', label: t('review.drivers') }, { id: 'teams', label: t('review.teams') }]}
            value={who}
            onChange={setWho}
          />
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link to={everyRace}>
            {t('review.everyRace')}
            <ChevronRightIcon />
          </Link>
        </Button>
      </header>
      <div className="px-1 pb-1">
        {who === 'teams'
          ? <TeamStandingsTable season={table} series={series} />
          : <StandingsTable season={table} series={series} playerName={playerName} />}
      </div>
    </section>
  );
};
