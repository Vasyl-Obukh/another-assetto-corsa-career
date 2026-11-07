import { ChevronUpIcon, PaintbrushIcon, SparklesIcon } from 'lucide-react';
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
   * Whether a renewal's changed figures say what they were.
   */
  changes?: boolean;
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
  terms, scale = 1, without = [], changes = false, className,
}: SponsorPerksProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <div className={cn('grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-2.5 gap-y-1 text-sm', className)}>
      {terms.perks.filter((perk) => !without.includes(perk.kind)).map((perk) => {
        const pair = perkPair(terms, perk, scale, t, formatMoney);
        const was = changes && perk.was !== undefined
          ? t('sponsors.perk.was', { value: perk.share === undefined ? formatMoney(perk.was) : `${perk.was}%` })
          : null;

        if (pair.signature) {
          return (
            <span key={perk.kind} className="col-span-2 flex items-start gap-1.5 font-medium">
              <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-sponsor-foreground" />
              <span className="flex min-w-0 flex-col">
                {pair.condition}
                {pair.sub ? <span className="text-xs font-normal text-muted-foreground">{pair.sub}</span> : null}
                {changes && perk.wasCar ? (
                  <span className="text-xs font-normal text-muted-foreground">{t('sponsors.perk.wasCar', { car: perk.wasCar })}</span>
                ) : null}
              </span>
            </span>
          );
        }
        if (pair.helps) {
          const Icon = perk.kind === 'repaints' ? PaintbrushIcon : ChevronUpIcon;

          return (
            <span key={perk.kind} className="col-span-2 flex items-center gap-1.5 font-medium">
              <Icon className={cn('size-3.5 shrink-0', terms.slot === 'main' ? 'text-sponsor-foreground' : 'text-partner-foreground')} />
              {pair.condition}
            </span>
          );
        }

        return (
          <span key={perk.kind} className="contents">
            <span className="font-semibold tabular-nums">{pair.price}</span>
            <span className="flex flex-col text-muted-foreground">
              {pair.condition}
              {was ? <span className="text-xs">{was}</span> : null}
            </span>
          </span>
        );
      })}
    </div>
  );
};
