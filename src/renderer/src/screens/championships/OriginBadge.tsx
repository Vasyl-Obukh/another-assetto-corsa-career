import { useTranslation } from 'react-i18next';

import { ORIGIN_TAG_CLASS } from './constants.ts';
import type { SeriesOrigin } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

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
    <Badge className={ORIGIN_TAG_CLASS[origin]}>{t(`championships.origin.${origin}`)}</Badge>
  );
};
