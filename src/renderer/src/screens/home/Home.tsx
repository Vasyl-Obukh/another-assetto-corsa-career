import { ArrowRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { EditionFinished } from './EditionFinished.tsx';
import { HistoricStrip } from './HistoricStrip.tsx';
import { HomeDoors } from './HomeDoors.tsx';
import { HomeSkeleton } from './HomeSkeleton.tsx';
import { NewSeason } from './NewSeason.tsx';
import { NextEvent } from './NextEvent.tsx';
import { NoEvent } from './NoEvent.tsx';
import {
  clashingWith, recentlyFinished, seasonProgress, upcomingEvent,
} from './utils.ts';
import { YearDone } from './YearDone.tsx';
import { YourChampionships } from './YourChampionships.tsx';
import { addDays } from '../../../../shared/utils/calendar-days';
import { seasonYear } from '../../../../shared/utils/editions';
import { championshipEntries } from '../../../../shared/utils/historic';
import { AdvanceDialog, ErrorCard, ScreenBody } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useCareer, useClockMove } from '@/hooks';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { historicReview } from '@/lib/season-review';
import { readPreference, writePreference } from '@/lib/stored-preference';
import { CALENDAR_MEMORY, readCriteria } from '@/screens/calendar';

export const Home = () => {
  const { t } = useTranslation();
  const { formatDay, formatWeekday } = useFormat();
  const navigate = useNavigate();
  const career = useCareer();
  const move = useClockMove(career);
  const { calendar } = career;

  const rows = useMemo(
    () => (career.career && calendar ? seasonProgress(career.career, calendar) : []),
    [career.career, calendar],
  );
  const season = career.career?.seasons.find((one) => one.index === calendar?.season) ?? null;
  const previous = career.career?.seasons.find((one) => one.index === (season?.index ?? 0) - 1) ?? null;
  const finished = useMemo(
    () => (season && calendar ? recentlyFinished(season, calendar.date) : []),
    [season, calendar],
  );
  const historic = useMemo(() => (season ? historicReview(season) : null), [season]);

  if (!calendar || !career.career || !season) {
    return (
      <ScreenBody className="flex flex-col gap-4 pt-8 pb-8">
        {career.error ? <ErrorCard error={career.error} onDismiss={career.dismissError} /> : null}
        {career.error ? null : <HomeSkeleton />}
      </ScreenBody>
    );
  }

  const next = upcomingEvent(calendar.events, calendar.date);
  const year = seasonYear(season);

  /**
   * Opens the calendar on what the career could enter, wherever its filters
   * were left otherwise.
   */
  const findChampionship = (): void => {
    const held = readCriteria(readPreference(CALENDAR_MEMORY));
    writePreference(CALENDAR_MEMORY, { ...held, status: 'available' });
    void navigate(path.calendar());
  };

  /**
   * What stands where the next event would once there is none: the year done,
   * a new year to fill, or nothing entered at all.
   * @returns The card
   */
  const nothingAhead = () => {
    // On championships alone: a season of historic events is never what hides
    // the way into a championship.
    if (championshipEntries(season).length > 0) {
      return (
        <YearDone
          season={season.index}
          year={year}
          opens={addDays(season.endDate, 1)}
          busy={career.busy}
          onFinish={() => move.moveTo(addDays(season.endDate, 1))}
          onFind={findChampionship}
        />
      );
    }
    if (previous && championshipEntries(previous).length > 0) {
      return (
        <NewSeason
          previous={previous}
          year={year}
          events={calendar.events}
          clock={calendar.date}
          onFind={findChampionship}
        />
      );
    }

    return <NoEvent onFind={findChampionship} />;
  };

  return (
    <ScreenBody className="flex flex-col gap-5 pt-8 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('home.season', { year })}
          </span>
          <h1 className="text-2xl font-semibold first-letter:uppercase">
            {t('home.today', { weekday: formatWeekday(calendar.date), day: formatDay(calendar.date) })}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link to={path.calendar()}>
            {t('home.openCalendar')}
            <ArrowRightIcon />
          </Link>
        </Button>
      </header>

      {career.error ? <ErrorCard error={career.error} onDismiss={career.dismissError} /> : null}

      {finished.map((one) => (
        <EditionFinished key={`${one.series}-${one.edition}-${one.entry}`} summary={one} year={year} />
      ))}

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {next ? (
          <NextEvent
            event={next}
            clashes={clashingWith(calendar.events, next)}
            today={calendar.date}
            busy={career.busy}
            onAdvance={() => move.moveTo(next.date)}
            seat={next.historic ? historic?.rows.find((row) => row.series === next.series) ?? null : null}
            onDecline={() => { void career.withdraw(next.series, next.entry); }}
          />
        ) : nothingAhead()}

        <YourChampionships rows={rows} />
      </div>

      {historic && historic.rows.length > 0 ? (
        <HistoricStrip review={historic} season={season.index} year={year} clock={calendar.date} />
      ) : null}

      <HomeDoors career={career.career} />

      <AdvanceDialog pending={move.pending} busy={career.busy} onConfirm={move.confirm} onClose={move.cancel} />
    </ScreenBody>
  );
};
