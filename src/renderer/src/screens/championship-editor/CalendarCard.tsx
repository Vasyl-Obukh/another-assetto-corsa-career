import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorSection } from './EditorSection.tsx';
import { RoundDialog } from './RoundDialog.tsx';
import { RoundHeading } from './RoundHeading.tsx';
import { RoundRow } from './RoundRow.tsx';
import type { RoundTab } from './types.ts';
import { nextRound, withoutRound } from './utils.ts';
import type {
  Championship, SeriesAvailability, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useRowDrag } from '@/hooks';
import { moveAt, moveTo } from '@/screens/race';

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

/**
 * Which round of the calendar is open in its dialog, and on which tab - with
 * the championship the dialog starts from when the round is being added.
 */
interface OpenRound {
  /**
   * The round's id.
   */
  round: string;
  /**
   * Which tab the dialog opens on.
   */
  tab: RoundTab;
  /**
   * The championship with the new round on the end, when it is being added.
   */
  adding: Championship | null;
}

/**
 * The calendar as a table of rounds. A round opens in its dialog; dragging a
 * row reorders the season.
 */
export const CalendarCard = ({
  series, checked, weather, controllers, system, locked, nameOf, onChange,
}: CalendarCardProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<OpenRound | null>(null);
  const { rounds } = series;

  const drag = useRowDrag({
    count: rounds.length,
    locked,
    onMove: (from, to) => onChange({ ...series, rounds: moveTo([...rounds], from, to) }),
  });

  return (
    <EditorSection
      title={t('editor.calendar.title')}
      hint={t('editor.calendar.hintShort')}
      summary={t('editor.calendar.count', { count: rounds.length })}
      className="flex flex-col gap-2"
    >
      {rounds.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('editor.calendar.empty')}</p>
      ) : (
        <div className="-mx-2 overflow-x-auto px-2">
          <div className="min-w-[46rem]">
            <RoundHeading />
            <div className="flex flex-col">
              {rounds.map((round, index) => (
                <RoundRow
                  key={round.id}
                  series={series}
                  round={round}
                  index={index}
                  count={rounds.length}
                  availability={checked?.rounds.find((one) => one.round === round.id)}
                  locked={locked}
                  drag={drag}
                  nameOf={nameOf}
                  onEdit={() => setOpen({ round: round.id, tab: 'basics', adding: null })}
                  onConditions={() => setOpen({ round: round.id, tab: 'conditions', adding: null })}
                  onCars={() => setOpen({ round: round.id, tab: 'cars', adding: null })}
                  onMove={(by) => onChange({ ...series, rounds: moveAt([...rounds], index, by) })}
                  onRemove={() => onChange(withoutRound(series, round.id))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-dashed"
          disabled={locked}
          onClick={() => {
            const round = nextRound(series);
            setOpen({ round: round.id, tab: 'basics', adding: { ...series, rounds: [...rounds, round] } });
          }}
        >
          <PlusIcon />
          {t('editor.calendar.add')}
        </Button>
      </div>

      {/* Mounted only while open, so its copy of the championship seeds afresh. */}
      {open === null ? null : (
        <RoundDialog
          series={open.adding ?? series}
          round={open.round}
          adding={open.adding !== null}
          tab={open.tab}
          availability={checked?.rounds.find((one) => one.round === open.round)}
          weather={weather}
          controllers={controllers}
          system={system}
          locked={locked}
          nameOf={nameOf}
          onConfirm={(next) => { onChange(next); setOpen(null); }}
          onCancel={() => setOpen(null)}
        />
      )}
    </EditorSection>
  );
};
