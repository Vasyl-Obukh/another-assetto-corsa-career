import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ChampionshipCard } from './ChampionshipCard.tsx';
import { ErrorCard, ScreenBody } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionships } from '@/hooks';
import { useAppError } from '@/i18n';

export const Championships = () => {
  const { t } = useTranslation();
  const championships = useChampionships();
  const describeError = useAppError();

  return (
    <ScreenBody className="flex flex-col gap-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('championships.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('championships.subtitle')}</p>
      </header>

      {championships.error ? (
        <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
      ) : null}

      {championships.loading ? <Skeleton className="h-24 w-full" /> : null}

      {/* A file the user wrote that would not load is not the same as the read
          failing - the rest of the library is fine - so it is said here rather
          than replacing the list with an error. */}
      {championships.problems.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-md border border-destructive/50 p-3">
          <span className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangleIcon className="size-4" />
            {t('championships.problems.label', { count: championships.problems.length })}
          </span>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
            {championships.problems.map((problem) => (
              <li key={problem.code + problem.message} data-selectable>
                {describeError(problem)}
              </li>
            ))}
          </ul>
          <span className="text-xs text-muted-foreground">
            {t('championships.problems.hint')}
          </span>
        </div>
      ) : null}

      {!championships.loading && championships.listings.length === 0 && !championships.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
      ) : null}

      {championships.listings.map((listing) => (
        <ChampionshipCard key={listing.series.id} listing={listing} />
      ))}
    </ScreenBody>
  );
};
