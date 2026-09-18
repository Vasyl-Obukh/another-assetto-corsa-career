import { useTranslation } from 'react-i18next';

import { ChampionshipCard } from './ChampionshipCard.tsx';
import { isListed } from './utils.ts';
import { useSettings } from '@/app';
import { ErrorCard, ScreenBody } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionships } from '@/hooks';

export const Championships = () => {
  const { t } = useTranslation();
  const championships = useChampionships();
  const { settings } = useSettings();

  // What a career can race today. Everything else - and everything that changes
  // a championship - lives on the settings tab.
  const listed = championships.listings.filter((listing) => isListed(listing, settings));

  return (
    <ScreenBody className="flex flex-col gap-4 py-8" backToTop>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('championships.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('championships.subtitle')}</p>
      </header>

      {championships.error ? (
        <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
      ) : null}

      {championships.loading ? <Skeleton className="h-24 w-full" /> : null}

      {!championships.loading && listed.length === 0 && !championships.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
      ) : null}

      {listed.map((listing) => (
        <ChampionshipCard key={listing.series.id} listing={listing} />
      ))}
    </ScreenBody>
  );
};
