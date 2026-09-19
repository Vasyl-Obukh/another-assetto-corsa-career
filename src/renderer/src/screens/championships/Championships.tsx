import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChampionshipCard } from './ChampionshipCard.tsx';
import { ChampionshipToolbar } from './ChampionshipToolbar.tsx';
import { CHAMPIONSHIP_MEMORY } from './constants.ts';
import { championshipFilters } from './filters.ts';
import { NoneMatch } from './NoneMatch.tsx';
import { isListed } from './utils.ts';
import { useSettings } from '@/app';
import { ErrorCard, ScreenBody } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionshipBrowser, useChampionships, useSeriesCommands } from '@/hooks';

export const Championships = () => {
  const { t } = useTranslation();
  const championships = useChampionships();
  // Edit is the one command a career's list offers.
  const commands = useSeriesCommands();
  const { settings } = useSettings();

  // What a career can race today. Everything else - and everything that manages
  // the library - lives on the settings tab.
  const listed = useMemo(
    () => championships.listings.filter((listing) => isListed(listing, settings)),
    [championships.listings, settings],
  );
  const filters = useMemo(() => championshipFilters(), []);
  const browser = useChampionshipBrowser(
    listed,
    filters,
    CHAMPIONSHIP_MEMORY.championships,
    !championships.loading,
  );
  const error = championships.error ?? commands.error;

  return (
    <ScreenBody className="flex flex-col gap-4 pt-8 pb-8" scrollRef={browser.scrollRef} backToTop>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t('championships.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('championships.subtitle')}</p>
      </header>

      <ChampionshipToolbar browser={browser} filters={filters} />

      {error ? (
        <ErrorCard
          error={error}
          onDismiss={() => { championships.dismissError(); commands.dismissError(); }}
        />
      ) : null}

      {championships.loading ? <Skeleton className="h-24 w-full" /> : null}

      {!championships.loading && listed.length === 0 && !championships.error ? (
        <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
      ) : null}

      {listed.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

      {browser.shown.map((listing) => (
        <ChampionshipCard key={listing.series.id} listing={listing} commands={commands} />
      ))}
    </ScreenBody>
  );
};
