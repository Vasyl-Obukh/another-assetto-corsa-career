import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { disciplineKey } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';

interface ChampionshipCardProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
  /**
   * The screen's commands, shared by every card so one busy flag and one error
   * surface cover the whole list.
   */
  commands: SeriesCommandsState;
}

export const ChampionshipCard = ({ listing, commands }: ChampionshipCardProps) => {
  const { t } = useTranslation();
  const { series, availability, origin } = listing;

  // The link is stretched over the card rather than wrapping it, which is what
  // lets the menu live inside: a button nested in an anchor is neither valid nor
  // clickable in the way anyone expects.
  return (
    <Card className="relative transition-[box-shadow,border-color] focus-within:border-primary hover:border-primary">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={path.championship({ id: series.id })}
            className="min-w-0 flex-1 truncate font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {series.name}
          </Link>

          <OriginBadge origin={origin} />
          <AvailabilityBadge availability={availability} />

          <div className="relative z-10 -my-2 -mr-2">
            <ChampionshipActions listing={listing} commands={commands} />
          </div>
        </div>

        {series.notes ? (
          <p className="text-sm text-muted-foreground">{series.notes}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {series.entries.map((entry) => (
            <Badge key={entry.id} variant="secondary">
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
  );
};
