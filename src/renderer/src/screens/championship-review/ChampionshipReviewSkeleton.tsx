import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { REVIEW_SKELETON } from './constants.ts';
import { Loading, ResultStrip, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';

/**
 * A review while the career is read: the hero, the figures under their real
 * labels, and every card under its real heading with its rows still to come.
 */
export const ChampionshipReviewSkeleton = () => {
  const { t } = useTranslation();
  const figure = { value: <Shimmer className="h-6 w-12" />, detail: <Shimmer className="h-3 w-20" /> };

  return (
    <Loading className="flex flex-col gap-4">
      <section className="relative flex min-h-52 items-center justify-between rounded-xl border bg-card px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-1.5">
            <Shimmer className="h-5.5 w-24" />
            <Shimmer className="h-5.5 w-14" />
            <Shimmer className="h-5.5 w-12" />
            <Shimmer className="h-5.5 w-20" />
          </div>
          <Shimmer className="h-8 w-96" />
          <Shimmer className="h-3.5 w-[28rem]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Shimmer className="h-14 w-18 rounded-xl" />
          <Shimmer className="h-3.5 w-16" />
          <Shimmer className="h-3 w-14" />
        </div>
      </section>

      <ResultStrip
        figures={[
          { label: t('review.figures.points'), ...figure },
          { label: t('review.figures.wins'), ...figure },
          { label: t('review.figures.poles'), ...figure },
          { label: t('review.figures.best'), ...figure },
          { label: t('review.figures.starts'), ...figure },
        ]}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <TrophyIcon className="size-4" />
              {t('review.champions')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['driversChampion', 'teamsChampion'] as const).map((kind) => (
                <div key={kind} className="flex flex-col overflow-hidden rounded-lg border">
                  <Shimmer deep className="aspect-[16/6] w-full rounded-none" />
                  <div className="flex flex-col gap-1.5 px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-wide text-podium-gold-foreground uppercase">
                      <TrophyIcon className="size-3.5" />
                      {t(`review.${kind}`)}
                    </span>
                    <Shimmer className="h-4 w-40" />
                    <Shimmer className="h-3 w-44" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">{t('review.path')}</h2>
              <span className="text-xs text-muted-foreground">{t('review.pathHint')}</span>
            </header>
            <Shimmer className="h-44 w-full" />
            <div className="grid grid-cols-5 gap-1.5">
              {slots(REVIEW_SKELETON.rounds).map((at) => <Shimmer key={at} className="h-18 w-full rounded-lg" />)}
            </div>
          </section>

          <section className="flex flex-col rounded-xl border bg-card shadow-sm">
            <h2 className="px-4 py-3 font-semibold">{t('review.standings')}</h2>
            {slots(REVIEW_SKELETON.rows).map((at) => (
              <div key={at} className="flex items-center gap-3 border-t px-4 py-2">
                <Shimmer className="h-6 w-8" />
                <Shimmer className="size-3 rounded-full" />
                <div className="flex flex-1 flex-col gap-1">
                  <Shimmer className="h-3.5 w-36" />
                  <Shimmer className="h-3 w-24" />
                </div>
                <Shimmer className="h-3.5 w-10" />
              </div>
            ))}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="flex flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-sm">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-4.5 w-52" />
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="mt-1 h-10 w-full" />
          </section>
          <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">{t('review.teammate')}</h2>
            <div className="flex justify-between">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-3.5 w-24" />
            </div>
            {(['qualifyingAhead', 'finishAhead', 'teammatePoints'] as const).map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-center text-xs text-muted-foreground">{t(`review.${label}`)}</span>
                <Shimmer className="h-2 w-full rounded-full" />
              </div>
            ))}
          </section>
        </aside>
      </div>
    </Loading>
  );
};
