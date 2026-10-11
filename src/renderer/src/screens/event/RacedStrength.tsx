import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { racedStrength } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';

interface RacedStrengthProps {
  /**
   * The event's sessions, in the order they ran.
   */
  sessions: readonly EventSession[];
  /**
   * The player's class, by its entry id.
   */
  entry: string;
  /**
   * What the list is, said under it, already translated.
   */
  hint: string;
}

/**
 * An AI strength card once its event is over: what each session ran at, in the
 * player's class, read off what each launch recorded so nothing changed since
 * reaches it - and nothing at all for an event none of whose launches did.
 */
export const RacedStrength = ({ sessions, entry, hint }: RacedStrengthProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const raced = racedStrength(sessions, entry);
  if (raced.length === 0) return null;

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="flex items-center justify-between gap-2 px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('strength.title')}
        </CardTitle>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <LockIcon className="size-3.5" />
          {t('strength.raced')}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-3">
        <div className="flex flex-col">
          {raced.map(({ session, figure }) => {
            const kind = t(SESSION_TYPE_LABEL[session.type]);

            return (
              <div
                key={session.index}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t py-1.5 first:border-t-0"
              >
                <Badge className={SESSION_ACCENT[session.type]}>{kind}</Badge>
                {/* The chip already says what a session is when its name says no more. */}
                <span className="truncate text-sm">{session.name === kind ? null : session.name}</span>
                <span className="text-base font-semibold tabular-nums">{formatNumber(figure)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
};
