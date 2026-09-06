import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PathParam } from 'react-router';
import { Link, useNavigate, useParams } from 'react-router';

import { EnterRoundDialog } from './EnterRoundDialog.tsx';
import { EntryCard } from './EntryCard.tsx';
import { FormatCard } from './FormatCard.tsx';
import { MissingContent } from './MissingContent.tsx';
import { PointsCard } from './PointsCard.tsx';
import { RoundRow } from './RoundRow.tsx';
import { entryAvailability } from './utils.ts';
import type { Round } from '../../../../shared/types';
import { ErrorCard, ScreenBody } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionship } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';

export const ChampionshipDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<PathParam<typeof ROUTE.championship>>();
  const championship = useChampionship(id);
  const [entering, setEntering] = useState<Round | null>(null);

  const { listing } = championship;

  return (
    <ScreenBody className="flex flex-col gap-4 py-8">
      <Link
        to={path.championships()}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('championships.back')}
      </Link>

      {championship.error ? (
        <ErrorCard error={championship.error} onDismiss={championship.dismissError} />
      ) : null}

      {championship.loading ? <Skeleton className="h-24 w-full" /> : null}

      {!championship.loading && listing === null && !championship.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.notFound')}</p>
      ) : null}

      {listing ? (
        <>
          <header className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold">{listing.series.name}</h1>
              <Badge variant={listing.availability.available ? 'secondary' : 'destructive'}>
                {t(listing.availability.available
                  ? 'championships.available'
                  : 'championships.unavailable')}
              </Badge>
            </div>
            {listing.series.notes ? (
              <p className="text-sm text-muted-foreground">{listing.series.notes}</p>
            ) : null}
          </header>

          <Card>
            <CardHeader><CardTitle>{t('championships.entries.title')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {listing.series.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  availability={entryAvailability(listing, entry.id)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('championships.calendar.title')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col">
              {listing.series.rounds.map((round, index) => (
                <RoundRow
                  key={round.id}
                  listing={listing}
                  round={round}
                  number={index + 1}
                  busy={championship.busy}
                  onRace={() => setEntering(round)}
                />
              ))}
            </CardContent>
          </Card>

          <FormatCard series={listing.series} />

          <PointsCard
            systems={listing.series.pointsSystems}
            defaultSystem={listing.series.defaultPointsSystem}
            drops={listing.series.drops}
          />

          {listing.availability.available ? null : (
            <Card>
              <CardHeader><CardTitle>{t('championships.missing.title')}</CardTitle></CardHeader>
              <CardContent><MissingContent listing={listing} /></CardContent>
            </Card>
          )}

          <EnterRoundDialog
            key={entering?.id ?? ''}
            round={entering}
            listing={listing}
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
