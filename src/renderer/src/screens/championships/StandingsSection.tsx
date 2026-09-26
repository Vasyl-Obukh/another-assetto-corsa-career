import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { STANDINGS_PREFERENCE } from './constants.ts';
import type { StandingsLayout } from './types.ts';
import { readStandingsLayout } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import {
  Segments, StandingsMatrix, StandingsTable, TeamStandingsTable,
} from '@/components';
import type { SeasonResults } from '@/lib/season-results';
import { writePreference } from '@/lib/stored-preference';

interface StandingsSectionProps {
  /**
   * The season, read into its tables.
   */
  season: SeasonResults;
  /**
   * The championship the season is of.
   */
  series: Championship;
  /**
   * The class the player races in, which the section opens on.
   */
  playerEntry: string | null;
  /**
   * What the player is called.
   */
  playerName: string;
  /**
   * Called with a round's id to open it.
   * @param round The round, by its id
   */
  onOpenRound?: (round: string) => void;
}

/**
 * The championship's standings: drivers or teams, as a table or as the season
 * grid of every race, one class at a time. How it is laid out is remembered
 * across championships, since it is a way of reading standings rather than
 * anything about this one.
 */
export const StandingsSection = ({
  season, series, playerEntry, playerName, onOpenRound,
}: StandingsSectionProps) => {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<StandingsLayout>(readStandingsLayout);
  const [picked, setPicked] = useState(playerEntry ?? season.classes[0]?.entry ?? '');

  const held = season.classes.find((one) => one.entry === picked) ?? season.classes[0];
  const change = (next: Partial<StandingsLayout>): void => {
    const merged = { ...layout, ...next };
    setLayout(merged);
    writePreference(STANDINGS_PREFERENCE, merged);
  };
  const teams = layout.who === 'teams';

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <h2 className="mr-auto flex items-baseline gap-2 font-semibold">
          {t('standings.title')}
          <span className="text-xs font-normal text-muted-foreground">
            {t('standings.after', { number: season.counted, rounds: season.rounds.length })}
          </span>
        </h2>
        {season.classes.length > 1 ? (
          <Segments
            label={t('standings.class')}
            items={season.classes.map((one) => ({ id: one.entry, label: one.name }))}
            value={held?.entry ?? ''}
            onChange={setPicked}
          />
        ) : null}
        <Segments
          label={t('standings.title')}
          items={[
            { id: 'drivers', label: t('standings.drivers') },
            { id: 'teams', label: t('standings.teams') },
          ]}
          value={layout.who}
          onChange={(who) => change({ who })}
        />
        <Segments
          label={t('standings.title')}
          items={[
            { id: 'table', label: t('standings.table') },
            { id: 'grid', label: t('standings.byRound') },
          ]}
          value={layout.shape}
          onChange={(shape) => change({ shape })}
        />
        {layout.shape === 'grid' && !teams ? (
          <Segments
            label={t('standings.byRound')}
            items={[
              { id: 'points', label: t('standings.points') },
              { id: 'positions', label: t('standings.positions') },
            ]}
            value={layout.view}
            onChange={(view) => change({ view })}
          />
        ) : null}
      </div>

      {held && layout.shape === 'grid' ? (
        <StandingsMatrix
          season={held}
          rounds={season.rounds}
          series={series}
          teams={teams}
          view={layout.view}
          playerName={playerName}
          onOpenRound={onOpenRound}
        />
      ) : null}
      {held && layout.shape === 'table' ? (
        <div className="border-t pb-1">
          {teams ? <TeamStandingsTable season={held} series={series} /> : (
            <StandingsTable season={held} series={series} playerName={playerName} />
          )}
        </div>
      ) : null}
    </section>
  );
};
