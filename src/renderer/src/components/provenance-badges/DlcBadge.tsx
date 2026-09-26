import { useTranslation } from 'react-i18next';

import { packNameKey, SOURCE_TAG_CLASS, sourceTagKey } from './utils.ts';
import { ContentSource } from '../../../../shared/types';
import type { DLCPack } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

interface DlcBadgeProps {
  /**
   * The packs the chip stands for. Nothing is shown for none.
   */
  packs: readonly DLCPack[];
  /**
   * Anything the caller adds to the chip.
   */
  className?: string;
}

// Every pack as one short DLC chip, naming them on hover: a championship can
// need three packs, and "DLC - Porsche Pack 2" three times over took a row of a
// card to say. Focusable, so the names are reachable from the keyboard, and
// `relative z-10` keeps it above a card's stretched title.
export const DlcBadge = ({ packs, className }: DlcBadgeProps) => {
  const { t } = useTranslation();

  if (packs.length === 0) return null;

  const names = packs.map((pack) => t(packNameKey(pack)));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          tabIndex={0}
          aria-label={t('content.packsTag', { packs: names.join(', ') })}
          className={cn('relative z-10', SOURCE_TAG_CLASS[ContentSource.DLC], className)}
        >
          {t(sourceTagKey(ContentSource.DLC))}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <ul className="flex flex-col gap-0.5">
          {names.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
};
