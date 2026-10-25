import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { describeRatingLine, sessionPath } from './utils.ts';
import type { Career, RatingLine } from '../../../../shared/types';
import { RatingBadge, RatingChange } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, TierMedal, tierMetalKey } from '@/screens/championships';

interface RatingLogProps {
  /**
   * The lines to list, newest first.
   */
  lines: readonly RatingLine[];
  /**
   * The career, whose seasons say which run each session's round is.
   */
  career: Pick<Career, 'seasons'>;
}

/**
 * A career's rating log, a line per change: when, what kind, what moved it and
 * how, and what the discipline and the global rating came to. A session's row
 * opens its round on that session. Its headings stay put while its rows scroll
 * beneath them.
 */
export const RatingLog = ({ lines, career }: RatingLogProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatDayShort, formatNumber } = format;

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead className="sticky top-0 z-10 bg-card text-xs text-muted-foreground">
        <tr>
          <th className="w-28 border-b px-4 py-2 text-left font-medium">{t('rating.table.date')}</th>
          <th className="w-32 border-b px-2 py-2 text-left font-medium">{t('rating.table.kind')}</th>
          <th className="border-b px-2 py-2 text-left font-medium">{t('rating.table.what')}</th>
          <th className="w-44 border-b px-2 py-2 text-right font-medium">{t('rating.table.discipline')}</th>
          <th className="w-24 border-b px-4 py-2 text-right font-medium">{t('rating.table.global')}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => {
          const { title, detail } = describeRatingLine(line, t, format);
          const session = line.kind === 'race' || line.kind === 'qualifying';
          const level = line.kind === 'promotion' || line.kind === 'drop';
          const to = sessionPath(line, career);

          return (
            // A session's row is one link: its title's covers it whole, so a click
            // anywhere opens the round and the keyboard still meets a single stop.
            <tr
              key={line.key}
              className={cn(
                (line.kind === 'speed' || line.kind === 'opening') && 'bg-muted/50',
                to && 'group relative transition-colors focus-within:bg-accent/50 hover:bg-accent/50',
              )}
            >
              <td className="border-b px-4 py-2 whitespace-nowrap tabular-nums">{formatDayShort(line.date)}</td>
              <td className="border-b px-2 py-2"><RatingBadge line={line} /></td>
              <td className="border-b px-2 py-2">
                {to ? (
                  <Link
                    to={to}
                    className="block font-medium group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {title}
                  </Link>
                ) : <div className="font-medium">{title}</div>}
                <div className="text-xs text-muted-foreground">{detail}</div>
              </td>
              <td className="border-b px-2 py-2 text-right">
                {level && line.tier !== undefined ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <TierMedal tier={line.tier} className="size-5 text-[0.65rem]" />
                    {t('rating.table.tier', { tier: line.tier, metal: t(tierMetalKey(line.tier)) })}
                  </span>
                ) : null}
                {!level && line.discipline ? (
                  <>
                    <span className="inline-flex items-center justify-end gap-1.5">
                      <Badge className={DISCIPLINE_ACCENT[line.discipline]}>{t(disciplineKey(line.discipline))}</Badge>
                      <RatingChange change={line.change} />
                    </span>
                    <div className="text-xs text-muted-foreground tabular-nums">{formatNumber(line.rating ?? 0)}</div>
                  </>
                ) : null}
                {!level && !line.discipline ? <span className="text-muted-foreground">{t('common.dash')}</span> : null}
              </td>
              <td className="border-b px-4 py-2 text-right">
                {session ? (
                  <>
                    <RatingChange change={line.globalChange} />
                    <div className="text-xs text-muted-foreground tabular-nums">{formatNumber(line.global)}</div>
                  </>
                ) : <span className="text-muted-foreground">{t('common.dash')}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
