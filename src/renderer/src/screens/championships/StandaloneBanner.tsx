import {
  ArrowRightIcon, SkipForwardIcon, TriangleAlertIcon, TrophyIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { GLASS_BUTTON } from './constants.ts';
import { LadderChip } from './LadderChip.tsx';
import type { NextRound } from './types.ts';
import type { ChampionshipStanding, SeasonEntry } from '../../../../shared/types';
import { ContentImage, trackPictureSources } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { EDITION_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { isChampion, progressLine } from '@/lib/standalone-wording';
import { cn } from '@/lib/utils.ts';

interface StandaloneBannerProps {
  /**
   * The edition the standalone championship races.
   */
  entry: SeasonEntry;
  /**
   * Where it stands.
   */
  standing: ChampionshipStanding;
  /**
   * The year it is raced in.
   */
  year: number;
  /**
   * The round it races next, or undefined once nothing is left it can race.
   */
  next?: NextRound;
  /**
   * The rounds still to come that the install cannot race before the next -
   * or, with none it can race, every round left.
   */
  stuck: readonly NextRound[];
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Opens a round's page.
   * @param round The round's id
   */
  onOpen: (round: string) => void;
  /**
   * Asks to skip every round up to one, for rounds the install cannot race.
   * @param round The last round to skip, by its id
   */
  onSkip: (round: string) => void;
}

/**
 * What heads a standalone championship's own page in place of Back: the next
 * round's photograph, how far through the season it is, where the player
 * stands, and the way into the next round - or, once it is over, to its
 * review. Rounds the install cannot race are named, and when nothing left can
 * be, it offers to skip them and finish.
 */
export const StandaloneBanner = ({
  entry, standing, year, next, stuck, busy, onOpen, onSkip,
}: StandaloneBannerProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatYear } = useFormat();
  const { championship } = entry;
  const ladder = championship.entries.find((one) => one.id === entry.entry)?.ladder;
  // A round that cannot be raced most likely has no photograph to show, so
  // with nothing ahead it pictures the last round run.
  const run = [...entry.events].reverse().find((one) => one.status !== 'scheduled');
  const shown = next?.round ?? championship.rounds.find((one) => one.id === run?.round) ?? championship.rounds.at(-1);
  const [first] = stuck;
  const last = stuck.at(-1);
  let notice: { title: string; hint: string } | null = null;
  if (first && next) {
    notice = {
      title: t('standalone.stuck.aheadTitle', {
        count: stuck.length, number: first.number, round: first.round.name, next: next.number,
      }),
      hint: t('standalone.stuck.aheadHint', { count: stuck.length, next: next.number }),
    };
  } else if (first) {
    notice = {
      title: t('standalone.stuck.tailTitle', { count: stuck.length, number: first.number, round: first.round.name }),
      hint: t('standalone.stuck.tailHint', { count: stuck.length }),
    };
  }
  const figures = { position: standing.position ?? 0, points: formatNumber(standing.points) };

  let line = t('standalone.heroUnscored');
  if (standing.position !== null) {
    line = standing.over ? t('standalone.heroOver', figures) : t('standalone.heroStanding', figures);
  }

  return (
    <section className="relative min-h-48 overflow-hidden rounded-2xl bg-scrim text-on-scrim">
      {shown ? (
        <ContentImage sources={trackPictureSources(shown.track)} alt="" className="object-cover" fallback={null} />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-scrim/95 via-scrim/70 to-scrim/10" />

      <div className="relative flex max-w-2xl flex-col gap-2 px-6 py-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {ladder ? <LadderChip ladder={ladder} /> : null}
          {/* A year is an identifier rather than one of a set, so it stays
              neutral. */}
          <Badge variant="secondary">{formatYear(year)}</Badge>
          {isChampion(standing) ? (
            <Badge className={cn('gap-1', EDITION_ACCENT.title)}>
              <TrophyIcon className="size-3" />
              {t('standalone.champion')}
            </Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold">{championship.name}</h1>
        <p className="text-sm text-on-scrim/85">
          {t('newChampionship.pair', { first: progressLine(standing, t), second: line })}
        </p>
        {notice ? (
          <p className="flex items-start gap-2.5 rounded-lg border border-warning/50 bg-warning/20 px-3 py-2.5 text-sm backdrop-blur-sm">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              <span className="font-semibold">{notice.title}</span>
              {' '}
              {notice.hint}
            </span>
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap gap-2">
          {next ? (
            <Button size="lg" onClick={() => onOpen(next.round.id)}>
              {t('standalone.heroNext', { number: next.number, round: next.round.name })}
              <ArrowRightIcon />
            </Button>
          ) : null}
          {!next && last ? (
            <Button size="lg" disabled={busy} onClick={() => onSkip(last.round.id)}>
              <SkipForwardIcon />
              {t('standalone.stuck.skip', { count: stuck.length })}
            </Button>
          ) : null}
          {/* The round's own page says what it lacks, and skips it alone. */}
          {first ? (
            <Button size="lg" variant="outline" className={GLASS_BUTTON} onClick={() => onOpen(first.round.id)}>
              {t('standalone.heroNext', { number: first.number, round: first.round.name })}
            </Button>
          ) : null}
          {!next && standing.over ? (
            <Button size="lg" asChild>
              <Link to={path.championshipReview({ series: entry.series, season: 0, edition: entry.edition })}>
                <TrophyIcon />
                {t('standalone.lookBack')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
};
