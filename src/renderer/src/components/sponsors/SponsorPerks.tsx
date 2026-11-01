import { SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { perkPair } from './utils.ts';
import type { SponsorPerkKind, SponsorTerms } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface SponsorPerksProps {
  /**
   * The deal or offer.
   */
  terms: SponsorTerms;
  /**
   * What its figures are multiplied by now - a deal that climbs with the
   * player, past the rung it was drawn at.
   */
  scale?: number;
  /**
   * Perks left out, such as a goal bonus shown beside its goal.
   */
  without?: readonly SponsorPerkKind[];
  /**
   * Anything the caller adds.
   */
  className?: string;
}

/**
 * What a sponsor gives, a price and its condition to a line - a main
 * sponsor's signature first, on a line of its own.
 */
export const SponsorPerks = ({
  terms, scale = 1, without = [], className,
}: SponsorPerksProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <div className={cn('grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-2.5 gap-y-1 text-sm', className)}>
      {terms.perks.filter((perk) => !without.includes(perk.kind)).map((perk) => {
        const pair = perkPair(terms, perk, scale, t, formatMoney);

        return pair.signature ? (
          <span key={perk.kind} className="col-span-2 flex items-center gap-1.5 font-medium">
            <SparklesIcon className="size-3.5 shrink-0 text-sponsor-foreground" />
            {pair.condition}
          </span>
        ) : (
          <span key={perk.kind} className="contents">
            <span className="font-semibold tabular-nums">{pair.price}</span>
            <span className="text-muted-foreground">{pair.condition}</span>
          </span>
        );
      })}
    </div>
  );
};
