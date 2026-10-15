import { useState } from 'react';


import { ConditionsEditor } from './ConditionsEditor.tsx';
import { ROUND_TABS } from './constants.ts';
import { EditorDialog } from './EditorDialog.tsx';
import { RoundBasics } from './RoundBasics.tsx';
import { RoundCars } from './RoundCars.tsx';
import type { RoundTab, SetAside } from './types.ts';
import { groupsSet, withRound, withRoundEligibility } from './utils.ts';
import type {
  Championship, Round, RoundAvailability, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { useClasses } from '@/app';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { UNDERLINE_TAB } from '@/screens/championships';
import { withSessionConditions } from '@/screens/race';

interface RoundDialogProps {
  /**
   * The championship, which the dialog edits a copy of: a class's cars at a
   * round clear up after themselves across the whole document.
   */
  series: Championship;
  /**
   * Which round, by id - one already on the calendar, or the one being added,
   * which the copy carries at its end.
   */
  round: string;
  /**
   * Whether the round is being added, which changes the heading and the button.
   */
  adding: boolean;
  /**
   * Which tab it opens on.
   */
  tab: RoundTab;
  /**
   * What the round is missing on this install, or undefined before it has
   * been checked.
   */
  availability: RoundAvailability | undefined;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather.
   */
  system: WeatherSystem;
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
   * Called with the championship as edited.
   * @param next The championship
   */
  onConfirm: (next: Championship) => void;
  /**
   * Called to close without keeping anything.
   */
  onCancel: () => void;
}

/**
 * A round, in three tabs: what it is, what it runs in, and which cars each
 * class runs there. Each tab says how much the round sets for itself.
 */
export const RoundDialog = ({
  series, round, adding, tab: opening, availability, weather, controllers, system, locked, nameOf,
  onConfirm, onCancel,
}: RoundDialogProps) => {
  const { t } = useKindTranslation();
  const { catalogue } = useClasses();
  const [draft, setDraft] = useState(series);
  const [tab, setTab] = useState<RoundTab>(opening);
  // What these changes took off each class, so turning an override back on
  // restores it. Lives as long as the dialog, which is how long a detour lasts.
  const [aside, setAside] = useState<SetAside>({});
  const index = draft.rounds.findIndex((one) => one.id === round);
  const current = draft.rounds[index];
  if (current === undefined) return null;
  const conditions = current.conditions ?? {};
  const set: Record<RoundTab, number> = {
    basics: 0,
    conditions: groupsSet(conditions).length,
    cars: current.eligibility?.length ?? 0,
  };

  /**
   * Puts the round back on the copy.
   * @param next The round
   */
  const apply = (next: Round): void => setDraft(withRound(draft, round, next));

  return (
    <EditorDialog
      caption={t('editor.calendar.caption', { number: index + 1, count: draft.rounds.length })}
      title={current.name || t('editor.calendar.unnamed')}
      note={t('editor.calendar.dialogNote')}
      confirmLabel={adding ? t('editor.calendar.add') : t('editor.apply')}
      locked={locked}
      className="sm:max-w-4xl"
      tabs={(
        <Tabs value={tab} onValueChange={(next) => setTab(next as RoundTab)} className="-mx-1 mt-2">
          <TabsList className="h-auto justify-start gap-1 rounded-none bg-transparent p-0">
            {ROUND_TABS.map((one) => (
              <TabsTrigger
                key={one}
                value={one}
                className={cn(UNDERLINE_TAB, 'px-3 py-2')}
              >
                {t(`editor.calendar.tabs.${one}`)}
                {set[one] > 0 ? (
                  <span className="rounded-full bg-muted px-1.5 text-xs font-normal">{t('editor.calendar.tabSet', { count: set[one] })}</span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
    >
      {tab === 'basics' ? (
        <RoundBasics series={draft} round={current} availability={availability} locked={locked} onChange={apply} />
      ) : null}

      {tab === 'conditions' ? (
        <>
          <p className="text-xs text-muted-foreground">{t('editor.calendar.conditionsHint')}</p>
          <ConditionsEditor
            idPrefix={`round-${round}`}
            conditions={conditions}
            behind={draft.generatedWeather ? 'climate' : 'default'}
            layout="rows"
            weather={weather}
            controllers={controllers}
            system={system}
            locked={locked}
            onChange={(next) => apply(withSessionConditions(current, next))}
          />
        </>
      ) : null}

      {tab === 'cars' ? (
        <RoundCars
          series={draft}
          round={current}
          locked={locked}
          nameOf={nameOf}
          onChange={(entry, eligibility) => {
            const narrowed = withRoundEligibility(draft, round, entry, eligibility, catalogue, aside);
            setAside(narrowed.aside);
            setDraft(narrowed.series);
          }}
        />
      ) : null}
    </EditorDialog>
  );
};
