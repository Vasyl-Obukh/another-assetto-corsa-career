import { useTranslation } from 'react-i18next';

import { TRADE_ICON } from './constants.ts';
import { SPONSOR_LOGOS } from './logos.ts';
import { markInitials } from './utils.ts';
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
 * A sponsor's mark: its logo on a light plate ringed in its slot's colour, or
 * for a sponsor with none its initials on that colour, its trade as an icon in
 * the corner. Wider than tall, since most logos are wordmarks.
 */
export const SponsorMark = ({ sponsor, slot, small = false }: SponsorMarkProps) => {
  const { t } = useTranslation();
  const logo = sponsor.logo ? SPONSOR_LOGOS[sponsor.logo] : undefined;
  const size = small ? 'h-8 w-13.5 rounded-lg' : 'h-11 w-19 rounded-xl';

  if (logo) {
    return (
      <span
        title={t(`sponsors.trade.${sponsor.trade}`)}
        className={cn(
          'grid shrink-0 place-items-center bg-sponsor-plate',
          size,
          small ? 'px-1.5 py-1 inset-ring-[1.5px]' : 'px-[0.4375rem] py-1.5 inset-ring-2',
          slot === 'main' ? 'inset-ring-sponsor-solid' : 'inset-ring-partner-solid',
        )}
      >
        <img src={logo} alt="" draggable={false} className="size-full min-h-0 min-w-0 object-contain" />
      </span>
    );
  }

  const Icon = TRADE_ICON[sponsor.trade];

  return (
    <span
      title={t(`sponsors.trade.${sponsor.trade}`)}
      className={cn(
        'relative grid shrink-0 place-items-center font-bold tracking-wide',
        size,
        small ? 'text-[0.7rem]' : 'text-sm',
        SPONSOR_ACCENT[slot],
      )}
    >
      {markInitials(sponsor.name)}
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
