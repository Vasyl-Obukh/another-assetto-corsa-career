import { useTranslation } from 'react-i18next';

import type { PointsSystem } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface PointsCardProps {
  /**
   * Every way the championship scores a race, in the order it offers them.
   */
  systems: readonly PointsSystem[];
  /**
   * The id of the system a race pays when it names none.
   */
  defaultSystem: string;
  /**
   * How many worst results the season drops, if any.
   */
  drops?: number;
}

export const PointsCard = ({ systems, defaultSystem, drops }: PointsCardProps) => {
  const { t } = useTranslation();

  /**
   * Lists one system as the badges it is made of.
   *
   * Built as a list rather than conditional blocks in the markup, so the badges
   * are one shape and the composition stays a translation decision.
   * @param points The system to describe
   * @returns One label per award it pays
   */
  const rows = (points: PointsSystem): string[] => [
    ...points.positions.map((value, index) => t('championships.points.row', {
      label: t('championships.points.position', { number: index + 1 }),
      points: value,
    })),
    ...(points.fastestLap ? [t('championships.points.row', {
      label: t('championships.points.fastestLap'), points: points.fastestLap,
    })] : []),
    ...(points.pole ? [t('championships.points.row', {
      label: t('championships.points.pole'), points: points.pole,
    })] : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('championships.points.title', { count: systems.length })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {systems.map((points) => (
          <div key={points.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{points.name}</span>
              {/* Only worth saying when there is something to default against,
                  the same rule the weekend formats card follows. */}
              {systems.length > 1 && points.id === defaultSystem ? (
                <Badge variant="secondary">{t('championships.points.default')}</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {rows(points).map((row) => <Badge key={row} variant="outline">{row}</Badge>)}
            </div>
          </div>
        ))}
        {/* A season rule rather than a scoring one, so it sits under the
            systems rather than inside any of them. */}
        {drops ? (
          <span className="text-xs text-muted-foreground">
            {t('championships.points.drops', { count: drops })}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
};
