import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { CARD_TITLE } from './constants.ts';
import { FormatStrip } from './FormatStrip.tsx';
import { MissingContent } from './MissingContent.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { Requirements } from './Requirements.tsx';
import { RoundTicks } from './RoundTicks.tsx';
import { SeasonBand } from './SeasonBand.tsx';
import { availabilityState, tierAccent } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { defaultFormatOf } from '../../../../shared/utils/weekend-format';
import { useSettings } from '@/app';
import { ProblemList, SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface SeasonCardProps {
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

// A championship as the settings tab manages it: a switch, what is wrong with
// it, the whole menu - from its button or a right-click anywhere on the card -
// and the season's shape at its foot.
export const SeasonCard = ({ listing, commands }: SeasonCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch } = useSettings();
  const { series, availability, origin } = listing;

  const active = isSeriesActive(listing, settings);
  const state = availabilityState(availability);
  const locked = listing.weekend !== null;
  const page = path.settingsChampionship({ id: series.id });
  const format = defaultFormatOf(series);
  const disciplines = [...new Set(series.entries.map((entry) => entry.ladder.discipline))];
  const tiers = [...new Set(series.entries.map((entry) => entry.ladder.tier))].sort((a, b) => a - b);
  // Everything but the switch goes pale when the championship is off, so a card
  // that is not on the Championships page reads as such at a glance - and the
  // switch that brings it back does not.
  const dimmed = !active && 'opacity-50';

  /**
   * Switches the championship on or off the Championships page.
   * @param next Whether it should be active
   */
  const setActive = (next: boolean): void => {
    patch({ seriesActive: withSeriesActive(listing, settings.seriesActive, next) });
  };

  return (
    <ChampionshipActions
      listing={listing}
      commands={commands}
      manage
      onOpen={() => navigate(page)}
      active={active}
      onToggle={() => setActive(!active)}
      triggerClassName="size-7 text-inherit hover:bg-current/15 hover:text-inherit data-[state=open]:bg-current/15 dark:hover:bg-current/15"
    >
      {(menu) => (
        // Isolated, so the controls lifted over the stretched title stack inside
        // the card rather than over the sticky toolbar the list scrolls under.
        <Card
          className="relative isolate gap-0 overflow-hidden py-0 hover-outline transition-[border-color] focus-within:border-primary"
        >
          <SeasonBand disciplines={disciplines} tiers={tiers} menu={menu} dimmed={dimmed} />

          <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-3">
            <div className="flex items-start gap-3">
              <Link to={page} className={cn(CARD_TITLE, 'text-base leading-snug font-semibold', dimmed)}>
                {series.name}
              </Link>
              <Switch
                checked={active}
                aria-label={t('championshipLibrary.active', { name: series.name })}
                className={cn('relative z-10', SWITCH_TRACK)}
                onCheckedChange={setActive}
              />
            </div>

            <div className={cn('flex flex-col gap-3', dimmed)}>
              {series.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{series.description}</p>
              ) : null}

              {series.entries.length > 1 ? (
                <div className="flex flex-wrap gap-1">
                  {series.entries.map((entry) => (
                    <Badge key={entry.id} className={tierAccent(entry.ladder.tier)}>{entry.name}</Badge>
                  ))}
                </div>
              ) : null}

              {origin !== 'shipped' || state !== 'available' || locked ? (
                <div className="flex flex-wrap gap-1">
                  <OriginBadge origin={origin} />
                  {/* Only when it says something: most of the library is
                      available, and a green chip on every card is noise. */}
                  {state === 'available' ? null : <AvailabilityBadge availability={availability} />}
                  {locked ? <Badge variant="warning">{t('championships.actions.editLocked')}</Badge> : null}
                </div>
              ) : null}

              <Requirements requires={availability.requires} />

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
          </div>

          <div className={cn('flex flex-col gap-2 border-t px-4 py-3', dimmed)}>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="tabular-nums">{t('championships.rounds', { count: series.rounds.length })}</span>
              {format ? <FormatStrip sessions={format.sessions} /> : null}
            </div>
            <RoundTicks listing={listing} />
          </div>
        </Card>
      )}
    </ChampionshipActions>
  );
};
