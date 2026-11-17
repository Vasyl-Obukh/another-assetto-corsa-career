import { ChevronRightIcon } from 'lucide-react';

import { SOURCE_FLAGS } from './constants.ts';
import type { Championship, SeriesOrigin, Team } from '../../../../shared/types';
import { NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useKindTranslation } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import {
  disciplineKey, disciplinesOf, OriginBadge, TierMedal, tiersOf,
} from '@/screens/championships';

interface TeamSourceTileProps {
  /**
   * The championship.
   */
  series: Championship;
  /**
   * Whose it is.
   */
  origin: SeriesOrigin;
  /**
   * Every team its seats name, each once.
   */
  teams: readonly Team[];
  /**
   * The teams a search matched, shown in place of the flags, or null when
   * nothing is being searched.
   */
  found: readonly Team[] | null;
  /**
   * Called when the tile is clicked.
   */
  onChoose: () => void;
}

/**
 * One championship in the team picker: its name, its disciplines and a medal
 * per class, its teams' flags and how many teams it fields.
 */
export const TeamSourceTile = ({
  series, origin, teams, found, onChoose,
}: TeamSourceTileProps) => {
  const { t } = useKindTranslation();
  const disciplines = disciplinesOf(series);
  const tiers = tiersOf(series);
  const several = series.entries.length > 1;
  const flags = teams.flatMap((team) => team.nationCode ?? []).slice(0, SOURCE_FLAGS);

  return (
    <button
      type="button"
      onClick={onChoose}
      className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-left hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1 text-sm leading-snug font-semibold">{series.name}</span>
        <OriginBadge origin={origin} />
      </span>
      <span className="flex flex-wrap items-center gap-1">
        {disciplines.map((discipline) => (
          <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
        ))}
        {tiers.map((tier) => <TierMedal key={tier} tier={tier} className="size-5 text-[0.65rem]" />)}
      </span>
      {found !== null && found.length > 0 ? (
        <span className="line-clamp-2 text-xs text-muted-foreground">{found.map((team) => team.name).join(', ')}</span>
      ) : (
        // Keyed by place: two teams of one nation share a flag.
        // eslint-disable-next-line react/no-array-index-key
        <span className="flex h-3.5 gap-1">{flags.map((code, at) => <NationFlag key={at} code={code} />)}</span>
      )}
      <span className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          {several ? `${t('editor.teamSource.classCount', { count: series.entries.length })} · ` : null}
          {t('editor.teamSource.teamCount', { count: teams.length })}
        </span>
        {several ? (
          <span className="ml-auto inline-flex items-center">
            {t('editor.teamSource.classes')}
            <ChevronRightIcon className="size-3.5" />
          </span>
        ) : null}
      </span>
    </button>
  );
};
