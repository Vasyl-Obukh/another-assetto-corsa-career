import { useTranslation } from 'react-i18next';

import { FormatStrip } from './FormatStrip.tsx';
import { pointsOf, sessionsByDay } from './utils.ts';
import type { Championship, SeriesSession } from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { sessionLength } from '@/screens/race';

interface FormatsCardProps {
  /**
   * The championship the formats belong to.
   */
  series: Championship;
  /**
   * Anything the caller adds to the card, such as the columns it spans.
   */
  className?: string;
}

// Every event format: its sessions as a strip and in words, day by day, and
// which rounds run it. Several formats sit side by side in columns rather than
// down one narrow list.
export const FormatsCard = ({ series, className }: FormatsCardProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const formats = series.eventFormats;

  /**
   * Names one session, with its length where it has one.
   * @param session The session to name
   * @returns Its label, already translated
   */
  const label = (session: SeriesSession): string => {
    const name = sessionName(session, t);
    // A distance becomes laps only on a round's track, which the rounds table says.
    if (session.distance !== undefined) {
      return t('championships.format.session', {
        name, length: units.format('distance', session.distance),
      });
    }
    const length = sessionLength(session);

    return length === null
      ? t('championships.format.sessionPlain', { name })
      : t('championships.format.session', { name, length: t(length.key, { count: length.count }) });
  };

  return (
    <Card className={cn('gap-3 py-4', className)}>
      <CardHeader className="px-4">
        <CardTitle>{t('championships.detail.formats')}</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          'px-4',
          formats.length > 1 ? 'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-8 gap-y-5' : 'flex flex-col',
        )}
      >
        {formats.map((format) => {
          const rounds = series.rounds.filter((round) => formatOf(series, round)?.id === format.id);
          // A race paying its own table is the whole reason a sprint event is
          // a separate format, so each one that does is named.
          const ownPoints = format.sessions
            .filter((session) => session.pointsSystem)
            .map((session) => pointsOf(series, session)?.name ?? session.pointsSystem);

          return (
            <div key={format.id} className="flex items-start gap-3">
              <FormatStrip sessions={format.sessions} wrap />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{format.name}</span>
                  {/* Filled, as the format most rounds run. Only worth saying
                      when there is something to default against. */}
                  {formats.length > 1 && format.id === series.defaultEventFormat ? (
                    <Badge>{t('championships.format.default')}</Badge>
                  ) : null}
                  {/* Neutral on purpose: a points system is named by whoever wrote it. */}
                  {ownPoints.map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}
                </div>
                {sessionsByDay(format.sessions).map(({ day, sessions }) => (
                  <span key={day} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {t('championships.format.day', { number: day + 1 })}
                    </span>
                    {' '}
                    {sessions.map(label).join(', ')}
                  </span>
                ))}
                {rounds.length > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {t('championships.detail.racedAt', { rounds: rounds.map((round) => round.name).join(', ') })}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
