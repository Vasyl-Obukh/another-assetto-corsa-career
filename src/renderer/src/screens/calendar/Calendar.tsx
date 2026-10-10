import { CalendarDaysIcon, ListIcon } from 'lucide-react';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AgendaSkeleton } from './AgendaSkeleton.tsx';
import { CalendarAgenda } from './CalendarAgenda.tsx';
import { CalendarFilters } from './CalendarFilters.tsx';
import { CalendarHead } from './CalendarHead.tsx';
import { CalendarHeadSkeleton } from './CalendarHeadSkeleton.tsx';
import {
  CALENDAR_MEMORY, CALENDAR_VIEW_MEMORY, CALENDAR_VIEWS, MONTH_VIEW_INSET,
  MONTH_VIEW_MIN_HEIGHT, TODAY_MARGIN,
} from './constants.ts';
import { MonthStrip } from './MonthStrip.tsx';
import { MonthStripSkeleton } from './MonthStripSkeleton.tsx';
import { MonthView } from './MonthView.tsx';
import { MonthViewSkeleton } from './MonthViewSkeleton.tsx';
import { ToToday } from './ToToday.tsx';
import type { CalendarCriteria, CalendarView } from './types.ts';
import {
  defaultDay, monthOf, nextEvent, offeredDisciplines, readCriteria, readView, seasonMonths, shownEvents,
  statusCounts,
} from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { CalendarEntry, Discipline } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  AdvanceDialog, ErrorCard, ScreenBody, Segments, toggledIn,
} from '@/components';
import {
  useCareer, useChampionships, useClockMove, useElementHeight,
} from '@/hooks';
import { path } from '@/lib/routes';
import { readPreference, writePreference } from '@/lib/stored-preference';
import { isListed } from '@/screens/championships';

