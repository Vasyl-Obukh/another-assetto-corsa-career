
import { GridFieldsSkeleton } from './GridFieldsSkeleton.tsx';
import { PaneHeading } from './PaneHeading.tsx';
import { Shimmer } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useKindTranslation } from '@/i18n';
import { REGULATION_FLAGS, REGULATIONS } from '@/screens/race';

/**
 * The rules card while what it holds is read: its three panes with their real
 * headings, labels and hints - the field's two figures, a slider a regulation,
 * the race control's chips - and every value still to come.
 */
export const RulesCardSkeleton = () => {
  const { t } = useKindTranslation();

  return (
    <Card className="grid gap-0 py-0 lg:grid-cols-3">
      <div className="flex flex-col gap-3 p-6">
        <PaneHeading>{t('editor.grid.title')}</PaneHeading>
        <GridFieldsSkeleton />
      </div>

      <div className="flex flex-col gap-3 border-t p-6 lg:border-t-0 lg:border-l">
        <PaneHeading>{t('editor.regulations.title')}</PaneHeading>
        <p className="text-xs text-muted-foreground">{t('editor.regulations.hint')}</p>
        <div className="flex flex-col gap-4">
          {REGULATIONS.map((spec) => (
            <div key={spec.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm font-medium">{t(`race.regulations.${spec.key}`)}</span>
                <Shimmer className="my-0.5 h-3 w-24" />
              </div>
              <div className="flex h-7 items-center px-1">
                <Shimmer className="h-1.5 w-full rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                {spec.stops.map((stop) => <Shimmer key={stop.value} className="h-5.5 w-11 rounded-full" />)}
                <Shimmer className="ml-auto h-5.5 w-14 rounded-full" />
              </div>
            </div>
          ))}
          {REGULATION_FLAGS.map(({ key }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t(`race.regulations.${key}`)}</span>
              <Shimmer className="h-[1.15rem] w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t p-6 lg:border-t-0 lg:border-l">
        <PaneHeading>{t('editor.regulations.raceControl')}</PaneHeading>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.regulations.allowedTyresOut')}</span>
          <Shimmer className="h-8.25 w-52 rounded-lg" />
          <span className="text-xs text-muted-foreground">{t('editor.regulations.allowedTyresOutHint')}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.regulations.jumpStartPenalty')}</span>
          <Shimmer className="h-8.25 w-60 rounded-lg" />
          <span className="text-xs text-muted-foreground">{t('editor.regulations.jumpStartPenaltyHint')}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{t('editor.regulations.penalties')}</span>
          <Shimmer className="h-[1.15rem] w-8 rounded-full" />
        </div>
      </div>
    </Card>
  );
};
