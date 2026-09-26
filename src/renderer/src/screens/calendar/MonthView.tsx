import { ClockArrowUpIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DAY_PANEL_QUERY } from './constants.ts';
import { DayEvents } from './DayEvents.tsx';
import { MonthCell } from './MonthCell.tsx';
import { agendaDays, monthGrid, monthOf } from './utils.ts';
import { DAYS_PER_WEEK } from '../../../../shared/constants';
import type { CalendarEntry } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet.tsx';
import { useMediaQuery } from '@/hooks';
import { useFormat } from '@/i18n';

interface MonthViewProps {
  /**
   * The first day of the month to draw.
   */
  month: string;
  /**
   * The events the filters leave, earliest first.
   */
  events: readonly CalendarEntry[];
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * The day whose events are listed.
   */
  selected: string;
  /**
   * How tall the view is drawn, in pixels - whatever the window leaves below
   * the calendar's pinned header.
   */
  height: number;
  /**
   * Whether a command is in flight, which holds the clock's button.
   */
  busy: boolean;
  /**
   * Called to move the clock to a day.
   * @param date Its ISO date
   */
  onAdvance: (date: string) => void;
  /**
   * Called to list another day's events.
   * @param date Its ISO date
   */
  onSelect: (date: string) => void;
  /**
   * Called to open one round's event page.
   * @param event Which event
   */
  onOpen: (event: CalendarEntry) => void;
}

export const MonthView = ({
  month, events, today, selected, height, busy, onAdvance, onSelect, onOpen,
}: MonthViewProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatWeekday } = useFormat();
  // Beside the grid where there is room for both, in a sheet where there is
  // not - squeezing the grid to make room would fold every busy Sunday.
  const beside = useMediaQuery(DAY_PANEL_QUERY);
  const [sheet, setSheet] = useState(false);

  const days = useMemo(() => monthGrid(month), [month]);
  const byDay = useMemo(
    () => new Map(agendaDays(events).map((day) => [day.date, day.events])),
    [events],
  );
  const listed = byDay.get(selected) ?? [];

  // A day still to come can be jumped to, from beside its list or the sheet.
  const advance = selected > today ? (
    <Button size="sm" variant="outline" disabled={busy} onClick={() => onAdvance(selected)}>
      <ClockArrowUpIcon />
      {t('calendar.advanceHere')}
    </Button>
  ) : null;

  const heading = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <h3 className="font-semibold">{formatDayShort(selected)}</h3>
        <span className="text-xs text-muted-foreground">{t('calendar.onThisDay', { count: listed.length })}</span>
      </div>
      {advance}
    </div>
  );

  return (
    // Exactly the window's height, so the month is one screen with no page
    // scroll - and the day's list scrolls on its own beside it.
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]" style={{ height }}>
      {/* The weekend's two columns wider than the weekdays', since that is
          where nearly every race day falls. */}
      <div
        className="grid grid-cols-[repeat(5,minmax(0,1fr))_repeat(2,minmax(0,1.6fr))] gap-px overflow-hidden rounded-xl border bg-border"
        style={{ gridTemplateRows: `auto repeat(${days.length / DAYS_PER_WEEK}, minmax(0, 1fr))` }}
      >
        {days.slice(0, DAYS_PER_WEEK).map((day) => (
          <span
            key={`dow-${day}`}
            className="bg-card px-2 py-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {formatWeekday(day)}
          </span>
        ))}

        {days.map((day) => (
          <MonthCell
            key={day}
            date={day}
            events={byDay.get(day) ?? []}
            outside={monthOf(day) !== month}
            today={day === today}
            past={day < today}
            selected={day === selected}
            onSelect={() => {
              onSelect(day);
              if (!beside) setSheet(true);
            }}
          />
        ))}
      </div>

      {beside ? (
        <aside className="flex min-h-0 flex-col gap-3">
          {heading}
          {/* Room on every side for a card's hover outline, which the scroller
              would otherwise clip. */}
          <div className="-m-1 -mr-3 min-h-0 flex-1 overflow-y-auto p-1 pr-3 [scrollbar-gutter:stable]">
            <DayEvents events={listed} onOpen={onOpen} />
          </div>
        </aside>
      ) : (
        <Sheet open={sheet} onOpenChange={setSheet}>
          <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
            <SheetHeader className="gap-1 px-5 pt-5 pb-3">
              <SheetTitle>{formatDayShort(selected)}</SheetTitle>
              <SheetDescription>{t('calendar.onThisDay', { count: listed.length })}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-5 pb-5">
              {advance}
              <DayEvents events={listed} onOpen={onOpen} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
