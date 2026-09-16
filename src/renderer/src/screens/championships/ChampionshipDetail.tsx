import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { useNavigate, useParams } from 'react-router';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { EnterRoundDialog } from './EnterRoundDialog.tsx';
import { EntryCard } from './EntryCard.tsx';
import { FormatCard } from './FormatCard.tsx';
import { MissingContent } from './MissingContent.tsx';
import { MoneyCard } from './MoneyCard.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { PointsCard } from './PointsCard.tsx';
import { RoundRow } from './RoundRow.tsx';
import { availabilityState, entryAvailability } from './utils.ts';
import type { Round } from '../../../../shared/types';
import {
  ClimateBadge, ErrorCard, ProblemList, ScreenBody, ScreenHeader,
} from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionship, useForecast, useSeriesCommands } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';

export const ChampionshipDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<PathParam<typeof ROUTE.championship>>();
  const championship = useChampionship(id);
  const commands = useSeriesCommands();
  const forecasts = useForecast(id === '' ? undefined : id);
  const [entering, setEntering] = useState<Round | null>(null);

  /**
   * One round's forecast, when the championship generates its weather.
   * @param round The round's id
   * @returns Its forecast, or null
   */
  const forecastOf = (round: string | undefined) => (
    forecasts.find((one) => one.round === round) ?? null
  );

  const { listing } = championship;
  // One card rather than two: the two hooks fail for the same kinds of reason,
  // and stacking a second banner under the first says nothing extra.
  const error = championship.error ?? commands.error;

  return (
    <ScreenBody className="flex flex-col gap-4 pb-8">
      <ScreenHeader back={{ to: path.championships(), label: t('championships.back') }}>
        {listing ? (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{listing.series.name}</h1>
            <OriginBadge origin={listing.origin} />
            <AvailabilityBadge availability={listing.availability} />

            <div className="ml-auto">
              <ChampionshipActions
                listing={listing}
                commands={commands}
                onDeleted={() => navigate(path.championships())}
              />
            </div>
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

          {/* Above the calendar, because it is why every Race button below is
              dead - and installing content will not change that. */}
          <ProblemList
            problems={listing.availability.problems}
            label={t('championships.problems.series', {
              count: listing.availability.problems.length,
            })}
            hint={t('championships.problems.seriesHint')}
          />

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
                  onRace={() => setEntering(round)}
                />
              ))}
            </CardContent>
          </Card>

          <FormatCard series={listing.series} />

          <PointsCard
            systems={listing.series.pointsSystems}
            defaultSystem={listing.series.defaultPointsSystem}
          />

          <MoneyCard entryFee={listing.series.entryFee} prizes={listing.series.prizes} />

          {/* Only when content is genuinely what is missing. A misconfigured
              file's entries and rounds are derived from a document already
              declared incoherent, so the list behind it is not worth showing. */}
          {availabilityState(listing.availability) === 'unavailable' ? (
            <Card>
              <CardHeader><CardTitle>{t('championships.missing.title')}</CardTitle></CardHeader>
              <CardContent><MissingContent listing={listing} /></CardContent>
            </Card>
          ) : null}

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

        </>
      ) : null}
    </ScreenBody>
  );
};
