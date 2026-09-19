import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { SeriesImportResult } from '../../../../shared/types';
import { hiddenBySources } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import { ErrorCard, ProblemList, ScreenBody } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useChampionshipBrowser, useChampionships, useSeriesCommands } from '@/hooks';
import { path } from '@/lib/routes';
import {
  CHAMPIONSHIP_MEMORY, ChampionshipCard, championshipFilters, ChampionshipToolbar, NoneMatch,
} from '@/screens/championships';

export const ChampionshipLibrary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const championships = useChampionships();
  const commands = useSeriesCommands();
  const { settings } = useSettings();
  const [refused, setRefused] = useState<SeriesImportResult | null>(null);

  // One card rather than two: the two hooks fail for the same kinds of reason,
  // and stacking a second banner under the first says nothing extra.
  const error = championships.error ?? commands.error;
  // A championship of ours the content sources leave out is not listed at all,
  // since those switches are how it is turned back on. The user's own are never
  // switched off that way, so they are always here.
  const offered = useMemo(
    () => championships.listings.filter(
      (listing) => !hiddenBySources(listing, settings.hiddenContentSources),
    ),
    [championships.listings, settings.hiddenContentSources],
  );
  // Rebuilt with the switches, since whether one is on is one of the filters.
  const filters = useMemo(
    () => championshipFilters({ seriesActive: settings.seriesActive }),
    [settings.seriesActive],
  );
  const browser = useChampionshipBrowser(
    offered,
    filters,
    CHAMPIONSHIP_MEMORY.library,
    !championships.loading,
  );

  return (
    <ScreenBody className="flex flex-col gap-6 py-6" scrollRef={browser.scrollRef} backToTop>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* Nothing is written until the editor's first Save, so this is a
            navigation rather than a command. */}
        <Button variant="outline" onClick={() => navigate(path.championshipNew())}>
          <PlusIcon />
          {t('common.new')}
        </Button>

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
            }, () => undefined);
          }}
        >
          {t('championships.actions.import')}
        </Button>
      </div>

      {error ? (
        <ErrorCard
          error={error}
          onDismiss={() => { championships.dismissError(); commands.dismissError(); }}
        />
      ) : null}

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

      <ChampionshipToolbar browser={browser} filters={filters} />

      {championships.loading ? <Skeleton className="h-24 w-full" /> : null}

      {offered.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

      {browser.shown.map((listing) => (
        <ChampionshipCard key={listing.series.id} listing={listing} commands={commands} manage />
      ))}
    </ScreenBody>
  );
};
