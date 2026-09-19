import { useTranslation } from 'react-i18next';

import { pointsOf, sessionsByDay } from './utils.ts';
import type { Championship, SeriesSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL, sessionLength } from '@/screens/race';

interface FormatCardProps {
  /**
   * The championship the formats belong to, for resolving what a race pays.
   */
  series: Championship;
}

export const FormatCard = ({ series }: FormatCardProps) => {
  const { weekendFormats: formats, defaultWeekendFormat: defaultFormat } = series;
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  /**
   * Names one session, with its length where it has one.
   * @param session The session to name
   * @returns Its label, already translated
   */
  const label = (session: SeriesSession): string => {
    const name = session.name ?? t(SESSION_TYPE_LABEL[session.type]);
    // A distance becomes laps only on a round's track, which the calendar says.
    if (session.distance !== undefined) {
      return t('championships.format.session', {
        name, length: t('championships.format.distance', { value: formatNumber(session.distance) }),
      });
    }
    const length = sessionLength(session);

    return length === null
      ? t('championships.format.sessionPlain', { name })
      : t('championships.format.session', { name, length: t(length.key, { count: length.count }) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('championships.format.title', { count: formats.length })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {formats.map((format) => (
          <div key={format.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{format.name}</span>
              {/* Filled, as the format most rounds run. Only worth saying when
                  there is something to default against. */}
              {formats.length > 1 && format.id === defaultFormat ? (
                <Badge>{t('championships.format.default')}</Badge>
              ) : null}
            </div>
            {sessionsByDay(format.sessions).map(({ day, sessions }) => (
              <div key={day} className="flex flex-wrap items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  {t('championships.format.day', { number: day + 1 })}
                </span>
                {sessions.map((session, index) => (
                  // Keyed by position: a sprint weekend runs two races of the
                  // same length on one day, so a label is not unique - and a
                  // format is a fixed list rather than a reordered one.
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={index} className="flex items-center gap-1">
                    {/* Coloured by what it is rather than by where it sits,
                        so a format reads as practice, qualifying and a race
                        without anybody working down the row. */}
                    <Badge className={SESSION_ACCENT[session.type]}>{label(session)}</Badge>
                    {/* A race paying its own table is the whole reason a sprint
                        weekend is a separate format, so it is said here rather
                        than left to the points card, which shows the
                        championship's own. */}
                    {session.pointsSystem ? (
                      <Badge variant="secondary">
                        {pointsOf(series, session)?.name ?? session.pointsSystem}
                      </Badge>
                    ) : null}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
