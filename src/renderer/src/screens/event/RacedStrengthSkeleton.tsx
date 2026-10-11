import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Shimmer } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { slots } from '@/lib/slots.ts';

interface RacedStrengthSkeletonProps {
  /**
   * How many sessions to hold a row for.
   */
  rows: number;
}

/**
 * An AI strength card once its event is over, while the event is read: its
 * title and lock for real, and a row per session still to come.
 */
export const RacedStrengthSkeleton = ({ rows }: RacedStrengthSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="flex items-center justify-between gap-2 px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('strength.title')}
        </CardTitle>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <LockIcon className="size-3.5" />
          {t('strength.raced')}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-3">
        <div className="flex flex-col">
          {slots(rows).map((at) => (
            <div key={at} className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
              <Shimmer className="h-5.5 w-16" />
              <span className="flex-1" />
              <Shimmer className="h-4.5 w-6" />
            </div>
          ))}
        </div>
        <Shimmer className="h-3 w-4/5" />
      </CardContent>
    </Card>
  );
};
