import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { LedgerKind } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { LEDGER_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface LedgerBadgeProps {
  /**
   * What kind of line it is.
   */
  kind: LedgerKind;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

/**
 * What a line of a career's ledger is, in the colour of what paid it.
 */
export const LedgerBadge = ({ kind, className }: LedgerBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Badge className={cn(LEDGER_ACCENT[kind], className)}>
      {kind === 'speed' ? <GaugeIcon /> : null}
      {t(`finances.kind.${kind}`)}
    </Badge>
  );
};
