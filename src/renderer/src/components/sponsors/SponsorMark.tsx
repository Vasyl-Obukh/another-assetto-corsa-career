import { useTranslation } from 'react-i18next';

import { MARK_LETTERS, TRADE_ICON } from './constants.ts';
import type { Sponsor, SponsorSlot } from '../../../../shared/types';
import { SPONSOR_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SponsorMarkProps {
  /**
   * Who the sponsor is.
   */
  sponsor: Sponsor;
  /**
   * The slot it fills, which its colour says.
   */
  slot: SponsorSlot;
  /**
   * Drawn small, for a row or a list.
   */
  small?: boolean;
}

/**
 * A sponsor's mark: its initials on its slot's colour, and its trade as an
 * icon in the corner.
 */
export const SponsorMark = ({ sponsor, slot, small = false }: SponsorMarkProps) => {
  const { t } = useTranslation();
  const Icon = TRADE_ICON[sponsor.trade];
  const initials = sponsor.name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, MARK_LETTERS)
    .map((word) => word[0].toUpperCase())
    .join('');

  return (
    <span
      title={t(`sponsors.trade.${sponsor.trade}`)}
      className={cn(
        'relative grid shrink-0 place-items-center font-bold tracking-wide',
        small ? 'size-8 rounded-lg text-[0.7rem]' : 'size-11 rounded-xl text-sm',
        SPONSOR_ACCENT[slot],
      )}
    >
      {initials}
      <span
        className={cn(
          'absolute -right-1 -bottom-1 grid place-items-center rounded-md bg-card ring-1 ring-border',
          small ? 'size-4 [&_svg]:size-2.5' : 'size-5 [&_svg]:size-3',
          slot === 'main' ? 'text-sponsor-foreground' : 'text-partner-foreground',
        )}
      >
        <Icon />
      </span>
    </span>
  );
};
