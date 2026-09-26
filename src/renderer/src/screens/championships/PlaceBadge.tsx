import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { PODIUM_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface PlaceBadgeProps {
  /**
   * The place, counting from one.
   */
  place: number;
}

// A finishing place, a podium one in its metal and the rest left plain - which
// is what the accent map's three-long list is for.
export const PlaceBadge = ({ place }: PlaceBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge variant="outline" className={cn('min-w-8 justify-center tabular-nums', PODIUM_ACCENT[place - 1])}>
      {t('championships.detail.position', { number: place })}
    </Badge>
  );
};
