import { MedalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';

interface RatingLinkProps {
  /**
   * The career's global rating.
   */
  rating: number;
}

/**
 * The career's global rating at the right of the header, beside its money,
 * and the way into its rating from anywhere.
 */
export const RatingLink = ({ rating }: RatingLinkProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <Link
      to={path.rating()}
      title={t('rating.open')}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border bg-card px-2.5 text-sm font-semibold tabular-nums transition-colors hover:border-primary/45"
    >
      <MedalIcon className="size-4 text-podium-gold-foreground" />
      {formatNumber(rating)}
    </Link>
  );
};
