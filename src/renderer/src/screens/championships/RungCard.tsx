import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { FormatStrip } from './FormatStrip.tsx';
import { NeedsChips } from './NeedsChips.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import type { Rung } from './types.ts';
import { tierAccent } from './utils.ts';
import { defaultFormatOf } from '../../../../shared/utils/event-format';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface RungCardProps {
  /**
   * The championship, and the class entries that put it on this rung.
   */
  rung: Rung;
  /**
   * What opens this rung, when the career may not enter it yet - which holds
   * the card still and greyed, with a lock and that in a tooltip.
   */
  locked?: string;
}

export const RungCard = ({ rung, locked }: RungCardProps) => {
  const { t } = useTranslation();
  const { listing, entries } = rung;
  const { series } = listing;
  const format = defaultFormatOf(series);

  // Still a way to its page when locked, which is where it says how to open it.
  return (
    <Link
      to={path.championship({ id: series.id })}
      aria-description={locked}
      className={cn(
        // Plain on purpose: the row the card sits in carries its discipline.
        'hover-outline relative flex flex-col gap-2 rounded-lg border p-3 transition-colors',
        'focus-visible:border-primary focus-visible:outline-none',
        locked === undefined ? 'bg-card' : 'bg-muted [&>*:not(.lock)]:opacity-55 [&>*:not(.lock)]:grayscale',
      )}
    >
      {/* What opens the rung hangs off the lock; the card's description says
          the same to a screen reader. z-10: each faded sibling paints on a
          layer of its own, over the lock and its tooltip trigger. */}
      {locked === undefined ? null : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="lock absolute top-2 right-2 z-10 grid size-5 place-items-center rounded-md border bg-card text-muted-foreground">
              <LockIcon className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{locked}</TooltipContent>
        </Tooltip>
      )}
      <span className={cn('text-sm leading-snug font-semibold', locked !== undefined && 'pr-6')}>{series.name}</span>

      {/* Every class on the grid, so a multi-class championship says which of
          them this rung is. Those wear their tier's metal; the rest are
          outlined on purpose - they are context here, and their own rungs
          colour them. */}
      {series.entries.length > 1 ? (
        <div className="flex flex-wrap gap-1">
          {series.entries.map((one) => (entries.some((here) => here.id === one.id) ? (
            <Badge
              key={one.id}
              className={tierAccent(one.ladder.tier)}
              title={t('championships.ladder.enters', { name: one.name })}
            >
              {one.name}
            </Badge>
          ) : (
            <Badge
              key={one.id}
              variant="outline"
              className="text-muted-foreground"
              title={t('championships.ladder.alsoOnGrid', { tier: one.ladder.tier })}
            >
              {one.name}
            </Badge>
          )))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1">
        <OriginBadge origin={listing.origin} />
        <NeedsChips requires={listing.availability.requires} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{t('championships.rounds', { count: series.rounds.length })}</span>
        {format ? <FormatStrip sessions={format.sessions} /> : null}
      </div>
    </Link>
  );
};
