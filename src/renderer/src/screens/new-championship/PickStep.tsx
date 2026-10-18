import { ArrowRightIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { PICK_MEMORY } from './constants.ts';
import { useSettings } from '@/app';
import {
  BrowserLayout, ErrorCard, Loading, SearchField, TOOLBAR_SEARCH,
} from '@/components';
import { useChampionshipBrowser } from '@/hooks';
import type { ChampionshipsState } from '@/hooks';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';
import {
  championshipFilters, ChampionshipRail, isListed, NoneMatch, SEASON_GRID, SEASON_SKELETON, SeasonCard,
  SeasonCardSkeleton,
} from '@/screens/championships';

interface PickStepProps {
  /**
   * The page's header, which the browser is laid out under.
   */
  heading: ReactNode;
  /**
   * The championship library, read by the page so the step after this one
   * has the championship picked already.
   */
  championships: ChampionshipsState;
  /**
   * The championship picked, by its id, or null.
   */
  picked: string | null;
  /**
   * Picks a championship and goes on to the seat.
   * @param id Its id
   */
  onChoose: (id: string) => void;
}

/**
 * New championship's first step: the championships a season can be raced in,
 * with the Championships page's own rail and search.
 */
export const PickStep = ({
  heading, championships, picked, onChoose,
}: PickStepProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // Switched on and raceable, as the Championships page lists them.
  const listed = useMemo(
    () => championships.listings.filter((listing) => isListed(listing, settings)),
    [championships.listings, settings],
  );
  const filters = useMemo(() => championshipFilters(), []);
  const browser = useChampionshipBrowser(listed, filters, PICK_MEMORY, !championships.loading);

  return (
    <BrowserLayout
      heading={heading}
      rail={(
        // The rail keeps to the top of its column and would shrink to its
        // content's width beside the note, so it is stretched across it.
        <div className="flex min-h-0 flex-col gap-4 [&>aside]:self-stretch">
          <ChampionshipRail browser={browser} filters={filters} loading={championships.loading} />
          <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <p>{t('newChampionship.switchedOn')}</p>
              {/* Where more are switched on, or one of the player's own is
                  made - Back from there returns here. */}
              <Link
                to={path.settingsChampionships()}
                className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
              >
                {t('newChampionship.library')}
                <ArrowRightIcon className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
      toolbar={(
        // A row, as the Championships page's toolbar is: the search field's
        // basis is a width, and in the toolbar's column it would be a height.
        <div className="flex items-center gap-3">
          <SearchField
            value={browser.search}
            placeholder={t('newChampionship.search')}
            inputClassName={TOOLBAR_SEARCH}
            onChange={browser.setSearch}
          />
        </div>
      )}
      scrollRef={browser.scrollRef}
      backToTop
    >
      <div className="flex flex-col gap-4 pb-6">
        {championships.error ? (
          <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
        ) : null}

        {championships.loading ? (
          <Loading className={SEASON_GRID}>
            {slots(SEASON_SKELETON).map((at) => <SeasonCardSkeleton key={at} />)}
          </Loading>
        ) : null}

        {!championships.loading && listed.length === 0 && !championships.error ? (
          <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
        ) : null}

        {listed.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

        {browser.shown.length > 0 ? (
          <div className={SEASON_GRID}>
            {browser.shown.map((listing) => (
              <SeasonCard
                key={listing.series.id}
                listing={listing}
                picked={listing.series.id === picked}
                onPick={() => onChoose(listing.series.id)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </BrowserLayout>
  );
};
