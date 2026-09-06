import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { disciplineKey } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { path } from '@/lib/routes';

interface ChampionshipCardProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
}

export const ChampionshipCard = ({ listing }: ChampionshipCardProps) => {
  const { t } = useTranslation();
  const { series, availability, origin } = listing;

  return (
    <Link
      to={path.championship({ id: series.id })}
      className="rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className="transition-[box-shadow,border-color] hover:border-primary">
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="min-w-0 flex-1 truncate font-medium">{series.name}</span>

            {/* Only when it is not simply the app's own: a badge down every row
                saying "shipped" would be noise, and what a list has to show is
                which of its entries you have had a hand in. */}
            {origin === 'shipped' ? null : (
              <Badge variant="outline">{t(`championships.origin.${origin}`)}</Badge>
            )}

            <Badge variant={availability.available ? 'secondary' : 'destructive'}>
              {t(availability.available ? 'championships.available' : 'championships.unavailable')}
            </Badge>
          </div>

          {series.notes ? (
            <p className="text-sm text-muted-foreground">{series.notes}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {series.entries.map((entry) => (
              <Badge key={entry.id} variant="outline">
                {t('championships.entryLabel', {
                  discipline: t(disciplineKey(entry.ladder.discipline)),
                  tier: entry.ladder.tier,
                })}
              </Badge>
            ))}

            <Badge variant="outline">
              {t('championships.rounds', { count: series.rounds.length })}
            </Badge>
            {series.entries.length > 1 ? (
              <Badge variant="outline">
                {t('championships.classes', { count: series.entries.length })}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
