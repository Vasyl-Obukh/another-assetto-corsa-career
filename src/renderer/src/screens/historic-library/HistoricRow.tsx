import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { HistoricState } from './HistoricState.tsx';
import { HistoricTrack } from './HistoricTrack.tsx';
import { historicSwitches } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { defaultFormatOf } from '../../../../shared/utils/event-format';
import { fieldSize } from '../../../../shared/utils/field-size';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import { SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { managePath } from '@/lib/series-kind';
import { cn } from '@/lib/utils.ts';
import {
  ChampionshipActions, disciplineKey, FormatStrip, TierMedal,
} from '@/screens/championships';

interface HistoricRowProps {
  /**
   * The historic event and whether the install can race it.
   */
  listing: SeriesListing;
  /**
   * The tab's commands, shared by every row.
   */
  commands: SeriesCommandsState;
}

// A historic event as one row of the tab's table, its switch first so a column
// of switches reads down the table's edge.
export const HistoricRow = ({ listing, commands }: HistoricRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch } = useSettings();
  const { series } = listing;

  const active = isSeriesActive(listing, historicSwitches(settings));
  const page = managePath('historic', series.id);
  const format = defaultFormatOf(series);
  const disciplines = [...new Set(series.entries.map((entry) => entry.ladder.discipline))];
  const tiers = [...new Set(series.entries.map((entry) => entry.ladder.tier))].sort((a, b) => a - b);
  const dimmed = !active && 'opacity-50';

  /**
   * Switches whether a season may draw this event.
   * @param next Whether it may
   */
  const setActive = (next: boolean): void => {
    patch({ historicActive: withSeriesActive(listing, settings.historicActive, next) });
  };

  return (
    <tr className="border-t first:border-t-0 hover:bg-accent/40">
      <td className="w-14 px-2.5 py-2">
        <Switch
          checked={active}
          aria-label={t('historicLibrary.active', { name: series.name })}
          className={SWITCH_TRACK}
          onCheckedChange={setActive}
        />
      </td>
      <td className={cn('px-2.5 py-2', dimmed)}>
        <div className="flex min-w-0 flex-col gap-1">
          <Link to={page} className="font-semibold hover:underline">{series.name}</Link>
          <HistoricTrack listing={listing} className="w-12" />
        </div>
      </td>
      <td className={cn('px-2.5 py-2', dimmed)}>
        <div className="flex flex-wrap items-center gap-1.5">
          {disciplines.map((discipline) => (
            <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
          ))}
          <span className="flex -space-x-1">
            {tiers.map((tier) => <TierMedal key={tier} tier={tier} className="size-6 text-xs ring-2 ring-card" />)}
          </span>
        </div>
      </td>
      <td className={cn('hidden px-2.5 py-2 @[52rem]:table-cell', dimmed)}>
        {series.entries.map((entry) => entry.name).join(', ')}
      </td>
      <td className={cn('px-2.5 py-2 text-right tabular-nums', dimmed)}>{fieldSize(series)}</td>
      <td className={cn('hidden px-2.5 py-2 @[44rem]:table-cell', dimmed)}>
        {format ? <FormatStrip sessions={format.sessions} /> : null}
      </td>
      <td className="px-2.5 py-2"><HistoricState listing={listing} /></td>
      <td className="w-12 px-2.5 py-2">
        <ChampionshipActions
          listing={listing}
          commands={commands}
          manage
          kind="historic"
          onOpen={() => navigate(page)}
          active={active}
          onToggle={() => setActive(!active)}
        />
      </td>
    </tr>
  );
};
