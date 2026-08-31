import { useTranslation } from 'react-i18next';

import type { SessionSummary } from '../../../../shared/types';
import { formatLapTime } from '../../../../shared/utils/lap-time';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';

interface SessionTableProps {
  /**
   * One session's classification.
   */
  session: SessionSummary;
}

export const SessionTable = ({ session }: SessionTableProps) => {
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
          <Badge variant={official ? 'secondary' : 'outline'}>
            {official ? t('results.order.raceResult') : t('results.order.inferred')}
          </Badge>
          <Badge variant="outline">{scheduled}</Badge>
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
              </tr>
            </thead>
            <tbody>
              {session.standings.map((standing) => (
                <tr key={`${standing.position}-${standing.driver}`} className="border-b last:border-0">
                  <td className="py-2 pr-2 tabular-nums">{formatNumber(standing.position)}</td>
                  <td className="py-2 pr-4" data-selectable>{standing.driver}</td>
                  <td className="py-2 pr-4 text-muted-foreground" data-selectable>{standing.car}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(standing.laps)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatLapTime(standing.bestLap)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(standing.cuts)}</td>
                  <td className="py-2 text-right tabular-nums">{formatLapTime(standing.totalTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
