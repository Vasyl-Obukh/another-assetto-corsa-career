import { ArrowRightIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { editionName } from '@/lib/edition-names';
import { path } from '@/lib/routes';
import type { EditionSummary } from '@/lib/season-review';

interface EditionFinishedProps {
  /**
   * The edition that finished.
   */
  summary: EditionSummary;
  /**
   * The year its season is.
   */
  year: number;
}

/**
 * Word that one of the career's championships is over, and the way into its
 * review - in the podium's gold, since a season's end is the one moment of it
 * worth a fanfare.
 */
export const EditionFinished = ({ summary, year }: EditionFinishedProps) => {
  const { t } = useTranslation();
  const series = summary.editions > 1
    ? `${summary.name} ${editionName({ year, edition: summary.edition, editions: summary.editions }, t)}`
    : summary.name;
  let title = t('home.finished.titleNone', { series });
  if (summary.title) title = t('home.finished.titleChampion', { series });
  else if (summary.position !== null) title = t('home.finished.title', { series, position: summary.position });

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-podium-gold-foreground/25 bg-podium-gold/60 px-4 py-3 shadow-sm">
      <TrophyIcon className="size-5 text-podium-gold-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{title}</span>
        {summary.champion && !summary.title ? (
          <span className="text-sm text-muted-foreground">
            {t('home.finished.detail', {
              points: t('home.points', { count: summary.points }),
              wins: t('home.wins', { count: summary.wins }),
              champion: summary.champion,
            })}
          </span>
        ) : null}
      </div>
      <Button asChild>
        <Link
          to={path.championshipReview({ series: summary.series, season: summary.season, edition: summary.edition })}
        >
          {t('home.finished.open')}
          <ArrowRightIcon />
        </Link>
      </Button>
    </section>
  );
};
