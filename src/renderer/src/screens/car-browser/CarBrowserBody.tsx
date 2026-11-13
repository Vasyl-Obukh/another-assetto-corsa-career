import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CarCard } from './CarCard.tsx';
import { CarCardSkeleton } from './CarCardSkeleton.tsx';
import { CarRail } from './CarRail.tsx';
import { CarTable } from './CarTable.tsx';
import { CAR_SORTS, DISCOUNT_SORT, PRICE_SORT } from './constants.ts';
import { carPills } from './pills.ts';
import type { Car, CarQuery } from '../../../../shared/types';
import { saleOffs } from '../../../../shared/utils/car-sale';
import { useClasses, useSettings } from '@/app';
import {
  ActiveFilters, BrowserGrid, BrowserLayout, SearchField, SortMenu, TOOLBAR_SEARCH, ViewToggle,
} from '@/components';
import type { BrowserToggle, CarAppraise, CarTrade } from '@/components';
import { useCarBrowser, useInfiniteScroll, useRacingIndex } from '@/hooks';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { isListed } from '@/screens/championships';

interface CarBrowserBodyProps {
  /**
   * Called with a car when the browser is being picked from rather than read.
   *
   * This is the whole difference between the Cars page and a car picker: the
   * search, the facets, the paging and the cards are the same either way.
   */
  onSelect?: (car: Car) => void;
  /**
   * Folder ID of the car already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * A query every request is narrowed by, before the user filters anything.
   *
   * What a restricted picker is: the search, the facets and the paging all work
   * as they do on the Cars page, over a smaller library.
   */
  baseQuery?: CarQuery;
  /**
   * Which browser this is, for one that comes back to the filters it was left
   * with. Omitted, it opens unfiltered every time - which is what a picker
   * wants, since its library is already restricted to one question.
   */
  memoryId?: string;
  /**
   * A switch on every card, for a browser deciding something about each car
   * rather than opening or picking one.
   */
  toggle?: BrowserToggle;
  /**
   * What the browser does with money, inside a career: the Store, the Garage,
   * or a picker that shows what each car costs. Every card and row says it, the
   * list sorts and filters by price, and the Garage shows its own table.
   */
  trade?: CarTrade;
  /**
   * What the browser does with prices, in Your content: every car switched on
   * shows its price, where that comes from and Edit price, the list sorts by
   * price, and the rail filters on where a price comes from.
   */
  appraise?: CarAppraise;
  /**
   * Filters of the page's own, at the head of the rail - the Store's switches
   * for the cars the career owns and can afford.
   */
  railTop?: ReactNode;
  /**
   * The page's title and what it is, for a browser that is a page - left out,
   * it heads nothing.
   */
  heading?: { title: string; subtitle: string };
  /**
   * A car the page leads with above the list - the Store's Deal of the week -
   * and what stands there for it, while nothing narrows the list. Meanwhile
   * the list leaves it out.
   */
  lead?: { model: string; render: (racing: Racing | undefined) => ReactNode };
}

export const CarBrowserBody = ({
  onSelect, selectedId, baseQuery, memoryId, toggle, trade, appraise, railTop, heading, lead,
}: CarBrowserBodyProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { catalogue } = useClasses();
  const { settings } = useSettings();

  // What a career can race, which is what the Championships page lists.
  const racing = useRacingIndex((listing) => isListed(listing, settings));
  const raced = useMemo(() => (racing === null ? undefined : [...racing.cars.keys()]), [racing]);

  // A browser selling cars prices them at the week's sale, which its sort, its
  // price filter and what the career can pay all read.
  const deals = trade !== undefined && trade.mode !== 'garage' ? trade.garage.deals : null;
  const offs = useMemo(() => (deals && deals.length > 0 ? saleOffs(deals) : null), [deals]);
  const query = offs ? { ...baseQuery, sale: offs } : baseQuery;
  const browser = useCarBrowser(query, memoryId, raced, lead?.model);
  const { list, criteria } = browser;
  const view = criteria.view ?? 'cards';
  // A Discount sort remembered from a week with a sale reads as Name in one
  // without, which is how the list falls back anyway.
  const sort = criteria.sort === 'discount' && !offs ? 'name' : criteria.sort ?? 'name';
  const direction = criteria.direction ?? 'asc';

  let sortItems = CAR_SORTS;
  if (trade || appraise) sortItems = offs ? [...CAR_SORTS, PRICE_SORT, DISCOUNT_SORT] : [...CAR_SORTS, PRICE_SORT];

  const { scrollRef, sentinelRef } = useInfiniteScroll(
    list.loadMore,
    !list.loading && !list.exhausted,
  );

  return (
    <BrowserLayout
      heading={heading ? (
        <header className="flex flex-col gap-1 pt-8">
          <h1 className="text-2xl font-semibold">{heading.title}</h1>
          <p className="text-sm text-muted-foreground">{heading.subtitle}</p>
        </header>
      ) : undefined}
      rail={(
        <CarRail
          top={railTop}
          priced={trade !== undefined}
          appraised={appraise !== undefined}
          criteria={criteria}
          facets={browser.facets}
          filtered={browser.filtered}
          onChange={browser.setCriteria}
          onClear={browser.clear}
        />
      )}
      toolbar={(
        <>
          <div className="flex items-center gap-2">
            <SearchField
              value={browser.search}
              placeholder={t('cars.searchPlaceholder')}
              inputClassName={TOOLBAR_SEARCH}
              onChange={browser.setSearch}
            />
            <SortMenu
              items={sortItems}
              value={sort}
              direction={direction}
              onChange={(next) => browser.setCriteria({ ...criteria, sort: next })}
              onDirectionChange={(next) => browser.setCriteria({ ...criteria, direction: next })}
            />
            <ViewToggle value={view} onChange={(next) => browser.setCriteria({ ...criteria, view: next })} />
          </div>
          <ActiveFilters
            filters={carPills(criteria, browser.facets, catalogue, t, format, browser.setCriteria)}
            shown={list.items.length}
            total={list.total}
            stale={browser.stale}
            loading={list.loading}
            onClear={browser.clear}
            onRefresh={browser.refresh}
          />
        </>
      )}
      scrollRef={scrollRef}
      backToTop={heading !== undefined}
    >
      {lead && browser.leading ? <div className="pb-4">{lead.render(racing?.cars.get(lead.model))}</div> : null}
      <BrowserGrid
        list={list}
        view={view}
        cardSkeleton={<CarCardSkeleton trade={trade?.mode} />}
        filtered={browser.filtered}
        sentinelRef={sentinelRef}
        onClear={browser.clear}
      >
        {view === 'cards' ? list.items.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            racing={racing?.cars.get(car.id)}
            onSelect={onSelect}
            selected={car.id === selectedId}
            toggle={toggle}
            trade={trade}
            appraise={appraise}
          />
      )) : (
        <CarTable
          cars={list.items}
          racing={racing}
          sort={sort}
          direction={direction}
          loading={list.loading}
          onSort={(next, way) => browser.setCriteria({ ...criteria, sort: next, direction: way })}
          onSelect={onSelect}
          selectedId={selectedId}
          toggle={toggle}
          trade={trade}
          appraise={appraise}
        />
      )}
      </BrowserGrid>
    </BrowserLayout>
  );
};
