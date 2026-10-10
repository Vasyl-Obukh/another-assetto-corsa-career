import { useTranslation } from 'react-i18next';

import { BriefTile } from './BriefTile.tsx';
import { EVENT_SKELETON } from './constants.ts';
import { Loading, Shimmer } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';

/**
 * A round's page under its header while it is read: the entry card, the
 * event's sessions under their real heading, and the session open beside
 * them with its four briefing tiles.
 */
export const EventSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-4">
        <Card className="gap-3 py-3">
          <CardHeader className="px-3"><Shimmer className="h-2.5 w-20" /></CardHeader>
          <CardContent className="flex flex-col gap-3 px-3">
            <Shimmer deep className="aspect-[16/9] w-full rounded-md" />
            <div className="flex flex-col gap-1.5">
              <Shimmer className="my-0.5 h-4 w-32" />
              <Shimmer className="h-3 w-40" />
              <Shimmer className="h-3 w-44" />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('event.listTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {slots(EVENT_SKELETON).map((at) => (
              <div key={at} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-3 py-2.5">
                <Shimmer className="size-4 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Shimmer className="my-0.5 h-3.5 w-20" />
                  <Shimmer className="h-3 w-32" />
                </div>
                <Shimmer className="size-4 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      <Card className="py-4">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shimmer className="h-5.5 w-16" />
              <Shimmer className="my-1 h-5 w-28" />
            </div>
            <Shimmer className="h-3.5 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {(['length', 'weather', 'wind', 'start'] as const).map((tile) => (
              <BriefTile key={tile} label={t(`event.brief.${tile}`)}>
                <Shimmer className="my-1.5 h-4.5 w-24" />
              </BriefTile>
            ))}
          </div>
          <Shimmer className="h-3.5 w-56" />
        </CardContent>
      </Card>
    </Loading>
  );
};
