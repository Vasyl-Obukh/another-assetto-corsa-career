import { CarFrontIcon, CloudSunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CountBadge } from './CountBadge.tsx';
import { ListRow } from './ListRow.tsx';
import { SwapSummary } from './SwapSummary.tsx';
import type { Championship, Round, RoundAvailability } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';
import { trackKeyOf } from '@/screens/championships';
import { ConditionsSummaryLine, overrideCount } from '@/screens/race';

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
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be acted on, which it may not while any row in the
   * editor has its form open.
   */
  editable: boolean;
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
 * One event on the calendar, read-only.
 *
 * The chips are the point: a twenty-round season is scanned for what is unusual
 * about a round - a circuit that is not installed, a field the track cannot
 * hold, weather of its own, a class running different cars - rather than read
 * field by field.
 */
export const RoundRow = ({
  series, round, index, count, availability, locked, editable, drag, nameOf,
  onEdit, onConditions, onCars, onMove, onRemove,
}: RoundRowProps) => {
  const { t } = useTranslation();

  const trackKey = trackKeyOf(round);
  const overrides = overrideCount(round.conditions ?? {});
  const swapped = round.eligibility?.length ?? 0;
  // Only a format the round names itself, and only when it resolves: a missing
  // reference is validateSeries' to report, not a chip's.
  const format = round.weekendFormat === undefined
    ? undefined
    : series.weekendFormats.find((one) => one.id === round.weekendFormat);

  return (
    <ListRow
      index={index}
      number={index + 1}
      name={round.name}
      label={round.name}
      first={index === 0}
      last={index === count - 1}
      locked={locked}
      editable={editable}
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
    >
      {/* Only a round that names its own format. Neutral: a name, not one of a
          closed set. */}
      {format === undefined ? null : (
        <Badge variant="secondary" className="max-w-40 shrink-0 truncate">{format.name}</Badge>
      )}

      <CountBadge
        icon={<CloudSunIcon />}
        count={overrides}
        label={t('editor.calendar.conditions')}
        disabled={locked || !editable}
        onClick={onConditions}
      >
        <ConditionsSummaryLine conditions={round.conditions ?? {}} className="text-xs text-background" />
      </CountBadge>

      <CountBadge
        icon={<CarFrontIcon />}
        count={swapped}
        label={t('editor.calendar.cars')}
        disabled={locked || !editable}
        onClick={onCars}
      >
        <SwapSummary series={series} round={round} nameOf={nameOf} />
      </CountBadge>

      {availability?.track ? (
        <Badge variant="destructive" className="shrink-0">
          {t('editor.calendar.missingTrack')}
        </Badge>
      ) : null}

      {availability?.pitboxes ? (
        <Badge variant="destructive" className="shrink-0">
          {t('editor.calendar.tooFewPitboxes', {
            available: availability.pitboxes.available,
            needed: availability.pitboxes.needed,
          })}
        </Badge>
      ) : null}

      <span className="hidden w-56 shrink-0 truncate text-xs text-muted-foreground sm:block">
        {trackKey === '' ? t('editor.calendar.noTrack') : trackKey}
      </span>
    </ListRow>
  );
};
