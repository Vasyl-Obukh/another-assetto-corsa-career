import { useTranslation } from 'react-i18next';

import { DEFAULT_REF } from './constants.ts';
import type { Championship, SeriesSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

interface RacesPayingProps {
  /**
   * The championship, for its formats and its points systems.
   */
  series: Championship;
  /**
   * The system being edited, whose races are picked out.
   */
  system: string;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the championship whenever a race's points change.
   * @param next The championship
   */
  onChange: (next: Championship) => void;
}

/**
 * Every race of every format with the points it pays - the same choice each
 * race's own Pays field makes on the Weekends tab, gathered in one place.
 */
export const RacesPaying = ({
  series, system, locked, onChange,
}: RacesPayingProps) => {
  const { t } = useTranslation();
  const defaultName = series.pointsSystems.find((one) => one.id === series.defaultPointsSystem)?.name ?? '';
  const races = series.weekendFormats.flatMap((format) => format.sessions
    .map((session, index) => ({ format, session, index }))
    .filter(({ session }) => session.type === 'race'));

  /**
   * Sets the points one race pays.
   * @param format The format's id
   * @param index Where the race sits in it
   * @param value A system's id, or the default
   */
  const pay = (format: string, index: number, value: string): void => onChange({
    ...series,
    weekendFormats: series.weekendFormats.map((one) => (one.id !== format ? one : {
      ...one,
      sessions: one.sessions.map((session, at): SeriesSession => (at !== index ? session : {
        ...session,
        pointsSystem: value === DEFAULT_REF ? undefined : value,
      })),
    })),
  });

  return (
    <div className="max-w-2xl overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 font-normal">{t('editor.points.format')}</th>
            <th className="pb-2 font-normal">{t('editor.points.race')}</th>
            <th className="pb-2 font-normal">{t('editor.points.pays')}</th>
          </tr>
        </thead>
        <tbody>
          {races.map(({ format, session, index }) => {
            const paid = (session.pointsSystem ?? series.defaultPointsSystem) === system;

            return (
              <tr key={`${format.id}-${index}`} className="border-t">
                {/* Muted where the race pays another system, so the ones this
                    system scores read first. */}
                <td className={cn('py-1.5 pr-3', !paid && 'text-muted-foreground')}>{format.name}</td>
                <td className="py-1.5 pr-3">
                  <Badge className={SESSION_ACCENT.race}>{session.name ?? t(SESSION_TYPE_LABEL.race)}</Badge>
                </td>
                <td className="w-60 py-1.5">
                  <Select
                    value={session.pointsSystem ?? DEFAULT_REF}
                    disabled={locked}
                    onValueChange={(value) => pay(format.id, index, value)}
                  >
                    <SelectTrigger className="h-8 w-full" aria-label={t('editor.points.pays')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_REF}>{t('editor.points.defaultNamed', { name: defaultName })}</SelectItem>
                      {series.pointsSystems.map((points) => (
                        <SelectItem key={points.id} value={points.id}>{points.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
