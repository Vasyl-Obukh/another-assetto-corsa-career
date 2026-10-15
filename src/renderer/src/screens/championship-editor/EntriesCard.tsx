import { PlusIcon } from 'lucide-react';
import { useState } from 'react';


import { ClassDialog } from './ClassDialog.tsx';
import { ClassListItem } from './ClassListItem.tsx';
import { ClassPanel } from './ClassPanel.tsx';
import { ROW_SCOPE } from './constants.ts';
import type { ClassSection, SetAside } from './types.ts';
import {
  nextEntry, withEntry, withEntryEligibility, withoutEntry,
} from './utils.ts';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';
import { useClasses } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import type { RowEditState } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { moveAt } from '@/screens/race';

interface EntriesCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * The draft checked against what is installed, or null before the first
   * answer comes back.
   */
  checked: SeriesAvailability | null;
  /**
   * Which class is open, or null for the first.
   */
  picked: string | null;
  /**
   * Which part of the open class is shown.
   */
  section: ClassSection;
  /**
   * Called to open another class.
   * @param id The class entry's id
   */
  onPick: (id: string) => void;
  /**
   * Called to show another part of the open class.
   * @param next The part
   */
  onSection: (next: ClassSection) => void;
  /**
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the whole championship whenever a class entry changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

/**
 * The classes as a list down the side and the one picked opened beside it,
 * since a class holds far too much - its cars, a grid of seats, its field and
 * its purse - for every one of them to be open on one page.
 */
export const EntriesCard = ({
  series, checked, picked, section, onPick, onSection, rows, locked, nameOf, onChange,
}: EntriesCardProps) => {
  const { t } = useKindTranslation();
  const { catalogue } = useClasses();
  // What eligibility changes took off each class, so changing back restores it.
  const [aside, setAside] = useState<SetAside>({});
  const editing = series.entries.find((entry) => rows.editing(ROW_SCOPE.ENTRIES, entry.id));
  // The first class until another is picked, and again once the picked one goes.
  const index = Math.max(0, series.entries.findIndex((entry) => entry.id === picked));
  const entry = series.entries[index];

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-44 lg:flex-col lg:overflow-visible lg:pb-0">
        {series.entries.map((one) => (
          <ClassListItem
            key={one.id}
            entry={one}
            availability={checked?.entries.find((own) => own.entry === one.id)}
            selected={one.id === entry?.id}
            disabled={!rows.editable}
            onSelect={() => onPick(one.id)}
          />
        ))}

        {/* A tile as tall as the cards while they run across, a line under
            them once they stack. */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-auto shrink-0 rounded-lg border-dashed px-5 text-muted-foreground lg:h-8 lg:shrink lg:justify-start lg:rounded-md lg:px-3 lg:text-foreground"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(ROW_SCOPE.ENTRIES)}
        >
          <PlusIcon />
          {t('editor.entries.add')}
        </Button>
      </div>

      {entry === undefined ? null : (
        <ClassPanel
          key={entry.id}
          series={series}
          entry={entry}
          index={index}
          count={series.entries.length}
          availability={checked?.entries.find((one) => one.entry === entry.id)}
          teams={series.teams ?? []}
          fieldable={[...fieldableCars(series, entry, catalogue)]}
          rows={rows}
          locked={locked}
          section={section}
          nameOf={nameOf}
          onSection={onSection}
          onChange={(next) => onChange(withEntry(series, entry.id, next))}
          onEligibility={(next) => {
            const narrowed = withEntryEligibility(series, entry.id, next, catalogue, aside);
            setAside(narrowed.aside);
            onChange(narrowed.series);
          }}
          onEdit={() => rows.edit(ROW_SCOPE.ENTRIES, entry.id)}
          onMove={(by) => onChange({
            ...series,
            entries: moveAt([...series.entries], index, by),
          })}
          onRemove={() => {
            // Forgotten with the class, so a later one minted under its id
            // does not inherit its pins.
            setAside(Object.fromEntries(Object.entries(aside).filter(([id]) => id !== entry.id)));
            onChange(withoutEntry(series, entry.id));
          }}
        />
      )}

      {/* Mounted only while open, so its draft seeds itself every time. */}
      {editing === undefined ? null : (
        <ClassDialog
          series={series}
          entry={editing}
          adding={false}
          locked={locked}
          onConfirm={(next) => {
            onChange(withEntry(series, editing.id, next));
            rows.close();
          }}
          onCancel={rows.close}
        />
      )}

      {rows.adding(ROW_SCOPE.ENTRIES) ? (
        <ClassDialog
          series={series}
          entry={nextEntry(series)}
          adding
          locked={locked}
          onConfirm={(next) => {
            onChange({ ...series, entries: [...series.entries, next] });
            // The class just added is the one worth looking at.
            onPick(next.id);
            rows.close();
          }}
          onCancel={rows.close}
        />
      ) : null}
    </div>
  );
};
