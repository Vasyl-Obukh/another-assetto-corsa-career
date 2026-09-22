import { useTranslation } from 'react-i18next';

import { CALENDAR_STATUSES } from './constants.ts';
import type { CalendarStatus } from './types.ts';
import type { Discipline } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey } from '@/screens/championships';

interface CalendarFiltersProps {
  /**
   * Which status filter is on.
   */
  status: CalendarStatus;
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
}

export const CalendarFilters = ({
  status, disciplines, offered, onStatus, onDiscipline,
}: CalendarFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
          {t('calendar.filters.status')}
        </span>
        <div className="flex gap-1">
          {CALENDAR_STATUSES.map((one) => (
            <Button
              key={one}
              size="sm"
              variant={one === status ? 'default' : 'outline'}
              className="h-7 px-2.5 text-xs"
              onClick={() => onStatus(one)}
            >
              {t(`calendar.filters.${one}`)}
            </Button>
          ))}
        </div>
      </div>

      {offered.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            {t('calendar.filters.discipline')}
          </span>
          <div className="flex flex-wrap gap-1">
            {offered.map((discipline) => {
              // Empty means every one, so nothing reads as selected until the
              // player narrows it - which is what the button state shows.
              const on = disciplines.includes(discipline);

              return (
                <Button
                  key={discipline}
                  size="sm"
                  variant="outline"
                  className={cn('h-7 gap-1.5 px-2.5 text-xs', on ? 'border-foreground/40' : '')}
                  onClick={() => onDiscipline(discipline)}
                >
                  {/* The dot carries the discipline's own colour, which is the
                      same one the cards wear - so the filter reads as a legend
                      as well as a control. */}
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      DISCIPLINE_ACCENT[discipline],
                      on ? '' : 'opacity-40',
                    )}
                  />
                  {t(disciplineKey(discipline))}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
