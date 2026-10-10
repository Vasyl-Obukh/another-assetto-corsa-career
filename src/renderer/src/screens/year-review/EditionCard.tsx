import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { EditionState, ResultCell, Sparkline } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { disciplineDot } from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { path } from '@/lib/routes';
import type { EditionSummary } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';
import { LadderChip } from '@/screens/championships';

interface EditionCardProps {
  /**
   * The edition.
   */
  summary: EditionSummary;
  /**
   * The year its season is.
   */
  year: number;
}

/**
 * One edition of a season, as the year's review lists it: its name, its rung,
 * how it stands, the shape of the player's season in it and where they ended -
 * opening the edition's own review.
 */
export const EditionCard = ({ summary, year }: EditionCardProps) => {
  const { t } = useTranslation();
  const { ladder } = summary;

  return (
    <Link
      to={path.championshipReview({ series: summary.series, season: summary.season, edition: summary.edition })}
      className="grid min-h-26 grid-cols-[0.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
    >
      <span aria-hidden className={cn('self-stretch rounded-full', disciplineDot(ladder))} />
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="truncate text-sm font-semibold">{summary.name}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {/* Neutral on purpose: an edition's name is an identifier, not one of a set. */}
          <Badge variant="secondary">{editionName({ year, edition: summary.edition, editions: summary.editions }, t)}</Badge>
          {ladder ? <LadderChip ladder={ladder} /> : null}
          <EditionState summary={summary} />
        </span>
        <Sparkline positions={summary.path} field={summary.field} running={!summary.over} />
      </span>
      <span className="flex flex-col items-end gap-1">
        {summary.over ? null : <span className="text-xs text-muted-foreground">{t('yearReview.soFar')}</span>}
        {summary.position === null ? (
          <span className="text-lg font-semibold text-muted-foreground">{t('home.noPosition')}</span>
        ) : <ResultCell position={summary.position} scored={summary.points > 0} prefixed size="lg" />}
        <span className="text-xs text-muted-foreground tabular-nums">
          {[t('home.points', { count: summary.points }), t('home.wins', { count: summary.wins })].join(' · ')}
        </span>
      </span>
    </Link>
  );
};
