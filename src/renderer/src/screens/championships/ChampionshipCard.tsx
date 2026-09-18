import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { CARD_TITLE } from './constants.ts';
import { LadderChip } from './LadderChip.tsx';
import { MissingContent } from './MissingContent.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { Requirements } from './Requirements.tsx';
import { availabilityState } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ConfirmDialog, ProblemList, SWITCH_TRACK } from '@/components';
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
   * The screen's commands when the card manages the championship, shared by
   * every card so one busy flag and one error surface cover the whole list.
   * Left out, the card is read-only, as a career sees it.
   */
  commands?: SeriesCommandsState;
}

export const ChampionshipCard = ({ listing, commands }: ChampionshipCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch } = useSettings();
  const [copying, setCopying] = useState(false);
  const { series, availability, origin } = listing;

  const active = !settings.inactiveSeries.includes(series.id);
  const state = availabilityState(availability);
  const editor = path.championshipEdit({ id: series.id });
  // Both versions of the card lead somewhere: the page a career reads, or the
  // editor. Only a weekend under way stops the second.
  const locked = listing.weekend !== null;
  // Everything but the switch goes pale when the championship is off, so a card
  // that is not on the Championships page reads as such at a glance - and the
  // switch that brings it back does not.
  const dimmed = commands !== undefined && !active && 'opacity-50';

  /**
   * Switches the championship on or off the Championships page.
   * @param next Whether it should be active
   */
  const setActive = (next: boolean): void => {
    const others = settings.inactiveSeries.filter((id) => id !== series.id);
    patch({ inactiveSeries: next ? others : [...others, series.id] });
  };

  /**
   * Opens the editor, taking a copy of a shipped championship on the way.
   *
   * The copy keeps the id, so one navigation covers both ways in.
   */
  const customise = (): void => {
    if (!commands) return;

    commands.customise(series.id).then((ok) => {
      setCopying(false);
      if (ok) navigate(editor);
    }, () => setCopying(false));
  };

  return (
    <Card
      className={cn(
        'relative',
        !(commands && locked)
          && 'transition-[box-shadow,border-color] focus-within:border-primary hover:border-primary',
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className={cn('flex flex-wrap items-center gap-3', dimmed)}>
          {commands ? (
            <button
              type="button"
              className={cn(CARD_TITLE, locked && 'text-muted-foreground')}
              disabled={locked || commands.busy}
              onClick={() => {
                // The app's own is replaced until it is reverted, which is
                // worth saying out loud rather than discovering.
                if (origin === 'shipped') setCopying(true);
                else navigate(editor);
              }}
            >
              {series.name}
            </button>
          ) : (
            <Link to={path.championship({ id: series.id })} className={CARD_TITLE}>
              {series.name}
            </Link>
          )}

          <OriginBadge origin={origin} />

          {/* Only where it can be anything else: the Championships page lists
              nothing that is not available. The menu sits above the stretched
              button, or the card's own click would swallow its. */}
          {commands ? (
            <>
              <AvailabilityBadge availability={availability} />
              <div className="relative z-10">
                <ChampionshipActions listing={listing} commands={commands} />
              </div>
            </>
          ) : null}
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

        {commands ? (
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

            <ConfirmDialog
              open={copying}
              busy={commands.busy}
              title={t('championships.edit.title', { name: series.name })}
              description={t('championships.edit.body')}
              confirmLabel={t('championships.edit.confirm')}
              onClose={() => setCopying(false)}
              onConfirm={customise}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
