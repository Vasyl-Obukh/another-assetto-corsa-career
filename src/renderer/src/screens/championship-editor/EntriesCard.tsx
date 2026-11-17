import { useState } from 'react';


import { AddButton } from './AddButton.tsx';
import { ClassDialog } from './ClassDialog.tsx';
import { ClassListItem } from './ClassListItem.tsx';
import { ClassPanel } from './ClassPanel.tsx';
import { ROW_SCOPE } from './constants.ts';
import { FastestFirst } from './FastestFirst.tsx';
import type { ClassSection, SetAside } from './types.ts';
import {
  nextEntry, withEntry, withEntryEligibility, withoutEntry,
} from './utils.ts';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';
import { useClasses } from '@/app';
import { useRoomBelow, useRowDrag } from '@/hooks';
import type { RowEditState } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { moveAt, moveTo } from '@/screens/race';

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
  // Down the side, the list takes the height it needs and no more than the
  // window has below it, scrolling on its own past that.
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const room = useRoomBelow(list);
  const editing = series.entries.find((entry) => rows.editing(ROW_SCOPE.ENTRIES, entry.id));
  // The first class until another is picked, and again once the picked one goes.
  const index = Math.max(0, series.entries.findIndex((entry) => entry.id === picked));
  const entry = series.entries[index];
  // Dragged into place as the menu's Move earlier and Move later do, and held
  // still while a row's form is open, as they are.
  const drag = useRowDrag({
    count: series.entries.length,
    locked: locked || !rows.editable,
    onMove: (from, to) => {
      // The class open stays open wherever the first one goes.
      if (entry) onPick(entry.id);
      onChange({ ...series, entries: moveTo([...series.entries], from, to) });
    },
  });

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* The padding is room for a picked card's ring, which an edge that
          scrolls would otherwise cut. */}
      <div
        ref={setList}
        className="flex gap-2 overflow-x-auto pb-1 lg:-m-0.5 lg:flex-col lg:overflow-y-auto lg:p-0.5"
        style={room === null ? undefined : { maxHeight: room }}
      >
        {/* Only once the list stacks, and only once there is an order to read. */}
        {series.entries.length > 1 ? <FastestFirst className="hidden lg:flex" /> : null}
        {series.entries.map((one, at) => (
          <ClassListItem
            key={one.id}
            index={at}
            drag={drag}
            movable={series.entries.length > 1}
            entry={one}
            availability={checked?.entries.find((own) => own.entry === one.id)}
            selected={one.id === entry?.id}
            disabled={!rows.editable}
            onSelect={() => onPick(one.id)}
          />
        ))}

        {/* A tile as tall as the cards while they run across, a line under
            them once they stack. */}
        <AddButton
          label={t('editor.entries.add')}
          className="shrink-0 px-5 lg:h-8 lg:shrink lg:justify-start lg:px-3"
          disabled={locked || !rows.editable}
          onClick={() => rows.add(ROW_SCOPE.ENTRIES)}
        />
      </div>

      {entry === undefined ? null : (
        <ClassPanel
          key={entry.id}
          series={series}
          checked={checked}
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
          checked={checked}
          entry={editing}
          adding={false}
          locked={locked}
          nameOf={nameOf}
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
          checked={checked}
          entry={nextEntry(series)}
          adding
          locked={locked}
          nameOf={nameOf}
          onConfirm={(next, teams) => {
            onChange({
              ...series,
              ...(teams.length > 0 ? { teams: [...(series.teams ?? []), ...teams] } : {}),
              entries: [...series.entries, next],
            });
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
