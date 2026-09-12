import { CalendarDaysIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROW_SCOPE } from './constants.ts';
import { EditorConditionsDialog } from './EditorConditionsDialog.tsx';
import { EditorSection } from './EditorSection.tsx';
import { RoundEligibilityDialog } from './RoundEligibilityDialog.tsx';
import { RoundForm } from './RoundForm.tsx';
import { RoundRow } from './RoundRow.tsx';
import { RowList } from './RowList.tsx';
import { nextRound, withoutRound, withRound } from './utils.ts';
import type { Championship, Round, SeriesAvailability, Weather, WeatherController, WeatherSystem } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';
import { withSessionConditions } from '@/screens/race';

interface CalendarCardProps {
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
   * Called with the whole championship whenever the calendar changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const CalendarCard = ({
  series, checked, weather, controllers, system, rows, locked, nameOf, onChange,
}: CalendarCardProps) => {
  const { t } = useTranslation();
  // Kept out of useRowEdit: neither dialog is a row form, and a modal already
  // makes the page behind it unreachable.
  const [conditions, setConditions] = useState<string | null>(null);
  const [cars, setCars] = useState<{ round: string; value: Championship } | null>(null);
  const conditionsOf = series.rounds.find((one) => one.id === conditions);

  /**
   * Puts the calendar back on the championship.
   * @param next The rounds, in order
   */
  const apply = (next: readonly Round[]): void => onChange({ ...series, rounds: next });

  return (
    <EditorSection
      icon={<CalendarDaysIcon />}
      title={t('editor.calendar.title')}
      summary={t('editor.calendar.count', { count: series.rounds.length })}
      className="flex flex-col gap-3"
    >
      <RowList
        items={series.rounds}
        scope={ROW_SCOPE.ROUNDS}
        rows={rows}
        locked={locked}
        idOf={(round) => round.id}
        empty={t('editor.calendar.empty')}
        addLabel={t('editor.calendar.add')}
        onReorder={apply}
        renderRow={(round, controls) => (
          <RoundRow
            {...controls}
            series={series}
            round={round}
            availability={checked?.rounds.find((one) => one.round === round.id)}
            nameOf={nameOf}
            onConditions={() => setConditions(round.id)}
            onCars={() => setCars({ round: round.id, value: series })}
            onRemove={() => onChange(withoutRound(series, round.id))}
          />
        )}
        renderForm={(round) => (
          <RoundForm
            series={series}
            round={round ?? nextRound(series)}
            locked={locked}
            onConfirm={(next) => {
              onChange(round
                ? withRound(series, round.id, next)
                : { ...series, rounds: [...series.rounds, next] });
              rows.close();
            }}
            onCancel={rows.close}
          />
        )}
      />

      {conditionsOf === undefined ? null : (
        <EditorConditionsDialog
          title={conditionsOf.name}
          description={t('editor.calendar.conditionsHint')}
          conditions={conditionsOf.conditions ?? {}}
          weather={weather}
          controllers={controllers}
          system={system}
          idPrefix={`round-${conditionsOf.id}`}
          locked={locked}
          onConfirm={(value) => {
            onChange(withRound(series, conditionsOf.id, withSessionConditions(conditionsOf, value)));
            setConditions(null);
          }}
          onCancel={() => setConditions(null)}
        />
      )}

      {cars === null ? null : (
        <RoundEligibilityDialog
          series={cars.value}
          round={cars.value.rounds.find((one) => one.id === cars.round) ?? series.rounds[0]}
          locked={locked}
          nameOf={nameOf}
          onChange={(value) => setCars({ ...cars, value })}
          onConfirm={() => { onChange(cars.value); setCars(null); }}
          onCancel={() => setCars(null)}
        />
      )}
    </EditorSection>
  );
};
