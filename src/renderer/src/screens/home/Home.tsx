import { ArrowRightIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { HomeSkeleton } from './HomeSkeleton.tsx';
import { NextWeekend } from './NextWeekend.tsx';
import { NoWeekend } from './NoWeekend.tsx';
import { clashingWith, seasonProgress, upcomingWeekend } from './utils.ts';
import { YourChampionships } from './YourChampionships.tsx';
import { AdvanceDialog, ErrorCard, ScreenBody } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useCareer, useClockMove } from '@/hooks';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
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

  if (!calendar || !career.career) {
    return (
      <ScreenBody className="flex flex-col gap-4 pt-8 pb-8">
        {career.error ? <ErrorCard error={career.error} onDismiss={career.dismissError} /> : null}
        {career.error ? null : <HomeSkeleton />}
      </ScreenBody>
    );
  }

  const next = upcomingWeekend(calendar.events, calendar.date);

  /**
   * Opens the calendar on what the career could enter, wherever its filters
   * were left otherwise.
   */
  const findChampionship = (): void => {
    const held = readCriteria(readPreference(CALENDAR_MEMORY));
    writePreference(CALENDAR_MEMORY, { ...held, status: 'available' });
    void navigate(path.calendar());
  };

  return (
    <ScreenBody className="flex flex-col gap-5 pt-8 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('home.season', { number: calendar.season + 1 })}
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

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {next ? (
          <NextWeekend
            event={next}
            clashes={clashingWith(calendar.events, next)}
            today={calendar.date}
            busy={career.busy}
            onAdvance={() => move.moveTo(next.firstDay)}
          />
        ) : <NoWeekend onFind={findChampionship} />}

        <YourChampionships rows={rows} />
      </div>

      <AdvanceDialog pending={move.pending} busy={career.busy} onConfirm={move.confirm} onClose={move.cancel} />
    </ScreenBody>
  );
};
