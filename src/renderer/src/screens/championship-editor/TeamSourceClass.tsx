import { teamNameKey } from './utils.ts';
import type { Championship, ClassEntry } from '../../../../shared/types';
import { BudgetBadge, NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useKindTranslation } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, teamGroups, TierMedal } from '@/screens/championships';

interface TeamSourceClassProps {
  /**
   * The championship the class is in.
   */
  series: Championship;
  /**
   * The class.
   */
  entry: ClassEntry;
  /**
   * The teams the championship being edited has, by teamNameKey, to mark the
   * ones it would reuse.
   */
  ownNames: ReadonlySet<string>;
  /**
   * Called when the card is clicked.
   */
  onPick: () => void;
}

/**
 * One class in the team picker: its rung, name and discipline, and every team
 * it fields with its flag, its seats past one and its budget. A class with no
 * teams is shown, greyed, so a championship's shape still reads right.
 */
export const TeamSourceClass = ({
  series, entry, ownNames, onPick,
}: TeamSourceClassProps) => {
  const { t } = useKindTranslation();
  const teams = teamGroups(entry.seats, series.teams ?? [])
    .flatMap(({ team, seats }) => (team ? [{ team, seats: seats.length }] : []));
  const empty = teams.length === 0;

  return (
    <button
      type="button"
      disabled={empty}
      onClick={onPick}
      className={cn(
        'flex flex-col rounded-lg border bg-card text-left',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        empty ? 'opacity-55' : 'hover:bg-accent/50',
      )}
    >
      <span className="flex items-center gap-2.5 px-3 py-2.5">
        <TierMedal tier={entry.ladder.tier} className="size-7 text-xs" />
        <span className="min-w-0 truncate font-semibold">{entry.name}</span>
        <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
          {t(disciplineKey(entry.ladder.discipline))}
        </Badge>
        {empty ? null : (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
            {[
              t('editor.teamSource.teamCount', { count: teams.length }),
              t('editor.entries.seatCount', { count: entry.seats.length }),
            ].join(' · ')}
          </span>
        )}
      </span>
      {empty ? (
        <span className="px-3 pb-3 text-sm text-muted-foreground">{t('editor.entries.teamsFromNothing')}</span>
      ) : (
        <span className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-x-4 gap-y-1 px-3 pb-3">
          {teams.map(({ team, seats }) => (
            <span key={team.id} className="flex h-6 min-w-0 items-center gap-2 text-sm">
              <NationFlag code={team.nationCode} />
              <span className="min-w-0 truncate">{team.name}</span>
              {seats > 1 ? (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {t('editor.teamSource.seats', { count: seats })}
                </span>
              ) : null}
              {ownNames.has(teamNameKey(team.name))
                ? <span className="shrink-0 text-xs text-muted-foreground italic">{t('editor.teamSource.here')}</span>
                : null}
              {team.budget ? <BudgetBadge budget={team.budget} className="ml-auto" /> : null}
            </span>
          ))}
        </span>
      )}
    </button>
  );
};
