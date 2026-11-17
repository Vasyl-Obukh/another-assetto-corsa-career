import {
  FlagIcon, FolderOpenIcon, LogOutIcon, PlayIcon, PlusIcon, SettingsIcon, TrendingUpIcon, TrophyIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  CAREER_TILE_TRACK, CHAMPIONSHIP_TILE_TRACK, QUICK_TILE_TRACK, START_SCALE,
} from './constants.ts';
import { ContinueLine } from './ContinueLine.tsx';
import { ContinueLineSkeleton } from './ContinueLineSkeleton.tsx';
import { ModeBlock } from './ModeBlock.tsx';
import { PlayedCaption } from './PlayedCaption.tsx';
import { lastPlayedMode } from './utils.ts';
import type { PathsReport } from '../../../../shared/types';
import { useSlot } from '@/app';
import {
  AppWordmark, ContentImage, ErrorCard, Loading, NationFlag, Shimmer, trackPictureSources, UpdateButton,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useCareers, useQuickRaces, useViewportScale } from '@/hooks';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { progressLine, standaloneName, standingLine } from '@/lib/standalone-wording';
import { continuePath, isReadable } from '@/screens/careers';

interface StartProps {
  /**
   * The probe main ran before the first render, which says whether the game
   * and Content Manager were found.
   */
  initialReport: PathsReport;
}

/**
 * Where the app always opens: a game's main menu - the modes in a panel down
 * the left, each carrying on where it was left, with Settings and Exit at its
 * foot - over the photograph of whatever was played last. Designed at 1080p and
 * scaled with the window, so any screen is the same picture, with more of the
 * photograph on a wider one.
 */
