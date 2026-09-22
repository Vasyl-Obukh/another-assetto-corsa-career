import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { useNavigate, useParams } from 'react-router';

import { ChampionshipActions } from './ChampionshipActions.tsx';
import { EnterRoundDialog } from './EnterRoundDialog.tsx';
import { EntryCard } from './EntryCard.tsx';
import { FormatCard } from './FormatCard.tsx';
import { MoneyCard } from './MoneyCard.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { PointsCard } from './PointsCard.tsx';
import { RoundRow } from './RoundRow.tsx';
import { entryAvailability } from './utils.ts';
import type { Round } from '../../../../shared/types';
import {
  ClimateBadge, ErrorCard, ScreenBody, ScreenHeader,
} from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCareer, useChampionship, useForecast, useSeriesCommands } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';
import { StandingsCard } from '@/screens/calendar';

interface ChampionshipDetailProps {
  /**
   * Whether the page is the settings tab's, which manages the library rather
   * than racing it: the whole menu, and no round can be raced from it. Left
   * out, it is the page a career reads, with Edit its only command.
   */
  manage?: boolean;
}

// Read-only either way: every change is made in the editor the menu opens.
export const ChampionshipDetail = ({ manage = false }: ChampionshipDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<PathParam<typeof ROUTE.championship>>();
  const championship = useChampionship(id);
  const commands = useSeriesCommands();
  const forecasts = useForecast(id === '' ? undefined : id);
  // The season this championship is being raced in, when the career has entered
  // it: what dates its rounds and what its standings are.
  const career = useCareer();
  const [entering, setEntering] = useState<Round | null>(null);

  const season = career.career?.seasons[career.career.seasons.length - 1];
  const entered = season?.entries.find((one) => one.series === id && !one.withdrawn) ?? null;

  /**
   * One round's place on the career's calendar, when it has one.
   * @param round The round's id
   * @returns Its dated event, or undefined
   */
  const eventOf = (round: string) => entered?.events.find((one) => one.round === round);

  /**
   * One round's forecast, when the championship generates its weather.
   * @param round The round's id
   * @returns Its forecast, or null
   */
  const forecastOf = (round: string | undefined) => (
    forecasts.find((one) => one.round === round) ?? null
  );

  const { listing } = championship;
  // Each back to the list it was opened from: a championship on the settings
  // tab may be switched off, and then the Championships page does not list it.
  const back = manage
    ? { to: path.settingsChampionships(), label: t('editor.back') }
    : { to: path.championships(), label: t('championships.back') };
  const here = manage ? path.settingsChampionship({ id }) : path.championship({ id });
  // One card rather than two, as on the settings tab.
  const error = championship.error ?? commands.error;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={back}>
        {listing ? (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-semibold">{listing.series.name}</h1>
            <OriginBadge origin={listing.origin} />
            <ChampionshipActions
              listing={listing}
              commands={commands}
              manage={manage}
              returnTo={{ to: here, label: 'championships.backToChampionship' }}
              onDeleted={() => navigate(back.to)}
            />
          </div>
        ) : null}
      </ScreenHeader>

      {error ? (
        <ErrorCard
          error={error}
          onDismiss={() => { championship.dismissError(); commands.dismissError(); }}
        />
      ) : null}

      {championship.loading ? <Skeleton className="h-24 w-full" /> : null}

      {!championship.loading && listing === null && !championship.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.notFound')}</p>
      ) : null}

      {listing ? (
        <>
          {/* Under the pinned header rather than in it, so the bar stays two
              lines however much the description says. */}
          {listing.series.description ? (
            <p className="text-sm text-muted-foreground">{listing.series.description}</p>
          ) : null}
          {/* Only ever set by Duplicate, and it is a record of where the copy
              came from rather than a live link - the original may since have
              changed, or be gone. */}
          {listing.series.forkedFrom ? (
            <p className="text-xs text-muted-foreground">
              {t('championships.forkedFrom', { series: listing.series.forkedFrom })}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>
                {t('championships.entries.title', { count: listing.series.entries.length })}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {listing.series.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  availability={entryAvailability(listing, entry.id)}
                  teams={listing.series.teams ?? []}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{t('championships.calendar.title')}</CardTitle>
                {/* The climate every round expects unless it names its own, which
                    is why a round row only badges the ones that do. */}
                {listing.series.generatedWeather ? (
                  <ClimateBadge climate={listing.series.generatedWeather.climate} />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              {listing.series.rounds.map((round, index) => (
                <RoundRow
                  key={round.id}
                  listing={listing}
                  round={round}
                  number={index + 1}
                  busy={championship.busy}
                  forecast={forecastOf(round.id)}
                  date={eventOf(round.id)?.raceDay}
                  status={eventOf(round.id)?.status}
                  onRace={manage ? undefined : () => setEntering(round)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Only on the page a career races from, and only once it is in this
              championship: the settings tab manages the library rather than
              running a season in it. */}
          {!manage && entered ? (
            <StandingsCard entry={entered} seriesName={listing.series.name} />
          ) : null}

          <FormatCard series={listing.series} />

          <PointsCard
            systems={listing.series.pointsSystems}
            defaultSystem={listing.series.defaultPointsSystem}
          />

          <MoneyCard
            entryFee={listing.series.entryFee}
            prizes={listing.series.prizes}
            entries={listing.series.entries}
          />

          {manage ? null : (
            <EnterRoundDialog
              key={entering?.id ?? ''}
              round={entering}
              listing={listing}
              forecast={forecastOf(entering?.id)}
              busy={championship.busy}
              onClose={() => setEntering(null)}
              onConfirm={(entry, car, skin) => {
              if (!entering) return;

              championship.enterRound(entry, entering.id, car, skin).then((ok) => {
                setEntering(null);
                if (ok) navigate(path.race());
              }, () => setEntering(null));
            }}
            />
          )}

        </>
      ) : null}
    </ScreenBody>
  );
};
