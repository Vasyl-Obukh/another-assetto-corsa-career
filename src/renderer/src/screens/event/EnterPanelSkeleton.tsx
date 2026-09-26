import { useTranslation } from 'react-i18next';

import { Shimmer } from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader,
} from '@/components/ui/card.tsx';

interface EnterPanelSkeletonProps {
  /**
   * Whether the loaded panel will say which round entering starts from.
   */
  showFirstRound?: boolean;
}

/**
 * The Enter panel while its round is read: the title still to come under the
 * panel's own wording, the car row and the Enter button.
 */
export const EnterPanelSkeleton = ({ showFirstRound = false }: EnterPanelSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-3 border-dashed border-primary py-3">
      <CardHeader className="px-3">
        <Shimmer className="my-0.5 h-4 w-3/4" />
        <CardDescription>{t('event.enter.body')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="flex items-center gap-3">
          <Shimmer className="h-3.5 flex-1" />
          <Shimmer className="h-8 w-24" />
        </div>
        <Shimmer className="h-9 w-full" />
        {showFirstRound ? (
          <div className="flex items-center justify-between gap-2 border-t pt-2.5">
            <span className="text-xs text-muted-foreground">{t('event.enter.firstRound')}</span>
            <Shimmer className="h-3 w-36" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
