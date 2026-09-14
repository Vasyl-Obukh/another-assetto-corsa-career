import { useTranslation } from 'react-i18next';

import type { SeriesOrigin } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';

interface OriginBadgeProps {
  /**
   * Whether the app ships this championship, the user wrote it, or the user
   * replaced a shipped one with it.
   */
  origin: SeriesOrigin;
}

export const OriginBadge = ({ origin }: OriginBadgeProps) => {
  const { t } = useTranslation();

  // Nothing for the app's own: a badge down every row saying "shipped" is
  // noise, and what a list shows is which entries you have had a hand in.
  if (origin === 'shipped') return null;

  return (
    <Badge className={ORIGIN_ACCENT[origin]}>{t(`championships.origin.${origin}`)}</Badge>
  );
};
