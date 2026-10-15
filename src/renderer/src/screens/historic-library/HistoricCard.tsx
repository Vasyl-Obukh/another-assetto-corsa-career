import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { HistoricState } from './HistoricState.tsx';
import { HistoricTrack } from './HistoricTrack.tsx';
import { eventRequirements, historicSwitches } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { defaultFormatOf } from '../../../../shared/utils/event-format';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import { ProblemList, SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { managePath } from '@/lib/series-kind';
import { cn } from '@/lib/utils.ts';
import {
  availabilityState, CARD_TITLE, ChampionshipActions, fieldSize, FormatStrip, MissingContent, Requirements,
  SeasonBand, tierAccent,
} from '@/screens/championships';

interface HistoricCardProps {
  /**
   * The historic event and whether the install can race it.
   */
  listing: SeriesListing;
  /**
   * The tab's commands, shared by every card so one busy flag and one error
   * surface cover the whole list.
   */
  commands: SeriesCommandsState;
}

// A historic event as the settings tab manages it, in a championship card's
// shape: the band in its discipline's colour, a switch for whether a season may
// draw it, where it runs, what stops it being drawn, and its format at its foot.
export const HistoricCard = ({ listing, commands }: HistoricCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch } = useSettings();
  const { series, availability } = listing;

  const active = isSeriesActive(listing, historicSwitches(settings));
  const page = managePath('historic', series.id);
  const format = defaultFormatOf(series);
  const disciplines = [...new Set(series.entries.map((entry) => entry.ladder.discipline))];
  const tiers = [...new Set(series.entries.map((entry) => entry.ladder.tier))].sort((a, b) => a - b);
  // Everything but the switch goes pale when it is off, as a championship card does.
  const dimmed = !active && 'opacity-50';

  /**
   * Switches whether a season may draw this event.
   * @param next Whether it may
   */
  const setActive = (next: boolean): void => {
    patch({ historicActive: withSeriesActive(listing, settings.historicActive, next) });
  };

  return (
    <ChampionshipActions
      listing={listing}
      commands={commands}
      manage
      kind="historic"
      onOpen={() => navigate(page)}
      active={active}
      onToggle={() => setActive(!active)}
      triggerClassName="size-7 text-inherit hover:bg-current/15 hover:text-inherit data-[state=open]:bg-current/15 dark:hover:bg-current/15"
    >
      {(menu) => (
        <Card className="relative isolate gap-0 overflow-hidden py-0 hover-outline transition-[border-color] focus-within:border-primary">
          <SeasonBand disciplines={disciplines} tiers={tiers} menu={menu} dimmed={dimmed} />

          <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-3">
            <div className="flex items-start gap-3">
              <Link to={page} className={cn(CARD_TITLE, 'text-base leading-snug font-semibold', dimmed)}>
                {series.name}
              </Link>
              <Switch
                checked={active}
                aria-label={t('historicLibrary.active', { name: series.name })}
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

              <HistoricTrack listing={listing} />
              <HistoricState listing={listing} />
              <Requirements requires={eventRequirements(availability.requires)} />

              <ProblemList
                problems={availability.problems}
                label={t('championships.problems.series', { count: availability.problems.length })}
                hint={t('championships.problems.seriesHint')}
              />

              {availabilityState(availability) === 'unavailable' ? <MissingContent listing={listing} /> : null}
            </div>
          </div>

          <div className={cn('flex items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground', dimmed)}>
            <span className="tabular-nums">{t('historicLibrary.cars', { count: fieldSize(series) })}</span>
            {format ? <FormatStrip sessions={format.sessions} /> : null}
          </div>
        </Card>
      )}
    </ChampionshipActions>
  );
};
