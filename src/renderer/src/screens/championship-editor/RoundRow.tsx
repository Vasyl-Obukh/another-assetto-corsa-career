import { CarFrontIcon, CloudSunIcon } from 'lucide-react';


import { ROUND_COLUMN } from './constants.ts';
import { ListRow } from './ListRow.tsx';
import { OverrideButton } from './OverrideButton.tsx';
import { SwapSummary } from './SwapSummary.tsx';
import { groupsSet } from './utils.ts';
import type {
  Championship, Round, RoundAvailability, RoundRaceLength,
} from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { ClimateBadge } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';
import { useUnits } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { FormatStrip, trackKeyOf } from '@/screens/championships';
import { ConditionsSummaryLine } from '@/screens/race';
import { LayoutMap } from '@/screens/track-browser';

interface RoundRowProps {
  /**
   * The championship the round belongs to, for resolving the format it runs.
   */
  series: Championship;
  /**
   * The round the row stands for.
   */
  round: Round;
  /**
   * Where it sits on the calendar, counting from zero.
   */
  index: number;
  /**
   * How many rounds there are, which is what disables the last Move later.
   */
  count: number;
  /**
   * What this round is missing against the installed content, or undefined
   * while the draft has not been checked yet.
   *
   * On the row rather than in the problem list: a missing circuit is a fact
   * about this install, not about the document.
   */
  availability: RoundAvailability | undefined;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * The calendar's drag state.
   */
  drag: RowDrag;
  /**
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
  /**
   * Called to open the round's form.
   */
  onEdit: () => void;
  /**
   * Called to open what the round runs in.
   */
  onConditions: () => void;
  /**
   * Called to open which cars each class runs here.
   */
  onCars: () => void;
  /**
   * Called to move the round along the calendar.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the round from the calendar.
   */
  onRemove: () => void;
}

/**
 * One event on the calendar, read-only, as a line of the calendar's table.
 *
 * The columns are the point: a twenty-round season is scanned down them for
 * what is unusual about a round - a circuit that is not installed, an event
 * of its own, weather of its own, a class running different cars - rather than
 * read field by field.
 */
export const RoundRow = ({
  series, round, index, count, availability, locked, drag, nameOf,
  onEdit, onConditions, onCars, onMove, onRemove,
}: RoundRowProps) => {
  const { t } = useKindTranslation();
  const { formatMoney } = useFormat();
  const units = useUnits();

  const trackKey = trackKeyOf(round);
  // Counted a group at a time, as the round's dialog sets them.
  const overrides = groupsSet(round.conditions ?? {}).length;
  const swapped = round.eligibility?.length ?? 0;
  const format = formatOf(series, round);

  /**
   * Says how long one race runs at this round's track.
   * @param race The race's length
   * @returns The length, already translated
   */
  const lengthOf = (race: RoundRaceLength): string => (race.distance === undefined
    ? t('championships.format.laps', { count: race.laps ?? 0 })
    : units.format('distance', race.distance));
  const lengths = availability?.races.map(lengthOf) ?? [];
  // An event of identical races says so once rather than repeating itself.
  const races = lengths.length > 1 && lengths.every((length) => length === lengths[0])
    ? t('championships.detail.raceTimes', { count: lengths.length, length: lengths[0] })
    : lengths.join(', ');

  return (
    <ListRow
      index={index}
      name={round.name}
      detail={trackKey === '' ? t('editor.calendar.noTrack') : trackKey}
      label={round.name}
      count={count}
      locked={locked}
      drag={drag}
      onEdit={onEdit}
      extra={[
        {
          label: t('editor.calendar.conditions'),
          icon: <CloudSunIcon />,
          badge: overrides > 0 ? String(overrides) : undefined,
          onSelect: onConditions,
        },
        {
          label: t('editor.calendar.cars'),
          icon: <CarFrontIcon />,
          badge: swapped > 0 ? String(swapped) : undefined,
          onSelect: onCars,
        },
      ]}
      onMove={onMove}
      onRemove={onRemove}
      lead={(
        <div className={cn('relative aspect-[16/10] overflow-hidden rounded-md bg-muted', ROUND_COLUMN.MAP)}>
          <LayoutMap track={round.track} alt={round.name} className="p-1" />
        </div>
      )}
    >
      {/* What this install cannot race, right where the eye is reading. */}
      {availability?.track ? (
        <Badge variant="destructive" className="shrink-0">{t('editor.calendar.missingTrack')}</Badge>
      ) : null}

      {availability?.pitboxes ? (
        <Badge variant="destructive" className="shrink-0">
          {t('editor.calendar.tooFewPitboxes', {
            available: availability.pitboxes.available,
            needed: availability.pitboxes.needed,
          })}
        </Badge>
      ) : null}

      <span className={cn('min-w-0 items-center gap-2', ROUND_COLUMN.EVENT)}>
        {format ? <FormatStrip sessions={format.sessions} /> : null}
        {/* Muted when it is only the default, which is what most rounds run. */}
        <span className={cn('truncate text-xs', round.eventFormat === undefined ? 'text-muted-foreground' : 'font-medium')}>
          {format?.name ?? ''}
        </span>
      </span>

      <span className={cn('truncate text-xs tabular-nums', ROUND_COLUMN.RACES)}>
        {races}
        {round.sessionLengths?.length ? (
          <span className="block text-muted-foreground">{t('editor.calendar.ownLength')}</span>
        ) : null}
      </span>

      <span className={ROUND_COLUMN.OWN}>
        {/* Only a round that expects weather of its own, and only while the
            championship generates it - a climate is ignored otherwise. */}
        {series.generatedWeather && round.climate ? <ClimateBadge climate={round.climate} /> : null}

        <OverrideButton
          icon={<CloudSunIcon />}
          label={overrides > 0
            ? t('editor.calendar.conditionsSet', { count: overrides })
            : t('editor.calendar.conditions')}
          active={overrides > 0}
          disabled={locked}
          onClick={onConditions}
        >
          {overrides > 0
            ? <ConditionsSummaryLine conditions={round.conditions ?? {}} className="text-xs text-background" />
            : undefined}
        </OverrideButton>

        <OverrideButton
          icon={<CarFrontIcon />}
          label={swapped > 0 ? t('editor.calendar.carsSet', { count: swapped }) : t('editor.calendar.cars')}
          active={swapped > 0}
          disabled={locked}
          onClick={onCars}
        >
          {swapped > 0 ? <SwapSummary series={series} round={round} nameOf={nameOf} /> : undefined}
        </OverrideButton>
      </span>

      {/* Muted when it is the championship's own. */}
      <span className={cn('text-xs tabular-nums', ROUND_COLUMN.FEE, round.entryFee === undefined && 'text-muted-foreground')}>
        {round.entryFee === undefined ? t('editor.calendar.defaultFee') : formatMoney(round.entryFee)}
      </span>
    </ListRow>
  );
};