export const Calendar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const career = useCareer();
  const move = useClockMove(career);
  const championships = useChampionships();
  const { settings } = useSettings();

  const [criteria, setCriteria] = useState<CalendarCriteria>(
    () => readCriteria(readPreference(CALENDAR_MEMORY)),
  );
  const [view, setView] = useState<CalendarView>(
    () => readView(readPreference(CALENDAR_VIEW_MEMORY)),
  );
  // Null until something picks one, which reads as wherever the clock stands.
  const [picked, setPicked] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [head, setHead] = useState<HTMLDivElement | null>(null);
  const [marker, setMarker] = useState<HTMLDivElement | null>(null);
  const headHeight = useElementHeight(head);
  const scrollerHeight = useElementHeight(scroller);
  // Which day the view was last put on, so it lands on today once on arrival
  // and then follows the clock when it moves, but never fights the player's
  // own scrolling in between.
  const landedOn = useRef<string | null>(null);
  // Set while the page scrolls itself to a month or to today, so the title
  // stays on where it is going rather than following every month it passes -
  // which first snapped the strip back to the month it was leaving.
  const steering = useRef(false);
  const today = career.calendar?.date ?? null;

  /**
   * Scrolls an element of the timeline to just below the pinned header.
   * @param element What to bring up
   * @param behavior Instant on arrival, smooth when asked for
   */
  const scrollUnderHead = useCallback((element: Element, behavior: ScrollBehavior): void => {
    if (!scroller) return;

    const offset = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const by = offset - headHeight - TODAY_MARGIN;
    // A scroll that goes nowhere never ends, so it is not one to wait out.
    steering.current = behavior === 'smooth' && Math.abs(by) >= 1;
    scroller.scrollBy({ top: by, behavior });
  }, [scroller, headHeight]);

  /**
   * Scrolls the timeline's today marker to just below the pinned header.
   * @param behavior Instant on arrival, smooth when asked for
   */
  const toToday = useCallback((behavior: ScrollBehavior): void => {
    if (marker) scrollUnderHead(marker, behavior);
  }, [marker, scrollUnderHead]);

  useEffect(() => {
    // Waits for the header's first measurement as well as for the elements:
    // landing before it would put today underneath it, and once landed the
    // view is not moved again until the clock does.
    if (view !== 'days' || !scroller || !marker || headHeight === 0 || today === null) return;
    if (landedOn.current === today) return;

    toToday(landedOn.current === null ? 'instant' : 'smooth');
    landedOn.current = today;
  }, [view, scroller, marker, headHeight, today, toToday]);

  // The timeline's title follows the scroll: whichever month's heading has
  // passed under the pinned header is the month being read.
  useEffect(() => {
    if (view !== 'days' || !scroller) return undefined;

    const follow = (): void => {
      if (steering.current) return;
      const line = scroller.getBoundingClientRect().top + headHeight + TODAY_MARGIN + 1;
      const passed = [...scroller.querySelectorAll<HTMLElement>('[data-month]')]
        .filter((heading) => heading.getBoundingClientRect().top <= line)
        .at(-1);
      if (passed?.dataset.month) setPicked(passed.dataset.month);
    };

    // The page's own scroll hands back once it lands, or as soon as the player
    // takes the wheel themselves.
    const land = (): void => {
      if (!steering.current) return;
      steering.current = false;
      follow();
    };
    // Only a press on the scroller itself is its scrollbar being grabbed; a
    // press on a month or a card is another click to go somewhere.
    const grab = (event: PointerEvent): void => {
      if (event.target === scroller) land();
    };

    scroller.addEventListener('scroll', follow, { passive: true });
    scroller.addEventListener('scrollend', land);
    scroller.addEventListener('wheel', land, { passive: true });
    scroller.addEventListener('pointerdown', grab);

    return () => {
      scroller.removeEventListener('scroll', follow);
      scroller.removeEventListener('scrollend', land);
      scroller.removeEventListener('wheel', land);
      scroller.removeEventListener('pointerdown', grab);
    };
  }, [view, scroller, headHeight]);

  const all = useMemo(() => career.calendar?.events ?? [], [career.calendar]);
  const listed = useMemo(() => new Set(championships.listings
    .filter((listing) => isListed(listing, settings))
    .map((listing) => listing.series.id)), [championships.listings, settings]);
  // Counted over what the switches leave, before the status narrows it.
  const pool = useMemo(
    () => shownEvents(all, listed, { ...criteria, status: 'all' }),
    [all, listed, criteria],
  );
  const events = useMemo(
    () => shownEvents(all, listed, criteria),
    [all, listed, criteria],
  );
  const counts = useMemo(() => statusCounts(pool, criteria), [pool, criteria]);
  // Every discipline while the calendar is read, so the filter is there to use
  // before the season says which of them it holds.
  const offered = useMemo(() => (career.calendar ? offeredDisciplines(all) : DISCIPLINES), [career.calendar, all]);
  const months = useMemo(
    () => (career.calendar ? seasonMonths(career.calendar.from, career.calendar.to, events) : []),
    [career.calendar, events],
  );

  /**
   * Records a change to the filters and saves it, so the calendar opens on it
   * again - after a restart too.
   * @param next What the calendar is now filtered to
   */
  const narrow = (next: CalendarCriteria): void => {
    setCriteria(next);
    writePreference(CALENDAR_MEMORY, next);
  };

  const error = career.error ?? championships.error;
  const month = picked ?? (today === null ? '' : monthOf(today));
  const at = months.findIndex((one) => one.start === month);
  const next = today === null ? null : nextEvent(all, today);
  const monthHeight = Math.max(MONTH_VIEW_MIN_HEIGHT, scrollerHeight - headHeight - MONTH_VIEW_INSET);

  /**
   * Goes to a month: the grid shows it, and the timeline scrolls to its first
   * race day still listed - or the first after it, where the filters left that
   * month empty.
   * @param target The first day of the month
   */
  const goTo = (target: string): void => {
    setPicked(target);
    setDay(null);
    if (view !== 'days' || !scroller) return;

    const heading = [...scroller.querySelectorAll<HTMLElement>('[data-month]')]
      .find((one) => (one.dataset.month ?? '') >= target);
    if (heading) scrollUnderHead(heading, 'smooth');
  };

  /**
   * Opens one round's event page.
   * @param event Which event
   */
  const open = (event: CalendarEntry): void => {
    void navigate(path.event({ series: event.series, round: event.round }));
  };

  return (
    <ScreenBody wide className="flex flex-col gap-4 pb-8" scrollRef={setScroller}>
      {/* Pinned: the view opens on today, which is usually well down the page,
          and the clock, the months and the filters have to stay in reach from
          there. */}
      <div
        ref={setHead}
        className="sticky top-0 z-20 flex flex-col gap-4 border-b bg-background/95 pt-8 pb-4 backdrop-blur"
      >
        {today === null ? <CalendarHeadSkeleton /> : (
          <CalendarHead
            month={month}
            canBack={at > 0}
            canForward={at >= 0 && at < months.length - 1}
            today={today}
            next={next}
            busy={career.busy}
            onStep={(by) => { const target = months[at + by]; if (target) goTo(target.start); }}
            onToday={() => {
              setPicked(null);
              setDay(null);
              if (view === 'days') toToday('smooth');
            }}
            onAdvance={() => { if (next) move.moveTo(next.date); }}
          />
        )}

        {today === null ? <MonthStripSkeleton /> : (
          <MonthStrip months={months} current={month} today={monthOf(today)} onPick={goTo} />
        )}

        {error ? (
          <ErrorCard
            error={error}
            onDismiss={() => { career.dismissError(); championships.dismissError(); }}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CalendarFilters
            status={criteria.status}
            counts={today === null ? null : counts}
            disciplines={criteria.disciplines}
            offered={offered}
            onStatus={(status) => narrow({ ...criteria, status })}
            onDiscipline={(discipline: Discipline) => narrow({
              ...criteria,
              disciplines: toggledIn(criteria.disciplines, discipline),
            })}
          />

          <Segments
            label={t('calendar.view.label')}
            items={CALENDAR_VIEWS.map((one) => ({
              id: one,
              label: t(`calendar.view.${one}`),
              icon: one === 'days' ? <ListIcon /> : <CalendarDaysIcon />,
            }))}
            value={view}
            onChange={(chosen) => {
              setView(chosen);
              writePreference(CALENDAR_VIEW_MEMORY, chosen);
              // Coming back to the timeline lands on today again, as arriving
              // does; the grid is one screen tall and starts at its top.
              landedOn.current = null;
              if (chosen === 'month') scroller?.scrollTo({ top: 0 });
            }}
          />
        </div>
      </div>

      <div style={{ '--calendar-head': `${headHeight}px` } as CSSProperties}>
        {today === null && !error && view === 'days' ? <AgendaSkeleton /> : null}
        {today === null && !error && view === 'month' ? <MonthViewSkeleton height={monthHeight} /> : null}
        {today !== null && view === 'days' ? (
          <CalendarAgenda
            events={events}
            today={today}
            busy={career.busy}
            onOpen={open}
            onAdvance={move.moveTo}
            todayRef={setMarker}
          />
        ) : null}
        {today !== null && view === 'month' ? (
          <MonthView
            month={month}
            events={events}
            today={today}
            selected={day ?? defaultDay(events, month, today)}
            height={monthHeight}
            busy={career.busy}
            onSelect={setDay}
            onOpen={open}
            onAdvance={move.moveTo}
          />
        ) : null}
      </div>

      <AdvanceDialog
        pending={move.pending}
        busy={career.busy}
        onConfirm={move.confirm}
        onClose={move.cancel}
      />

      {view === 'days' ? (
        <ToToday
          scroller={scroller}
          marker={marker}
          topInset={headHeight}
          onJump={() => toToday('smooth')}
        />
      ) : null}
    </ScreenBody>
  );
};
