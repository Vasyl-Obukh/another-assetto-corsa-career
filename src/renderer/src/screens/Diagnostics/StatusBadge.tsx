import { CheckIcon, TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PathProbe } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface StatusBadgeProps {
  /**
   * The probe result to describe.
   */
  probe: PathProbe;
}

export const StatusBadge = ({ probe }: StatusBadgeProps) => {
  const { t } = useTranslation();

  if (probe.exists) {
    return (
      <Badge variant="success">
        <CheckIcon />
        {t('paths.found')}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <TriangleAlertIcon />
      {probe.value ? t('paths.missing') : t('paths.undetected')}
    </Badge>
  );
};
