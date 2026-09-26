import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface MovementProps {
  /**
   * Places gained, negative for places lost, or null when there is nothing to
   * compare against.
   */
  move: number | null;
  /**
   * Extra classes.
   */
  className?: string;
}

/**
 * How far a row moved since the round before: green up, red down, and a quiet
 * dash for no change. Nothing before there is a round to compare against.
 */
export const Movement = ({ move, className }: MovementProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const base = 'inline-flex min-w-7 items-center text-[0.7rem] font-semibold tabular-nums';

  if (move === null) return <span className={cn(base, className)} />;
  if (move === 0) {
    return (
      <span className={cn(base, 'font-normal text-muted-foreground', className)}>
        {t('standings.noMove')}
      </span>
    );
  }

  const up = move > 0;
  const Icon = up ? ChevronUpIcon : ChevronDownIcon;

  return (
    <span
      title={t(up ? 'standings.moveUp' : 'standings.moveDown', { count: Math.abs(move) })}
      className={cn(base, up ? 'text-success' : 'text-destructive', className)}
    >
      <Icon className="size-3" />
      {formatNumber(Math.abs(move))}
    </span>
  );
};
