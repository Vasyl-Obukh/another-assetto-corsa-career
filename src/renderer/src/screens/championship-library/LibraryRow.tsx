import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { LibraryState } from './LibraryState.tsx';
import type { SeriesListing } from '../../../../shared/types';
import { editionsOf } from '../../../../shared/utils/editions';
import { defaultFormatOf } from '../../../../shared/utils/event-format';
import { fieldSize } from '../../../../shared/utils/field-size';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import { SourceChips, SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { useFormat, useLocalizedText } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import {
  ChampionshipActions, disciplineKey, FormatStrip, NeedsChips, RoundTicks, tierAccent, TierMedal,
} from '@/screens/championships';

interface LibraryRowProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
  /**
   * The tab's commands, shared by every row.
   */
  commands: SeriesCommandsState;
}

// A championship as one row of the settings tab's table: what its card says, a
// cell at a time, with the card's menu on its button and on a right-click.
export const LibraryRow = ({ listing, commands }: LibraryRowProps) => {
  const { t } = useTranslation();
  const describe = useLocalizedText();
  const description = describe(listing.series.description);
  const { formatNumber } = useFormat();
  const navigate = useNavigate();
  const { settings, patch } = useSettings();
  const { series, availability } = listing;

  const active = isSeriesActive(listing, settings);
  const page = path.settingsChampionship({ id: series.id });
  const format = defaultFormatOf(series);
  const editions = editionsOf(series);
  const teams = series.teams?.length ?? 0;
  const disciplines = [...new Set(series.entries.map((entry) => entry.ladder.discipline))];
  const tiers = [...new Set(series.entries.map((entry) => entry.ladder.tier))].sort((a, b) => a - b);
  const { rounds } = availability.requires;
  const roundsNeed = rounds.packs.length > 0;
  // Everything but the switch goes pale when the championship is off, as on
  // its card.
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
    >
      {(menu) => (
        <tr className="border-t first:border-t-0 hover:bg-accent/40">
          <td className="w-14 px-2.5 py-2">
            <Switch
              checked={active}
              aria-label={t('championshipLibrary.active', { name: series.name })}
              className={SWITCH_TRACK}
              onCheckedChange={setActive}
            />
          </td>
          <td className={cn('px-2.5 py-2', dimmed)}>
            <div className="flex min-w-0 flex-col">
              <Link to={page} className="leading-snug font-semibold hover:underline">{series.name}</Link>
              {description ? (
                <span className="hidden max-w-[24ch] truncate text-xs text-muted-foreground @[64rem]:block @[88rem]:max-w-[34ch]">
                  {description}
                </span>
              ) : null}
            </div>
          </td>
          <td className={cn('px-2.5 py-2', dimmed)}>
            <div className="flex items-center gap-1.5">
              {disciplines.map((discipline) => (
                <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
              ))}
              <span className="flex -space-x-1">
                {tiers.map((tier) => <TierMedal key={tier} tier={tier} className="size-6 text-xs ring-2 ring-card" />)}
              </span>
            </div>
          </td>
          <td className={cn('hidden px-2.5 py-2 @[88rem]:table-cell', dimmed)}>
            <div className="flex flex-wrap gap-1">
              {series.entries.map((entry) => (
                <Badge key={entry.id} className={tierAccent(entry.ladder.tier)}>{entry.name}</Badge>
              ))}
            </div>
          </td>
          <td className={cn('px-2.5 py-2', dimmed)}>
            <div className="flex w-28 flex-col gap-1.5">
              <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="tabular-nums">{t('championships.rounds', { count: series.rounds.length })}</span>
                {/* Only where it is news: most championships run once a year. */}
                {editions > 1 ? (
                  <span className="text-xs text-muted-foreground">
                    {t('championshipLibrary.table.perYear', { count: editions })}
                  </span>
                ) : null}
              </span>
              <RoundTicks listing={listing} />
            </div>
          </td>
          <td className={cn('hidden px-2.5 py-2 @[70rem]:table-cell', dimmed)}>
            {format ? <FormatStrip sessions={format.sessions} /> : null}
          </td>
          <td className={cn('px-2.5 py-2 text-right whitespace-nowrap tabular-nums', dimmed)}>
            {teams > 0 ? t('championshipLibrary.table.gridSize', {
              cars: formatNumber(fieldSize(series)),
              teams: t('championships.teams', { count: teams }),
            }) : formatNumber(fieldSize(series))}
          </td>
          <td className={cn('hidden px-2.5 py-2 @[64rem]:table-cell', dimmed)}>
            <div className="flex flex-wrap items-center gap-1">
              <NeedsChips requires={availability.requires} />
              {/* What only some rounds need costs those rounds and not the
                  season, so it is named on hover rather than beside the rest. */}
              {roundsNeed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="cursor-help text-xs whitespace-nowrap text-muted-foreground">
                      {t('championshipLibrary.table.someRounds')}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="flex flex-wrap items-center gap-1.5">
                    {t('championshipLibrary.roundsNeed')}
                    <SourceChips packs={rounds.packs} makers={[]} />
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </td>
          <td className="px-2.5 py-2"><LibraryState listing={listing} /></td>
          <td className="w-12 px-2.5 py-2">{menu}</td>
        </tr>
      )}
    </ChampionshipActions>
  );
};
