import { useTranslation } from 'react-i18next';

import type { Climate } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { CLIMATE_ACCENT } from '@/lib/accents';

interface ClimateBadgeProps {
  /**
   * The climate to name.
   */
  climate: Climate;
}

export const ClimateBadge = ({ climate }: ClimateBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge variant="secondary" className={`shrink-0 ${CLIMATE_ACCENT[climate]}`}>
      {t(`climate.${climate}`)}
    </Badge>
  );
};
