import { CloudRainIcon, SunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { RAIN_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface RainChipProps {
  /**
   * Whether rain is allowed.
   */
  allowed: boolean;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

// Says whether a round or a championship may race in the wet.
export const RainChip = ({ allowed, className }: RainChipProps) => {
  const { t } = useTranslation();

  return (
    <Badge className={cn(allowed ? RAIN_ACCENT.allowed : RAIN_ACCENT.notAllowed, className)}>
      {allowed ? <CloudRainIcon /> : <SunIcon />}
      {t(allowed ? 'rain.allowed' : 'rain.notAllowed')}
    </Badge>
  );
};
