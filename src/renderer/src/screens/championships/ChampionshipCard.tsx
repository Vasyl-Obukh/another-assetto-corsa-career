import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { CARD_TITLE } from './constants.ts';
import { LadderChip } from './LadderChip.tsx';
import { MissingContent } from './MissingContent.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { Requirements } from './Requirements.tsx';
import { availabilityState } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import { ProblemList, SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

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
  /**
   * Whether the card manages the championship, as the settings tab's do: a
   * switch, what is wrong with it and the whole menu. Left out, the card is
   * as a career sees it, with Edit its only command.
   */
  manage?: boolean;
}

export const ChampionshipCard = ({ listing, commands, manage = false }: ChampionshipCardProps) => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const { series, availability, origin } = listing;

  const active = isSeriesActive(listing, settings);
  const state = availabilityState(availability);
  const locked = listing.weekend !== null;
  // Each list opens the page of its own: the settings tab's never races a round.
  const page = manage
    ? path.settingsChampionship({ id: series.id })
    : path.championship({ id: series.id });
  const returnTo = manage
    ? { to: path.settingsChampionships(), label: 'editor.back' as const }
    : { to: path.championships(), label: 'championships.back' as const };
  // Everything but the switch goes pale when the championship is off, so a card
  // that is not on the Championships page reads as such at a glance - and the
  // switch that brings it back does not.
  const dimmed = manage && !active && 'opacity-50';

  /**
   * Switches the championship on or off the Championships page.
   * @param next Whether it should be active
   */
  const setActive = (next: boolean): void => {
    patch({ seriesActive: withSeriesActive(listing, settings.seriesActive, next) });
  };

  return (
    // Isolated, so the controls lifted over the stretched title stack inside
    // the card rather than over the sticky toolbar the list scrolls under.
    <Card
      className="relative isolate transition-[box-shadow,border-color] focus-within:border-primary hover:border-primary"
    >
      <CardContent className="flex flex-col gap-3">
        <div className={cn('flex flex-wrap items-center gap-3', dimmed)}>
          <Link to={page} className={CARD_TITLE}>
            {series.name}
          </Link>

          <OriginBadge origin={origin} />

          {/* Only where it can be anything else: the Championships page lists
              nothing that is not available. */}
          {manage ? <AvailabilityBadge availability={availability} /> : null}

          {/* Above the stretched link, or the card's own click would swallow
              the menu's. */}
          <div className="relative z-10">
            <ChampionshipActions
              listing={listing}
              commands={commands}
              manage={manage}
              returnTo={returnTo}
            />
          </div>
        </div>

        {series.description ? (
          <p className={cn('text-sm text-muted-foreground', dimmed)}>{series.description}</p>
        ) : null}

        <div className={cn('flex flex-wrap items-center gap-2', dimmed)}>
          {series.entries.map((entry) => <LadderChip key={entry.id} ladder={entry.ladder} />)}

          {/* Counts rather than one of a set, so they stay neutral. */}
          <Badge variant="outline">
            {t('championships.rounds', { count: series.rounds.length })}
          </Badge>
          {series.entries.length > 1 ? (
            <Badge variant="outline">
              {t('championships.classes', { count: series.entries.length })}
            </Badge>
          ) : null}
        </div>

        {manage ? (
          <>
            <div className={cn('flex flex-col gap-3 empty:hidden', dimmed)}>
              {locked ? (
                <Badge variant="warning" className="self-start">
                  {t('championships.actions.editLocked')}
                </Badge>
              ) : null}

              {/* The one reason nothing else on the card spells out: the switch
                  says inactive, the problem list misconfigured, and this tab
                  never lists a championship the sources hide. */}
              {active && state === 'unavailable' ? (
                <p className="text-sm text-muted-foreground">{t('championshipLibrary.unavailable')}</p>
              ) : null}

              <ProblemList
                problems={availability.problems}
                label={t('championships.problems.series', { count: availability.problems.length })}
                hint={t('championships.problems.seriesHint')}
              />

              {/* Only when content is genuinely what is missing. A misconfigured
                  file's entries and rounds are derived from a document already
                  declared incoherent, so the list behind it is not worth showing. */}
              {state === 'unavailable' ? <MissingContent listing={listing} /> : null}
            </div>

            {/* The switch in the bottom corner, beside what the championship
                needs, and above the stretched button like the menu. */}
            <div className="flex items-end gap-3">
              <div className={cn('min-w-0 flex-1', dimmed)}>
                <Requirements requires={availability.requires} />
              </div>
              <Switch
                checked={active}
                aria-label={t('championshipLibrary.active', { name: series.name })}
                className={cn('relative z-10', SWITCH_TRACK)}
                onCheckedChange={setActive}
              />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
