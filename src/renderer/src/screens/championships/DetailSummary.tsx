import { useTranslation } from 'react-i18next';

import { AvailabilityBadge } from './AvailabilityBadge.tsx';
import { ChampionshipActions } from './ChampionshipActions.tsx';
import { DISCIPLINE_STRIPE } from './constants.ts';
import { FormatStrip } from './FormatStrip.tsx';
import { NextRoundBox } from './NextRoundBox.tsx';
import { OriginBadge } from './OriginBadge.tsx';
import { Requirements } from './Requirements.tsx';
import { SummaryFact } from './SummaryFact.tsx';
import type { NextRound } from './types.ts';
import {
  availabilityState, disciplineKey, fieldSize, tierAccent,
} from './utils.ts';
import type { SeasonEntry, SeriesListing } from '../../../../shared/types';
import { defaultFormatOf } from '../../../../shared/utils/event-format';
import { isSeriesActive, withSeriesActive } from '../../../../shared/utils/series-toggles';
import { useSettings } from '@/app';
import { ClimateBadge, SWITCH_TRACK } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import type { SeriesCommandsState } from '@/hooks';
import { useFormat, useLocalizedText } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';

interface DetailSummaryProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
  /**
   * Whether the page manages the championship rather than racing it, which
   * trades the Race button for the switch and what it needs.
   */
  manage: boolean;
  /**
   * The screen's commands, for the menu.
   */
  commands: SeriesCommandsState;
  /**
   * Called once the championship has been deleted.
   */
  onDeleted: () => void;
  /**
   * The career's season in it, when it has entered the championship.
   */
  entered: SeasonEntry | null;
  /**
   * The round the page points at next, when there is one.
   */
  next?: NextRound;
  /**
   * Called to open a round's own page.
   * @param round The round's id
   */
  onOpen?: (round: string) => void;
}

// The championship at a glance, and the one thing to do with it: open the next
// round in a career, or switch it on and off where it is managed.
export const DetailSummary = ({
  listing, manage, commands, onDeleted, entered, next, onOpen,
}: DetailSummaryProps) => {
  const { t } = useTranslation();
  const describe = useLocalizedText();
  const description = describe(listing.series.description);
  const { formatMoney } = useFormat();
  const { settings, patch } = useSettings();
  const { series, availability, origin } = listing;
  const active = isSeriesActive(listing, settings);
  const state = availabilityState(availability);
  const format = defaultFormatOf(series);
  const disciplines = [...new Set(series.entries.map((entry) => entry.ladder.discipline))];
  const yours = entered ? series.entries.find((entry) => entry.id === entered.entry) : undefined;
  const yourSeat = yours?.seats.find((seat) => seat.id === entered?.playerSeat);
  const yourTeam = series.teams?.find((team) => team.id === yourSeat?.team);

  // A class may charge its own fee: the one raced in where there is one, or
  // the spread across the classes where they differ.
  const fees = [...new Set((yours ? [yours] : series.entries).map((one) => one.entryFee ?? series.entryFee ?? 0))];
  const low = Math.min(...fees);
  const high = Math.max(...fees);
  let feeText = high > 0 ? formatMoney(high) : t('championships.money.free');
  if (fees.length > 1) {
    feeText = t('championships.money.byClass', { low: formatMoney(low), high: formatMoney(high) });
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      {/* The discipline's colour as a stripe, split for a grid mixing them. */}
      <div className="flex h-1.5 overflow-hidden rounded-full">
        {disciplines.map((discipline) => (
          <span key={discipline} className={`flex-1 ${DISCIPLINE_STRIPE[discipline]}`} />
        ))}
      </div>

      {/* The name's first line is the menu button's height, and the controls
          are centred in that height, so all three line up however long the
          name runs. */}
      <div className="flex items-start gap-2">
        <h1 className="min-w-0 flex-1 py-1 text-xl leading-7 font-semibold">{series.name}</h1>
        <div className="flex h-9 shrink-0 items-center gap-2">
          {manage ? (
            <Switch
              checked={active}
              aria-label={t('championshipLibrary.active', { name: series.name })}
              className={SWITCH_TRACK}
              onCheckedChange={(on) => patch({
                seriesActive: withSeriesActive(listing, settings.seriesActive, on),
              })}
            />
          ) : null}
          <ChampionshipActions
            listing={listing}
            commands={commands}
            manage={manage}
            onDeleted={onDeleted}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {disciplines.map((discipline) => (
          <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>
            {t(disciplineKey(discipline))}
          </Badge>
        ))}
        {/* A class each by name, or the lone class by its tier. */}
        {series.entries.map((entry) => (
          <Badge key={entry.id} className={tierAccent(entry.ladder.tier)}>
            {series.entries.length > 1 ? entry.name : t('championships.tier', { tier: entry.ladder.tier })}
          </Badge>
        ))}
        <OriginBadge origin={origin} />
        {/* Only when it says something: most of the library is available. */}
        {manage && state !== 'available' ? <AvailabilityBadge availability={availability} /> : null}
      </div>

      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {/* Only ever set by Duplicate: a record of where the copy came from
          rather than a live link. */}
      {series.forkedFrom ? (
        <p className="text-xs text-muted-foreground">
          {t('championships.forkedFrom', { series: series.forkedFrom })}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {format ? (
          <SummaryFact label={t('championships.detail.event')}>
            <FormatStrip sessions={format.sessions} />
          </SummaryFact>
        ) : null}
        {series.generatedWeather ? (
          <SummaryFact label={t('championships.detail.weather')}>
            <ClimateBadge climate={series.generatedWeather.climate} />
          </SummaryFact>
        ) : null}
        <SummaryFact label={t('championships.detail.grid')}>
          {t('championships.detail.gridSize', {
            cars: t('championships.cars', { count: fieldSize(series) }),
            teams: t('championships.teams', { count: series.teams?.length ?? 0 }),
          })}
        </SummaryFact>
        {/* A free championship says so rather than showing nothing: an absent
            fee and a fee of zero are different facts. */}
        <SummaryFact label={t('championships.money.entryFee')}>
          {feeText}
        </SummaryFact>
        {yours ? (
          <SummaryFact label={t('championships.detail.youRace')}>
            <Badge className={tierAccent(yours.ladder.tier)}>{yours.name}</Badge>
            {yourTeam ? <span className="truncate">{yourTeam.name}</span> : null}
          </SummaryFact>
        ) : null}
      </div>

      {manage ? <Requirements requires={availability.requires} /> : null}

      {next && onOpen ? <NextRoundBox next={next} onOpen={() => onOpen(next.round.id)} /> : null}
    </section>
  );
};
