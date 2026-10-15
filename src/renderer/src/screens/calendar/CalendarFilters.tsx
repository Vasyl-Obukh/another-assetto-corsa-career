import { useTranslation } from 'react-i18next';

import { CALENDAR_EVENT_KINDS, CALENDAR_STATUSES } from './constants.ts';
import type { CalendarEventKind, CalendarStatus } from './types.ts';
import type { Discipline } from '../../../../shared/types';
import { Segments } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { DISCIPLINE_DOT, HISTORIC_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey } from '@/screens/championships';

interface CalendarFiltersProps {
  /**
   * Which status filter is on.
   */
  status: CalendarStatus;
  /**
   * How many events each status would leave, or null while the calendar is
   * still being read.
   */
  counts: Readonly<Record<CalendarStatus, number>> | null;
  /**
   * The disciplines being shown, or empty for all of them.
   */
  disciplines: readonly Discipline[];
  /**
   * Every discipline the season's calendar actually holds, in ladder order.
   */
  offered: readonly Discipline[];
  /**
   * Called with the status that was chosen.
   * @param next The new status
   */
  onStatus: (next: CalendarStatus) => void;
  /**
   * Called with the discipline that was toggled.
   * @param discipline Which one
   */
  onDiscipline: (discipline: Discipline) => void;
  /**
   * The kinds of event being shown, or empty for both.
   */
  kinds: readonly CalendarEventKind[];
  /**
   * Called with the kind of event that was toggled.
   * @param kind Which one
   */
  onKind: (kind: CalendarEventKind) => void;
}

/**
 * The dot each kind of event wears on its filter button. A championship's is
 * neutral on purpose: a round carries no marker of its own on the calendar,
 * so the only colour worth a legend is the historic chip's leather.
 */
const KIND_DOT: Record<CalendarEventKind, string> = {
  championship: 'bg-muted-foreground',
  historic: HISTORIC_DOT,
};

export const CalendarFilters = ({
  status, counts, disciplines, offered, onStatus, onDiscipline, kinds, onKind,
}: CalendarFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('calendar.filters.status')}
        </span>
        <Segments
          label={t('calendar.filters.status')}
          items={CALENDAR_STATUSES.map((one) => ({
            id: one,
            label: t(`calendar.filters.${one}`),
            count: counts === null ? null : counts[one],
          }))}
          value={status}
          onChange={onStatus}
        />
      </div>

      {offered.length > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('calendar.filters.discipline')}
          </span>
          {offered.map((discipline) => {
            // Empty means every one, so nothing reads as selected until narrowed.
            const on = disciplines.includes(discipline);

            return (
              <Button
                key={discipline}
                size="sm"
                variant="outline"
                aria-pressed={on}
                className={cn('h-8 gap-1.5 px-2.5 text-xs', on ? 'border-foreground/50 ring-1 ring-foreground/50' : '')}
                onClick={() => onDiscipline(discipline)}
              >
                {/* The colour the cards' edges wear, so the filter doubles as a legend. */}
                <span className={cn('size-2 rounded-full', DISCIPLINE_DOT[discipline], on ? '' : 'opacity-50')} />
                {t(disciplineKey(discipline))}
              </Button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('calendar.filters.events')}
        </span>
        {CALENDAR_EVENT_KINDS.map((kind) => {
          // Empty means both, as with the disciplines beside it.
          const on = kinds.includes(kind);

          return (
            <Button
              key={kind}
              size="sm"
              variant="outline"
              aria-pressed={on}
              className={cn('h-8 gap-1.5 px-2.5 text-xs', on ? 'border-foreground/50 ring-1 ring-foreground/50' : '')}
              onClick={() => onKind(kind)}
            >
              <span className={cn('size-2 rounded-full', KIND_DOT[kind], on ? '' : 'opacity-50')} />
              {t(`calendar.filters.kind.${kind}`)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
