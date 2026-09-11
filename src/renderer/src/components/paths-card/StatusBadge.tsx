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

  // Red for a path that was named and is not there, amber for one nothing has
  // named yet: the first is broken and the second is merely not done.
  return (
    <Badge variant={probe.value ? 'destructive' : 'warning'}>
      <TriangleAlertIcon />
      {probe.value ? t('paths.missing') : t('paths.undetected')}
    </Badge>
  );
};
