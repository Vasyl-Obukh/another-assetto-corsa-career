import {
  FlagIcon, FolderOpenIcon, LogOutIcon, PlayIcon, PlusIcon, SettingsIcon, TrendingUpIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { CAREER_TILE_TRACK, QUICK_TILE_TRACK, START_WIDTH } from './constants.ts';
import { ContinueLine } from './ContinueLine.tsx';
import { ContinueLineSkeleton } from './ContinueLineSkeleton.tsx';
import { StartTile } from './StartTile.tsx';
import type { PathsReport } from '../../../../shared/types';
import { useSlot } from '@/app';
import {
  ErrorCard, Loading, NationFlag, Shimmer, trackPictureSources,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useCareers, useQuickRaces } from '@/hooks';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface StartProps {
  /**
   * The probe main ran before the first render, which says whether the game
   * and Content Manager were found.
   */
  initialReport: PathsReport;
}

/**
 * Where the app always opens: a tile per mode, each carrying on where it was
 * left, and Settings and Exit underneath.
 */
export const Start = ({ initialReport }: StartProps) => {
  const { t } = useTranslation();
  const {
    formatAgo, formatDayShort, formatDay, formatYear,
  } = useFormat();
  const navigate = useNavigate();
  const { enterQuick, quit } = useSlot();
  const careers = useCareers();
  const quick = useQuickRaces();

  const latest = careers.careers?.[0] ?? null;
  const {races} = quick;
  const newest = races && [...races].sort((a, b) => b.race.updatedAt.localeCompare(a.race.updatedAt))[0];
  const busy = careers.busy || quick.busy;
  const found = initialReport.derived !== null;

  const carryOn = async (): Promise<void> => {
    if (latest && await careers.open(latest.id)) void navigate(path.home());
  };

  const openRaces = (): void => {
    enterQuick();
    void navigate(path.race());
  };

  const newRace = async (): Promise<void> => {
    // Made first, so a race that could not be made leaves the start screen up.
    const id = await quick.create();
    if (!id) return;
    enterQuick();
    void navigate(path.raceEvent({ id }));
  };

  let careerLine = null;
  if (careers.careers === null) careerLine = <Loading><ContinueLineSkeleton /></Loading>;
  else if (latest) {
    careerLine = (
      <ContinueLine
        mark={<NationFlag code={latest.driver.nation ?? undefined} className="h-[18px] w-[27px] rounded-[3px]" />}
        title={t('start.career.line', { driver: latest.driver.name, year: formatYear(latest.year) })}
        detail={latest.next
          ? t('start.career.next', {
            day: formatDay(latest.date), round: latest.next.roundName, date: formatDayShort(latest.next.date),
          })
          : t('start.career.nothingNext', { day: formatDay(latest.date) })}
      />
    );
  }

  const quickMark = (
    <span className="grid size-[27px] place-items-center rounded-md bg-mode-quick text-mode-quick-foreground [&_svg]:size-4">
      <FlagIcon />
    </span>
  );
  let quickLine = null;
  if (races === null) quickLine = <Loading><ContinueLineSkeleton /></Loading>;
  else if (newest) {
    quickLine = (
      <ContinueLine
        mark={quickMark}
        title={t('start.quick.count', { count: races.length })}
        detail={t('start.quick.changed', { ago: formatAgo(newest.race.updatedAt) })}
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-gradient-to-br from-primary/10 via-background to-background px-10 py-8">
      {/* Centred at its own height: a taller window adds space around the
          tiles rather than stretching them. */}
      <div className={cn('m-auto flex w-full flex-col gap-6', START_WIDTH)}>
        <h1 className="text-[1.625rem] font-semibold tracking-tight">{t('app.title')}</h1>

        {careers.error ? <ErrorCard error={careers.error} onDismiss={careers.dismissError} /> : null}
        {quick.error ? <ErrorCard error={quick.error} onDismiss={quick.dismissError} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <StartTile
            mode="career"
            icon={TrendingUpIcon}
            title={t('start.career.title')}
            description={t('start.career.description')}
            photo={trackPictureSources(latest?.track ?? CAREER_TILE_TRACK)}
            line={careerLine}
          >
            {careers.careers !== null && careers.careers.length === 0 ? (
              <Button onClick={() => { void navigate(path.careerNew()); }}>
                <PlusIcon />
                {t('start.newCareer')}
              </Button>
            ) : (
              <>
                {/* Waits, disabled, until it knows what it continues. */}
                <Button disabled={!latest || busy} onClick={() => { void carryOn(); }}>
                  <PlayIcon />
                  {t('start.continue')}
                </Button>
                <Button variant="outline" onClick={() => { void navigate(path.careerNew()); }}>
                  <PlusIcon />
                  {t('start.new')}
                </Button>
                <Button
                  variant="outline"
                  disabled={!latest}
                  onClick={() => { void navigate(path.careers(), { state: { pick: latest?.id } }); }}
                >
                  <FolderOpenIcon />
                  {t('start.load')}
                  {careers.careers === null
                    ? <Shimmer className="h-2.5 w-3" />
                    : <span className="text-xs tabular-nums opacity-75">{careers.careers.length}</span>}
                </Button>
              </>
            )}
          </StartTile>

          <StartTile
            mode="quick"
            icon={FlagIcon}
            title={t('start.quick.title')}
            description={t('start.quick.description')}
            photo={trackPictureSources(newest?.race.track ?? QUICK_TILE_TRACK)}
            line={quickLine}
          >
            {races !== null && races.length === 0 ? (
              <Button disabled={busy} onClick={() => { void newRace(); }}>
                <PlusIcon />
                {t('start.newRace')}
              </Button>
            ) : (
              <>
                <Button disabled={races === null} onClick={openRaces}>
                  <FlagIcon />
                  {t('start.openRaces')}
                </Button>
                <Button variant="outline" disabled={busy} onClick={() => { void newRace(); }}>
                  <PlusIcon />
                  {t('start.newRace')}
                </Button>
              </>
            )}
          </StartTile>
        </div>

        <footer className="flex items-center gap-2">
          <Button size="lg" variant="outline" onClick={() => { void navigate(path.settings()); }}>
            <SettingsIcon />
            {t('start.settings')}
          </Button>
          <Button size="lg" variant="outline" onClick={quit}>
            <LogOutIcon />
            {t('start.exit')}
          </Button>
          <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn('size-2 rounded-full', found ? 'bg-success' : 'bg-warning')} />
            {found ? t('start.found') : t('start.missing')}
          </span>
        </footer>
      </div>
    </div>
  );
};
