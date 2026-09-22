import { useTranslation } from 'react-i18next';

import { WeekendItem } from './WeekendItem.tsx';
import type { EventSession } from '../../../../shared/types';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface WeekendListProps {
  /**
   * Every session of the weekend, in the order they run.
   */
  sessions: readonly EventSession[];
  /**
   * The index of the session being shown.
   */
  selected: number;
  /**
   * Called with the index of the session to show.
   * @param index Which session
   */
  onSelect: (index: number) => void;
}

export const WeekendList = ({ sessions, selected, onSelect }: WeekendListProps) => {
  const { t } = useTranslation();

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('event.weekend')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {sessions.length === 0 ? (
          <p className="px-3 pb-3 text-sm text-muted-foreground">{t('event.noSessions')}</p>
        ) : sessions.map((session) => (
          <WeekendItem
            key={session.index}
            session={session}
            selected={session.index === selected}
            onSelect={() => onSelect(session.index)}
          />
        ))}
      </CardContent>
    </Card>
  );
};
