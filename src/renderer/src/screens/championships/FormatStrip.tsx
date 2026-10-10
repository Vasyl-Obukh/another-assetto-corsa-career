import { useTranslation } from 'react-i18next';

import { SESSION_SHORT_KEYS } from './constants.ts';
import type { SeriesSession } from '../../../../shared/types';
import { SESSION_ACCENT } from '@/lib/accents';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

interface FormatStripProps {
  /**
   * The event's sessions, in the order they are run.
   */
  sessions: readonly SeriesSession[];
  /**
   * Whether to wrap after every third session, for a list where a long event
   * would otherwise push everything beside the strip across the page.
   */
  wrap?: boolean;
  /**
   * Anything the caller adds to the strip.
   */
  className?: string;
}

// An event as a row of blocks, one per session in its session colour, so a
// sprint-and-feature event looks different from a Grand Prix before a word of
// it is read. The full names are the strip's label and each block's tooltip.
export const FormatStrip = ({ sessions, wrap = false, className }: FormatStripProps) => {
  const { t } = useTranslation();
  const names = sessions.map((session) => sessionName(session, t));

  return (
    <span
      role="img"
      aria-label={t('championships.event', { sessions: names.join(', ') })}
      className={cn(
        wrap ? 'grid shrink-0 grid-cols-[repeat(3,auto)] gap-0.5 self-start' : 'flex shrink-0 items-center gap-0.5',
        className,
      )}
    >
      {sessions.map((session, index) => (
        <span
          // A format may repeat a session exactly, so the position is the key.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          title={names[index]}
          className={cn(
            'grid h-5 min-w-5 place-items-center rounded px-1 text-[0.6875rem] font-semibold',
            SESSION_ACCENT[session.type],
          )}
        >
          {t(SESSION_SHORT_KEYS[session.type])}
        </span>
      ))}
    </span>
  );
};