export const Start = ({ initialReport }: StartProps) => {
  const { t } = useTranslation();
  const {
    formatAgo, formatDayShort, formatDay, formatNumber, formatYear,
  } = useFormat();
  const navigate = useNavigate();
  const { enterQuick, quit } = useSlot();
  const careers = useCareers('career');
  const standalones = useCareers('championship');
  const quick = useQuickRaces();
  const scale = useViewportScale(START_SCALE.design, START_SCALE.min, START_SCALE.max);

  // Continue carries on the newest career that can be opened, and the newest
  // standalone championship.
  const latest = careers.careers?.find(isReadable) ?? null;
  const latestStandalone = standalones.careers?.find(isReadable) ?? null;
  const { races } = quick;
  const newest = races && [...races].sort((a, b) => b.race.updatedAt.localeCompare(a.race.updatedAt))[0];
  const busy = careers.busy || standalones.busy || quick.busy;
  const found = initialReport.derived !== null;
  const read = careers.careers !== null && standalones.careers !== null && races !== null;

  const carryOn = async (): Promise<void> => {
    if (latest && await careers.open(latest.id)) void navigate(path.home());
  };

  /**
   * Opens the newest standalone championship where it was left - on its
   * review, once it is over.
   */
  const carryOnStandalone = async (): Promise<void> => {
    if (latestStandalone && await standalones.open(latestStandalone.id)) {
      void navigate(continuePath(latestStandalone));
    }
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

  let standaloneLine = null;
  if (standalones.careers === null) standaloneLine = <Loading><ContinueLineSkeleton /></Loading>;
  else if (latestStandalone?.standing) {
    const { standing } = latestStandalone;
    const placed = standingLine(standing, t, formatNumber);
    standaloneLine = (
      <ContinueLine
        mark={<NationFlag code={latestStandalone.driver.nation ?? undefined} className="h-[18px] w-[27px] rounded-[3px]" />}
        title={standaloneName(latestStandalone, t, formatYear)}
        detail={placed
          ? t('start.championship.line', { progress: progressLine(standing, t), standing: placed })
          : progressLine(standing, t)}
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

  // The photograph is whichever mode was played last, once all three are read:
  // its track, and the caption naming it.
  const lead = read ? lastPlayedMode({
    career: latest?.playedAt,
    championship: latestStandalone?.playedAt,
    quick: newest?.race.updatedAt,
  }) : undefined;

  let track: { id: string; layout?: string } | null = null;
  let played: { kicker: string; title: string; detail: string } | null = null;
  if (lead === null) track = CAREER_TILE_TRACK;
  if (lead === 'career' && latest) {
    track = latest.track ?? CAREER_TILE_TRACK;
    played = {
      kicker: t('start.lastPlayed', { mode: t('start.mode.career'), ago: formatAgo(latest.playedAt) }),
      title: t('start.career.line', { driver: latest.driver.name, year: formatYear(latest.year) }),
      detail: latest.next
        ? t('start.nextRound', { round: latest.next.roundName, date: formatDayShort(latest.next.date) })
        : formatDay(latest.date),
    };
  }
  if (lead === 'championship' && latestStandalone) {
    const { next, standing } = latestStandalone;
    track = latestStandalone.track ?? CHAMPIONSHIP_TILE_TRACK;
    let detail = standing ? progressLine(standing, t) : '';
    if (next) detail = t('start.nextRound', { round: next.roundName, date: formatDayShort(next.date) });
    played = {
      kicker: t('start.lastPlayed', { mode: t('start.mode.championship'), ago: formatAgo(latestStandalone.playedAt) }),
      title: standaloneName(latestStandalone, t, formatYear),
      detail,
    };
  }
  if (lead === 'quick' && newest && races) {
    track = newest.race.track ?? QUICK_TILE_TRACK;
    played = {
      kicker: t('start.lastPlayed', { mode: t('start.mode.quick'), ago: formatAgo(newest.race.updatedAt) }),
      title: newest.title,
      detail: t('start.quick.count', { count: races.length }),
    };
  }

  return (
    // Scaled as a whole rather than laid out afresh, so a 4K window shows the
    // 1080p screen at twice the size rather than a small island in the middle.
    <div className="relative h-full overflow-hidden bg-scrim" style={{ zoom: scale }}>
      {track ? (
        <ContentImage sources={trackPictureSources(track)} alt="" className="object-cover" fallback={null} />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,var(--scrim),transparent_30%)] opacity-60"
      />
      {lead === null ? null : <PlayedCaption played={played} />}

      <div className="relative flex h-full w-150 max-w-[48%] flex-col overflow-y-auto border-r bg-background/94 px-12 pt-12 pb-8 backdrop-blur-md">
        <h1 className="mb-3">
          <AppWordmark className="text-[2.5rem]" />
        </h1>

        {careers.error ? <ErrorCard error={careers.error} onDismiss={careers.dismissError} /> : null}
        {standalones.error ? <ErrorCard error={standalones.error} onDismiss={standalones.dismissError} /> : null}
        {quick.error ? <ErrorCard error={quick.error} onDismiss={quick.dismissError} /> : null}

        <div className="flex flex-col">
          <ModeBlock
            mode="career"
            icon={TrendingUpIcon}
            title={t('start.career.title')}
            description={t('start.career.description')}
            line={careerLine}
          >
            {careers.careers !== null && careers.careers.length === 0 ? (
              <>
                <Button onClick={() => { void navigate(path.careerNew()); }}>
                  <PlusIcon />
                  {t('start.newCareer')}
                </Button>
                {/* Still offered with nothing to load, since the Careers page is
                    where a backup is restored from. */}
                <Button variant="outline" onClick={() => { void navigate(path.careers()); }}>
                  <FolderOpenIcon />
                  {t('start.load')}
                </Button>
              </>
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
                  disabled={careers.careers === null}
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
          </ModeBlock>

          <ModeBlock
            mode="quick"
            icon={FlagIcon}
            title={t('start.quick.title')}
            description={t('start.quick.description')}
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
          </ModeBlock>

          <ModeBlock
            mode="championship"
            icon={TrophyIcon}
            title={t('start.championship.title')}
            description={t('start.championship.description')}
            line={standaloneLine}
          >
            {standalones.careers !== null && standalones.careers.length === 0 ? (
              <>
                <Button onClick={() => { void navigate(path.standaloneNew()); }}>
                  <PlusIcon />
                  {t('start.newChampionship')}
                </Button>
                {/* Offered with nothing to load, as the career's is: the
                    Championships page is where a backup is restored from. */}
                <Button variant="outline" onClick={() => { void navigate(path.standalones()); }}>
                  <FolderOpenIcon />
                  {t('start.load')}
                </Button>
              </>
            ) : (
              <>
                {/* Continue all the same on one that is over, which opens
                    on its review. */}
                <Button disabled={!latestStandalone || busy} onClick={() => { void carryOnStandalone(); }}>
                  <PlayIcon />
                  {t('start.continue')}
                </Button>
                <Button variant="outline" onClick={() => { void navigate(path.standaloneNew()); }}>
                  <PlusIcon />
                  {t('start.new')}
                </Button>
                <Button
                  variant="outline"
                  disabled={standalones.careers === null}
                  onClick={() => { void navigate(path.standalones(), { state: { pick: latestStandalone?.id } }); }}
                >
                  <FolderOpenIcon />
                  {t('start.load')}
                  {standalones.careers === null
                    ? <Shimmer className="h-2.5 w-3" />
                    : <span className="text-xs tabular-nums opacity-75">{standalones.careers.length}</span>}
                </Button>
              </>
            )}
          </ModeBlock>
        </div>

        <footer className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <Button size="lg" variant="outline" onClick={() => { void navigate(path.settings()); }}>
            <SettingsIcon />
            {t('start.settings')}
          </Button>
          <Button size="lg" variant="outline" onClick={quit}>
            <LogOutIcon />
            {t('start.exit')}
          </Button>
          {found ? null : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-warning" />
              {t('start.missing')}
            </span>
          )}
          {/* The header's, since the app opens here and has no header yet. */}
          <span className="ml-auto">
            <UpdateButton large />
          </span>
        </footer>
      </div>
    </div>
  );
};
