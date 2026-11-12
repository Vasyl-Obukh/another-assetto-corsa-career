import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { initials, isPerson, paddockName } from './utils.ts';
import type { Paddocker } from '../../../../shared/types';
import { NationFlag } from '@/components/NationFlag.tsx';
import { cn } from '@/lib/utils.ts';

interface SenderProps {
  /**
   * Who wrote it.
   */
  from: Paddocker;
  /**
   * The player's name, whom it is to.
   */
  driver: string;
  /**
   * The well's colour.
   */
  accent: string;
  /**
   * What a body rather than a person is drawn as.
   */
  icon: LucideIcon;
  /**
   * What stands in for their role, where the role says too little.
   */
  role?: string;
  /**
   * Drawn small, as a list's row or a card does.
   */
  small?: boolean;
}

// Who wrote a mail: a person as their initials in a round well, a body - the
// organisers, the panel, the paddock's news - as its icon in a square one,
// with their name and flag, what they are and whom it is to.
export const Sender = ({
  from, driver, accent, icon: Icon, role, small = false,
}: SenderProps) => {
  const { t } = useTranslation();
  const person = isPerson(from);
  const name = paddockName(from, t);
  const well = small ? 'size-9 text-xs [&_svg]:size-4' : 'size-10 text-sm [&_svg]:size-5';

  return (
    <div className="flex items-center gap-3">
      <span className={cn('grid shrink-0 place-items-center font-bold', well, person ? 'rounded-full' : 'rounded-lg', accent)}>
        {person ? initials(name) : <Icon />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 font-semibold">
          {name}
          {person && from.nation ? <NationFlag code={from.nation} /> : null}
        </span>
        <span className="text-xs text-muted-foreground">
          {[role ?? t(`inbox.news.role.${from.role}`), from.teamName, t('inbox.to', { driver })].filter(Boolean).join(' · ')}
        </span>
      </span>
    </div>
  );
};
