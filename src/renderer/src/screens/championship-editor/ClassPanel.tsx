import { useTranslation } from 'react-i18next';

import { BopCards } from './BopCards.tsx';
import { ClassPrizes } from './ClassPrizes.tsx';
import { CLASS_SECTIONS, PILL_TAB, PILL_TAB_LIST } from './constants.ts';
import { EligibilityField } from './EligibilityField.tsx';
import { GridFields } from './GridFields.tsx';
import { RowActions } from './RowActions.tsx';
import { SeatSheet } from './SeatSheet.tsx';
import type { ClassSection } from './types.ts';
import type {
  Championship, ClassEntry, EntryAvailability, Team,
} from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs.tsx';
import type { RowEditState } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import {
  disciplineKey, tierAccent, TierMedal, tierMetalKey,
} from '@/screens/championships';

interface ClassPanelProps {
  /**
   * The championship the class belongs to.
   */
  series: Championship;
  /**
   * The class entry being edited.
   */
  entry: ClassEntry;
  /**
   * Its position in the list, counting from zero.
   */
  index: number;
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
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Which part of the class is open. Held by the list rather than the panel,
   * so moving to another class stays on the same part.
   */
  section: ClassSection;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called to open another part of the class.
   * @param next The part
   */
  onSection: (next: ClassSection) => void;
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
 * One class, opened beside the list: what it is across the top, then a tab for
 * each thing it holds - its cars, its seats, how its field drives and what it
 * pays.
 */
export const ClassPanel = ({
  series, entry, index, count, availability, teams, fieldable, rows, locked, section, nameOf,
  onSection, onChange, onEligibility, onEdit, onMove, onRemove,
}: ClassPanelProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const idPrefix = `entry-${entry.id}`;
  // An open row quietens the lists here too; the plain fields beside it stay live.
  const quiet = locked || !rows.editable;
  // What this install has of the class's cars: a catalogued grid names cars
  // nobody may own, and neither a picture nor a balance is any use for those.
  const installed = availability?.eligible ?? fieldable;

  return (
    <Card className="min-w-0 gap-0 py-0">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3.5 sm:px-5">
        <TierMedal tier={entry.ladder.tier} />
        <h3 className="mr-1 text-lg font-semibold">{entry.name}</h3>

        {/* A hue for the discipline, a metal for the rung. */}
        <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
          {t(disciplineKey(entry.ladder.discipline))}
        </Badge>
        <Badge className={tierAccent(entry.ladder.tier)}>{t(tierMetalKey(entry.ladder.tier))}</Badge>

        {/* Neutral on purpose: specs are an open set the user can add to, so
            no palette could give each its own colour. */}
        {entry.eligibility.kind === 'spec' ? (
          <Badge variant="outline" className="max-w-48 truncate">
            {carSpecName(entry.eligibility.spec, catalogue)}
          </Badge>
        ) : null}

        {/* Whether the class can be raced on this install. */}
        {availability === undefined ? null : (
          <Badge variant={availability.enough ? 'success' : 'destructive'}>
            {t('championships.entries.eligible', { count: availability.eligible.length })}
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button type="button" size="sm" variant="outline" disabled={quiet} onClick={onEdit}>
            {t('editor.entries.edit')}
          </Button>
          <RowActions
            label={entry.name}
            first={index === 0}
            last={index === count - 1}
            locked={locked}
            editable={rows.editable}
            // A championship with no class entries is one nobody can enter,
            // which validateSeries refuses.
            removable={count > 1}
            onMove={onMove}
            onRemove={onRemove}
          />
        </div>
      </div>

      <Tabs value={section} onValueChange={(next) => onSection(next as ClassSection)} className="gap-0">
        <TabsList className={PILL_TAB_LIST}>
          {CLASS_SECTIONS.map((one) => (
            <TabsTrigger
              key={one}
              value={one}
              disabled={!rows.editable && one !== section}
              className={PILL_TAB}
            >
              {t(`editor.entries.${one}`)}
              {one === 'seats' ? <span className="text-xs tabular-nums">{entry.seats.length}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cars" className="flex flex-col gap-4 p-4 sm:p-5">
          <EligibilityField
            idPrefix={idPrefix}
            eligibility={entry.eligibility}
            locked={quiet}
            nameOf={nameOf}
            showCars={false}
            pictured={installed}
            onChange={onEligibility}
          />
        </TabsContent>

        <TabsContent value="seats" className="p-4 pt-3 sm:p-5 sm:pt-3">
          <SeatSheet
            series={series}
            entry={entry}
            teams={teams}
            fieldable={fieldable}
            locked={locked}
            nameOf={nameOf}
            onChange={onChange}
          />
        </TabsContent>

        <TabsContent value="performance" className="flex flex-col gap-5 p-4 sm:p-5">
          <div className="max-w-3xl">
            <GridFields
              grid={entry.grid ?? {}}
              above={[{ label: t('race.ai.championship'), grid: series.grid }]}
              own={t('race.ai.class')}
              idPrefix={idPrefix}
              locked={locked}
              onChange={(grid) => onChange({ ...entry, grid })}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-sm font-semibold">{t('championships.entries.bop')}</h4>
              <span className="text-xs text-muted-foreground">{t('editor.bop.hint')}</span>
            </div>
            {installed.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('editor.bop.noCars')}</p>
            ) : (
              <BopCards
                idPrefix={idPrefix}
                bop={entry.bop ?? []}
                fieldable={installed}
                locked={locked}
                nameOf={nameOf}
                onChange={(bop) => onChange({ ...entry, bop: bop.length > 0 ? bop : undefined })}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="prizes" className="p-4 sm:p-5">
          <ClassPrizes series={series} entry={entry} locked={locked} onChange={onChange} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
