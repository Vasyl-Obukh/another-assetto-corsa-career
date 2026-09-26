import { useTranslation } from 'react-i18next';

import { DISTRIBUTOR_TAG_CLASS, distributorTagKey } from './utils.ts';
import type { ModDistributor } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface DistributorBadgeProps {
  /**
   * Who redistributes the car or layout.
   */
  distributor: ModDistributor;
}

/**
 * Who redistributes something, on its own - for a layout card, where the
 * circuit's source is already said once for the whole page.
 */
export const DistributorBadge = ({ distributor }: DistributorBadgeProps) => {
  const { t } = useTranslation();

  return <Badge className={DISTRIBUTOR_TAG_CLASS}>{t(distributorTagKey(distributor))}</Badge>;
};
