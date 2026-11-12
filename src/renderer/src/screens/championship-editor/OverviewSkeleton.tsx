import type { ReactNode } from 'react';


import { PaneHeading } from './PaneHeading.tsx';
import { RulesCardSkeleton } from './RulesCardSkeleton.tsx';
import { Loading, Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useKindTranslation } from '@/i18n';

/**
 * A field of the form while the championship is read: its real label, and an
 * input whose value is still to come.
 * @param label The field's label, already translated
 * @param hint Its hint, when it has one
 * @returns The field
 */
const field = (label: ReactNode, hint?: string) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex h-9 items-center rounded-md border px-3">
      <Shimmer className="h-3 w-2/5" />
    </div>
    {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
  </div>
);

/**
 * The Overview tab while the championship is read: both cards with their real
 * headings, labels and hints, and every value still to come.
 */
export const OverviewSkeleton = () => {
  const { t } = useKindTranslation();

  return (
    <Loading className="flex flex-col gap-4">
      <Card className="grid gap-0 py-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 p-6">
          <PaneHeading>{t('editor.details.identity')}</PaneHeading>
          {field(t('editor.details.name'))}
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-sm font-medium">{t('editor.details.description')}</span>
            <div className="flex min-h-28 flex-col gap-2 rounded-md border px-3 py-3">
              <Shimmer className="h-3 w-11/12" />
              <Shimmer className="h-3 w-1/3" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t p-6 lg:border-t-0 lg:border-l">
          <PaneHeading>{t('editor.details.season')}</PaneHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            {field(t('editor.details.entryFee'), t('editor.details.entryFeeShort'))}
            {field(t('editor.details.seasonLength'), t('editor.details.seasonLengthShort'))}
            {field(t('editor.details.raceWeekday'), t('editor.details.raceWeekdayShort'))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{t('editor.details.generatedWeather')}</span>
              <span className="text-xs text-muted-foreground">{t('editor.details.generatedWeatherShort')}</span>
            </div>
            <Shimmer className="h-[1.15rem] w-8 rounded-full" />
          </div>
          {/* Nearly every championship generates its weather, so the climate
              and hemisphere it is then drawn from are held open too. */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('editor.details.climate')}</span>
            <Shimmer className="h-8.5 w-82 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('editor.details.hemisphere')}</span>
            <Shimmer className="h-8.5 w-41 rounded-lg" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{t('editor.details.rain')}</span>
              <span className="text-xs text-muted-foreground">{t('editor.details.rainShort')}</span>
            </div>
            <Shimmer className="h-[1.15rem] w-8 rounded-full" />
          </div>
        </div>
      </Card>

      <RulesCardSkeleton />
    </Loading>
  );
};
