import { useTranslation } from 'react-i18next';

import { NationFlag } from '../NationFlag.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';

interface DriverNameProps {
  /**
   * What to call them.
   */
  name: string;
  /**
   * Their nation's code, for the flag, or undefined for none.
   */
  nation?: string;
  /**
   * What sits under the name - the team - or null for nothing.
   */
  detail?: string | null;
  /**
   * Whether this is the player, which adds the You chip.
   */
  player?: boolean;
  /**
   * Whether they raced the player's seat when the player did not, which says
   * so under the name.
   */
  substitute?: boolean;
  /**
   * Extra classes.
   */
  className?: string;
}

/**
 * A driver as every results table lists one: their flag, their name, the
 * player marked, and their team underneath.
 */
export const DriverName = ({
  name, nation, detail = null, player = false, substitute = false, className,
}: DriverNameProps) => {
  const { t } = useTranslation();
  const under = substitute ? t('standings.substitute') : detail;

  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)}>
      <NationFlag code={nation} className="h-3 w-4.5" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate" data-selectable>{name}</span>
          {/* Primary, the colour the player's own row is picked out in. */}
          {player ? <Badge className="h-4 px-1 text-[0.6rem]">{t('standings.you')}</Badge> : null}
        </span>
        {under ? <span className="truncate text-xs font-normal text-muted-foreground">{under}</span> : null}
      </span>
    </span>
  );
};
