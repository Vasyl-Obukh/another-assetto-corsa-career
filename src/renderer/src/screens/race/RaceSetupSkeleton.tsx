import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CAR_TILE_SKELETON, CLASS_SKELETON } from './constants.ts';
import { RaceSection } from './RaceSection.tsx';
import { Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';
import { GridFieldsSkeleton, RulesCardSkeleton } from '@/screens/championship-editor';

/**
 * The setup half of a race event's page while it is read: the classes with
 * one open, the sessions beside the one open, and the rules in their three
 * panes - every heading and label written out, every value still to come.
 */
export const RaceSetupSkeleton = () => {
  const { t } = useTranslation();

  return (
    <>
      <RaceSection title={t('race.classes.title')} hint={t('race.classes.hint')}>
        <Card className="gap-4 p-4">
          <div className="grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-2">
              {slots(CLASS_SKELETON).map((at) => <Shimmer key={at} className="h-15 w-full rounded-lg" />)}
              <span className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-dashed text-sm font-medium text-muted-foreground">
                <PlusIcon className="size-4" />
                {t('race.classes.add')}
              </span>
              <div className="mt-1 flex flex-col gap-1.5">
                <Shimmer className="h-2.5 w-full rounded-full" />
                <Shimmer className="h-3 w-40" />
              </div>
            </div>

            <Card className="gap-0 overflow-hidden py-0">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Shimmer className="h-5.5 w-12" />
                <Shimmer className="h-5.5 w-28" />
                {/* The move and remove buttons' row height. */}
                <Shimmer className="ml-auto h-9 w-40 rounded-md" />
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">{t('race.classes.name')}</span>
                  <Shimmer className="h-9 w-full rounded-md" />
                </div>
                <div className="grid items-end gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{t('editor.eligibility.kind')}</span>
                    <Shimmer className="h-8.25 w-28 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{t('editor.eligibility.specLabel')}</span>
                    <Shimmer className="h-8.25 w-full rounded-md" />
                  </div>
                </div>
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
                  {slots(CAR_TILE_SKELETON).map((at) => (
                    <li key={at} className="flex flex-col overflow-hidden rounded-md border bg-card">
                      <Shimmer deep className="aspect-[16/9] w-full rounded-none" />
                      <span className="flex px-2 py-1.5 text-xs">
                        <Shimmer className="my-0.5 h-3 w-24" />
                      </span>
                    </li>
                  ))}
                </ul>
                <h3 className="border-t pt-4 text-sm font-semibold">{t('race.classes.drivers')}</h3>
                <GridFieldsSkeleton />
              </div>
            </Card>
          </div>
        </Card>
      </RaceSection>

      <RaceSection title={t('race.event.title')} hint={t('race.event.hint')}>
        <Card className="gap-0 overflow-hidden py-0">
          <div className="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-2 border-b bg-muted/30 p-3 lg:border-r lg:border-b-0">
              <Shimmer className="h-12 w-full rounded-lg" />
              <Shimmer className="h-10 w-full rounded-lg" />
              <Shimmer className="h-10 w-full rounded-lg" />
              <span className="flex h-8 items-center justify-center gap-2 rounded-lg border border-dashed text-sm font-medium text-muted-foreground">
                <PlusIcon className="size-4" />
                {t('editor.sessions.add')}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Shimmer className="h-5.5 w-16" />
                <Shimmer className="h-5 w-28" />
              </div>
              <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">{t('editor.sessions.type')}</span>
                  <Shimmer className="h-8.25 w-52 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">{t('editor.sessions.name')}</span>
                  <Shimmer className="h-9 w-full rounded-md" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{t('editor.sessions.length')}</span>
                <Shimmer className="h-9 w-56 rounded-md" />
              </div>
              <Shimmer className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </Card>
      </RaceSection>

      <RaceSection title={t('race.rules.title')} hint={t('race.rules.hint')}>
        <RulesCardSkeleton />
      </RaceSection>
    </>
  );
};
