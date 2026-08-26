import { ArrowLeftIcon, CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import type { PathParam } from 'react-router';

import { SKIN_GRID, SKIN_SKELETON_COUNT } from './constants.ts';
import { SkinCard } from './SkinCard.tsx';
import { carBadgeUrl, isSafeSegment } from '../../../../shared/utils/content-url';
import { ContentImage, ErrorCard, ProvenanceBadges, SpecBadge } from '@/components';
import { SearchField } from '@/components/browser';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCarDetail } from '@/hooks';
import { useFormat } from '@/i18n';
import { path, ROUTE } from '@/lib/routes';

export const CarDetail = () => {
  const { t } = useTranslation();
  const { formatNumber, formatYear } = useFormat();
  const { id = '' } = useParams<PathParam<typeof ROUTE.car>>();
  const detail = useCarDetail(id);

  const { car, skins } = detail;

  const back = (
    <Button asChild size="sm" variant="ghost" className="-ml-2 w-fit">
      <Link to={path.cars()}>
        <ArrowLeftIcon />
        {t('cars.detail.back')}
      </Link>
    </Button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-8 py-6">
        {back}

        {detail.error !== null ? (
          <ErrorCard error={detail.error} onDismiss={detail.dismissError} />
        ) : null}

        {detail.loading ? (
          <>
            <Skeleton className="h-16 w-80" />
            <div className={SKIN_GRID}>
              {Array.from({ length: SKIN_SKELETON_COUNT }, (unused, index) => index).map((key) => (
                <Skeleton key={key} className="h-64" />
              ))}
            </div>
          </>
        ) : null}

        {detail.missing ? (
          <p className="py-12 text-center text-muted-foreground">
            {t('cars.detail.notFound', { id })}
          </p>
        ) : null}

        {car !== null ? (
          <>
            <header className="flex items-center gap-4">
              <div className="relative size-16 shrink-0">
                <ContentImage
                  sources={isSafeSegment(car.id) ? [carBadgeUrl(car.id)] : []}
                  alt={car.name}
                  className="object-contain"
                  fallback={(
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CarIcon className="size-8 text-muted-foreground/40" />
                    </div>
                  )}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="truncate text-2xl font-semibold" title={car.name}>{car.name}</h1>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="mr-1 text-sm text-muted-foreground">
                    {car.brand ?? t('browse.unknown')}
                  </span>
                  {car.year !== null ? (
                    <Badge variant="outline">{formatYear(car.year)}</Badge>
                  ) : null}
                  <ProvenanceBadges provenance={car.provenance} />
                  <SpecBadge carId={car.id} />
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {car.skins.length === 0
                  ? t('cars.noSkins')
                  : t('browse.showing', {
                    shown: formatNumber(skins.length),
                    total: formatNumber(car.skins.length),
                  })}
              </span>

              {car.skins.length > 0 ? (
                <SearchField
                  value={detail.search}
                  placeholder={t('cars.detail.searchPlaceholder')}
                  onChange={detail.setSearch}
                />
              ) : null}
            </div>

            {skins.length > 0 ? (
              <div className={SKIN_GRID}>
                {skins.map((skin) => <SkinCard key={skin.id} carId={car.id} skin={skin} />)}
              </div>
            ) : null}

            {car.skins.length > 0 && skins.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <p className="text-muted-foreground">{t('cars.detail.noMatch')}</p>
                <Button variant="outline" size="sm" onClick={detail.clear}>
                  {t('browse.clearSearch')}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};
