import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { CalendarAgenda } from './CalendarAgenda.tsx';
import { CalendarFilters } from './CalendarFilters.tsx';
import { CALENDAR_MEMORY, DEFAULT_CRITERIA, TODAY_MARGIN } from './constants.ts';
import { ToToday } from './ToToday.tsx';
import type { CalendarCriteria } from './types.ts';
import { commitments, offeredDisciplines, shownEvents } from './utils.ts';
import type { Discipline } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ErrorCard, ScreenBody } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCareer, useChampionships, useElementHeight } from '@/hooks';
import { useFormat } from '@/i18n';
import { readBrowserMemory, rememberBrowser } from '@/lib/browser-memory';
import { path } from '@/lib/routes';
import { isListed } from '@/screens/championships';

export const Calendar = () => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const navigate = useNavigate();
  const career = useCareer();
  const championships = useChampionships();
  const { settings } = useSettings();

  const [criteria, setCriteria] = useState<CalendarCriteria>(
    () => readBrowserMemory<CalendarCriteria>(CALENDAR_MEMORY).criteria ?? DEFAULT_CRITERIA,
  );
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [head, setHead] = useState<HTMLDivElement | null>(null);
  const [marker, setMarker] = useState<HTMLDivElement | null>(null);
  const headHeight = useElementHeight(head);
  // Which day the view was last put on, so it lands on today once on arrival
  // and then follows the clock when it moves, but never fights the player's
  // own scrolling in between.
  const landedOn = useRef<string | null>(null);
  const today = career.calendar?.date ?? null;

  /**
   * Scrolls today to just below the pinned header.
   * @param behavior Instant on arrival, smooth when asked for
   */
  const toToday = useCallback((behavior: ScrollBehavior): void => {
    if (!scroller || !marker) return;

    const offset = marker.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollBy({ top: offset - headHeight - TODAY_MARGIN, behavior });
  }, [scroller, marker, headHeight]);

  useEffect(() => {
    // Waits for the header's first measurement as well as for the elements:
    // landing before it would put today underneath it, and once landed the
    // view is not moved again until the clock does.
    if (!scroller || !marker || headHeight === 0 || today === null) return;
    if (landedOn.current === today) return;

    toToday(landedOn.current === null ? 'instant' : 'smooth');
    landedOn.current = today;
  }, [scroller, marker, headHeight, today, toToday]);

  const all = useMemo(() => career.calendar?.events ?? [], [career.calendar]);
  const listed = useMemo(() => new Set(championships.listings
    .filter((listing) => isListed(listing, settings))
    .map((listing) => listing.series.id)), [championships.listings, settings]);
  const events = useMemo(
    () => shownEvents(all, listed, criteria),
    [all, listed, criteria],
  );
  const offered = useMemo(() => offeredDisciplines(all), [all]);
  const totals = useMemo(() => commitments(all), [all]);

  /**
   * Records a change to the filters and remembers it for the next visit.
   * @param next What the calendar is now filtered to
   */
  const narrow = (next: CalendarCriteria): void => {
    setCriteria(next);
    rememberBrowser<CalendarCriteria>(CALENDAR_MEMORY, { criteria: next });
  };

  const error = career.error ?? championships.error;

  // There is no empty state and no form: reading the calendar starts the
  // career, so the only thing to wait for is the first read.
  if (!career.calendar) {
    return (
      <ScreenBody className="flex flex-col gap-4 pt-8 pb-8">
        {error ? <ErrorCard error={error} onDismiss={career.dismissError} /> : null}
        {error ? null : <Skeleton className="h-64 w-full" />}
      </ScreenBody>
    );
  }

  const clock = career.calendar.date;
  // The next weekend you are in, or failing that the next one at all - so the
  // button always moves the clock somewhere worth looking at.
  const nextEnrolled = all.find((event) => event.enrolled && event.firstDay > clock)?.firstDay;
  const nextEvent = nextEnrolled ?? all.find((event) => event.firstDay > clock)?.firstDay ?? null;

  return (
    <ScreenBody className="flex flex-col gap-5 pb-8" scrollRef={setScroller}>
      {/* Pinned, as the reference calendar pins it: the view opens on today,
          which is usually well down the page, and the clock, Next event and the
          filters have to stay in reach from there. */}
      <div
        ref={setHead}
        className="sticky top-0 z-20 flex flex-col gap-4 border-b bg-background/95 pt-8 pb-4 backdrop-blur"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{t('calendar.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('calendar.subtitle')}</p>
            <p className="text-xs text-muted-foreground">
              {t('calendar.commitments', { enrolled: totals.enrolled, clashes: totals.clashes })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* The career's clock, which every other date on this screen is
                relative to - so it is stated rather than left to be inferred
                from which row is highlighted. */}
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                {t('calendar.today')}
              </span>
              <span className="font-medium">{formatDay(clock)}</span>
            </Badge>

            {nextEvent ? (
              <Button
                size="sm"
                disabled={career.busy}
                title={t('calendar.advanceHint')}
                onClick={() => { void career.advanceTo(nextEvent); }}
              >
                {t('calendar.nextEvent')}
              </Button>
            ) : null}
          </div>
        </header>

        {error ? (
          <ErrorCard
            error={error}
            onDismiss={() => { career.dismissError(); championships.dismissError(); }}
          />
        ) : null}

        <CalendarFilters
          status={criteria.status}
          disciplines={criteria.disciplines}
          offered={offered}
          onStatus={(status) => narrow({ ...criteria, status })}
          onDiscipline={(discipline: Discipline) => narrow({
            ...criteria,
            disciplines: criteria.disciplines.includes(discipline)
              ? criteria.disciplines.filter((one) => one !== discipline)
              : [...criteria.disciplines, discipline],
          })}
        />
      </div>

      <div style={{ '--calendar-head': `${headHeight}px` } as CSSProperties}>
        <CalendarAgenda
          events={events}
          today={clock}
          onOpen={(event) => { void navigate(path.event({ series: event.series, round: event.round })); }}
          todayRef={setMarker}
        />
      </div>

      <ToToday
        scroller={scroller}
        marker={marker}
        topInset={headHeight}
        onJump={() => toToday('smooth')}
      />

    </ScreenBody>
  );
};
