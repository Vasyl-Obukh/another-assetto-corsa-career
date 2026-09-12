import { useTranslation } from 'react-i18next';

import type { PointsSystem } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { PODIUM_ACCENT } from '@/lib/accents';

interface PointsCardProps {
  /**
   * Every way the championship scores a race, in the order it offers them.
   */
  systems: readonly PointsSystem[];
  /**
   * The id of the system a race pays when it names none.
   */
  defaultSystem: string;
}

export const PointsCard = ({ systems, defaultSystem }: PointsCardProps) => {
  const { t } = useTranslation();

  /**
   * Lists one system as the badges it is made of.
   *
   * Built as a list rather than conditional blocks in the markup, so the badges
   * are one shape and the composition stays a translation decision. Each row
   * carries its own colour, which for the first three is the metal that place
   * is worth - the top of a points table is the part anybody reads.
   * @param points The system to describe
   * @returns One label per award it pays, with the colour it wears
   */
  const rows = (points: PointsSystem): { label: string; accent?: string }[] => [
    ...points.positions.map((value, index) => ({
      label: t('championships.points.row', {
        label: t('championships.points.position', { number: index + 1 }),
        points: value,
      }),
      accent: PODIUM_ACCENT[index],
    })),
    ...(points.fastestLap ? [{
      label: t('championships.points.row', {
        label: t('championships.points.fastestLap'), points: points.fastestLap,
      }),
    }] : []),
    // The same metals as the finishing table: pole is a podium of its own.
    ...(points.qualifying ?? []).map((value, index) => ({
      label: t('championships.points.row', {
        label: t('championships.points.qualifying', { number: index + 1 }),
        points: value,
      }),
      accent: PODIUM_ACCENT[index],
    })),
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
              {/* Filled, and only worth saying when there is something to
                  default against - the same rule and the same weight the
                  weekend formats card uses. */}
              {systems.length > 1 && points.id === defaultSystem ? (
                <Badge>{t('championships.points.default')}</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {rows(points).map((row) => (
                <Badge key={row.label} variant="outline" className={row.accent}>
                  {row.label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
