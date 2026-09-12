import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ChampionshipCard } from './ChampionshipCard.tsx';
import type { SeriesImportResult } from '../../../../shared/types';
import { ErrorCard, ProblemList, ScreenBody } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionships, useSeriesCommands } from '@/hooks';
import { path } from '@/lib/routes';

export const Championships = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const championships = useChampionships();
  const commands = useSeriesCommands();
  const [refused, setRefused] = useState<SeriesImportResult | null>(null);

  const error = championships.error ?? commands.error;

  return (
    <ScreenBody className="flex flex-col gap-4 py-8" backToTop>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('championships.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('championships.subtitle')}</p>
        </div>

        {/* The one control on this screen, and it belongs here rather than on a
            card: importing is a library-level action, and the cards are links
            end to end - a button inside one would be a control nested in an
            anchor, with the click targets genuinely overlapping. */}
        <Button
          variant="outline"
          disabled={commands.busy}
          onClick={() => {
            commands.importSeries().then((result) => {
              if (!result) return;
              // A file that held no championship is reported here rather than
              // written: it must not become a permanent entry in the library's
              // own problems that the user then has to delete by hand.
              if (result.id === null) { setRefused(result); return; }

              setRefused(null);
              navigate(path.championship({ id: result.id }));
            }, () => undefined);
          }}
        >
          {t('championships.actions.import')}
        </Button>
      </header>

      {error ? (
        <ErrorCard
          error={error}
          onDismiss={() => { championships.dismissError(); commands.dismissError(); }}
        />
      ) : null}

      {championships.loading ? <Skeleton className="h-24 w-full" /> : null}

      {refused ? (
        <ProblemList
          problems={refused.problems}
          label={t('championships.import.failed', { count: refused.problems.length })}
          hint={t('championships.import.failedHint')}
        />
      ) : null}

      {/* A file the user wrote that would not load is not the same as the read
          failing - the rest of the library is fine - so it is said here rather
          than replacing the list with an error. */}
      <ProblemList
        problems={championships.problems}
        label={t('championships.problems.label', { count: championships.problems.length })}
        hint={t('championships.problems.hint')}
      />

      {!championships.loading && championships.listings.length === 0 && !championships.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
      ) : null}

      {championships.listings.map((listing) => (
        <ChampionshipCard key={listing.series.id} listing={listing} commands={commands} />
      ))}
    </ScreenBody>
  );
};
