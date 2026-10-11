import { useTranslation } from 'react-i18next';

import { StrengthNote } from './StrengthNote.tsx';
import { racedStrength } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { useFormat } from '@/i18n';
import { sessionName } from '@/lib/session-labels';

interface StrengthBetweenProps {
  /**
   * The event's sessions, in the order they run.
   */
  sessions: readonly EventSession[];
  /**
   * The player's class, by its entry id.
   */
  entry: string;
  /**
   * Anything more the note says, already translated.
   */
  extra?: string;
}

/**
 * Between two sessions of an event, what the last one ran at and which session
 * a change would reach first - nothing before the first has run, or once none
 * is left to run.
 */
export const StrengthBetween = ({ sessions, entry, extra }: StrengthBetweenProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const next = sessions.find((one) => one.status === 'next');
  if (!next || !sessions.some((one) => one.record !== null)) return null;

  const ran = racedStrength(sessions, entry).at(-1);
  const said = [
    ran ? t('strength.ran', { session: sessionName(ran.session, t), figure: formatNumber(ran.figure) }) : null,
    t('strength.appliesFrom', { session: sessionName(next, t) }),
    extra,
  ];

  return <StrengthNote>{said.filter(Boolean).join(' ')}</StrengthNote>;
};
