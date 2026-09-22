import { useTranslation } from 'react-i18next';

import type { PositionPoints, SessionSummary } from '../../../../shared/types';
import { formatLapTime } from '../../../../shared/utils/lap-time';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { PODIUM_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SessionTableProps {
  /**
   * One session's classification.
   */
  session: SessionSummary;
  /**
   * What each finishing position scored, for a championship race - which adds a
   * points column. Left out, the table is the plain classification the Results
   * screen shows.
   */
  points?: readonly PositionPoints[];
  /**
   * The finishing position to pick out, which is the player's on a career's
   * event page. By position rather than by name, because Content Manager
   * writes its own profile name over the player's.
   */
  highlight?: number;
}

export const SessionTable = ({ session, points, highlight }: SessionTableProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const official = session.order === 'raceResult';
  const scheduled = session.lapCount > 0
    ? t('results.scheduledLaps', { count: session.lapCount })
    : t('results.scheduledMinutes', { count: session.durationMinutes });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {session.name}
          {/* Green for AC's own answer, amber for ours: an inferred order is
              not wrong, but it is the one a reader should know about. */}
          <Badge variant={official ? 'success' : 'warning'}>
            {official ? t('results.order.raceResult') : t('results.order.inferred')}
          </Badge>
          <Badge variant="secondary">{scheduled}</Badge>
        </CardTitle>
        <CardDescription>
          {official ? t('results.order.raceResultHint') : t('results.order.inferredHint')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Wide on a mod grid with long car IDs, so it scrolls inside the card
            rather than pushing the page sideways. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className="w-10 py-2 pr-2 font-medium">{t('results.column.position')}</th>
                <th scope="col" className="py-2 pr-4 font-medium">{t('results.column.driver')}</th>
                <th scope="col" className="py-2 pr-4 font-medium">{t('results.column.car')}</th>
                <th scope="col" className="w-16 py-2 pr-4 text-right font-medium">{t('results.column.laps')}</th>
                <th scope="col" className="w-28 py-2 pr-4 text-right font-medium">{t('results.column.best')}</th>
                <th scope="col" className="w-16 py-2 pr-4 text-right font-medium">{t('results.column.cuts')}</th>
                <th scope="col" className="w-28 py-2 text-right font-medium">{t('results.column.total')}</th>
                {points ? (
                  <th scope="col" className="w-16 py-2 pl-4 text-right font-medium">{t('results.column.points')}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {session.standings.map((standing) => (
                <tr
                  key={`${standing.position}-${standing.driver}`}
                  className={cn('border-b last:border-0', standing.position === highlight ? 'bg-accent font-medium' : '')}
                >
                  <td className="py-2 pr-2">
                    {/* The podium is a chip and the rest of the field is not,
                        so the top three are findable without reading down the
                        column. Fourth place onwards gets no badge at all rather
                        than a grey one, which would only make the table noisier -
                        but it keeps the chip's width, or the column comes out
                        ragged where the podium ends. */}
                    {PODIUM_ACCENT[standing.position - 1] ? (
                      <Badge className={cn('w-7', PODIUM_ACCENT[standing.position - 1])}>
                        {formatNumber(standing.position)}
                      </Badge>
                    ) : (
                      <span className="inline-block w-7 text-center tabular-nums">
                        {formatNumber(standing.position)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4" data-selectable>{standing.driver}</td>
                  <td className="py-2 pr-4 text-muted-foreground" data-selectable>{standing.car}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(standing.laps)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatLapTime(standing.bestLap)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(standing.cuts)}</td>
                  <td className="py-2 text-right tabular-nums">{formatLapTime(standing.totalTime)}</td>
                  {points ? (
                    <td className="py-2 pl-4 text-right font-medium tabular-nums">
                      {formatNumber(points.find((one) => one.position === standing.position)?.points ?? 0)}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
