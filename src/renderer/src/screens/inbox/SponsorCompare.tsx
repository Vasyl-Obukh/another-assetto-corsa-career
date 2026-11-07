import { CheckIcon, RefreshCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { COMPARE_COLUMN, COMPARE_LABEL } from './constants.ts';
import type { SponsorTerms } from '../../../../shared/types';
import { perkOf } from '../../../../shared/utils/sponsors';
import {
  CoversBadge, HELPS, NationFlag, RewardPicture, SIGNATURES, SponsorGoal, SponsorMark, SponsorPerks,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { SPONSOR_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

/**
 * How wide a deal's column is at most, in rem.
 */
const COLUMN_WIDTH = 20;

/**
 * How wide the column of row labels is, in rem.
 */
const LABEL_WIDTH = 7.5;

interface SponsorCompareProps {
  /**
   * The offer.
   */
  offer: SponsorTerms;
  /**
   * The deal it would replace, shown beside it.
   */
  replaces: SponsorTerms | null;
  /**
   * Whether it is a sponsor asking for another year, which is washed in its
   * slot's colour and says what changed.
   */
  renewal?: boolean;
  /**
   * Whether no slot is free for it, which holds a renewal's button.
   */
  held?: boolean;
  /**
   * Whether the offer can still be signed.
   */
  open: boolean;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to sign it.
   */
  onSign: () => void;
}

/**
 * A sponsor's offer as a table - a row per part of the deal - and, for a slot
 * already filled, the deal it would replace beside it, washed in its slot's
 * colour.
 */
export const SponsorCompare = ({
  offer, replaces, renewal = false, held = false, open, busy, onSign,
}: SponsorCompareProps) => {
  const { t } = useTranslation();
  const columns = [offer, ...(replaces ? [replaces] : [])];
  const current = (terms: SponsorTerms): string | false => (terms === replaces || renewal) && (terms.slot === 'main' ? 'bg-sponsor/30' : 'bg-partner/30');
  const row = (label: string, cell: (terms: SponsorTerms) => ReactNode) => (
    <>
      <div className={COMPARE_LABEL}>{label}</div>
      {columns.map((terms) => (
        <div key={terms.sponsor.name} className={cn(COMPARE_COLUMN.cell, current(terms))}>{cell(terms)}</div>
      ))}
    </>
  );

  return (
    <div
      className="grid overflow-hidden rounded-lg border bg-card text-sm"
      style={{
        gridTemplateColumns: `${LABEL_WIDTH}rem repeat(${columns.length}, minmax(0, 1fr))`,
        maxWidth: `${LABEL_WIDTH + columns.length * COLUMN_WIDTH}rem`,
      }}
    >
      <div className={cn(COMPARE_LABEL, 'border-t-0')} />
      {columns.map((terms) => (
        <div key={terms.sponsor.name} className={cn(COMPARE_COLUMN.head, current(terms))}>
          <span className="flex flex-wrap items-center gap-2">
            <SponsorMark sponsor={terms.sponsor} slot={terms.slot} />
            <CoversBadge covers={terms.covers} />
            {terms === replaces ? (
              <Badge className={SPONSOR_ACCENT[terms.slot]}>{t(`inbox.sponsor.yours.${terms.slot}`)}</Badge>
            ) : null}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 font-semibold">
            <span className="truncate">{terms.sponsor.name}</span>
            <NationFlag code={terms.sponsor.nation} />
          </span>
          <span className="truncate text-xs text-muted-foreground">{t(`sponsors.trade.${terms.sponsor.trade}`)}</span>
        </div>
      ))}
      {columns.some((terms) => terms.perks.some((perk) => SIGNATURES.includes(perk.kind)))
        ? row(t('inbox.sponsor.signature'), (terms) => {
          const car = perkOf(terms, 'carReward')?.car;

          return (
            <div className="flex flex-col gap-2">
              {car ? <RewardPicture car={car} /> : null}
              <SponsorPerks
                terms={{ ...terms, perks: terms.perks.filter((perk) => SIGNATURES.includes(perk.kind)) }}
                changes={renewal}
              />
            </div>
          );
        })
        : null}
      {row(t('inbox.sponsor.pays'), (terms) => (
        <SponsorPerks terms={terms} without={[...SIGNATURES, ...HELPS, 'goalBonus']} changes={renewal} />
      ))}
      {columns.some((terms) => terms.perks.some((perk) => HELPS.includes(perk.kind)))
        ? row(t('inbox.sponsor.helps'), (terms) => (
          <SponsorPerks terms={{ ...terms, perks: terms.perks.filter((perk) => HELPS.includes(perk.kind)) }} />
        ))
        : null}
      {row(t('inbox.sponsor.goal'), (terms) => (
        <div className="flex flex-col gap-1.5">
          <SponsorGoal goal={terms.goal} labelled={false} />
          <SponsorPerks terms={{ ...terms, perks: terms.perks.filter((perk) => perk.kind === 'goalBonus') }} changes={renewal} />
        </div>
      ))}
      {row(t('inbox.sponsor.runs'), () => <span className="font-medium">{t('inbox.sponsor.year')}</span>)}
      <div className={COMPARE_LABEL} />
      {columns.map((terms) => (
        <div key={terms.sponsor.name} className={cn(COMPARE_COLUMN.cell, 'py-2.5', current(terms))}>
          {terms === offer && open ? (
            <Button className="w-full" disabled={busy || held} onClick={onSign}>
              {renewal ? <RefreshCwIcon /> : <CheckIcon />}
              {renewal ? t('inbox.compare.renew') : null}
              {!renewal && replaces ? t('inbox.sponsor.signReplacing', { sponsor: replaces.sponsor.name }) : null}
              {!renewal && !replaces ? t('inbox.sponsor.sign') : null}
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
};
