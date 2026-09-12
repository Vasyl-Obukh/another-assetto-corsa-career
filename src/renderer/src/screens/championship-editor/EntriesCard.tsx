import { LayersIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROW_SCOPE } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { EntryDialog } from './EntryDialog.tsx';
import { EntryEditor } from './EntryEditor.tsx';
import type { SetAside } from './types.ts';
import {
  nextEntry, withEntry, withEntryEligibility, withoutEntry,
} from './utils.ts';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';
import { Button } from '@/components/ui/button.tsx';
import type { RowEditState } from '@/hooks';
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
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
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

export const EntriesCard = ({
  series, checked, rows, locked, nameOf, onChange,
}: EntriesCardProps) => {
  const { t } = useTranslation();
  // What eligibility changes took off each class, so changing back restores it.
  const [aside, setAside] = useState<SetAside>({});
  const seats = series.entries.reduce((total, entry) => total + entry.seats.length, 0);
  const editing = series.entries.find((entry) => rows.editing(ROW_SCOPE.ENTRIES, entry.id));
  // Two keys joined, because i18next pluralises on a single number.
  const summary = [
    t('editor.entries.count', { count: series.entries.length }),
    t('editor.entries.seatCount', { count: seats }),
  ].join(' · ');

  return (
    <EditorSection
      icon={<LayersIcon />}
      title={t('editor.entries.title')}
      hint={t('editor.entries.hint')}
      summary={summary}
      className="flex flex-col gap-4"
    >
      {series.entries.map((entry, index) => (
        <EntryEditor
          key={entry.id}
          series={series}
          entry={entry}
          number={index + 1}
          count={series.entries.length}
          availability={checked?.entries.find((one) => one.entry === entry.id)}
          teams={series.teams ?? []}
          fieldable={[...fieldableCars(series, entry)]}
          locked={locked}
          rows={rows}
          nameOf={nameOf}
          onChange={(next) => onChange(withEntry(series, entry.id, next))}
          onEligibility={(next) => {
            const narrowed = withEntryEligibility(series, entry.id, next, aside);
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
      ))}

      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(ROW_SCOPE.ENTRIES)}
        >
          <PlusIcon />
          {t('editor.entries.add')}
        </Button>
      </div>

      {/* Mounted only while open, so its draft seeds itself every time. */}
      {editing === undefined ? null : (
        <EntryDialog
          entry={editing}
          locked={locked}
          onConfirm={(next) => {
            onChange(withEntry(series, editing.id, next));
            rows.close();
          }}
          onCancel={rows.close}
        />
      )}

      {rows.adding(ROW_SCOPE.ENTRIES) ? (
        <EntryDialog
          entry={nextEntry(series)}
          locked={locked}
          onConfirm={(next) => {
            onChange({ ...series, entries: [...series.entries, next] });
            rows.close();
          }}
          onCancel={rows.close}
        />
      ) : null}
    </EditorSection>
  );
};
