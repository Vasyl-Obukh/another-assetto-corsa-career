import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RUNG_EDGE } from './constants.ts';
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
   * The championship, and the class entry that puts it on this rung.
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
  const { listing, entry } = rung;
  const { series } = listing;
  const format = defaultFormatOf(series);

  // Still a way to its page when locked, which is where it says how to open it.
  const card = (
    <Link
      to={path.championship({ id: series.id })}
      aria-description={locked}
      className={cn(
        'hover-outline relative flex flex-col gap-2 rounded-lg border border-l-[3px] bg-background p-3 transition-colors',
        'focus-visible:border-y-primary focus-visible:border-r-primary focus-visible:outline-none',
        locked === undefined ? RUNG_EDGE[entry.ladder.discipline] : 'border-l-border bg-muted/60 [&>*:not(.lock)]:opacity-55 [&>*:not(.lock)]:grayscale',
      )}
    >
      {locked === undefined ? null : (
        <span className="lock absolute top-2 right-2 grid size-5 place-items-center rounded-md border bg-card text-muted-foreground">
          <LockIcon className="size-3" />
        </span>
      )}
      <span className={cn('text-sm leading-snug font-semibold', locked !== undefined && 'pr-6')}>{series.name}</span>

      {/* Every class on the grid, so a multi-class championship says which of
          them this rung is. That one wears its tier's metal; the rest are
          outlined on purpose - they are context here, and their own rungs
          colour them. */}
      {series.entries.length > 1 ? (
        <div className="flex flex-wrap gap-1">
          {series.entries.map((one) => (one.id === entry.id ? (
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

  if (locked === undefined) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="top">{locked}</TooltipContent>
    </Tooltip>
  );
};
