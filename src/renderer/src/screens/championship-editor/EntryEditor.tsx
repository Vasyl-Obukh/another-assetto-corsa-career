import { useTranslation } from 'react-i18next';

import { BopTable } from './BopTable.tsx';
import { EligibilityField } from './EligibilityField.tsx';
import { GridFields } from './GridFields.tsx';
import { PanelRow } from './PanelRow.tsx';
import { SeatTable } from './SeatTable.tsx';
import { bopScope } from './utils.ts';
import type {
  Championship, ClassEntry, EntryAvailability, Team,
} from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowEditState } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface EntryEditorProps {
  /**
   * The championship the class belongs to.
   */
  series: Championship;
  /**
   * The class entry being edited.
   */
  entry: ClassEntry;
  /**
   * Its position in the list, counting from one.
   */
  number: number;
  /**
   * How many class entries there are.
   */
  count: number;
  /**
   * What it can field against the installed content, or undefined while the
   * draft has not been checked yet.
   */
  availability: EntryAvailability | undefined;
  /**
   * Every team the championship fields.
   */
  teams: readonly Team[];
  /**
   * Every car it may field at some point in the season, which a seat and a
   * balance-of-performance row are both restricted to.
   */
  fieldable: readonly string[];
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
   * Called with the whole class entry whenever any part of it changes.
   *
   * Eligibility is the exception and goes out through onEligibility, because
   * narrowing a rule has to clear up after itself across the whole document.
   * @param next The entry to apply
   */
  onChange: (next: ClassEntry) => void;
  /**
   * Called with a new eligibility rule for this class.
   * @param next The rule to apply
   */
  onEligibility: (next: ClassEntry['eligibility']) => void;
  /**
   * Called to open the class's own form - its name and its rung.
   */
  onEdit: () => void;
  /**
   * Called to move the entry along the list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the entry from the championship.
   */
  onRemove: () => void;
}

/**
 * Classes shown as a heading that says what the class is, and three sections
 * for the three lists inside it.
 */
export const EntryEditor = ({
  series, entry, number, count, availability, teams, fieldable, rows, locked, nameOf,
  onChange, onEligibility, onEdit, onMove, onRemove,
}: EntryEditorProps) => {
  const { t } = useTranslation();
  const idPrefix = `entry-${entry.id}`;
  // An open row quietens the eligibility rule too, since that is a list; the
  // plain fields beside it stay live.
  const quiet = locked || !rows.editable;

  return (
    // A panel, so the three sections below read as the class's contents.
    <div className="overflow-hidden rounded-lg border">
      <PanelRow
        name={entry.name}
        label={entry.name}
        first={number === 1}
        last={number === count}
        locked={locked}
        editable={rows.editable}
        // A championship with no class entries is one nobody can enter, which
        // validateSeries refuses.
        removable={count > 1}
        onEdit={onEdit}
        onMove={onMove}
        onRemove={onRemove}
      >
        {/* A hue for the discipline, a metal for the rung. The grid count stays
            neutral: a number of cars is not one of a closed set. */}
        <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
          {t(disciplineKey(entry.ladder.discipline))}
        </Badge>

        <Badge className={tierAccent(entry.ladder.tier)}>
          {t('championships.tier', { tier: entry.ladder.tier })}
        </Badge>

        <Badge variant="outline">{t('championships.grid', { count: entry.seats.length })}</Badge>

        {entry.eligibility.kind === 'spec' ? (
          <Badge variant="secondary" className="max-w-48 truncate">
            {carSpecName(entry.eligibility.spec)}
          </Badge>
        ) : null}

        {/* Whether the class can be raced on this install. */}
        {availability === undefined ? null : (
          <Badge variant={availability.enough ? 'success' : 'destructive'}>
            {t('championships.entries.eligible', { count: availability.eligible.length })}
          </Badge>
        )}
      </PanelRow>

      <Accordion type="multiple" className="px-3">
        <AccordionItem value="eligibility">
          <AccordionTrigger className="-mx-2 rounded-md px-2 py-2 hover:bg-accent/60 hover:no-underline">
            {t('editor.entries.eligibility')}
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-4">
            <EligibilityField
              idPrefix={idPrefix}
              eligibility={entry.eligibility}
              locked={quiet}
              nameOf={nameOf}
              onChange={onEligibility}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grid">
          <AccordionTrigger className="-mx-2 rounded-md px-2 py-2 hover:bg-accent/60 hover:no-underline">
            {t('editor.entries.performance')}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-1 pb-4">
            <GridFields
              grid={entry.grid ?? {}}
              idPrefix={idPrefix}
              locked={locked}
              onChange={(grid) => onChange({ ...entry, grid })}
            />

            <BopTable
              idPrefix={idPrefix}
              scope={bopScope(entry.id)}
              bop={entry.bop ?? []}
              fieldable={fieldable}
              rows={rows}
              locked={locked}
              nameOf={nameOf}
              onChange={(bop) => onChange({ ...entry, bop: bop.length > 0 ? bop : undefined })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seats" className="border-b-0">
          <AccordionTrigger className="-mx-2 rounded-md px-2 py-2 hover:bg-accent/60 hover:no-underline">
            {t('editor.entries.seats')}
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <SeatTable
              series={series}
              entry={entry}
              teams={teams}
              fieldable={fieldable}
              rows={rows}
              locked={locked}
              nameOf={nameOf}
              onChange={onChange}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
