import { useTranslation } from 'react-i18next';

import { Shimmer } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface RainCardSkeletonProps {
  /**
   * Whether the loaded card carries a note under the switch.
   */
  note?: boolean;
}

/**
 * A Wet weather card while its event is read: its title and the switch's label
 * for real, the switch and what it follows still to come.
 */
export const RainCardSkeleton = ({ note = true }: RainCardSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('rain.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{t('rain.allow')}</span>
          <Shimmer className="h-[1.15rem] w-8 rounded-full" />
        </div>
        <Shimmer className="h-3 w-36" />
        {note ? <Shimmer className="h-9 w-full rounded-md" /> : null}
      </CardContent>
    </Card>
  );
};
