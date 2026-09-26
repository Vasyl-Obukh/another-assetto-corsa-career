import { useTranslation } from 'react-i18next';

import type { ClassEntry, EntryAvailability } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { cn } from '@/lib/utils.ts';
import { TierMedal } from '@/screens/championships';

interface ClassListItemProps {
  /**
   * The class entry it stands for.
   */
  entry: ClassEntry;
  /**
   * What it can field on this install, or undefined before the draft has been
   * checked.
   */
  availability: EntryAvailability | undefined;
  /**
   * Whether it is the class open beside the list.
   */
  selected: boolean;
  /**
   * Whether another class may not be opened just now, which it may not while
   * a row's form is open.
   */
  disabled: boolean;
  /**
   * Called to open it.
   */
  onSelect: () => void;
}

/**
 * One class in the list down the side of the classes tab: its rung, its name,
 * and how big a grid of what.
 */
export const ClassListItem = ({
  entry, availability, selected, disabled, onSelect,
}: ClassListItemProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const cars = entry.eligibility.kind === 'spec'
    ? carSpecName(entry.eligibility.spec, catalogue)
    : t('editor.entries.carCount', { count: entry.eligibility.cars.length });

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled && !selected}
      className={cn(
        'flex min-w-56 shrink-0 items-center gap-3 rounded-lg border bg-card p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-0 lg:shrink',
        selected ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
      )}
      onClick={onSelect}
    >
      <TierMedal tier={entry.ladder.tier} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-semibold">{entry.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {t('editor.entries.listLine', { count: entry.seats.length, cars })}
        </span>
      </span>
      {/* Only when it cannot be raced here: the panel says how many are installed. */}
      {availability && !availability.enough ? (
        <span role="img" aria-label={t('editor.tabs.problem')} className="size-2 shrink-0 rounded-full bg-destructive" />
      ) : null}
    </button>
  );
};
