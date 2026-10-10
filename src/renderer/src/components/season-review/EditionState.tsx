import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { EDITION_ACCENT } from '@/lib/accents';
import type { EditionSummary } from '@/lib/season-review';

interface EditionStateProps {
  /**
   * The edition.
   */
  summary: EditionSummary;
}

/**
 * How an edition stands, in a word: under way, won, or who won it - the one
 * part of an edition's row that is a state rather than a figure.
 */
export const EditionState = ({ summary }: EditionStateProps) => {
  const { t } = useTranslation();

  if (!summary.over) {
    return (
      <Badge className={EDITION_ACCENT.running}>
        {t('yearReview.underWay', { run: summary.run, rounds: summary.rounds })}
      </Badge>
    );
  }
  if (summary.title) {
    return (
      <Badge className={EDITION_ACCENT.title}>
        <TrophyIcon />
        {t('history.champion')}
      </Badge>
    );
  }

  return summary.champion ? (
    <span className="truncate text-xs text-muted-foreground">
      {t('yearReview.wonBy', { name: summary.champion })}
    </span>
  ) : null;
};
